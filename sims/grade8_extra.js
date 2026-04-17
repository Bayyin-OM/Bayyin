// الصف الثامن — وحدة ٧: الجهاز الدوري وتبادل الغازات
// نسخة v2 — تفاعلية كاملة مع controls + questions + sound
// ══════════════════════════════════════════════════════════

// ── مساعد: نسخة خفيفة من U9 للوحدة 7 ──
const U7 = {
  bg(c,w,h,col){ c.fillStyle=col||'#FFF5F5'; c.fillRect(0,0,w,h); },
  grid(c,w,h,col,size){
    c.strokeStyle=col||'rgba(200,50,50,0.06)'; c.lineWidth=1;
    for(let x=0;x<w;x+=size){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
    for(let y=0;y<h;y+=size){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
  },
  txt(c,t,x,y,col,sz,bold){
    c.fillStyle=col||'#333'; c.font=(bold?'bold ':'')+sz+'px Tajawal';
    c.textAlign='center'; c.textBaseline='middle'; c.fillText(t,x,y);
  },
  pill(c,x,y,w2,h2,col,text,textCol){
    c.fillStyle=col; c.beginPath(); c.roundRect(x-w2/2,y-h2/2,w2,h2,h2/2); c.fill();
    if(text){ c.fillStyle=textCol||'white'; c.font='bold 12px Tajawal'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(text,x,y); }
  },
  heart(c,cx,cy,scale,col){
    c.save(); c.translate(cx,cy); c.scale(scale,scale);
    c.fillStyle=col||'#C0392B';
    c.beginPath();
    c.moveTo(0,8); c.bezierCurveTo(-5,-5,-22,-5,-22,-16);
    c.bezierCurveTo(-22,-28,-5,-28,0,-18);
    c.bezierCurveTo(5,-28,22,-28,22,-16);
    c.bezierCurveTo(22,-5,5,-5,0,8);
    c.fill(); c.restore();
  },
  lung(c,cx,cy,rw,rh,col){
    c.fillStyle=col||'rgba(255,160,160,0.7)'; c.strokeStyle='#C0392B'; c.lineWidth=2;
    c.beginPath(); c.ellipse(cx-rw*0.4,cy,rw*0.5,rh,0,0,Math.PI*2); c.fill(); c.stroke();
    c.beginPath(); c.ellipse(cx+rw*0.4,cy,rw*0.5,rh,0,0,Math.PI*2); c.fill(); c.stroke();
  }
};

// ── نظام الأصوات للوحدة 7 (نبضات قلب) ──
(function(){
  var _hbAC=null, _hbStop=null;
  function getHBAC(){ if(!_hbAC){ try{_hbAC=new(window.AudioContext||window.webkitAudioContext)();}catch(e){} } return _hbAC; }

  window._playHeartbeat = function(rate){
    var ac=getHBAC(); if(!ac) return;
    if(_hbStop){ try{_hbStop();}catch(e){} _hbStop=null; }
    var interval = 60/rate;
    var stopped=false;
    function beat(){
      if(stopped) return;
      ['lub','dub'].forEach(function(type,i){
        setTimeout(function(){
          if(stopped) return;
          var o=ac.createOscillator(), g=ac.createGain();
          o.frequency.value = type==='lub'?60:50;
          o.type='sine';
          var t=ac.currentTime;
          g.gain.setValueAtTime(0,t);
          g.gain.linearRampToValueAtTime(0.25,t+0.02);
          g.gain.exponentialRampToValueAtTime(0.001,t+0.12);
          o.connect(g); g.connect(ac.destination);
          o.start(t); o.stop(t+0.14);
        }, i*150);
      });
      var tid=setTimeout(function(){ beat(); }, interval*1000);
      _hbStop=function(){ stopped=true; clearTimeout(tid); };
    }
    beat();
  };

  window._stopHeartbeat = function(){
    if(_hbStop){ try{_hbStop();}catch(e){} _hbStop=null; }
  };

  // ربط تلقائي مع openSim لوحدة القلب
  var _origOpenSim2 = window.openSim;
  window.openSim = function(type){
    if(_origOpenSim2) _origOpenSim2(type);
    var circSims = ['circsystem','heart8','blood8','vessels8','lungs8','gasex8','respiration8','fitness8','smoking8'];
    if(circSims.indexOf(type)!==-1){
      setTimeout(function(){ try{ window._playHeartbeat(70); }catch(e){} }, 800);
    }
  };
  var _origCloseSim2 = window.closeSim;
  window.closeSim = function(){
    if(_origCloseSim2) _origCloseSim2();
    try{ window._stopHeartbeat(); }catch(e){}
  };
})();

// ══════════════════════════════════════════════════════════
// 7-1 · رحلة الدم في الجهاز الدوري
// ══════════════════════════════════════════════════════════
function simCircSystem1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.cs1) simState.cs1={t:0,particles:[],running:false,speed:1,showLabels:true};
  const S=simState.cs1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">❤️ الجهاز الدوري للإنسان</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.cs1.running=!simState.cs1.running;this.textContent=simState.cs1.running?'⏸ إيقاف':'▶ أرسل الدم'">▶ أرسل الدم</button>
    <button class="ctrl-btn reset" onclick="simState.cs1.particles=[];simState.cs1.running=false;simState.cs1.t=0;document.querySelector('.ctrl-btn.play').textContent='▶ أرسل الدم'">↺ إعادة</button>
    <div class="ctrl-section">
      <div class="ctrl-label">سرعة الدورة الدموية</div>
      <input type="range" min="0.5" max="3" step="0.5" value="1" oninput="simState.cs1.speed=+this.value;document.getElementById('cs1spd').textContent=this.value+'×'" style="width:100%">
      <div id="cs1spd" style="text-align:center;font-size:13px;color:#C0392B">1×</div>
    </div>
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-top:6px">
      <input type="checkbox" checked onchange="simState.cs1.showLabels=this.checked"> إظهار التسميات
    </label>
    <div class="info-box" style="font-size:12px;line-height:1.8;margin-top:8px">
      🔴 = دم مؤكسج (غني بالأكسجين)<br>
      🔵 = دم غير مؤكسج<br>
      🔄 الدورة الرئوية: قلب←رئة←قلب<br>
      🔄 الدورة الجهازية: قلب←جسم←قلب
    </div>`);

  function draw(){
    if(currentSim!=='circsystem'||currentTab!==0) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    // bg
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF0F0';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',40);

    const cx=w*0.48, cy=h*0.5;
    const lungX=cx-w*0.25, lungY=cy-h*0.22;
    const bodyX=cx+w*0.26, bodyY=cy+h*0.14;

    // Vessels (thick background paths)
    const drawCurve=(pts,col,lw)=>{
      c.beginPath(); c.moveTo(pts[0][0],pts[0][1]);
      for(let i=1;i<pts.length;i++) c.lineTo(pts[i][0],pts[i][1]);
      c.strokeStyle=col; c.lineWidth=lw||8; c.lineCap='round'; c.lineJoin='round'; c.stroke();
    };
    // Pulmonary circuit
    drawCurve([[cx-20,cy-20],[cx-60,cy-60],[lungX+20,lungY+20],[lungX,lungY]],'rgba(91,155,213,0.5)',10);
    drawCurve([[lungX,lungY],[lungX+20,lungY+30],[cx-20,cy-30],[cx,cy-20]],'rgba(192,57,43,0.5)',10);
    // Systemic circuit
    drawCurve([[cx+20,cy+10],[cx+60,cy+40],[bodyX-20,bodyY-10],[bodyX,bodyY]],'rgba(192,57,43,0.5)',10);
    drawCurve([[bodyX,bodyY],[bodyX-30,bodyY+20],[cx+30,cy+30],[cx+20,cy+10]],'rgba(91,155,213,0.5)',10);

    // Lungs
    U7.lung(c,lungX,lungY,60,36,'rgba(255,180,180,0.8)');
    if(S.showLabels) U7.txt(c,'الرئتان',lungX,lungY+52,'#C0392B',12,true);

    // Body tissues
    c.fillStyle='rgba(255,220,150,0.8)'; c.strokeStyle='#D4901A'; c.lineWidth=2;
    c.beginPath(); c.roundRect(bodyX-42,bodyY-22,84,44,10); c.fill(); c.stroke();
    if(S.showLabels){
      U7.txt(c,'أنسجة الجسم',bodyX,bodyY-6,'#7A4A10',11,true);
      U7.txt(c,'(عضلات، أعضاء)',bodyX,bodyY+9,'#7A4A10',10,false);
    }

    // Heart (pulsing)
    const pulse=1+Math.sin(S.t*4.5)*0.07;
    c.save(); c.translate(cx,cy); c.scale(pulse,pulse);
    // Left side (oxygenated - red)
    c.fillStyle='#C0392B'; c.beginPath();
    c.moveTo(0,22); c.bezierCurveTo(-4,-4,-22,-4,-22,-14);
    c.bezierCurveTo(-22,-26,-4,-26,0,-16);
    c.bezierCurveTo(4,-26,22,-26,22,-14);
    c.bezierCurveTo(22,-4,4,-4,0,22); c.fill();
    // Dividing line
    c.strokeStyle='rgba(255,255,255,0.4)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(0,-24); c.lineTo(0,20); c.stroke();
    // Left half overlay
    c.fillStyle='rgba(91,155,213,0.35)';
    c.beginPath(); c.moveTo(0,-24); c.lineTo(-22,-24); c.lineTo(-22,20); c.lineTo(0,20); c.closePath(); c.fill();
    c.restore();
    if(S.showLabels) U7.txt(c,'القلب',cx,cy+38,'#7A0000',13,true);

    // Labels overlay
    if(S.showLabels){
      U7.txt(c,'دم غير مؤكسج ←',cx-w*0.19,cy-h*0.06,'#5B9BD5',11,false);
      U7.txt(c,'← دم مؤكسج',cx-w*0.05,cy-h*0.19,'#C0392B',11,false);
      U7.txt(c,'دم مؤكسج ←',cx+w*0.12,cy+h*0.02,'#C0392B',11,false);
      U7.txt(c,'← دم غير مؤكسج',cx+w*0.14,cy+h*0.17,'#5B9BD5',11,false);
    }

    // Spawn particles
    if(S.running && S.t%Math.max(0.3,0.8/S.speed)<0.03){
      const paths=[
        {pts:[[cx-20,cy-20],[cx-60,cy-60],[lungX+20,lungY+20],[lungX,lungY]],oxy:false,next:'fromLung'},
        {pts:[[lungX,lungY],[lungX+20,lungY+30],[cx-20,cy-30],[cx,cy-20]],oxy:true,next:'toBody'},
        {pts:[[cx+20,cy+10],[cx+60,cy+40],[bodyX-20,bodyY-10],[bodyX,bodyY]],oxy:true,next:'fromBody'},
        {pts:[[bodyX,bodyY],[bodyX-30,bodyY+20],[cx+30,cy+30],[cx+20,cy+10]],oxy:false,next:'toLung'}
      ];
      paths.forEach(p=>{
        S.particles.push({pts:p.pts,step:0,oxy:p.oxy,alpha:1});
      });
    }

    // Update & draw particles
    S.particles=S.particles.filter(p=>p.alpha>0.1);
    S.particles.forEach(p=>{
      p.step=Math.min(1,p.step+0.012*S.speed);
      const segs=p.pts.length-1;
      const si=Math.min(Math.floor(p.step*segs),segs-1);
      const st=p.step*segs-si;
      const ax=p.pts[si][0]+(p.pts[si+1][0]-p.pts[si][0])*st;
      const ay=p.pts[si][1]+(p.pts[si+1][1]-p.pts[si][1])*st;
      if(p.step>=0.99) p.alpha=0;
      // Glow
      const g=c.createRadialGradient(ax,ay,0,ax,ay,10);
      g.addColorStop(0,p.oxy?'rgba(220,50,50,1)':'rgba(60,100,200,1)');
      g.addColorStop(1,p.oxy?'rgba(220,50,50,0)':'rgba(60,100,200,0)');
      c.fillStyle=g; c.beginPath(); c.arc(ax,ay,10,0,Math.PI*2); c.fill();
      c.fillStyle=p.oxy?'#C0392B':'#2471A3'; c.beginPath(); c.arc(ax,ay,5,0,Math.PI*2); c.fill();
      c.strokeStyle='white'; c.lineWidth=1; c.stroke();
    });

    const hint=S.running?'الدم يجري الآن في الدورة الدموية...':'اضغط "أرسل الدم" لبدء الدورة الدموية';
    U7.txt(c,hint,w/2,h-18,'#888',12,false);

    S.t+=0.022;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 7-1 TAB 1: الدم المؤكسج وغير المؤكسج ──
function simCircSystem2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.cs2) simState.cs2={t:0,selected:null,quiz:false};
  const S=simState.cs2;

  const zones=[
    {id:'lung',  label:'في الرئتين', x:0.25, y:0.35, color:'#2980B9', text:'الدم يمتص الأكسجين هنا\nيصبح مؤكسجاً (أحمر فاتح)'},
    {id:'tissue',label:'في الأنسجة', x:0.75, y:0.35, color:'#8E44AD', text:'الأكسجين ينتقل للخلايا هنا\nيصبح الدم غير مؤكسج (داكن)'},
    {id:'oxy',   label:'دم مؤكسج', x:0.25, y:0.7,  color:'#C0392B', text:'لون أحمر فاتح\nهيموجلوبين مؤكسج (أوكسيهيموجلوبين)'},
    {id:'deoxy', label:'دم غير مؤكسج', x:0.75, y:0.7, color:'#2C3E6B', text:'لون أحمر داكن مائل للزرقة\nهيموجلوبين فقط (بدون أكسجين)'}
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🩸 الدم المؤكسج وغير المؤكسج</div>
    </div>
    ${zones.map(z=>`<button class="ctrl-btn" onclick="simState.cs2.selected='${z.id}';simState.cs2.quiz=false" style="background:${z.color};color:white;border:none;margin-bottom:4px">${z.label}</button>`).join('')}
    <button class="ctrl-btn reset" onclick="simState.cs2.selected=null">↺ مسح التحديد</button>
    <div class="info-box" style="font-size:12px;line-height:1.9;margin-top:8px">
      الهيموجلوبين يحمل O₂<br>
      في الرئتين: O₂ منخفض → ينتشر للدم<br>
      في الأنسجة: O₂ مرتفع في الدم → ينتشر للخلايا
    </div>`);

  function draw(){
    if(currentSim!=='circsystem'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',45);

    U7.txt(c,'الدم المؤكسج مقابل غير المؤكسج',w/2,22,'#7A0000',14,true);

    // Draw central flow diagram
    const midX=w/2, midY=h*0.5;
    // Oxygenated side (left)
    const gOxy=c.createLinearGradient(midX-w*0.2,0,midX,0);
    gOxy.addColorStop(0,'rgba(192,57,43,0.15)'); gOxy.addColorStop(1,'rgba(192,57,43,0.02)');
    c.fillStyle=gOxy; c.fillRect(0,h*0.08,midX,h*0.84);

    const gDeoxy=c.createLinearGradient(midX,0,midX+w*0.2,0);
    gDeoxy.addColorStop(0,'rgba(44,62,107,0.02)'); gDeoxy.addColorStop(1,'rgba(44,62,107,0.15)');
    c.fillStyle=gDeoxy; c.fillRect(midX,h*0.08,w-midX,h*0.84);

    // Draw blood cells side by side
    const cellsOxy=[[midX-w*0.22,h*0.48],[midX-w*0.16,h*0.44],[midX-w*0.14,h*0.52],[midX-w*0.08,h*0.48]];
    const cellsDeoxy=[[midX+w*0.08,h*0.48],[midX+w*0.14,h*0.44],[midX+w*0.16,h*0.52],[midX+w*0.22,h*0.48]];

    cellsOxy.forEach(([cx,cy])=>{
      const r=18+Math.sin(S.t*2)*1.5;
      const g2=c.createRadialGradient(cx-4,cy-4,0,cx,cy,r);
      g2.addColorStop(0,'#E74C3C'); g2.addColorStop(0.6,'#C0392B'); g2.addColorStop(1,'#922B21');
      c.fillStyle=g2; c.beginPath(); c.ellipse(cx,cy,r,r*0.7,0,0,Math.PI*2); c.fill();
      // O2 label
      c.fillStyle='rgba(255,255,255,0.8)'; c.font='bold 9px Tajawal'; c.textAlign='center';
      c.fillText('O₂',cx,cy+2);
    });

    cellsDeoxy.forEach(([cx,cy])=>{
      const r=18+Math.sin(S.t*2+1)*1.5;
      const g2=c.createRadialGradient(cx-4,cy-4,0,cx,cy,r);
      g2.addColorStop(0,'#5D6D7E'); g2.addColorStop(0.6,'#2C3E50'); g2.addColorStop(1,'#1A252F');
      c.fillStyle=g2; c.beginPath(); c.ellipse(cx,cy,r,r*0.7,0,0,Math.PI*2); c.fill();
    });

    // Labels
    U7.txt(c,'دم مؤكسج',midX*0.5,h*0.32,'#C0392B',14,true);
    U7.txt(c,'Oxygenated',midX*0.5,h*0.38,'#C0392B',11,false);
    U7.txt(c,'لون أحمر فاتح',midX*0.5,h*0.61,'#C0392B',12,false);
    U7.txt(c,'هيموجلوبين+O₂',midX*0.5,h*0.67,'#C0392B',12,false);

    U7.txt(c,'دم غير مؤكسج',midX+midX*0.5,h*0.32,'#2C3E6B',14,true);
    U7.txt(c,'Deoxygenated',midX+midX*0.5,h*0.38,'#2C3E6B',11,false);
    U7.txt(c,'لون أحمر داكن مائل للزرقة',midX+midX*0.5,h*0.61,'#2C3E6B',12,false);
    U7.txt(c,'هيموجلوبين بدون O₂',midX+midX*0.5,h*0.67,'#2C3E6B',12,false);

    // Center divider
    c.strokeStyle='rgba(150,150,150,0.3)'; c.lineWidth=2; c.setLineDash([6,4]);
    c.beginPath(); c.moveTo(midX,h*0.08); c.lineTo(midX,h*0.92); c.stroke();
    c.setLineDash([]);

    // Oxygen molecule animation
    const ot=(S.t*0.5)%1;
    const ox_x=midX-w*0.05+Math.sin(S.t)*8;
    const ox_y=h*0.48+Math.cos(S.t*0.8)*10;
    c.fillStyle='rgba(39,174,96,0.9)'; c.beginPath(); c.arc(ox_x,ox_y,5,0,Math.PI*2); c.fill();
    c.font='bold 8px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('O₂',ox_x,ox_y);

    // Show selection info
    if(S.selected){
      const z=zones.find(z=>z.id===S.selected);
      if(z){
        c.fillStyle='rgba(255,255,255,0.92)'; c.strokeStyle=z.color; c.lineWidth=3;
        c.beginPath(); c.roundRect(w*0.15,h*0.77,w*0.7,h*0.15,10); c.fill(); c.stroke();
        U7.txt(c,z.text.split('\n')[0],w/2,h*0.815,z.color,13,true);
        U7.txt(c,z.text.split('\n')[1],w/2,h*0.845,z.color,11,false);
      }
    }

    S.t+=0.025;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-2 · القلب — تركيبه وكيف يعمل
// ══════════════════════════════════════════════════════════

// ─── دالة رسم القلب التشريحي الحقيقي ───────────────────
// drawAnatomicalHeart(c, cx, cy, size, beatPhase)
// beatPhase: 0=diastole(مرتخي), 1=systole(منقبض)
function drawAnatomicalHeart(c, cx, cy, size, beatPhase, showLabels, highlighted) {
  const S = size;
  const bp = beatPhase; // 0..1  1=fully contracted

  // scale factor: ينقبض إلى 88% ثم يرتد
  const sc = 1 - bp * 0.12;

  c.save();
  c.translate(cx, cy);
  c.scale(sc, sc);

  // ── الظل الخارجي ─────────────────────────────────────
  c.shadowBlur = 28 + bp * 14;
  c.shadowColor = 'rgba(160,20,20,0.35)';

  // ── الجسم الخارجي للقلب (silhouette) ─────────────────
  // شكل القلب الحقيقي: قوس علوي ذو فصّين + قمة سفلية
  function heartPath(s) {
    c.beginPath();
    // نقطة القمة السفلية
    c.moveTo(0, s * 0.82);
    // الجانب الأيسر (من الناحية التشريحية = يمين الشاشة لأن القلب مقلوب)
    c.bezierCurveTo( s*0.05, s*0.55,  s*0.55, s*0.35,  s*0.55,  s*0.05);
    c.bezierCurveTo( s*0.55,-s*0.28,  s*0.25,-s*0.42,  s*0.08, -s*0.38);
    c.bezierCurveTo(-s*0.08,-s*0.34,  0,     -s*0.18,  0,      -s*0.18);
    // الجانب الأيمن
    c.bezierCurveTo( 0,     -s*0.18, -s*0.08,-s*0.34, -s*0.08, -s*0.38);
    c.bezierCurveTo(-s*0.25,-s*0.42, -s*0.55,-s*0.28, -s*0.55,  s*0.05);
    c.bezierCurveTo(-s*0.55, s*0.35, -s*0.05, s*0.55,  0,       s*0.82);
    c.closePath();
  }

  // تدرج خارجي
  const outerG = c.createRadialGradient(-S*0.1,-S*0.25, S*0.05, 0, 0, S*0.85);
  outerG.addColorStop(0, '#e05050');
  outerG.addColorStop(0.45,'#b82020');
  outerG.addColorStop(1,  '#7a1010');
  c.fillStyle = outerG;
  heartPath(S);
  c.fill();
  c.shadowBlur = 0;

  // حدود خارجية
  c.strokeStyle = 'rgba(80,0,0,0.55)';
  c.lineWidth = 2.2;
  heartPath(S);
  c.stroke();

  // ── تفاصيل الأخاديد (grooves) ──────────────────────
  c.strokeStyle = 'rgba(90,0,0,0.38)';
  c.lineWidth = 2.8;
  c.setLineDash([]);
  // الأخدود التاجي (coronary sulcus) — يفصل الأذينين عن البطينين
  c.beginPath();
  c.moveTo(-S*0.52, S*0.04);
  c.bezierCurveTo(-S*0.4,-S*0.04, S*0.4,-S*0.04, S*0.52, S*0.04);
  c.stroke();

  // الأخدود الأمامي البيني (anterior interventricular sulcus)
  c.beginPath();
  c.moveTo(S*0.04,-S*0.14);
  c.bezierCurveTo(S*0.06, S*0.18, S*0.04, S*0.5, 0, S*0.82);
  c.stroke();

  // ── الأذين الأيمن (RA) — يمين الشاشة ─────────────
  const raHl = highlighted==='RA';
  const raG = c.createRadialGradient(-S*0.32,-S*0.28, 0, -S*0.32,-S*0.28, S*0.28);
  raG.addColorStop(0, raHl?'#5b8dd9':'#3a6ab5');
  raG.addColorStop(1, raHl?'#2455a0':'#1a3a7a');
  c.fillStyle = raG;
  c.beginPath();
  c.ellipse(-S*0.32,-S*0.2, S*0.21, S*0.17, -0.2, 0, Math.PI*2);
  c.fill();
  if(raHl){ c.strokeStyle='white'; c.lineWidth=2.5; c.stroke(); }

  // ── الأذين الأيسر (LA) — يسار الشاشة ──────────────
  const laHl = highlighted==='LA';
  const laG = c.createRadialGradient(S*0.3,-S*0.28, 0, S*0.3,-S*0.28, S*0.28);
  laG.addColorStop(0, laHl?'#e86060':'#c0392b');
  laG.addColorStop(1, laHl?'#a02020':'#7b1818');
  c.fillStyle = laG;
  c.beginPath();
  c.ellipse(S*0.3,-S*0.2, S*0.2, S*0.17, 0.2, 0, Math.PI*2);
  c.fill();
  if(laHl){ c.strokeStyle='white'; c.lineWidth=2.5; c.stroke(); }

  // ── حاجز بين الأذينين ──────────────────────────────
  c.strokeStyle='rgba(80,0,0,0.5)'; c.lineWidth=2;
  c.setLineDash([3,2]);
  c.beginPath(); c.moveTo(0,-S*0.38); c.lineTo(0,-S*0.02); c.stroke();
  c.setLineDash([]);

  // ── البطين الأيمن (RV) ─────────────────────────────
  const rvHl = highlighted==='RV';
  // ينقبض أكثر من الأذينين
  const rvSc = 1 - bp*0.08;
  c.save(); c.scale(rvSc,rvSc);
  const rvG = c.createRadialGradient(-S*0.26, S*0.25, 0, -S*0.26, S*0.25, S*0.36);
  rvG.addColorStop(0, rvHl?'#6090e0':'#2c6eb5');
  rvG.addColorStop(1, rvHl?'#1a45a0':'#0e2d70');
  c.fillStyle = rvG;
  c.beginPath();
  c.moveTo(-S*0.04, S*0.01);
  c.bezierCurveTo(-S*0.06, S*0.15, -S*0.5, S*0.22, -S*0.46, S*0.42);
  c.bezierCurveTo(-S*0.36, S*0.58, -S*0.14, S*0.62, 0, S*0.82);
  c.bezierCurveTo(-S*0.02, S*0.5, -S*0.01, S*0.2, S*0.04*rvSc, S*0.01/rvSc);
  c.closePath();
  c.fill();
  if(rvHl){ c.strokeStyle='white'; c.lineWidth=2.5; c.stroke(); }
  c.restore();

  // ── البطين الأيسر (LV) ─────────────────────────────
  const lvHl = highlighted==='LV';
  const lvSc = 1 - bp*0.1; // LV أقوى = ينقبض أكثر
  c.save(); c.scale(lvSc,lvSc);
  const lvG = c.createRadialGradient(S*0.22, S*0.25, 0, S*0.22, S*0.25, S*0.38);
  lvG.addColorStop(0, lvHl?'#ff7070':'#e74c3c');
  lvG.addColorStop(1, lvHl?'#c02020':'#8b1a1a');
  c.fillStyle = lvG;
  c.beginPath();
  c.moveTo(S*0.04, S*0.01);
  c.bezierCurveTo(S*0.06, S*0.15, S*0.5, S*0.22, S*0.46, S*0.42);
  c.bezierCurveTo(S*0.36, S*0.58, S*0.14, S*0.62, 0, S*0.82);
  c.bezierCurveTo(S*0.02, S*0.5, S*0.01, S*0.2, -S*0.04/lvSc, S*0.01/lvSc);
  c.closePath();
  c.fill();
  if(lvHl){ c.strokeStyle='white'; c.lineWidth=2.5; c.stroke(); }
  c.restore();

  // ── حاجز بين البطينين ──────────────────────────────
  c.strokeStyle='rgba(60,0,0,0.55)'; c.lineWidth=2.5;
  c.setLineDash([4,3]);
  c.beginPath(); c.moveTo(0, S*0.02); c.bezierCurveTo(S*0.02,S*0.38, S*0.01,S*0.62, 0,S*0.82); c.stroke();
  c.setLineDash([]);

  // ── الأوردة الرئوية (الداخلة إلى LA) ──────────────
  c.strokeStyle='rgba(220,60,60,0.75)'; c.lineWidth=5;
  c.beginPath(); c.moveTo(S*0.5,-S*0.18); c.lineTo(S*0.42,-S*0.22); c.stroke();
  c.beginPath(); c.moveTo(S*0.5,-S*0.28); c.lineTo(S*0.42,-S*0.26); c.stroke();

  // ── الوريد الأجوف العلوي (إلى RA) ─────────────────
  c.strokeStyle='rgba(50,80,180,0.8)'; c.lineWidth=7;
  c.beginPath(); c.moveTo(-S*0.34,-S*0.5); c.lineTo(-S*0.34,-S*0.36); c.stroke();
  // رأس السهم
  c.fillStyle='rgba(50,80,180,0.8)';
  c.beginPath(); c.moveTo(-S*0.34,-S*0.34); c.lineTo(-S*0.39,-S*0.44); c.lineTo(-S*0.29,-S*0.44); c.closePath(); c.fill();

  // ── الوريد الأجوف السفلي (إلى RA) ─────────────────
  c.strokeStyle='rgba(50,80,180,0.75)'; c.lineWidth=6;
  c.beginPath(); c.moveTo(-S*0.5, S*0.12); c.lineTo(-S*0.4, S*0.06); c.stroke();

  // ── الشريان الرئوي (من RV) ─────────────────────────
  c.strokeStyle='rgba(60,110,210,0.85)'; c.lineWidth=8;
  c.beginPath(); c.moveTo(-S*0.18,-S*0.02); c.bezierCurveTo(-S*0.28,-S*0.25,-S*0.12,-S*0.48, S*0.05,-S*0.5); c.stroke();
  // نهاية مفتوحة
  c.strokeStyle='rgba(60,110,210,0.6)'; c.lineWidth=5;
  c.beginPath(); c.moveTo(S*0.05,-S*0.5); c.lineTo(S*0.14,-S*0.5); c.stroke();
  c.beginPath(); c.moveTo(S*0.05,-S*0.5); c.lineTo(-S*0.02,-S*0.5); c.stroke();

  // ── الشريان الأبهر (من LV) ─────────────────────────
  c.strokeStyle='rgba(220,50,50,0.85)'; c.lineWidth=9;
  c.beginPath(); c.moveTo(S*0.16,-S*0.0); c.bezierCurveTo(S*0.25,-S*0.22, S*0.1,-S*0.5,-S*0.1,-S*0.52); c.stroke();
  // قوس الأبهر
  c.strokeStyle='rgba(200,40,40,0.75)'; c.lineWidth=7;
  c.beginPath(); c.moveTo(-S*0.1,-S*0.52); c.bezierCurveTo(-S*0.28,-S*0.58,-S*0.44,-S*0.42,-S*0.44,-S*0.18); c.stroke();

  // ── تدفق الدم داخل الحجرات (نبضات) ───────────────
  if(bp > 0.3) {
    // جسيمات تخرج مع الانقباض من LV
    const alpha = Math.min(1,(bp-0.3)*2.5);
    for(let i=0;i<3;i++){
      const ang = -Math.PI*0.55 + i*0.22;
      const dist = S*(0.2 + bp*0.35);
      c.fillStyle = `rgba(220,50,50,${alpha*0.7})`;
      c.beginPath(); c.arc(S*0.16+Math.cos(ang)*dist, S*0.0+Math.sin(ang)*dist, 4+i, 0, Math.PI*2); c.fill();
    }
    // جسيمات من RV
    for(let i=0;i<2;i++){
      const ang = -Math.PI*0.75 + i*0.3;
      const dist = S*(0.15 + bp*0.3);
      c.fillStyle = `rgba(60,110,200,${alpha*0.65})`;
      c.beginPath(); c.arc(-S*0.18+Math.cos(ang)*dist, -S*0.02+Math.sin(ang)*dist, 3+i, 0, Math.PI*2); c.fill();
    }
  }

  // ── تأثير اللمعة (highlight) ──────────────────────
  const hl = c.createRadialGradient(-S*0.2,-S*0.3, 0, -S*0.1,-S*0.15, S*0.55);
  hl.addColorStop(0,'rgba(255,255,255,0.18)');
  hl.addColorStop(0.5,'rgba(255,255,255,0.04)');
  hl.addColorStop(1,'rgba(255,255,255,0)');
  c.fillStyle=hl; heartPath(S); c.fill();

  // ── تسميات الحجرات ─────────────────────────────────
  if(showLabels) {
    const lbl=(txt,x,y,col,sz=11)=>{
      c.fillStyle='rgba(0,0,0,0.45)'; c.font=`bold ${sz}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(txt,x+1,y+1);
      c.fillStyle=col; c.fillText(txt,x,y);
    };
    lbl('RA',-S*0.32,-S*0.2,'#a0c4ff',11);
    lbl('LA', S*0.30,-S*0.2,'#ffaaaa',11);
    lbl('RV',-S*0.26, S*0.28,'#6aabff',11);
    lbl('LV', S*0.24, S*0.28,'#ff8888',11);
  }

  c.restore();
}

// ── TAB 0: تركيب القلب ───────────────────────────────────
function simHeart1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.h1) simState.h1={t:0, highlighted:null, showFlow:true, beatPhase:0};
  const S=simState.h1;

  const chambers=[
    {id:'RA', label:'الأذين الأيمن',  desc:'يستقبل الدم غير المؤكسج القادم من الجسم عبر الوريد الأجوف',   color:'#2C3E6B'},
    {id:'LA', label:'الأذين الأيسر',  desc:'يستقبل الدم المؤكسج القادم من الرئتين عبر الأوردة الرئوية',  color:'#C0392B'},
    {id:'RV', label:'البطين الأيمن',  desc:'يضخ الدم غير المؤكسج إلى الرئتين عبر الشريان الرئوي',       color:'#2980B9'},
    {id:'LV', label:'البطين الأيسر',  desc:'يضخ الدم المؤكسج إلى سائر أعضاء الجسم عبر الشريان الأبهر', color:'#E74C3C'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🫀 تشريح القلب الحقيقي</div>
      <div style="font-size:12px;color:#888">اضغط على حجرة لعرض تفاصيلها</div>
    </div>
    ${chambers.map(ch=>`
      <button class="ctrl-btn" onclick="simState.h1.highlighted='${ch.id}'" style="background:${ch.color};color:white;border:none;font-size:12px;margin-bottom:3px;display:flex;align-items:center;gap:6px">
        <span style="font-size:10px;opacity:0.8">${ch.id}</span> ${ch.label}
      </button>`).join('')}
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-top:6px">
      <input type="checkbox" ${S.showFlow?'checked':''} onchange="simState.h1.showFlow=this.checked"> إظهار التدفق
    </label>
    <button class="ctrl-btn reset" onclick="simState.h1.highlighted=null">↺ مسح التحديد</button>
    <div class="info-box" style="font-size:11.5px;line-height:2;margin-top:8px">
      🔵 RA/RV — دم غير مؤكسج<br>
      🔴 LA/LV — دم مؤكسج<br>
      ⚡ الصمامات تمنع الرجوع<br>
      💓 ٧٠ نبضة/دقيقة في الراحة
    </div>`);

  // Click detection على الحجرات
  cv.onclick=function(e){
    const rect=cv.getBoundingClientRect();
    const mx=(e.clientX-rect.left)*(cv.width/rect.width);
    const my=(e.clientY-rect.top)*(cv.height/rect.height);
    const cx=cv.width/2, cy=cv.height*0.50;
    const sz=Math.min(cv.width,cv.height)*0.38;
    const pts={
      RA:[-sz*0.32*0.88, -sz*0.2*0.88, sz*0.22],
      LA:[ sz*0.30*0.88, -sz*0.2*0.88, sz*0.22],
      RV:[-sz*0.24*0.88,  sz*0.28*0.88, sz*0.25],
      LV:[ sz*0.22*0.88,  sz*0.28*0.88, sz*0.25],
    };
    Object.entries(pts).forEach(([id,[dx,dy,r]])=>{
      if(Math.hypot(mx-(cx+dx), my-(cy+dy))<r) S.highlighted=id;
    });
  };

  function draw(){
    if(currentSim!=='heart8'||currentTab!==0){ cv.onclick=null; return; }
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',45);

    const cx=w/2, cy=h*0.50;
    const heartSize=Math.min(w,h)*0.38;

    U7.txt(c,'تشريح القلب الحقيقي — الحجرات الأربع',w/2,22,'#7A0000',14,true);

    // نبضة هادئة في تاب التشريح
    const gentleBeat=0.4+Math.sin(S.t*4.5)*0.4; // 0..0.8 — نبض خفيف
    drawAnatomicalHeart(c, cx, cy, heartSize, gentleBeat*0.3, true, S.highlighted);

    // تدفق الدم (نقاط متحركة)
    if(S.showFlow){
      const ft=(S.t*0.35)%1;
      // من RA إلى RV (أزرق)
      const rax=cx-heartSize*0.28, ray=cy-heartSize*0.18;
      const rvx=cx-heartSize*0.22, rvy=cy+heartSize*0.26;
      const rfx=rax+(rvx-rax)*ft, rfy=ray+(rvy-ray)*ft;
      c.fillStyle='rgba(60,110,210,0.85)'; c.beginPath(); c.arc(rfx,rfy,5,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(60,110,210,0.25)'; c.lineWidth=1.5; c.setLineDash([3,3]);
      c.beginPath(); c.moveTo(rax,ray); c.lineTo(rvx,rvy); c.stroke(); c.setLineDash([]);
      // من LA إلى LV (أحمر)
      const lax=cx+heartSize*0.27, lay=cy-heartSize*0.18;
      const lvx=cx+heartSize*0.20, lvy=cy+heartSize*0.26;
      const lfx=lax+(lvx-lax)*ft, lfy=lay+(lvy-lay)*ft;
      c.fillStyle='rgba(220,60,60,0.85)'; c.beginPath(); c.arc(lfx,lfy,5,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(220,60,60,0.25)'; c.lineWidth=1.5; c.setLineDash([3,3]);
      c.beginPath(); c.moveTo(lax,lay); c.lineTo(lvx,lvy); c.stroke(); c.setLineDash([]);
    }

    // Info box للحجرة المحددة
    if(S.highlighted){
      const ch=chambers.find(x=>x.id===S.highlighted);
      if(ch){
        c.fillStyle='rgba(255,255,255,0.94)'; c.strokeStyle=ch.color; c.lineWidth=2.5;
        c.beginPath(); c.roundRect(w*0.04,h*0.80,w*0.92,h*0.17,10); c.fill(); c.stroke();
        U7.txt(c,ch.id+' — '+ch.label,w/2,h*0.838,ch.color,13,true);
        U7.txt(c,ch.desc,w/2,h*0.872,'#444',10.5,false);
      }
    }

    // أسماء الأوعية
    U7.txt(c,'الوريد الأجوف',   cx-heartSize*0.33,cy-heartSize*0.62,'#5080d0',9,true);
    U7.txt(c,'الشريان الأبهر',  cx+heartSize*0.05,cy-heartSize*0.62,'#d04040',9,true);
    U7.txt(c,'الشريان الرئوي',  cx-heartSize*0.28,cy-heartSize*0.72,'#4070c0',9,true);

    S.t+=0.022;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── TAB 1: الانقباض والانبساط ────────────────────────────
function simHeart2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.h2) simState.h2={t:0,running:true,bpm:70};
  const S=simState.h2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ الانقباض والانبساط</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.h2.running=!simState.h2.running;this.textContent=simState.h2.running?'⏸ إيقاف':'▶ تشغيل'">⏸ إيقاف</button>
    <div class="ctrl-section" style="margin-top:8px">
      <div class="ctrl-label">معدل النبض (نبضة/دقيقة)</div>
      <input type="range" min="40" max="180" step="5" value="70"
        oninput="simState.h2.bpm=+this.value;document.getElementById('h2bpm').textContent=this.value;window._stopHeartbeat();if(simState.h2.running)window._playHeartbeat(+this.value)"
        style="width:100%">
      <div id="h2bpm" style="text-align:center;font-size:18px;font-weight:800;color:#C0392B">70</div>
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      🔴 انقباض: ضخ الدم للخارج<br>
      🔵 انبساط: امتلاء القلب بالدم<br>
      ✅ الصمامات تمنع الرجوع<br>
      💪 حجم الضربة ≈ 70 مل
    </div>`);

  function draw(){
    if(currentSim!=='heart8'||currentTab!==1){ return; }
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',40);

    const cx=w/2, cy=h*0.45;
    const heartSize=Math.min(w,h)*0.36;

    // ── حساب مرحلة الدورة ──────────────────────────
    const cycleDur=60/S.bpm;
    const phase=(S.t % cycleDur) / cycleDur; // 0..1

    // منحنى النبضة: ارتفاع حاد ثم هبوط ناعم (مثل موجة P-QRS-T)
    // 0..0.12: انقباض سريع, 0.12..0.45: ارتخاء, 0.45..1: دياستول
    let beatPhase;
    if(phase < 0.12)      beatPhase = Math.sin((phase/0.12)*Math.PI);        // صعود وهبوط سريع
    else if(phase < 0.45) beatPhase = Math.max(0,1-((phase-0.12)/0.33)*1.4)*0.25; // تلاشٍ ناعم
    else                   beatPhase = 0;                                      // دياستول كامل

    const systole = phase < 0.35;
    const phaseName = systole ? 'انقباض (Systole)' : 'انبساط (Diastole)';
    const phaseColor = systole ? '#C0392B' : '#2980B9';

    U7.txt(c,'دقة القلب — القلب الحقيقي',w/2,22,'#7A0000',14,true);

    // ── رسم القلب التشريحي مع النبضة ───────────────
    drawAnatomicalHeart(c, cx, cy, heartSize, beatPhase, false, null);

    // ── مرحلة النبضة ────────────────────────────────
    U7.pill(c, cx, cy+heartSize*0.98+22, 220, 32, phaseColor, phaseName, 'white');

    // ── سهام الضخ عند الانقباض ──────────────────────
    if(beatPhase > 0.25){
      const alpha = Math.min(1,(beatPhase-0.25)*3);
      const arrLen = heartSize * 0.3 * beatPhase;
      // أبهر: يسار وأعلى
      c.strokeStyle=`rgba(220,50,50,${alpha})`; c.lineWidth=3;
      c.beginPath(); c.moveTo(cx+heartSize*0.1, cy-heartSize*0.08);
      c.lineTo(cx+heartSize*0.1-arrLen*0.4, cy-heartSize*0.08-arrLen); c.stroke();
      c.fillStyle=`rgba(220,50,50,${alpha})`;
      const ax1=cx+heartSize*0.1-arrLen*0.4, ay1=cy-heartSize*0.08-arrLen;
      c.beginPath(); c.moveTo(ax1,ay1); c.lineTo(ax1-7,ay1+10); c.lineTo(ax1+7,ay1+10); c.closePath(); c.fill();
      // شريان رئوي: يمين وأعلى
      c.strokeStyle=`rgba(60,110,210,${alpha})`; c.lineWidth=3;
      c.beginPath(); c.moveTo(cx-heartSize*0.16, cy-heartSize*0.02);
      c.lineTo(cx-heartSize*0.16-arrLen*0.2, cy-heartSize*0.02-arrLen*0.9); c.stroke();
      c.fillStyle=`rgba(60,110,210,${alpha})`;
      const ax2=cx-heartSize*0.16-arrLen*0.2, ay2=cy-heartSize*0.02-arrLen*0.9;
      c.beginPath(); c.moveTo(ax2,ay2); c.lineTo(ax2-6,ay2+9); c.lineTo(ax2+6,ay2+9); c.closePath(); c.fill();
    }

    // ── خط ECG في الأسفل ────────────────────────────
    const ecgY=h*0.855, ecgH=h*0.075;
    c.strokeStyle='rgba(39,174,96,0.8)'; c.lineWidth=2;
    c.beginPath();
    for(let i=0;i<w;i++){
      const tp=((S.t - (i/w)*cycleDur*4) % cycleDur) / cycleDur;
      let yy;
      const t2=((tp%1)+1)%1;
      if     (t2<0.05)  yy=ecgY;
      else if(t2<0.08)  yy=ecgY-ecgH*0.35;
      else if(t2<0.12)  yy=ecgY-ecgH*2.1;
      else if(t2<0.16)  yy=ecgY+ecgH*0.85;
      else if(t2<0.22)  yy=ecgY-ecgH*0.55;
      else if(t2<0.27)  yy=ecgY;
      else               yy=ecgY;
      i===0?c.moveTo(i,yy):c.lineTo(i,yy);
    }
    c.stroke();
    U7.txt(c,'مخطط القلب الكهربائي (ECG)',w/2,ecgY-ecgH*2.8,'#888',11,false);

    // ── معدل النبض ───────────────────────────────────
    U7.txt(c, S.bpm+' نبضة/دقيقة', w/2, h*0.935, '#C0392B', 16, true);

    if(S.running) S.t += 0.016;
    animFrame=requestAnimationFrame(draw);
  }
  if(S.running) window._playHeartbeat(S.bpm);
  draw();
}


// ══════════════════════════════════════════════════════════
// 7-3 · الدم — مكوّناته ووظائفه
// ══════════════════════════════════════════════════════════
function simBlood1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.b1) simState.b1={t:0,zoom:null,cells:[]};
  const S=simState.b1;

  // Generate cells once
  if(!S.cells.length){
    for(let i=0;i<60;i++) S.cells.push({
      x:Math.random()*0.7+0.15,y:Math.random()*0.6+0.2,
      type:i<40?'rbc':i<52?'wbc':'platelet',
      phase:Math.random()*Math.PI*2, speed:0.3+Math.random()*0.4, dx:(Math.random()-0.5)*0.001, dy:(Math.random()-0.5)*0.001
    });
  }

  const types={
    rbc:{label:'خلية دم حمراء', color:'#C0392B', size:9, desc:'تحمل الأكسجين بالهيموجلوبين'},
    wbc:{label:'خلية دم بيضاء', color:'#5D6D7E', size:13, desc:'تدافع عن الجسم ضد الميكروبات'},
    platelet:{label:'صفيحة دموية', color:'#F39C12', size:6, desc:'تساعد على تجلط الدم والتئام الجروح'}
  };
  const plasma={label:'البلازما', color:'rgba(255,220,100,0.3)', desc:'السائل الأصفر الناقل للمواد المذابة'};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🩸 مكوّنات الدم</div>
    </div>
    ${Object.entries(types).map(([k,v])=>`
      <button class="ctrl-btn" onclick="simState.b1.zoom='${k}'" style="border-right:4px solid ${v.color};text-align:right;padding-right:12px;font-size:12px;margin-bottom:3px">
        <div style="font-weight:700">${v.label}</div>
        <div style="font-size:10px;color:#888">${v.desc}</div>
      </button>`).join('')}
    <button class="ctrl-btn" onclick="simState.b1.zoom='plasma'" style="border-right:4px solid #D4A017;font-size:12px;margin-bottom:3px">
      <div style="font-weight:700">${plasma.label}</div>
      <div style="font-size:10px;color:#888">${plasma.desc}</div>
    </button>
    <button class="ctrl-btn reset" onclick="simState.b1.zoom=null">↺ عرض الكل</button>`);

  cv.onclick=function(e){
    const rect=cv.getBoundingClientRect();
    const mx=(e.clientX-rect.left)*(cv.width/rect.width)/cv.width;
    const my=(e.clientY-rect.top)*(cv.height/rect.height)/cv.height;
    S.cells.forEach(cell=>{
      if(Math.abs(cell.x-mx)<0.04&&Math.abs(cell.y-my)<0.05) S.zoom=cell.type;
    });
  };

  function draw(){
    if(currentSim!=='blood8'||currentTab!==0){ cv.onclick=null; return; }
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    // Blood plasma background
    c.fillStyle='rgba(255,235,180,0.5)'; c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,100,50,0.06)',35);

    U7.txt(c,'الدم تحت المجهر',w/2,22,'#7A0000',14,true);

    // Plasma label
    U7.txt(c,'البلازما (سائل أصفر باهت)',w/2,h*0.89,'#B8860B',11,false);

    // Move & draw cells
    S.cells.forEach(cell=>{
      cell.x+=cell.dx+Math.sin(S.t*cell.speed+cell.phase)*0.0003;
      cell.y+=cell.dy+Math.cos(S.t*cell.speed+cell.phase)*0.0003;
      if(cell.x<0.1||cell.x>0.9) cell.dx*=-1;
      if(cell.y<0.1||cell.y>0.85) cell.dy*=-1;

      const t=types[cell.type];
      const cx2=cell.x*w, cy2=cell.y*h;
      const r=t.size*(w/500);
      const isZoomed=S.zoom===cell.type;
      const alpha=S.zoom&&!isZoomed?0.2:1;

      c.globalAlpha=alpha;
      if(cell.type==='rbc'){
        // Biconcave disk shape
        const g=c.createRadialGradient(cx2-r*0.2,cy2-r*0.2,0,cx2,cy2,r);
        g.addColorStop(0,'#E74C3C'); g.addColorStop(0.4,'#C0392B'); g.addColorStop(0.8,'#922B21'); g.addColorStop(1,'rgba(192,57,43,0.3)');
        c.fillStyle=g;
        c.beginPath(); c.ellipse(cx2,cy2,r,r*0.65,Math.sin(S.t+cell.phase)*0.5,0,Math.PI*2); c.fill();
        // Center dimple
        c.fillStyle='rgba(100,0,0,0.3)'; c.beginPath(); c.ellipse(cx2,cy2,r*0.3,r*0.2,0,0,Math.PI*2); c.fill();
      } else if(cell.type==='wbc'){
        // Irregular larger cell with nucleus
        c.fillStyle='rgba(93,109,126,0.8)';
        c.beginPath(); c.arc(cx2,cy2,r,0,Math.PI*2); c.fill();
        c.fillStyle='rgba(40,55,70,0.9)'; c.beginPath(); c.arc(cx2+r*0.1,cy2-r*0.1,r*0.55,0,Math.PI*2); c.fill();
      } else {
        // Platelet — small irregular
        c.fillStyle='rgba(243,156,18,0.8)';
        c.beginPath(); c.arc(cx2,cy2,r,0,Math.PI*2); c.fill();
      }
      c.globalAlpha=1;

      if(isZoomed){
        c.strokeStyle='white'; c.lineWidth=2;
        c.beginPath(); c.arc(cx2,cy2,r+3,0,Math.PI*2); c.stroke();
      }
    });

    // Info panel if zoomed
    if(S.zoom&&S.zoom!=='plasma'){
      const t=types[S.zoom];
      c.fillStyle='rgba(255,255,255,0.92)'; c.strokeStyle=t.color; c.lineWidth=2.5;
      c.beginPath(); c.roundRect(w*0.05,h*0.78,w*0.9,h*0.17,10); c.fill(); c.stroke();
      U7.txt(c,t.label,w/2,h*0.81,t.color,13,true);
      U7.txt(c,t.desc,w/2,h*0.84,t.color,11,false);
      // Count info
      const counts={rbc:'5 مليون خلية/مم³',wbc:'4,000-11,000 خلية/مم³',platelet:'150,000-400,000/مم³'};
      U7.txt(c,'العدد الطبيعي: '+counts[S.zoom],w/2,h*0.875,'#555',11,false);
    } else if(S.zoom==='plasma'){
      c.fillStyle='rgba(255,255,255,0.92)'; c.strokeStyle='#D4A017'; c.lineWidth=2.5;
      c.beginPath(); c.roundRect(w*0.05,h*0.78,w*0.9,h*0.17,10); c.fill(); c.stroke();
      U7.txt(c,plasma.label,w/2,h*0.81,'#B8860B',13,true);
      U7.txt(c,plasma.desc,w/2,h*0.84,'#B8860B',11,false);
      U7.txt(c,'تشكّل 55% من حجم الدم الكلي',w/2,h*0.875,'#555',11,false);
    }

    U7.txt(c,'اضغط على خلية لمعرفة تفاصيلها',w/2,h-16,'#888',11,false);

    S.t+=0.02;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 7-3 TAB 1: وظائف الخلايا ──
function simBlood2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.b2) simState.b2={t:0,step:0,playing:true};
  const S=simState.b2;

  const scenarios=[
    {title:'خلايا الدم الحمراء تحمل O₂',color:'#C0392B',fn:drawO2Transport},
    {title:'خلايا الدم البيضاء تبتلع بكتيريا',color:'#2C3E50',fn:drawWBCAttack},
    {title:'الصفائح تُوقف النزيف',color:'#F39C12',fn:drawClotting}
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 وظائف مكوّنات الدم</div>
    </div>
    ${scenarios.map((s,i)=>`<button class="ctrl-btn" onclick="simState.b2.step=${i};simState.b2.t=0" style="border-right:4px solid ${s.color};font-size:12px;margin-bottom:4px">
      ${['🔴','⚪','🩹'][i]} ${s.title}
    </button>`).join('')}
    <button class="ctrl-btn play" onclick="simState.b2.playing=!simState.b2.playing;this.textContent=simState.b2.playing?'⏸ إيقاف':'▶ تشغيل'">⏸ إيقاف</button>
    <button class="ctrl-btn reset" onclick="simState.b2.step=(simState.b2.step+1)%3;simState.b2.t=0">← التالي</button>
    <div class="info-box" style="font-size:12px;line-height:1.9;margin-top:8px">
      كل مكوّن من الدم<br>له وظيفة حيوية مختلفة!
    </div>`);

  function drawO2Transport(w,h){
    const cx=w/2, cy=h/2;
    U7.txt(c,'نقل الأكسجين من الرئة إلى الخلايا',w/2,30,'#C0392B',13,true);
    // Lung to tissue path
    c.strokeStyle='rgba(200,50,50,0.25)'; c.lineWidth=30; c.lineCap='round';
    c.beginPath(); c.moveTo(w*0.1,cy); c.lineTo(w*0.9,cy); c.stroke();
    // Label ends
    U7.pill(c,w*0.12,cy-30,80,26,'rgba(60,130,200,0.8)','الرئة','white');
    U7.pill(c,w*0.88,cy-30,80,26,'rgba(150,80,200,0.8)','الأنسجة','white');

    // Animated RBC
    const pos=(S.t*0.15)%1;
    const rbcX=w*0.1+pos*(w*0.8);
    const isOxy=pos<0.5;
    const g=c.createRadialGradient(rbcX-7,cy-5,0,rbcX,cy,14);
    g.addColorStop(0,isOxy?'#E74C3C':'#5D6D7E');
    g.addColorStop(1,isOxy?'#922B21':'#2C3E50');
    c.fillStyle=g; c.beginPath(); c.ellipse(rbcX,cy,14,9,0,0,Math.PI*2); c.fill();
    // O2 dots
    if(isOxy){
      for(let i=0;i<3;i++){
        const a=(Math.PI*2/3)*i+S.t*2;
        c.fillStyle='rgba(0,180,100,0.9)'; c.beginPath();
        c.arc(rbcX+Math.cos(a)*10,cy+Math.sin(a)*6,3,0,Math.PI*2); c.fill();
        c.font='7px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText('O₂',rbcX+Math.cos(a)*10,cy+Math.sin(a)*6);
      }
    }
    // Color legend
    U7.txt(c,isOxy?'مؤكسج (أحمر)':'غير مؤكسج (داكن)',w/2,h*0.72,isOxy?'#C0392B':'#5D6D7E',12,true);
  }

  function drawWBCAttack(w,h){
    const cx=w/2, cy=h/2;
    U7.txt(c,'خلية دم بيضاء تبتلع بكتيريا وتقتلها',w/2,30,'#2C3E50',13,true);
    // Bacteria
    const nBac=5;
    for(let i=0;i<nBac;i++){
      const phase=S.t*0.5+i*(Math.PI*2/nBac);
      const br=Math.min(120,90+S.t*5);
      const bx=cx+Math.cos(phase)*br, by=cy+Math.sin(phase)*br*0.6;
      const captured=br<70;
      c.fillStyle=captured?'rgba(50,150,50,0.5)':'rgba(200,50,50,0.8)';
      c.beginPath(); c.ellipse(bx,by,6,10,phase,0,Math.PI*2); c.fill();
      // flagella
      c.strokeStyle=captured?'rgba(50,150,50,0.4)':'rgba(200,50,50,0.6)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(bx,by+10); c.quadraticCurveTo(bx+10,by+20,bx+5,by+28); c.stroke();
    }
    // WBC (amoeba-like)
    const wbcR=38+Math.sin(S.t*2)*4;
    const g=c.createRadialGradient(cx-10,cy-10,0,cx,cy,wbcR);
    g.addColorStop(0,'rgba(93,109,126,0.95)'); g.addColorStop(1,'rgba(52,73,94,0.7)');
    c.fillStyle=g; c.beginPath();
    for(let a=0;a<Math.PI*2;a+=0.3){
      const r2=wbcR+Math.sin(a*4+S.t*3)*6;
      const x=cx+Math.cos(a)*r2, y=cy+Math.sin(a)*r2;
      a===0?c.moveTo(x,y):c.lineTo(x,y);
    }
    c.closePath(); c.fill();
    // Nucleus
    c.fillStyle='rgba(30,50,70,0.9)'; c.beginPath(); c.arc(cx+5,cy-5,14,0,Math.PI*2); c.fill();
    U7.txt(c,'نواة',cx+5,cy-5,'rgba(255,255,255,0.8)',9,false);
    U7.txt(c,'خلية دم بيضاء',cx,cy+wbcR+16,'#2C3E50',11,true);
    U7.txt(c,'تنتج أجساماً مضادة وإنزيمات قاتلة',w/2,h*0.82,'#555',11,false);
  }

  function drawClotting(w,h){
    U7.txt(c,'الصفائح الدموية تُوقف النزيف',w/2,30,'#F39C12',13,true);
    // Vessel with cut
    c.fillStyle='rgba(200,50,50,0.3)'; c.fillRect(0,h*0.35,w,h*0.3);
    // Cut opening
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(w*0.42,h*0.2,w*0.16,h*0.6);

    // Fibers forming
    const coverage=Math.min(1,S.t*0.04);
    for(let i=0;i<30*coverage;i++){
      const x=w*0.42+i*(w*0.16/30), y=h*0.35+Math.random()*h*0.3;
      c.strokeStyle='rgba(210,150,50,0.6)'; c.lineWidth=1.5;
      c.beginPath(); c.moveTo(x,h*0.35); c.lineTo(x+Math.sin(i)*20,h*0.65); c.stroke();
    }
    // Platelets converging
    for(let i=0;i<8;i++){
      const t2=Math.min(1,S.t*0.05);
      const startX=w*0.4+Math.cos(i)*60, startY=h*0.5+Math.sin(i)*40;
      const endX=w*0.5+Math.cos(i)*10, endY=h*0.5+Math.sin(i)*8;
      const px=startX+(endX-startX)*t2, py=startY+(endY-startY)*t2;
      c.fillStyle='rgba(243,156,18,0.9)'; c.beginPath(); c.arc(px,py,5,0,Math.PI*2); c.fill();
    }
    U7.txt(c,'صفائح تتكتّل عند موضع الجرح',w/2,h*0.82,'#F39C12',11,false);
    U7.txt(c,'وتنتج ألياف فيبرين لسد الجرح',w/2,h*0.87,'#555',11,false);
  }

  function draw(){
    if(currentSim!=='blood8'||currentTab!==1){ cv.onclick=null; return; }
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',40);
    scenarios[S.step].fn(w,h);
    if(S.playing) S.t+=0.018;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-4 · الأوعية الدموية
// ══════════════════════════════════════════════════════════
function simVessels1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.v1) simState.v1={t:0,pressure:80,highlighted:null};
  const S=simState.v1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔴 الشرايين — تركيبها</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">ضغط الدم (mmHg)</div>
      <input type="range" min="60" max="160" step="5" value="80"
        oninput="simState.v1.pressure=+this.value;document.getElementById('v1p').textContent=this.value"
        style="width:100%">
      <div id="v1p" style="text-align:center;font-size:18px;font-weight:800;color:#C0392B">80</div>
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      🔴 الشرايين تحمل الدم <strong>من القلب</strong><br>
      جدران سميكة ومرنة<br>
      تتمدد مع كل نبضة (النبض!)<br>
      ✅ السبب: تحمل الدم بضغط عالٍ
    </div>
    <button class="ctrl-btn" onclick="simState.v1.highlighted=!simState.v1.highlighted">🔍 تكبير الجدار</button>`);

  function draw(){
    if(currentSim!=='vessels8'||currentTab!==0) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',40);

    U7.txt(c,'الشريان — Artery',w/2,24,'#7A0000',15,true);

    const pFrac=S.pressure/120;
    const pulse=Math.sin(S.t*5)*0.04*pFrac;
    const baseR=h*0.22;
    const outerR=baseR*(1+pulse);
    const innerR=outerR*0.6;

    const cx=w/2, cy=h*0.5;

    // Outer elastic wall
    const gWall=c.createRadialGradient(cx,cy,innerR,cx,cy,outerR);
    gWall.addColorStop(0,'rgba(200,100,100,0.9)');
    gWall.addColorStop(0.5,'rgba(180,60,60,0.95)');
    gWall.addColorStop(1,'rgba(150,30,30,0.8)');
    c.fillStyle=gWall; c.beginPath(); c.arc(cx,cy,outerR,0,Math.PI*2); c.fill();

    // Muscle layer
    c.strokeStyle='rgba(120,40,40,0.5)'; c.lineWidth=3; c.setLineDash([8,4]);
    c.beginPath(); c.arc(cx,cy,outerR*0.82,0,Math.PI*2); c.stroke();
    c.setLineDash([]);

    // Lumen (blood)
    const bloodG=c.createRadialGradient(cx-innerR*0.2,cy-innerR*0.2,0,cx,cy,innerR);
    bloodG.addColorStop(0,'#E74C3C'); bloodG.addColorStop(1,'#922B21');
    c.fillStyle=bloodG; c.beginPath(); c.arc(cx,cy,innerR,0,Math.PI*2); c.fill();

    // Moving blood cells
    for(let i=0;i<8;i++){
      const a=(S.t*1.5+i*(Math.PI*2/8))%(Math.PI*2);
      const r2=innerR*0.6;
      const bx=cx+Math.cos(a)*r2, by=cy+Math.sin(a)*r2*0.4;
      c.fillStyle='rgba(255,100,100,0.7)'; c.beginPath(); c.ellipse(bx,by,6,4,a,0,Math.PI*2); c.fill();
    }

    // Labels
    c.strokeStyle='rgba(255,255,255,0.6)'; c.lineWidth=1.5; c.setLineDash([3,3]);
    [[outerR*0.92,45,'جدار خارجي مرن'],[outerR*0.7,135,'طبقة عضلية'],[innerR*0.5,0,'تجويف الدم (lumen)']].forEach(([r3,deg,label])=>{
      const angle=deg*Math.PI/180;
      const lx=cx+Math.cos(angle)*r3, ly=cy+Math.sin(angle)*r3;
      const ex=cx+Math.cos(angle)*(outerR+30), ey=cy+Math.sin(angle)*(outerR+30);
      c.beginPath(); c.moveTo(lx,ly); c.lineTo(ex,ey); c.stroke();
      c.setLineDash([]);
      c.fillStyle='#333'; c.font='11px Tajawal'; c.textAlign= deg<90?'left':'right';
      c.textBaseline='middle'; c.fillText(label,ex+(deg<90?4:-4),ey);
      c.setLineDash([3,3]);
    });
    c.setLineDash([]);

    // Pressure indicator
    const pColor=S.pressure<90?'#27AE60':S.pressure<120?'#F39C12':'#C0392B';
    U7.txt(c,`الضغط: ${S.pressure} mmHg`,w/2,h*0.88,pColor,14,true);
    U7.txt(c,S.pressure<90?'ضغط طبيعي':S.pressure<120?'ضغط مرتفع قليلاً':'ضغط مرتفع جداً',w/2,h*0.93,pColor,12,false);

    S.t+=0.025;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simVessels2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.v2) simState.v2={t:0,showValve:true};
  const S=simState.v2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔵 الأوردة — تركيبها</div>
    </div>
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-bottom:8px">
      <input type="checkbox" ${S.showValve?'checked':''} onchange="simState.v2.showValve=this.checked"> إظهار الصمامات
    </label>
    <div class="info-box" style="font-size:12px;line-height:2">
      🔵 الأوردة تحمل الدم <strong>إلى القلب</strong><br>
      جدران أرق من الشرايين<br>
      تجويف أوسع (قطر أكبر)<br>
      ✅ تحتوي على <strong>صمامات</strong><br>
      تمنع رجوع الدم للأسفل
    </div>`);

  function draw(){
    if(currentSim!=='vessels8'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#F5F5FF';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(50,50,200,0.04)',40);
    U7.txt(c,'الوريد — Vein',w/2,24,'#1A2A6B',15,true);

    // Draw a vein cross-section AND longitudinal view
    const cx=w*0.35, cy=h*0.5;
    const outerR=h*0.22, innerR=outerR*0.75; // Wider lumen, thinner walls

    // Outer wall (thin)
    c.fillStyle='rgba(100,100,180,0.7)'; c.beginPath(); c.arc(cx,cy,outerR,0,Math.PI*2); c.fill();
    // Lumen
    const bloodG=c.createRadialGradient(cx,cy,0,cx,cy,innerR);
    bloodG.addColorStop(0,'#5B9BD5'); bloodG.addColorStop(1,'#2C5F8A');
    c.fillStyle=bloodG; c.beginPath(); c.arc(cx,cy,innerR,0,Math.PI*2); c.fill();
    // Moving blood cells (slower)
    for(let i=0;i<6;i++){
      const a=(S.t*0.8+i*(Math.PI*2/6))%(Math.PI*2);
      const r2=innerR*0.55;
      const bx=cx+Math.cos(a)*r2, by=cy+Math.sin(a)*r2*0.4;
      c.fillStyle='rgba(80,150,220,0.7)'; c.beginPath(); c.ellipse(bx,by,6,4,a,0,Math.PI*2); c.fill();
    }
    // Wall label arrows
    c.strokeStyle='rgba(100,100,180,0.6)'; c.lineWidth=1.5; c.setLineDash([3,3]);
    ['جدار رقيق','تجويف واسع'].forEach((label,i)=>{
      const r3=i===0?outerR*0.88:innerR*0.4;
      const a=i===0?-Math.PI/4:Math.PI/4;
      const lx=cx+Math.cos(a)*r3, ly=cy+Math.sin(a)*r3;
      const ex=cx+Math.cos(a)*(outerR+28), ey=cy+Math.sin(a)*(outerR+28);
      c.beginPath(); c.moveTo(lx,ly); c.lineTo(ex,ey); c.stroke();
      c.setLineDash([]);
      c.fillStyle='#333'; c.font='11px Tajawal';
      c.textAlign=i===0?'right':'right'; c.textBaseline='middle';
      c.fillText(label,ex-4,ey);
      c.setLineDash([3,3]);
    });
    c.setLineDash([]);

    // Longitudinal valve diagram
    const vx=w*0.72, vy=h*0.5, vw=w*0.22, vh=h*0.55;
    c.fillStyle='rgba(100,100,180,0.3)'; c.strokeStyle='rgba(80,80,180,0.6)'; c.lineWidth=2;
    c.beginPath(); c.rect(vx-vw/2,vy-vh/2,vw,vh); c.fill(); c.stroke();
    U7.txt(c,'مقطع طولي',vx,vy-vh/2-12,'#1A2A6B',11,true);

    if(S.showValve){
      // Valve flaps
      const valveY=vy;
      const vo=Math.sin(S.t*0.7)*0.6+0.6; // Open fraction (mostly open)
      [[vx-vw*0.1,valveY,-1],[vx+vw*0.1,valveY,1]].forEach(([vvx,vvy,dir])=>{
        c.fillStyle='rgba(150,100,50,0.8)'; c.strokeStyle='rgba(100,60,20,0.9)'; c.lineWidth=2;
        c.beginPath();
        c.moveTo(vvx,vvy-vh*0.12);
        c.quadraticCurveTo(vvx+dir*vw*0.2*vo,vvy,vvx,vvy+vh*0.12);
        c.closePath(); c.fill(); c.stroke();
      });
      U7.txt(c,'صمام مفتوح',vx,valveY+vh*0.17,'#7A4A10',10,true);
      // Arrow showing blood going UP
      c.strokeStyle='rgba(91,155,213,0.8)'; c.lineWidth=3;
      c.beginPath(); c.moveTo(vx,vy+vh*0.35); c.lineTo(vx,vy-vh*0.35); c.stroke();
      c.fillStyle='rgba(91,155,213,0.8)';
      c.beginPath(); c.moveTo(vx,vy-vh*0.35); c.lineTo(vx-8,vy-vh*0.25); c.lineTo(vx+8,vy-vh*0.25); c.closePath(); c.fill();
    }

    // Blood cells moving upward in vein
    const cellT=(S.t*0.3)%1;
    const bcY=vy+vh/2-cellT*vh;
    c.fillStyle='rgba(91,155,213,0.8)'; c.beginPath(); c.ellipse(vx,bcY,8,5,0,0,Math.PI*2); c.fill();

    U7.txt(c,'الدم يتدفق نحو القلب ↑',vx,vy+vh/2+18,'#2980B9',11,false);

    S.t+=0.025;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simVessels3(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.v3) simState.v3={t:0,showDiffusion:true,zoom:1};
  const S=simState.v3;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 الشعيرات الدموية</div>
    </div>
    <label style="display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer;margin-bottom:8px">
      <input type="checkbox" ${S.showDiffusion?'checked':''} onchange="simState.v3.showDiffusion=this.checked"> إظهار انتشار المواد
    </label>
    <div class="ctrl-section">
      <div class="ctrl-label">تكبير</div>
      <input type="range" min="1" max="3" step="0.5" value="1" oninput="simState.v3.zoom=+this.value;document.getElementById('v3z').textContent=this.value+'×'" style="width:100%">
      <div id="v3z" style="text-align:center;font-size:13px;color:#666">1×</div>
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      أصغر وعاء دموي!<br>
      جدار = طبقة خلية واحدة<br>
      ✅ O₂ وجلوكوز → يخرجان للأنسجة<br>
      ✅ CO₂ ونفايات → يدخلان للدم<br>
      الربط بين الشرايين والأوردة
    </div>`);

  function draw(){
    if(currentSim!=='vessels8'||currentTab!==2) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#F5FFF5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(50,150,50,0.04)',40);
    U7.txt(c,'الشعيرة الدموية — Capillary',w/2,24,'#1A6B1A',15,true);

    const z=S.zoom;
    const capW=h*0.06*z, capL=w*0.7;
    const cx=w/2, cy=h*0.5;

    // Capillary tube (very thin walls)
    c.fillStyle='rgba(220,120,100,0.6)'; c.strokeStyle='rgba(180,80,60,0.7)'; c.lineWidth=2;
    c.beginPath(); c.rect(cx-capL/2,cy-capW/2,capL,capW); c.fill(); c.stroke();

    // Thin wall indicator
    c.strokeStyle='rgba(180,80,60,0.4)'; c.lineWidth=1; c.setLineDash([2,2]);
    c.beginPath(); c.rect(cx-capL/2+3,cy-capW/2+3,capL-6,capW-6); c.stroke();
    c.setLineDash([]);

    // Wall thickness annotation
    const wallT=3;
    c.strokeStyle='rgba(100,100,100,0.6)'; c.lineWidth=1.5;
    [[cx-capL/2,cy-capW/2,cx-capL/2,cy-capW*0.8,'طبقة خلية واحدة (≈1μm)']].forEach(([x1,y1,x2,y2,lbl])=>{
      c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
      c.fillStyle='#444'; c.font='10px Tajawal'; c.textAlign='center'; c.textBaseline='bottom';
      c.fillText(lbl,cx-capL/2,y2-4);
    });

    // Red blood cells barely fitting
    const nRBC=6;
    for(let i=0;i<nRBC;i++){
      const t2=(S.t*0.15+i/nRBC)%1;
      const bx=cx-capL/2+t2*capL;
      const r=capW*0.38;
      c.fillStyle='rgba(192,57,43,0.85)'; c.beginPath(); c.ellipse(bx,cy,r,r*0.72,0,0,Math.PI*2); c.fill();
    }

    // Diffusing molecules
    if(S.showDiffusion){
      const nMol=12;
      for(let i=0;i<nMol;i++){
        const phase=(S.t*0.4+i*(Math.PI*2/nMol))%(Math.PI*2);
        const isO2=i%2===0;
        const startY=isO2?cy-capW*0.3:cy+capW*0.3;
        const progress=Math.sin(phase)*0.5+0.5;
        const mx2=cx-capL*0.35+i*(capL*0.7/nMol);
        const my2=startY+(isO2?-1:1)*capW*(0.7+progress*0.8);
        const alpha=0.5+progress*0.5;
        c.fillStyle=isO2?`rgba(0,180,100,${alpha})`:`rgba(50,50,200,${alpha})`;
        c.beginPath(); c.arc(mx2,my2,4,0,Math.PI*2); c.fill();
        c.font='7px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(isO2?'O₂':'CO₂',mx2,my2);
      }
      // Arrows
      c.fillStyle='rgba(0,180,100,0.5)'; c.font='10px Tajawal'; c.textAlign='center';
      c.fillText('→ O₂ يخرج للأنسجة',cx,cy-capW*0.9);
      c.fillStyle='rgba(50,50,200,0.5)';
      c.fillText('← CO₂ يدخل للدم',cx,cy+capW*0.9);
    }

    // Tissue cells around capillary
    const tissueCols=['rgba(220,190,130,0.3)','rgba(200,170,110,0.25)','rgba(230,200,140,0.28)'];
    for(let i=0;i<8;i++){
      const tx=cx-capL*0.4+i*(capL*0.8/8);
      [[ty=cy-capW*1.6],[ty=cy+capW*1.4]].forEach(([t3])=>{
        c.fillStyle=tissueCols[i%3]; c.strokeStyle='rgba(180,140,80,0.3)'; c.lineWidth=1;
        c.beginPath(); c.roundRect(tx-16,t3-12,32,24,4); c.fill(); c.stroke();
      });
    }
    U7.txt(c,'خلايا الأنسجة (تستهلك O₂)',cx,h*0.86,'#7A5A10',11,false);

    S.t+=0.025;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-5 · الجهاز التنفسي
// ══════════════════════════════════════════════════════════
function simLungs1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.lu1) simState.lu1={t:0,breathing:true,phase:'inhale',breathRate:15};
  const S=simState.lu1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🫁 الجهاز التنفسي</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.lu1.breathing=!simState.lu1.breathing;this.textContent=simState.lu1.breathing?'⏸ إيقاف':'▶ تشغيل'">⏸ إيقاف</button>
    <div class="ctrl-section" style="margin-top:8px">
      <div class="ctrl-label">معدل التنفس (نفَس/دقيقة)</div>
      <input type="range" min="8" max="40" step="1" value="15"
        oninput="simState.lu1.breathRate=+this.value;document.getElementById('lu1br').textContent=this.value"
        style="width:100%">
      <div id="lu1br" style="text-align:center;font-size:18px;font-weight:800;color:#2980B9">15</div>
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      شهيق: الحجاب الحاجز ينخفض<br>
      الرئتان تتمددان ← هواء يدخل<br>
      زفير: الحجاب يرتفع<br>
      الرئتان تنضغطان ← هواء يخرج<br>
      O₂ في الهواء: 21%
    </div>`);

  function draw(){
    if(currentSim!=='lungs8'||currentTab!==0) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#F5F8FF';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(50,50,200,0.04)',40);
    U7.txt(c,'الجهاز التنفسي — مسار الهواء',w/2,24,'#1A2A7A',15,true);

    const cycleDur=60/S.breathRate;
    if(S.breathing) S.phase=(S.t%(cycleDur))<cycleDur/2?'inhale':'exhale';
    const isInhale=S.phase==='inhale';
    const cycleProgress=isInhale?(S.t%cycleDur)/(cycleDur/2):((S.t%cycleDur)-cycleDur/2)/(cycleDur/2);
    const expansion=isInhale?cycleProgress:1-cycleProgress;

    const cx=w/2, topY=h*0.12;
    // Trachea
    c.fillStyle='rgba(200,200,230,0.6)'; c.strokeStyle='rgba(100,100,180,0.5)'; c.lineWidth=2;
    c.beginPath(); c.rect(cx-12,topY,24,h*0.2); c.fill(); c.stroke();
    U7.txt(c,'القصبة',cx+22,topY+h*0.1,'#555',10,false);
    U7.txt(c,'الهوائية',cx+22,topY+h*0.13,'#555',10,false);

    // Bronchi
    const bY=topY+h*0.2;
    c.strokeStyle='rgba(100,100,180,0.5)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(cx,bY); c.quadraticCurveTo(cx-30,bY+h*0.05,cx-w*0.18,bY+h*0.08); c.stroke();
    c.beginPath(); c.moveTo(cx,bY); c.quadraticCurveTo(cx+30,bY+h*0.05,cx+w*0.18,bY+h*0.08); c.stroke();

    // Lungs (expanding/contracting)
    const lScale=0.85+expansion*0.15;
    [[cx-w*0.22,h*0.55,8,-1],[cx+w*0.22,h*0.55,8,1]].forEach(([lx,ly,sw,dir])=>{
      c.save(); c.translate(lx,ly); c.scale(lScale,lScale);
      const lg=c.createRadialGradient(0,-20,0,0,0,sw*6.5);
      lg.addColorStop(0,'rgba(255,180,180,0.95)');
      lg.addColorStop(0.5,'rgba(240,130,130,0.85)');
      lg.addColorStop(1,'rgba(200,80,80,0.5)');
      c.fillStyle=lg; c.strokeStyle='rgba(180,60,60,0.6)'; c.lineWidth=2;
      c.beginPath();
      c.moveTo(0,-sw*6); c.bezierCurveTo(dir*sw*5,-sw*6,dir*sw*7,-sw*2,dir*sw*7,sw*2);
      c.bezierCurveTo(dir*sw*7,sw*5,dir*sw*4,sw*7,0,sw*7);
      c.bezierCurveTo(-dir*sw*1,sw*7,0,sw*5,0,-sw*6);
      c.fill(); c.stroke();
      // Bronchioles
      for(let i=0;i<4;i++){
        const a=-Math.PI/2+dir*(i-1.5)*0.35;
        c.strokeStyle='rgba(180,80,80,0.5)'; c.lineWidth=1;
        c.beginPath(); c.moveTo(0,-sw*2); c.lineTo(Math.cos(a)*sw*4,Math.sin(a)*sw*4); c.stroke();
      }
      c.restore();
      U7.txt(c,dir<0?'الرئة اليسرى':'الرئة اليمنى',lx,ly+sw*6.5*(lScale)+14,'#C0392B',10,true);
    });

    // Diaphragm
    const diagY=h*0.8-expansion*h*0.04;
    c.fillStyle='rgba(180,120,80,0.5)'; c.strokeStyle='rgba(140,80,40,0.7)'; c.lineWidth=3;
    c.beginPath(); c.ellipse(cx,diagY,w*0.35,h*0.06,0,0,Math.PI); c.fill(); c.stroke();
    U7.txt(c,'الحجاب الحاجز',cx,diagY+18,'#7A4A10',11,true);

    // Air flow particles
    if(S.breathing){
      const nPart=6;
      for(let i=0;i<nPart;i++){
        const prog=(S.t*(S.breathRate/10)+i/nPart)%1;
        const ay=isInhale?topY+prog*(h*0.35):topY+h*0.35-prog*(h*0.35);
        c.fillStyle=isInhale?'rgba(100,200,100,0.7)':'rgba(200,100,100,0.7)';
        c.beginPath(); c.arc(cx+(i%2===0?-5:5),ay,4,0,Math.PI*2); c.fill();
      }
    }

    // Phase label
    const phaseCol=isInhale?'#27AE60':'#C0392B';
    U7.pill(c,w/2,h*0.93,200,28,phaseCol,isInhale?'شهيق ← هواء يدخل':'زفير → هواء يخرج','white');

    // Larynx label
    U7.txt(c,'الحنجرة (صندوق الصوت)',cx+28,topY+6,'#555',9,false);

    if(S.breathing) S.t+=0.016;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simLungs2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.lu2) simState.lu2={t:0,exhaled:0,measuring:false};
  const S=simState.lu2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📏 قياس حجم الهواء</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.lu2.measuring=true;simState.lu2.exhaled=0;simState.lu2.t=0">💨 ازفر بكل طاقتك</button>
    <button class="ctrl-btn reset" onclick="simState.lu2.measuring=false;simState.lu2.exhaled=0">↺ إعادة</button>
    <div id="lu2vol" style="text-align:center;font-size:22px;font-weight:800;color:#2980B9;margin:8px 0">0 مل</div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      السعة الحيوية<br>
      ≈ 3,500 - 5,000 مل للذكور<br>
      ≈ 2,500 - 4,000 مل للإناث<br>
      الهواء الباقي دائماً = 1,200 مل<br>
      (لا يمكن إخراجه)
    </div>`);

  function draw(){
    if(currentSim!=='lungs8'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#F5F8FF';
    c.fillRect(0,0,w,h);
    U7.txt(c,'قياس حجم هواء الزفير',w/2,24,'#1A2A7A',15,true);

    // Graduated container
    const bx=w*0.3, by=h*0.15, bw=w*0.4, bh=h*0.65;
    const maxVol=4500;
    if(S.measuring && S.exhaled<maxVol) S.exhaled=Math.min(maxVol,S.exhaled+maxVol*0.008);
    if(document.getElementById('lu2vol')) document.getElementById('lu2vol').textContent=Math.round(S.exhaled)+' مل';

    // Container background
    c.fillStyle='rgba(200,220,255,0.2)'; c.strokeStyle='rgba(100,150,200,0.6)'; c.lineWidth=2;
    c.beginPath(); c.rect(bx,by,bw,bh); c.fill(); c.stroke();

    // Water fill (going down as air comes in)
    const fillFrac=1-S.exhaled/maxVol;
    const fillY=by+bh*fillFrac;
    const waterG=c.createLinearGradient(bx,fillY,bx,by+bh);
    waterG.addColorStop(0,'rgba(100,180,255,0.7)'); waterG.addColorStop(1,'rgba(50,100,200,0.8)');
    c.fillStyle=waterG; c.beginPath(); c.rect(bx,fillY,bw,by+bh-fillY); c.fill();

    // Graduation marks
    for(let v=0;v<=5000;v+=500){
      const yy=by+bh*(1-v/maxVol);
      if(yy<by||yy>by+bh) continue;
      c.strokeStyle='rgba(100,150,200,0.5)'; c.lineWidth=v%1000===0?2:1;
      c.beginPath(); c.moveTo(bx,yy); c.lineTo(bx+12,yy); c.stroke();
      c.beginPath(); c.moveTo(bx+bw-12,yy); c.lineTo(bx+bw,yy); c.stroke();
      if(v%1000===0){
        c.fillStyle='#444'; c.font='11px Tajawal'; c.textAlign='right'; c.textBaseline='middle';
        c.fillText(v+' مل',bx-8,yy);
      }
    }

    // Current level line
    if(S.exhaled>0){
      const curY=by+bh*(1-S.exhaled/maxVol);
      c.strokeStyle='#E74C3C'; c.lineWidth=3;
      c.beginPath(); c.moveTo(bx,curY); c.lineTo(bx+bw,curY); c.stroke();
      // Volume annotation
      c.fillStyle='rgba(231,76,60,0.1)'; c.beginPath(); c.rect(bx,curY,bw,by+bh-curY); c.fill();
    }

    // Tube/mouthpiece
    c.fillStyle='rgba(180,180,220,0.6)'; c.strokeStyle='rgba(100,100,180,0.7)'; c.lineWidth=2;
    c.beginPath(); c.rect(bx+bw-4,by+bh*0.55,w*0.12,8); c.fill(); c.stroke();
    U7.txt(c,'أنبوبة الزفير',bx+bw+w*0.08,by+bh*0.555,'#555',10,false);

    // Person blowing
    const mouthX=bx+bw+w*0.22;
    c.font='48px serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(S.measuring?'😤':'😌',mouthX,by+bh*0.55);

    // Result bar
    if(S.exhaled>0){
      const pct=Math.round((S.exhaled/4500)*100);
      U7.txt(c,`${Math.round(S.exhaled)} مل (${pct}% من السعة القصوى)`,w/2,h*0.88,'#2980B9',13,true);
      if(S.exhaled>=4000) U7.txt(c,'ممتاز! 🏆 سعة رئوية جيدة جداً',w/2,h*0.93,'#27AE60',12,false);
    } else {
      U7.txt(c,'اضغط "ازفر" وخذ نفسًا عميقًا',w/2,h*0.88,'#888',12,false);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-6 · تبادل الغازات في الحويصلات الهوائية
// ══════════════════════════════════════════════════════════
function simGasEx1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.gx1) simState.gx1={t:0,o2conc:20,speed:1};
  const S=simState.gx1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💨 تبادل الغازات في الحويصلة</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">تركيز O₂ في الهواء الداخل (%)</div>
      <input type="range" min="5" max="21" step="1" value="20"
        oninput="simState.gx1.o2conc=+this.value;document.getElementById('gx1o2').textContent=this.value+'%'"
        style="width:100%">
      <div id="gx1o2" style="text-align:center;font-size:18px;font-weight:800;color:#27AE60">20%</div>
    </div>
    <div class="ctrl-section" style="margin-top:6px">
      <div class="ctrl-label">سرعة الانتشار</div>
      <input type="range" min="0.5" max="3" step="0.5" value="1"
        oninput="simState.gx1.speed=+this.value" style="width:100%">
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      الانتشار: من ↑ تركيز → ↓ تركيز<br>
      O₂ في الهواء > O₂ في الدم<br>
      → O₂ ينتشر للدم<br>
      CO₂ في الدم > CO₂ في الهواء<br>
      → CO₂ ينتشر للهواء
    </div>`);

  function draw(){
    if(currentSim!=='gasex8'||currentTab!==0) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#F5FFF5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(50,150,50,0.04)',40);
    U7.txt(c,'تبادل الغازات في الحويصلة الهوائية',w/2,24,'#1A6B1A',15,true);

    const cx=w/2, cy=h*0.48;
    const alR=Math.min(w,h)*0.28; // Alveolus radius

    // Alveolus (air sac)
    const alG=c.createRadialGradient(cx-alR*0.2,cy-alR*0.2,0,cx,cy,alR);
    alG.addColorStop(0,`rgba(100,200,255,${0.3+S.o2conc/30})`);
    alG.addColorStop(0.8,'rgba(150,220,255,0.2)');
    alG.addColorStop(1,'rgba(100,180,255,0.1)');
    c.fillStyle=alG; c.strokeStyle='rgba(80,160,200,0.7)'; c.lineWidth=2.5;
    c.beginPath(); c.arc(cx,cy,alR,0,Math.PI*2); c.fill(); c.stroke();
    U7.txt(c,'الحويصلة الهوائية',cx,cy-alR*0.55,'#1A5A8A',12,true);
    U7.txt(c,`O₂: ${S.o2conc}%`,cx,cy,'#27AE60',14,true);
    U7.txt(c,'CO₂: 0.04%',cx,cy+22,'#E74C3C',12,false);

    // Capillary (blood vessel wrapping around alveolus)
    const capR=alR+24;
    c.strokeStyle='rgba(192,57,43,0.5)'; c.lineWidth=18;
    c.beginPath(); c.arc(cx,cy,capR,0.3,Math.PI*2-0.3); c.stroke();
    // Blood content
    c.strokeStyle='rgba(180,40,40,0.7)'; c.lineWidth=14;
    c.beginPath(); c.arc(cx,cy,capR,0.3,Math.PI*2-0.3); c.stroke();
    U7.txt(c,'شعيرة دموية',cx+capR*0.72,cy-capR*0.72,'#7A0000',10,true);

    // Diffusion arrows (O2 going in, CO2 going out)
    const nArrows=8;
    for(let i=0;i<nArrows;i++){
      const angle=(Math.PI*2/nArrows)*i+S.t*S.speed*0.3;
      const alpha=(S.o2conc/21);

      // O2: alveolus → blood
      const o2prog=((S.t*S.speed*0.5+i/nArrows)%1);
      const o2x=cx+Math.cos(angle)*(alR*0.85+o2prog*30);
      const o2y=cy+Math.sin(angle)*(alR*0.85+o2prog*30);
      c.fillStyle=`rgba(0,180,100,${alpha*(1-o2prog)})`;
      c.beginPath(); c.arc(o2x,o2y,4,0,Math.PI*2); c.fill();
      c.font='7px sans-serif'; c.fillStyle=`rgba(0,150,80,${alpha*(1-o2prog)})`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('O₂',o2x,o2y);

      // CO2: blood → alveolus
      const co2prog=((S.t*S.speed*0.3+i/nArrows+0.5)%1);
      const co2x=cx+Math.cos(angle+Math.PI/8)*(capR-8-co2prog*30);
      const co2y=cy+Math.sin(angle+Math.PI/8)*(capR-8-co2prog*30);
      c.fillStyle=`rgba(200,50,50,${0.5*(1-co2prog)})`;
      c.beginPath(); c.arc(co2x,co2y,3.5,0,Math.PI*2); c.fill();
      c.font='7px sans-serif'; c.fillStyle=`rgba(180,30,30,${0.5*(1-co2prog)})`; c.textAlign='center';
      c.fillText('CO₂',co2x,co2y);
    }

    // Thin wall label
    U7.txt(c,'جدار رقيق جداً (طبقة خلية واحدة)',cx,cy+alR+42,'#555',11,false);
    U7.txt(c,'← تسهّل الانتشار السريع →',cx,cy+alR+58,'#888',10,false);

    // O2 concentration warning
    if(S.o2conc<12){
      U7.pill(c,cx,h*0.9,260,28,'rgba(200,50,50,0.8)','⚠️ تركيز O₂ منخفض! يقل الانتشار','white');
    }

    S.t+=0.016;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simGasEx2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.gx2) simState.gx2={t:0,running:false,size:'small'};
  const S=simState.gx2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 لماذا الحويصلات صغيرة؟</div>
      <div style="font-size:11px;color:#888">قارن بين حويصلتين بنفس الحجم الكلي</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.gx2.running=!simState.gx2.running;this.textContent=simState.gx2.running?'⏸ إيقاف':'▶ ابدأ التجربة'">▶ ابدأ التجربة</button>
    <button class="ctrl-btn reset" onclick="simState.gx2.running=false;simState.gx2.t=0">↺ إعادة</button>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      مساحة السطح ∝ نصف القطر²<br>
      الحجم ∝ نصف القطر³<br>
      → الصغيرة: نسبة مساحة/حجم أكبر<br>
      → انتشار أسرع وأكثر فعالية!<br>
      300 مليون حويصلة في الرئتين
    </div>`);

  function draw(){
    if(currentSim!=='gasex8'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#F5FFF5';
    c.fillRect(0,0,w,h);
    U7.txt(c,'مقارنة: حويصلة كبيرة مقابل حويصلات صغيرة',w/2,22,'#1A6B1A',13,true);

    // Left: one big alveolus
    const lx=w*0.25, midY=h*0.52, bigR=h*0.22;
    c.fillStyle='rgba(150,220,255,0.3)'; c.strokeStyle='rgba(80,160,200,0.7)'; c.lineWidth=2.5;
    c.beginPath(); c.arc(lx,midY,bigR,0,Math.PI*2); c.fill(); c.stroke();
    U7.txt(c,'حويصلة كبيرة',lx,midY-bigR-14,'#1A5A8A',12,true);
    const bigArea=Math.round(Math.PI*4*bigR*bigR/100);
    const bigVol=Math.round(Math.PI*4/3*bigR*bigR*bigR/100);
    U7.txt(c,`المساحة: ${bigArea} وحدة`,lx,midY+bigR+18,'#27AE60',11,false);
    U7.txt(c,`الحجم: ${bigVol} وحدة`,lx,midY+bigR+34,'#E74C3C',11,false);
    // Diffusion (few molecules reach center)
    if(S.running){
      for(let i=0;i<4;i++){
        const a=(Math.PI*2/4)*i+S.t*0.3;
        const prog=Math.min(1,S.t*0.05);
        const dist=bigR*prog*0.6;
        c.fillStyle=`rgba(0,180,100,${1-prog*0.8})`;
        c.beginPath(); c.arc(lx+Math.cos(a)*dist,midY+Math.sin(a)*dist,4,0,Math.PI*2); c.fill();
      }
    }

    // Right: multiple small alveoli (same total volume)
    const rx=w*0.7, smallR=h*0.07, cols=3, rows=3;
    let totalSmallArea=0;
    for(let r=0;r<rows;r++) for(let col=0;col<cols;col++){
      const sx=rx+(col-1)*smallR*2.2;
      const sy=midY+(r-1)*smallR*2.2;
      c.fillStyle='rgba(150,220,255,0.4)'; c.strokeStyle='rgba(80,160,200,0.7)'; c.lineWidth=2;
      c.beginPath(); c.arc(sx,sy,smallR,0,Math.PI*2); c.fill(); c.stroke();
      totalSmallArea+=Math.round(Math.PI*4*smallR*smallR/100);
      // Faster diffusion (smaller = more surface)
      if(S.running){
        const prog=Math.min(1,S.t*0.12);
        c.fillStyle=`rgba(0,180,100,${0.7*(1-prog*0.5)})`;
        c.beginPath(); c.arc(sx,sy,smallR*prog*0.8,0,Math.PI*2); c.fill();
      }
    }
    U7.txt(c,'حويصلات صغيرة',rx,midY-smallR*2.5-14,'#1A5A8A',12,true);
    U7.txt(c,`المساحة: ${totalSmallArea} وحدة`,rx,midY+smallR*2.5+18,'#27AE60',11,false);
    U7.txt(c,`(${Math.round(totalSmallArea/bigArea)}× أكبر!)`,rx,midY+smallR*2.5+34,'#E74C3C',11,true);

    // Winner annotation
    if(S.t>2){
      U7.txt(c,'✅ الحويصلات الصغيرة تتميز بمساحة سطح أكبر',w/2,h*0.9,'#27AE60',12,true);
      U7.txt(c,'→ انتشار أسرع وأكثر كفاءة',w/2,h*0.94,'#555',11,false);
    }

    if(S.running) S.t+=0.016;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-7 · التنفس الهوائي
// ══════════════════════════════════════════════════════════
function simRespiration1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.r1) simState.r1={t:0,running:false,glucoseLeft:100};
  const S=simState.r1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ معادلة التنفس الهوائي</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.r1.running=!simState.r1.running;simState.r1.glucoseLeft=100;simState.r1.t=0;this.textContent=simState.r1.running?'⏸ إيقاف':'▶ ابدأ التفاعل'">▶ ابدأ التفاعل</button>
    <button class="ctrl-btn reset" onclick="simState.r1.running=false;simState.r1.glucoseLeft=100;simState.r1.t=0">↺ إعادة</button>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      <strong>المعادلة:</strong><br>
      جلوكوز + أكسجين →<br>
      ثاني أكسيد الكربون + ماء + طاقة<br><br>
      C₆H₁₂O₆ + 6O₂ →<br>
      6CO₂ + 6H₂O + ATP
    </div>`);

  function draw(){
    if(currentSim!=='respiration8'||currentTab!==0) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFFFF5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,200,50,0.04)',40);
    U7.txt(c,'التنفس الهوائي — إنتاج الطاقة',w/2,24,'#7A6A00',15,true);

    // Cell membrane
    const cellX=w/2, cellY=h*0.5, cellR=Math.min(w,h)*0.3;
    const cg=c.createRadialGradient(cellX,cellY,0,cellX,cellY,cellR);
    cg.addColorStop(0,'rgba(255,250,200,0.8)'); cg.addColorStop(1,'rgba(220,220,100,0.2)');
    c.fillStyle=cg; c.strokeStyle='rgba(180,180,50,0.6)'; c.lineWidth=3;
    c.beginPath(); c.arc(cellX,cellY,cellR,0,Math.PI*2); c.fill(); c.stroke();
    U7.txt(c,'خلية حية',cellX,cellY+cellR+16,'#7A6A00',11,true);

    // Mitochondria inside
    for(let i=0;i<3;i++){
      const a=(Math.PI*2/3)*i+S.t*0.1;
      const mx=cellX+Math.cos(a)*cellR*0.4, my=cellY+Math.sin(a)*cellR*0.4;
      c.fillStyle='rgba(200,100,50,0.6)'; c.strokeStyle='rgba(150,60,20,0.7)'; c.lineWidth=1.5;
      c.beginPath(); c.ellipse(mx,my,20,12,a,0,Math.PI*2); c.fill(); c.stroke();
      c.fillStyle='rgba(255,150,80,0.4)';
      c.beginPath(); c.ellipse(mx,my,12,7,a,0,Math.PI*2); c.fill();
      U7.txt(c,'⚡',mx,my,'rgba(255,180,0,0.9)',12,false);
    }
    c.fillStyle='rgba(100,100,100,0.5)'; c.font='9px Tajawal'; c.textAlign='center';
    c.fillText('ميتوكوندريا',cellX+cellR*0.4,cellY+cellR*0.4+18);

    // Glucose molecules entering
    if(S.running){
      const gProg=(S.t*0.2)%1;
      const gx=w*0.12+gProg*(cellX-w*0.12);
      const gy=cellY;
      c.fillStyle='rgba(200,150,50,0.9)'; c.beginPath(); c.arc(gx,gy,10,0,Math.PI*2); c.fill();
      U7.txt(c,'🍬',gx,gy,'#7A4A00',16,false);
      U7.txt(c,'جلوكوز',w*0.08,cellY-20,'#7A4A10',11,true);

      // O2 entering
      const o2Prog=(S.t*0.2+0.5)%1;
      const ox=w*0.12+o2Prog*(cellX-w*0.12);
      const oy=cellY-30;
      c.fillStyle='rgba(50,180,100,0.9)'; c.beginPath(); c.arc(ox,oy,7,0,Math.PI*2); c.fill();
      c.font='8px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('O₂',ox,oy);

      // Products exiting
      const pProg=(S.t*0.2+0.3)%1;
      const px=cellX+pProg*(w*0.88-cellX);
      c.fillStyle='rgba(50,50,200,0.7)'; c.beginPath(); c.arc(px,cellY,7,0,Math.PI*2); c.fill();
      c.font='7px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('CO₂',px,cellY);

      c.fillStyle='rgba(100,180,255,0.7)'; c.beginPath(); c.arc(px,cellY+22,6,0,Math.PI*2); c.fill();
      c.font='7px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('H₂O',px,cellY+22);

      // Energy burst
      if(gProg<0.15){
        const ep=gProg/0.15;
        c.fillStyle=`rgba(255,220,0,${1-ep})`; c.beginPath(); c.arc(cellX,cellY,cellR*ep*0.6,0,Math.PI*2); c.fill();
        U7.txt(c,'⚡',cellX,cellY,`rgba(255,150,0,${1-ep})`,28,false);
      }

      S.glucoseLeft=Math.max(0,100-S.t*3);
    }

    // Equation bar at bottom
    const eqY=h*0.88;
    c.fillStyle='rgba(255,250,220,0.9)'; c.strokeStyle='rgba(180,180,50,0.5)'; c.lineWidth=2;
    c.beginPath(); c.roundRect(w*0.04,eqY,w*0.92,h*0.1,8); c.fill(); c.stroke();
    U7.txt(c,'C₆H₁₂O₆ + 6O₂  →  6CO₂ + 6H₂O + طاقة (ATP)',w/2,eqY+h*0.04,'#5A4A00',12,true);
    U7.txt(c,'جلوكوز + أكسجين → ثاني أكسيد الكربون + ماء + طاقة',w/2,eqY+h*0.075,'#888',11,false);

    if(S.running) S.t+=0.016;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simRespiration2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.r2) simState.r2={t:0,running:true,type:'germinating'};
  const S=simState.r2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌱 تجربة تنفس البازلاء</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.r2.running=!simState.r2.running;this.textContent=simState.r2.running?'⏸ إيقاف':'▶ تشغيل'">⏸ إيقاف</button>
    <button class="ctrl-btn reset" onclick="simState.r2.t=0">↺ إعادة</button>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      البذور النابتة تتنفس<br>
      → تنتج حرارة<br>
      البذور الميتة لا تتنفس<br>
      → لا حرارة<br><br>
      المتغير: حالة البذرة<br>
      المقاس: درجة الحرارة
    </div>`);

  function draw(){
    if(currentSim!=='respiration8'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFFFF5';
    c.fillRect(0,0,w,h);
    U7.txt(c,'تجربة: تنفس البازلاء وإنتاج الحرارة',w/2,24,'#1A6B00',14,true);

    const time=S.running?S.t*0.5:S.t*0.5;
    const germTemp=20+Math.min(12,time*0.8);
    const deadTemp=20+Math.random()*0.1; // stays constant

    // Draw two flasks
    [[w*0.28,h*0.52,'نابتة',germTemp,'#27AE60'],[w*0.72,h*0.52,'ميتة',20,'#7F8C8D']].forEach(([fx,fy,label,temp,col])=>{
      // Flask
      c.fillStyle='rgba(200,240,200,0.3)'; c.strokeStyle='rgba(100,150,100,0.7)'; c.lineWidth=2;
      c.beginPath();
      c.moveTo(fx-40,fy-h*0.28); c.lineTo(fx-40,fy-h*0.08);
      c.quadraticCurveTo(fx-40,fy+h*0.12,fx,fy+h*0.14);
      c.quadraticCurveTo(fx+40,fy+h*0.12,fx+40,fy-h*0.08);
      c.lineTo(fx+40,fy-h*0.28); c.closePath(); c.fill(); c.stroke();

      // Seeds inside
      const seeds=6;
      for(let i=0;i<seeds;i++){
        const si=(i%3)*22-22, sr=Math.floor(i/3)*14;
        const sx=fx+si, sy=fy+h*0.06-sr;
        c.fillStyle=col; c.beginPath(); c.ellipse(sx,sy,8,6,0.3,0,Math.PI*2); c.fill();
        if(label==='نابتة'){
          // Sprout
          c.strokeStyle='rgba(50,200,50,0.8)'; c.lineWidth=1.5;
          c.beginPath(); c.moveTo(sx,sy-6); c.lineTo(sx,sy-14); c.stroke();
        }
      }

      // Thermometer
      const thermoX=fx+50, thermoY=fy-h*0.08;
      const tH=h*0.3;
      const tempFrac=Math.min(1,(temp-18)/15);
      c.fillStyle='rgba(200,200,200,0.5)'; c.strokeStyle='rgba(150,150,150,0.7)'; c.lineWidth=1.5;
      c.beginPath(); c.rect(thermoX-4,thermoY-tH,8,tH); c.fill(); c.stroke();
      c.fillStyle=col; c.beginPath(); c.rect(thermoX-3,thermoY-tH*tempFrac,6,tH*tempFrac); c.fill();
      c.beginPath(); c.arc(thermoX,thermoY+6,8,0,Math.PI*2);
      c.fillStyle=col; c.fill(); c.strokeStyle='rgba(150,150,150,0.7)'; c.stroke();
      U7.txt(c,temp.toFixed(1)+'°C',thermoX,thermoY-tH-14,col,12,true);

      // Heat waves for germinating
      if(label==='نابتة' && temp>23){
        for(let wi=0;wi<3;wi++){
          const wp=(S.t*2+wi*0.33)%1;
          c.strokeStyle=`rgba(255,100,0,${0.5*(1-wp)})`;
          c.lineWidth=1.5;
          c.beginPath(); c.arc(fx,fy,30+wp*30,Math.PI,0); c.stroke();
        }
      }

      U7.txt(c,`بذور ${label}`,fx,fy+h*0.17,col,12,true);
    });

    // Time axis
    const chartX=w*0.1, chartY=h*0.88, chartW=w*0.8, chartH=h*0.08;
    c.fillStyle='rgba(240,240,240,0.5)'; c.beginPath(); c.rect(chartX,chartY,chartW,chartH); c.fill();
    c.strokeStyle='rgba(100,100,100,0.3)'; c.lineWidth=1; c.stroke();
    const chartProg=Math.min(1,S.t*0.03);
    // Germinating temp line
    c.strokeStyle='rgba(39,174,96,0.8)'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(chartX,chartY+chartH*0.8);
    c.lineTo(chartX+chartW*chartProg,chartY+chartH*(0.8-chartProg*0.7)); c.stroke();
    // Dead temp line (flat)
    c.strokeStyle='rgba(127,140,141,0.7)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(chartX,chartY+chartH*0.9); c.lineTo(chartX+chartW*chartProg,chartY+chartH*0.9); c.stroke();
    U7.txt(c,'الوقت →',chartX+chartW/2,chartY+chartH+10,'#888',10,false);

    if(S.running) S.t+=0.016;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-8 · اللياقة البدنية ومعدل النبض
// ══════════════════════════════════════════════════════════
function simFitness1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.f1) simState.f1={t:0,bpm:70,phase:'rest',history:[],measuring:false,timer:0};
  const S=simState.f1;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💓 معدل النبض وقياسه</div>
    </div>
    <button class="ctrl-btn" onclick="simState.f1.phase='rest';simState.f1.bpm=70;window._stopHeartbeat();window._playHeartbeat(70);document.getElementById('f1phase').textContent='😴 راحة — 70 نبضة/دقيقة'">😴 راحة</button>
    <button class="ctrl-btn" onclick="simState.f1.phase='walk';simState.f1.bpm=100;window._stopHeartbeat();window._playHeartbeat(100);document.getElementById('f1phase').textContent='🚶 مشي — 100 نبضة/دقيقة'">🚶 مشي</button>
    <button class="ctrl-btn" onclick="simState.f1.phase='run';simState.f1.bpm=150;window._stopHeartbeat();window._playHeartbeat(150);document.getElementById('f1phase').textContent='🏃 جري — 150 نبضة/دقيقة'">🏃 جري</button>
    <button class="ctrl-btn" onclick="simState.f1.phase='sprint';simState.f1.bpm=185;window._stopHeartbeat();window._playHeartbeat(185);document.getElementById('f1phase').textContent='💨 عدو — 185 نبضة/دقيقة'">💨 عدو سريع</button>
    <div id="f1phase" style="text-align:center;font-size:13px;font-weight:700;color:#C0392B;margin:8px 0;padding:8px;background:rgba(192,57,43,0.08);border-radius:8px">😴 راحة — 70 نبضة/دقيقة</div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:4px">
      قِس نبضك بأصابعك على الرسغ<br>
      عُدّ النبضات لـ 15 ثانية × 4<br>
      الطبيعي: 60-100 نبضة/دقيقة
    </div>`);

  window._playHeartbeat && window._playHeartbeat(S.bpm);

  function draw(){
    if(currentSim!=='fitness8'||currentTab!==0){ window._stopHeartbeat && window._stopHeartbeat(); return; }
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(200,50,50,0.04)',40);
    U7.txt(c,'معدل النبض في حالات مختلفة',w/2,24,'#7A0000',14,true);

    const cx=w/2, cy=h*0.42;
    // Heart visual
    const pulse=1+Math.sin(S.t*S.bpm/60*Math.PI*2)*0.1;
    const heartCol={rest:'#E74C3C',walk:'#C0392B',run:'#8B0000',sprint:'#5B0000'}[S.phase]||'#E74C3C';
    c.save(); c.translate(cx,cy); c.scale(pulse*1.4,pulse*1.4);
    const hg=c.createRadialGradient(-12,-15,0,0,0,40);
    hg.addColorStop(0,heartCol+'FF'); hg.addColorStop(1,heartCol+'66');
    c.fillStyle=hg;
    c.beginPath();
    c.moveTo(0,30); c.bezierCurveTo(-5,-5,-35,-5,-35,-20);
    c.bezierCurveTo(-35,-40,-5,-40,0,-25);
    c.bezierCurveTo(5,-40,35,-40,35,-20);
    c.bezierCurveTo(35,-5,5,-5,0,30); c.fill();
    c.restore();

    // BPM display
    U7.txt(c,S.bpm+'',cx,cy+10,'white',28,true);
    U7.txt(c,'نبضة/دقيقة',cx,cy+38,'white',10,false);

    // ECG strip
    const ecgY=h*0.73, ecgH=h*0.09;
    c.fillStyle='rgba(0,20,0,0.85)'; c.beginPath(); c.rect(0,ecgY-ecgH*0.5,w,ecgH*2.5); c.fill();
    c.strokeStyle='#00FF88'; c.lineWidth=1.8;
    c.beginPath();
    const ecgSpeed=S.bpm/60;
    for(let i=0;i<w;i++){
      const t2=(S.t*ecgSpeed-(i/w)*ecgSpeed*2.5)%(60/S.bpm);
      const norm=t2/(60/S.bpm);
      let y;
      if(norm<0.05) y=ecgY;
      else if(norm<0.08) y=ecgY-ecgH*0.4;
      else if(norm<0.13) y=ecgY-ecgH*2.8;
      else if(norm<0.18) y=ecgY+ecgH*1.2;
      else if(norm<0.25) y=ecgY-ecgH*0.8;
      else if(norm<0.3) y=ecgY;
      else y=ecgY;
      i===0?c.moveTo(i,y):c.lineTo(i,y);
    }
    c.stroke();
    // ECG labels
    c.fillStyle='rgba(0,255,136,0.6)'; c.font='10px Tajawal'; c.textAlign='left'; c.textBaseline='bottom';
    c.fillText('مخطط القلب الكهربائي (ECG)',6,ecgY-ecgH*0.4);

    // Activity icons
    const acts=[{icon:'😴',bpm:70,label:'راحة'},{icon:'🚶',bpm:100,label:'مشي'},{icon:'🏃',bpm:150,label:'جري'},{icon:'💨',bpm:185,label:'عدو'}];
    acts.forEach((a,i)=>{
      const ax=w*0.12+i*(w*0.76/3);
      const ay=h*0.9;
      const isActive=a.bpm===S.bpm;
      if(isActive){ c.fillStyle='rgba(192,57,43,0.15)'; c.beginPath(); c.roundRect(ax-28,ay-22,56,44,8); c.fill(); }
      c.font='20px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(a.icon,ax,ay-8);
      c.fillStyle=isActive?'#C0392B':'#888'; c.font=`${isActive?'bold ':''}10px Tajawal`;
      c.textAlign='center'; c.fillText(a.bpm,ax,ay+10);
      c.fillStyle='#aaa'; c.font='9px Tajawal'; c.fillText(a.label,ax,ay+22);
    });

    S.t+=0.016;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simFitness2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.f2) simState.f2={t:0,exercised:false,recover:false,bpmHistory:Array(60).fill(70),elapsed:0};
  const S=simState.f2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📈 معدل التعافي بعد التمرين</div>
    </div>
    <button class="ctrl-btn play" onclick="simState.f2.exercised=true;simState.f2.recover=false;simState.f2.elapsed=0;simState.f2.t=0">🏃 ابدأ التمرين (دقيقتان)</button>
    <button class="ctrl-btn reset" onclick="simState.f2.exercised=false;simState.f2.recover=false;simState.f2.elapsed=0;simState.f2.bpmHistory=Array(60).fill(70);window._stopHeartbeat();window._playHeartbeat(70)">↺ إعادة</button>
    <div id="f2status" style="text-align:center;font-size:12px;color:#888;margin:8px 0">في الراحة</div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      الشخص الرياضي يتعافى أسرع!<br>
      ← القلب أقوى وأكثر كفاءة<br>
      ← الأوعية أكثر مرونة<br><br>
      تمرّن بانتظام لتحسين<br>
      معدل التعافي 💪
    </div>`);

  function draw(){
    if(currentSim!=='fitness8'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.txt(c,'معدل النبض — قبل وبعد التمرين',w/2,24,'#7A0000',14,true);

    // Current BPM calculation
    let curBPM=70;
    if(S.exercised){
      if(S.elapsed<120) curBPM=Math.min(160,70+S.elapsed*0.75); // exercise: up
      else { curBPM=Math.max(70,160-((S.elapsed-120)*0.6)); } // recovery: down
    }
    // Update BPM history
    if(S.exercised){
      S.bpmHistory.push(curBPM);
      if(S.bpmHistory.length>60) S.bpmHistory.shift();
    }

    // Update status display
    const statusEl=document.getElementById('f2status');
    if(statusEl){
      if(!S.exercised) statusEl.textContent='في الراحة 😌';
      else if(S.elapsed<120) statusEl.textContent=`🏃 يتمرن... ${Math.round(120-S.elapsed)} ثانية`;
      else statusEl.textContent=`😮‍💨 تعافٍ... ${Math.round(S.elapsed-120)} ثانية`;
    }

    // Chart
    const chartX=w*0.1, chartY=h*0.12, chartW=w*0.82, chartH=h*0.58;
    c.fillStyle='rgba(255,255,255,0.5)'; c.strokeStyle='rgba(200,200,200,0.5)'; c.lineWidth=1;
    c.beginPath(); c.rect(chartX,chartY,chartW,chartH); c.fill(); c.stroke();

    // منطقة الراحة (قبل التمرين)
    c.fillStyle='rgba(100,180,100,0.07)';
    c.beginPath(); c.rect(chartX,chartY,chartW*0.27,chartH); c.fill();
    c.fillStyle='rgba(39,174,96,0.5)'; c.font='bold 10px Tajawal'; c.textAlign='center';
    c.fillText('😌 راحة',chartX+chartW*0.135,chartY+14);

    // منطقة التمرين
    c.fillStyle='rgba(220,50,50,0.07)';
    c.beginPath(); c.rect(chartX+chartW*0.27,chartY,chartW*0.23,chartH); c.fill();
    c.fillStyle='rgba(200,50,50,0.5)'; c.font='bold 10px Tajawal'; c.textAlign='center';
    c.fillText('🏃 تمرين',chartX+chartW*0.385,chartY+14);

    // منطقة التعافي
    c.fillStyle='rgba(50,150,255,0.07)';
    c.beginPath(); c.rect(chartX+chartW*0.5,chartY,chartW*0.5,chartH); c.fill();
    c.fillStyle='rgba(50,130,220,0.5)'; c.font='bold 10px Tajawal';
    c.fillText('😮‍💨 تعافي',chartX+chartW*0.75,chartY+14);

    // Grid lines مع أرقام واضحة
    [70,90,110,130,150,170].forEach(bpm=>{
      const yy=chartY+chartH*(1-(bpm-60)/120);
      c.strokeStyle='rgba(200,200,200,0.5)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(chartX,yy); c.lineTo(chartX+chartW,yy); c.stroke();
      c.fillStyle='#777'; c.font='bold 10px Tajawal'; c.textAlign='right';
      c.textBaseline='middle'; c.fillText(bpm,chartX-5,yy);
    });
    // عنوان المحور Y
    c.save(); c.translate(chartX-30,chartY+chartH/2);
    c.rotate(-Math.PI/2); c.fillStyle='#999'; c.font='10px Tajawal';
    c.textAlign='center'; c.fillText('نبضة/دقيقة',0,0); c.restore();

    // BPM line
    c.strokeStyle='rgba(192,57,43,0.9)'; c.lineWidth=2.5;
    c.beginPath();
    S.bpmHistory.forEach((bpm,i)=>{
      const px=chartX+(i/60)*chartW;
      const py=chartY+chartH*(1-(bpm-60)/120);
      i===0?c.moveTo(px,py):c.lineTo(px,py);
    });
    c.stroke();

    // Current point
    if(S.exercised){
      const cpx=chartX+(Math.min(59,S.bpmHistory.length-1)/60)*chartW;
      const cpy=chartY+chartH*(1-(curBPM-60)/120);
      c.fillStyle='#C0392B'; c.beginPath(); c.arc(cpx,cpy,6,0,Math.PI*2); c.fill();
      c.strokeStyle='white'; c.lineWidth=2; c.stroke();
    }

    // BPM label + status
    const bpmColor=curBPM<90?'#27AE60':curBPM<130?'#F39C12':'#C0392B';
    U7.txt(c,'النبض الحالي: '+Math.round(curBPM)+' نبضة/دقيقة',w/2,h*0.76,bpmColor,15,true);

    // تعليمات إذا لم يبدأ بعد
    if(!S.exercised){
      c.fillStyle='rgba(100,100,100,0.15)';
      c.beginPath(); c.roundRect(w*0.2,h*0.35,w*0.6,h*0.2,12); c.fill();
      U7.txt(c,'اضغط "ابدأ التمرين" لترى',w/2,h*0.41,'#888',13,true);
      U7.txt(c,'كيف يرتفع النبض ثم يتعافى',w/2,h*0.47,'#888',12,false);
    }

    // Heart animation
    const pulse2=1+Math.sin(S.t*curBPM/60*Math.PI*2)*0.08;
    c.save(); c.translate(w*0.5,h*0.9); c.scale(pulse2*0.65,pulse2*0.65);
    c.fillStyle=bpmColor;
    c.beginPath();
    c.moveTo(0,22); c.bezierCurveTo(-4,-4,-28,-4,-28,-16);
    c.bezierCurveTo(-28,-34,-4,-34,0,-20);
    c.bezierCurveTo(4,-34,28,-34,28,-16);
    c.bezierCurveTo(28,-4,4,-4,0,22); c.fill();
    c.restore();

    // تحديث نبضات القلب فقط عند تغيّر البي بي إم — لا في كل frame
    var roundedBPM = Math.round(curBPM/5)*5;
    if(S._lastBPM !== roundedBPM){
      S._lastBPM = roundedBPM;
      window._stopHeartbeat && window._stopHeartbeat();
      if(S.exercised) window._playHeartbeat && window._playHeartbeat(roundedBPM);
    }

    if(S.exercised){
      S.elapsed+=0.016*4;
      S.t+=0.016;
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 7-9 · السجائر والصحة
// ══════════════════════════════════════════════════════════
function simSmoking1(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sm1) simState.sm1={t:0,component:'nicotine'};
  const S=simState.sm1;

  const components={
    nicotine:{label:'النيكوتين',color:'#8E44AD',icon:'🧠',effect:'يضيّق الأوعية الدموية\nيزيد ضغط الدم\nمسبّب للإدمان'},
    tar:{label:'القطران',color:'#2C3E50',icon:'☠️',effect:'يسبّب السرطان (ورم)\nيدمر خلايا الرئة\nيسود لون الرئة'},
    co:{label:'أول أكسيد الكربون',color:'#7F8C8D',icon:'💨',effect:'يرتبط بالهيموجلوبين\nيمنع حمل O₂\nيسبب نقص الأكسجين'},
    particulates:{label:'الجسيمات الدقيقة',color:'#4A235A',icon:'🫁',effect:'تدمّر الحويصلات الهوائية\nتسبب أمراض الرئة\nتزيد احتمال السرطان'}
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🚭 مكوّنات دخان السجائر</div>
    </div>
    ${Object.entries(components).map(([k,v])=>`
      <button class="ctrl-btn" onclick="simState.sm1.component='${k}';simState.sm1.t=0" style="border-right:4px solid ${v.color};font-size:12px;margin-bottom:3px">
        ${v.icon} ${v.label}
      </button>`).join('')}
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px;background:rgba(200,50,50,0.06)">
      🚭 التدخين يقتل<br>
      4.2 مليون شخص سنوياً<br>
      ½ المدخنين يموتون بسببه
    </div>`);

  function draw(){
    if(currentSim!=='smoking8'||currentTab!==0) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.grid(c,w,h,'rgba(100,50,50,0.04)',40);
    U7.txt(c,'أضرار مكوّنات دخان السجائر',w/2,24,'#7A0000',14,true);

    const comp=components[S.component];
    const cx=w/2, cy=h*0.44;

    // Cigarette drawing
    const cigL=w*0.5, cigH=h*0.055;
    const cigX=cx-cigL/2, cigY=cy-h*0.35;
    // White part
    c.fillStyle='#F5F5F5'; c.strokeStyle='#ccc'; c.lineWidth=1;
    c.beginPath(); c.rect(cigX,cigY-cigH/2,cigL*0.75,cigH); c.fill(); c.stroke();
    // Filter
    c.fillStyle='rgba(255,200,100,0.8)'; c.beginPath(); c.rect(cigX+cigL*0.75,cigY-cigH/2,cigL*0.15,cigH); c.fill();
    // Burning tip
    c.fillStyle='rgba(255,100,0,0.8)'; c.beginPath(); c.arc(cigX+cigL*0.9,cigY,cigH*0.4,0,Math.PI*2); c.fill();

    // Smoke particles rising
    for(let i=0;i<20;i++){
      const sp=(S.t*0.3+i*0.05)%1;
      const sx=cigX+cigL*0.9+(Math.sin(S.t+i)*20)*(sp);
      const sy=cigY-sp*h*0.5-cigH;
      const alpha=Math.max(0,0.5-sp*0.5);
      c.fillStyle=`${comp.color}${Math.round(alpha*255).toString(16).padStart(2,'0')}`;
      c.beginPath(); c.arc(sx,sy,4+sp*6,0,Math.PI*2); c.fill();
    }

    // Effect on body organ
    const orgY=cy+h*0.05;
    if(S.component==='nicotine'){
      // Blood vessel narrowing
      U7.txt(c,'تضيّق الأوعية الدموية',cx,orgY-30,comp.color,13,true);
      const vesselH=h*0.08;
      const narrowing=0.35+Math.sin(S.t*2)*0.05;
      // Normal vessel (left)
      c.fillStyle='rgba(200,50,50,0.7)'; c.beginPath(); c.rect(cx-w*0.28,orgY-vesselH/2,w*0.22,vesselH); c.fill();
      c.fillStyle='rgba(220,50,50,0.3)'; c.beginPath(); c.rect(cx-w*0.28+3,orgY-vesselH/2+3,w*0.22-6,vesselH-6); c.fill();
      U7.txt(c,'طبيعي',cx-w*0.17,orgY+vesselH/2+14,'#27AE60',10,true);
      // Narrowed vessel (right)
      const narH=vesselH*narrowing;
      c.fillStyle='rgba(150,30,30,0.7)'; c.beginPath(); c.rect(cx+w*0.06,orgY-vesselH/2,w*0.22,vesselH); c.fill();
      c.fillStyle='rgba(120,0,0,0.5)'; c.beginPath(); c.rect(cx+w*0.06+3,orgY-narH/2,w*0.22-6,narH); c.fill();
      U7.txt(c,'بعد النيكوتين',cx+w*0.17,orgY+vesselH/2+14,'#C0392B',10,true);
    } else if(S.component==='co'){
      // Hemoglobin diagram
      U7.txt(c,'أول أكسيد الكربون يحتل مكان الأكسجين',cx,orgY-30,comp.color,12,true);
      [[cx-60,orgY,'O₂','#27AE60','الطبيعي'],[cx+60,orgY,'CO','#7F8C8D','بعد التدخين']].forEach(([hx,hy,mol,col,lbl])=>{
        const hg=c.createRadialGradient(hx,hy,0,hx,hy,25);
        hg.addColorStop(0,'#E74C3C'); hg.addColorStop(1,'#922B21');
        c.fillStyle=hg; c.beginPath(); c.ellipse(hx,hy,25,17,0,0,Math.PI*2); c.fill();
        c.fillStyle=col; c.beginPath(); c.arc(hx,hy-18,8,0,Math.PI*2); c.fill();
        c.font='8px sans-serif'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(mol,hx,hy-18);
        U7.txt(c,lbl,hx,hy+30,col,10,true);
      });
    } else {
      // General effect illustration
      U7.txt(c,comp.effect.split('\n')[0],cx,orgY-20,comp.color,13,true);
      U7.txt(c,comp.effect.split('\n')[1],cx,orgY,comp.color,12,false);
      U7.txt(c,comp.effect.split('\n')[2],cx,orgY+20,'#888',11,false);
    }

    // Component info box
    c.fillStyle='rgba(255,255,255,0.92)'; c.strokeStyle=comp.color; c.lineWidth=2.5;
    c.beginPath(); c.roundRect(w*0.05,h*0.8,w*0.9,h*0.16,10); c.fill(); c.stroke();
    U7.txt(c,comp.icon+' '+comp.label,w/2,h*0.83,comp.color,14,true);
    U7.txt(c,comp.effect.split('\n').join(' — '),w/2,h*0.86,comp.color,10,false);

    S.t+=0.025;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simSmoking2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sm2) simState.sm2={t:0,damage:0,_seed:42,_pts:null};
  const S=simState.sm2;

  // توليد نقاط ثابتة مرة واحدة باستخدام seed
  function seededRand(seed){ return ((Math.sin(seed)*9301+49297)%233280)/233280; }
  function getPoints(){
    if(S._pts) return S._pts;
    S._pts={alv:[],tar:[]};
    for(let i=0;i<30;i++){
      S._pts.alv.push({rx:seededRand(i*3)*2-1, ry:seededRand(i*3+1)*2-1, rr:seededRand(i*3+2)});
    }
    for(let i=0;i<15;i++){
      S._pts.tar.push({rx:seededRand(i*5+100)*2-1, ry:seededRand(i*5+101)*2-1, rr:seededRand(i*5+102)});
    }
    return S._pts;
  }

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 الرئة السليمة مقابل رئة المدخّن</div>
    </div>
    <div class="ctrl-section" style="margin-top:8px">
      <div class="ctrl-label">🚬 سنوات التدخين: <span id="sm2yrs">0 سنة</span></div>
      <input type="range" min="0" max="40" step="1" value="0"
        oninput="simState.sm2.damage=+this.value/40;document.getElementById('sm2yrs').textContent=this.value+' سنة'"
        style="width:100%;margin:6px 0">
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      كلما زاد التدخين:<br>
      → حويصلات هوائية مدمّرة<br>
      → قدرة تنفسية أقل<br>
      → ترسّب القطران (اللون الداكن)<br>
      🚭 التوقف يحسّن الوضع!
    </div>`);

  function drawLung(cx, cy, lw, lh, dir, color){
    const lx=cx+dir*lw*0.28, ly=cy;
    const lg=c.createRadialGradient(lx,ly-lh*0.1,0,lx,ly,lh*0.5);
    lg.addColorStop(0,color); lg.addColorStop(1,color.replace(/[\d.]+\)$/,'0.3)'));
    c.fillStyle=lg; c.strokeStyle='rgba(100,40,40,0.4)'; c.lineWidth=2;
    c.beginPath();
    c.moveTo(lx,ly-lh*0.52);
    c.bezierCurveTo(lx+dir*lw*0.18,ly-lh*0.52,lx+dir*lw*0.35,ly-lh*0.2,lx+dir*lw*0.35,ly);
    c.bezierCurveTo(lx+dir*lw*0.35,ly+lh*0.25,lx+dir*lw*0.15,ly+lh*0.45,lx,ly+lh*0.45);
    c.bezierCurveTo(lx-dir*lw*0.02,ly+lh*0.45,lx,ly+lh*0.25,lx,ly-lh*0.52);
    c.fill(); c.stroke();
  }

  function draw(){
    if(currentSim!=='smoking8'||currentTab!==1) return;
    const w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h);
    c.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--bg-canvas').trim()||'#FFF5F5';
    c.fillRect(0,0,w,h);
    U7.txt(c,'مقارنة: الرئة السليمة × رئة المدخّن',w/2,20,'#7A0000',14,true);

    const pts=getPoints();
    const d=S.damage;

    // نبض تنفس للرئة السليمة
    const breathe=1+Math.sin(S.t*1.8)*0.045;
    const lhBase=h*0.5, lwBase=w*0.26;

    // ── رئة سليمة (يسار) — حيّة تتنفس ──
    const hx=w*0.27, hy=h*0.5;
    const lhH=lhBase*breathe, lwH=lwBase*breathe;
    const healthyColor='rgba(255,120,120,0.9)';
    [-1,1].forEach(dir=>drawLung(hx,hy,lwH,lhH,dir,healthyColor));
    // حويصلات صحية — وردية كبيرة تنبض
    pts.alv.forEach((p)=>{
      const ax=hx+p.rx*lwH*0.32, ay=hy+p.ry*lhH*0.32;
      const ar=(5+p.rr*6)*breathe;
      c.fillStyle='rgba(240,80,80,0.55)';
      c.beginPath(); c.arc(ax,ay,ar,0,Math.PI*2); c.fill();
      // حلقة خارجية
      c.strokeStyle='rgba(200,60,60,0.3)'; c.lineWidth=1;
      c.beginPath(); c.arc(ax,ay,ar*1.5,0,Math.PI*2); c.stroke();
    });
    // تسمية مع خلفية خضراء واضحة
    c.fillStyle='rgba(39,174,96,0.15)'; c.strokeStyle='#27AE60'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(hx-55,hy+lhH*0.5,110,58,8); c.fill(); c.stroke();
    U7.txt(c,'✅ رئة سليمة 🫁',hx,hy+lhH*0.5+16,'#27AE60',13,true);
    U7.txt(c,'السعة: 100%',hx,hy+lhH*0.5+32,'#27AE60',12,false);
    U7.txt(c,'حويصلات: 30/30 • تتنفس بحرية',hx,hy+lhH*0.5+46,'#27AE60',10,false);

    // ── رئة المدخّن (يمين) ──
    const sx=w*0.73, sy=h*0.5;
    // اللون يتحول من وردي → بني داكن → أسود مع التدخين بشكل واضح جداً
    const rC=Math.round(220 - d*200);
    const gC=Math.round(100 - d*95);
    const bC=Math.round(90  - d*85);
    const smokerColor=`rgba(${rC},${gC},${bC},0.92)`;
    // الرئة المدخّن تتقلص مع الزمن
    const shrink=1-d*0.18;
    const lhS=lhBase*shrink, lwS=lwBase*shrink;
    [-1,1].forEach(dir=>drawLung(sx,sy,lwS,lhS,dir,smokerColor));

    // حويصلات مدمّرة — أقل وأصغر بشكل واضح
    const nAlv=Math.max(0,Math.round(30*(1-d*0.9)));
    pts.alv.slice(0,nAlv).forEach((p)=>{
      const ax=sx+p.rx*lwS*0.3, ay=sy+p.ry*lhS*0.3;
      const ar=Math.max(0.8,(5+p.rr*6)*shrink*(1-d*0.75));
      c.fillStyle=`rgba(140,60,20,0.6)`;
      c.beginPath(); c.arc(ax,ay,ar,0,Math.PI*2); c.fill();
    });

    // ترسّب القطران الداكن — بارز وواضح من أول سنة
    if(d>0.01){
      const nTar=Math.round(d*15);
      pts.tar.slice(0,nTar).forEach(p=>{
        const ax=sx+p.rx*lwS*0.28, ay=sy+p.ry*lhS*0.28;
        const ar=(4+p.rr*10)*d;
        // طبقات قطران: داخلي أسود + هالة بنية
        c.fillStyle=`rgba(8,5,0,${0.4+d*0.5})`;
        c.beginPath(); c.arc(ax,ay,ar,0,Math.PI*2); c.fill();
        c.fillStyle=`rgba(40,20,5,${0.2+d*0.3})`;
        c.beginPath(); c.arc(ax,ay,ar*1.6,0,Math.PI*2); c.fill();
      });
    }

    // مؤشر الضرر بشريط ملوّن
    const barW=lwS*1.8, barX=sx-barW/2, barY=sy-lhS*0.58;
    c.fillStyle='rgba(0,0,0,0.12)'; c.beginPath(); c.roundRect(barX,barY,barW,8,4); c.fill();
    const dmgColor= d<0.3?'#E67E22': d<0.6?'#D35400':'#C0392B';
    c.fillStyle=dmgColor; c.beginPath(); c.roundRect(barX,barY,barW*d,8,4); c.fill();
    U7.txt(c,`ضرر: ${Math.round(d*100)}%`,sx,barY-6,dmgColor,10,true);

    const capacity=Math.round(100*(1-d*0.78));
    const nAlvShow=Math.max(0,Math.round(30*(1-d*0.9)));
    // تسمية مع خلفية حمراء واضحة
    c.fillStyle='rgba(192,57,43,0.1)'; c.strokeStyle='#C0392B'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(sx-58,sy+lhS*0.5,116,58,8); c.fill(); c.stroke();
    U7.txt(c,'⚠️ رئة المدخّن 🖤',sx,sy+lhS*0.5+16,'#C0392B',13,true);
    U7.txt(c,`السعة: ${capacity}%`,sx,sy+lhS*0.5+32,'#C0392B',12,false);
    U7.txt(c,`حويصلات: ${nAlvShow}/30 • ضرر دائم`,sx,sy+lhS*0.5+46,'#C0392B',10,false);

    // سهم مقارنة وسط
    U7.txt(c,'⟵  مقارنة  ⟶',w/2,sy,'#888',12,false);
    // نص القطران إذا بدأ يظهر
    if(d>0.05){
      U7.txt(c,'◼ قطران',sx,sy+5,'rgba(20,10,0,0.7)',10,true);
    }

    S.t+=0.025;
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الوحدة ١٠ — التكاثر والتطوّر
// ══════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════
// الوحدة ١٠ — التكاثر والتطوّر  (PhET-style محسّن)
// ══════════════════════════════════════════════════════════

function repro_gametes(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_gametes) simState.repro_gametes={t:0,spermCount:0,launched:false,spermObjs:[],fertilised:false,fertAnim:0,tab:currentTab};
  const S=simState.repro_gametes;
  S.tab=currentTab;

  if(currentTab===0){
    controls(`
      <div class="ctrl-section">
        <div class="ctrl-label">🔬 محاكاة الإخصاب</div>
        <div style="font-size:13px;color:rgba(255,255,255,0.75);margin:6px 0;line-height:1.8">
          اضغط الزر لإطلاق الحيوانات المنوية نحو البويضة
        </div>
        <button class="ctrl-btn play" onclick="
          simState.repro_gametes.launched=true;
          simState.repro_gametes.fertilised=false;
          simState.repro_gametes.fertAnim=0;
          simState.repro_gametes.spermObjs=Array.from({length:20},(_,i)=>({
            x:0.88,y:0.35+Math.random()*0.3,
            vx:-(0.003+Math.random()*0.002),
            vy:(Math.random()-0.5)*0.004,
            phase:Math.random()*Math.PI*2,done:false
          }));
        ">🏊 أطلق الحيوانات المنوية</button>
        <button class="ctrl-btn reset" onclick="
          simState.repro_gametes.launched=false;
          simState.repro_gametes.fertilised=false;
          simState.repro_gametes.spermObjs=[];
          simState.repro_gametes.fertAnim=0;
        ">↺ إعادة</button>
      </div>
      <div class="info-box" style="font-size:13px;line-height:2;margin-top:8px">
        🥚 البويضة: كبيرة — 23 كروموسوم<br>
        🏊 الحيوان المنوي: صغير، له ذيل — 23 كروموسوم<br>
        ✅ عند الإخصاب: 23+23 = <strong>46 كروموسوم</strong>
      </div>`);
  } else {
    controls(`
      <div class="ctrl-section">
        <div class="ctrl-label">🧬 الكروموسومات</div>
      </div>
      <div class="info-box" style="font-size:13px;line-height:2">
        كل خلية جسمية: <strong>46</strong> كروموسوم<br>
        كل مشيج (بويضة/حيوان منوي): <strong>23</strong><br>
        بعد الإخصاب: <strong>46 ✅</strong><br><br>
        الكروموسومات تحمل الجينات التي تنقل الصفات الوراثية من الآباء إلى الأبناء
      </div>
      <div class="q-box" style="margin-top:8px">
        <strong>❓ لماذا 23 فقط في المشيج؟</strong>
        <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
        <div class="q-ans-panel">لو كان كل مشيج 46، فعند الإخصاب ستصبح 92 وتتضاعف في كل جيل — الطبيعة تحلّ هذا بتقسيم الخلية انقساماً اختزالياً ينتج 23 فقط.</div>
      </div>`);
  }

  function draw(){
    if(currentSim!=='repro_gametes') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.04;

    if(S.tab===0){
      // خلفية — قناة بيض
      const bg=c.createLinearGradient(0,0,0,h);
      bg.addColorStop(0,'#2D0840'); bg.addColorStop(1,'#4A1060');
      c.fillStyle=bg; c.fillRect(0,0,w,h);

      // قناة البيض
      c.fillStyle='rgba(180,80,220,0.12)';
      c.beginPath(); c.roundRect(w*0.05,h*0.25,w*0.9,h*0.5,30); c.fill();
      c.strokeStyle='rgba(180,80,220,0.3)'; c.lineWidth=2; c.stroke();

      // عنوان
      c.fillStyle='#E8B4FF'; c.font=`bold ${Math.min(17,w*0.038)}px Tajawal`;
      c.textAlign='center'; c.fillText('محاكاة الإخصاب في قناة البيض',w/2,h*0.12);

      // البويضة
      const ex=w*0.22, ey=h*0.5;
      const eR=Math.min(h*0.12,55);
      const glow=c.createRadialGradient(ex,ey,0,ex,ey,eR*1.6);
      glow.addColorStop(0,'rgba(255,180,50,0.4)'); glow.addColorStop(1,'transparent');
      c.fillStyle=glow; c.beginPath(); c.arc(ex,ey,eR*1.6,0,Math.PI*2); c.fill();

      const eg=c.createRadialGradient(ex-eR*0.3,ey-eR*0.3,eR*0.1,ex,ey,eR);
      eg.addColorStop(0,'#FFD080'); eg.addColorStop(0.6,'#E8962A'); eg.addColorStop(1,'#C07020');
      c.fillStyle=eg; c.beginPath(); c.arc(ex,ey,eR,0,Math.PI*2); c.fill();
      c.strokeStyle='#FFB040'; c.lineWidth=3; c.stroke();

      // نواة
      c.fillStyle='rgba(120,50,10,0.7)'; c.beginPath(); c.arc(ex,ey,eR*0.38,0,Math.PI*2); c.fill();
      c.fillStyle='white'; c.font=`bold ${eR*0.32}px Tajawal`; c.textAlign='center';
      c.fillText('23🧬',ex,ey+eR*0.12);
      c.fillStyle='#FFD080'; c.font=`bold ${Math.min(13,w*0.028)}px Tajawal`;
      c.fillText('🥚 البويضة',ex,ey+eR+18);

      // الحيوانات المنوية
      if(S.launched){
        S.spermObjs.forEach(sp=>{
          if(sp.done) return;
          sp.x+=sp.vx; sp.y+=sp.vy+Math.sin(S.t*4+sp.phase)*0.002;
          if(sp.y<0.28||sp.y>0.72){ sp.vy*=-1; }
          const sx2=sp.x*w, sy2=sp.y*h;
          const dist=Math.hypot(sx2-ex,sy2-ey);
          if(dist<eR+8 && !S.fertilised){
            S.fertilised=true; S.fertAnim=0;
            SoundEngine.chord([440,554,659],0.5,0.2);
          }
          if(dist<eR+8){ sp.done=true; return; }
          // رأس
          const hg=c.createRadialGradient(sx2,sy2,0,sx2,sy2,7);
          hg.addColorStop(0,'#80E8FF'); hg.addColorStop(1,'#1A8FA8');
          c.fillStyle=hg; c.beginPath(); c.ellipse(sx2,sy2,8,5,Math.atan2(sp.vy,sp.vx),0,Math.PI*2); c.fill();
          // ذيل
          c.strokeStyle='rgba(100,200,255,0.7)'; c.lineWidth=1.5;
          c.beginPath(); c.moveTo(sx2,sy2);
          for(let i=0;i<12;i++){
            const tx=sx2+(i+1)*6*(-sp.vx/Math.abs(sp.vx||0.001));
            const ty=sy2+Math.sin(S.t*5+sp.phase+i*0.5)*8*(1-i/14);
            i===0?c.moveTo(tx,ty):c.lineTo(tx,ty);
          }
          c.stroke();
        });
      }

      // إخصاب
      if(S.fertilised){
        S.fertAnim=Math.min(S.fertAnim+1,60);
        const prog=S.fertAnim/60;
        const ring=c.createRadialGradient(ex,ey,eR,ex,ey,eR+prog*50);
        ring.addColorStop(0,'rgba(255,220,80,0.8)'); ring.addColorStop(1,'transparent');
        c.fillStyle=ring; c.beginPath(); c.arc(ex,ey,eR+prog*50,0,Math.PI*2); c.fill();
        c.fillStyle='#FFD700'; c.font=`bold ${Math.min(18,w*0.04)}px Tajawal`;
        c.fillText('✅ إخصاب! 46 كروموسوم',w/2,h*0.85);
        c.fillStyle='rgba(255,215,0,0.8)'; c.font=`${Math.min(14,w*0.032)}px Tajawal`;
        c.fillText('بويضة مخصّبة — بداية حياة جديدة 🌟',w/2,h*0.92);
      } else if(!S.launched){
        c.fillStyle='rgba(255,255,255,0.5)'; c.font=`${Math.min(13,w*0.03)}px Tajawal`;
        c.fillText('اضغط "أطلق الحيوانات المنوية" لبدء المحاكاة',w/2,h*0.88);
      }

    } else {
      // تاب 2 — رسم الكروموسومات
      const bg2=c.createLinearGradient(0,0,0,h);
      bg2.addColorStop(0,'#0F2040'); bg2.addColorStop(1,'#1A3A6A');
      c.fillStyle=bg2; c.fillRect(0,0,w,h);

      c.fillStyle='#80C4FF'; c.font=`bold ${Math.min(17,w*0.038)}px Tajawal`;
      c.textAlign='center'; c.fillText('الكروموسومات في الخلايا',w/2,h*0.1);

      // خلية جسمية (46)
      const cx1=w*0.27, cy1=h*0.42;
      const cr1=Math.min(w*0.18,h*0.22);
      const cg=c.createRadialGradient(cx1,cy1,0,cx1,cy1,cr1);
      cg.addColorStop(0,'rgba(41,128,185,0.5)'); cg.addColorStop(1,'rgba(41,128,185,0.1)');
      c.fillStyle=cg; c.beginPath(); c.arc(cx1,cy1,cr1,0,Math.PI*2); c.fill();
      c.strokeStyle='#3498DB'; c.lineWidth=2; c.stroke();
      // كروموسومات صغيرة
      for(let i=0;i<23;i++){
        const a1=(i/23)*Math.PI*2+S.t*0.01;
        const r1=cr1*0.55;
        const kx=cx1+Math.cos(a1)*r1, ky=cy1+Math.sin(a1)*r1;
        c.fillStyle=`hsl(${i*15},70%,60%)`; 
        c.beginPath(); c.ellipse(kx,ky,5,3,(i/23)*Math.PI,0,Math.PI*2); c.fill();
        // النظير
        const kx2=cx1+Math.cos(a1+0.2)*r1*0.85, ky2=cy1+Math.sin(a1+0.2)*r1*0.85;
        c.beginPath(); c.ellipse(kx2,ky2,5,3,(i/23)*Math.PI,0,Math.PI*2); c.fill();
      }
      c.fillStyle='#80C4FF'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
      c.fillText('خلية جسمية',cx1,cy1+cr1+22);
      c.fillStyle='#3498DB'; c.font=`bold ${Math.min(18,w*0.04)}px Tajawal`;
      c.fillText('46 🧬',cx1,cy1+cr1+42);

      // سهم
      c.strokeStyle='#FFD700'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(w*0.45,cy1); c.lineTo(w*0.55,cy1); c.stroke();
      c.beginPath(); c.moveTo(w*0.52,cy1-8); c.lineTo(w*0.55,cy1); c.lineTo(w*0.52,cy1+8); c.fill(); c.fillStyle='#FFD700';
      c.fillStyle='#FFD700'; c.font=`${Math.min(11,w*0.024)}px Tajawal`;
      c.fillText('انقسام',w*0.5,cy1-12); c.fillText('اختزالي',w*0.5,cy1+16);

      // مشيج (23)
      const cx2=w*0.73, cy2=h*0.42;
      const cr2=Math.min(w*0.13,h*0.16);
      const cg2=c.createRadialGradient(cx2,cy2,0,cx2,cy2,cr2);
      cg2.addColorStop(0,'rgba(142,68,173,0.5)'); cg2.addColorStop(1,'rgba(142,68,173,0.1)');
      c.fillStyle=cg2; c.beginPath(); c.arc(cx2,cy2,cr2,0,Math.PI*2); c.fill();
      c.strokeStyle='#9B59B6'; c.lineWidth=2; c.stroke();
      for(let i=0;i<23;i++){
        const a2=(i/23)*Math.PI*2+S.t*0.01;
        const r2=cr2*0.55;
        const kx=cx2+Math.cos(a2)*r2, ky=cy2+Math.sin(a2)*r2;
        c.fillStyle=`hsl(${i*15},70%,60%)`;
        c.beginPath(); c.ellipse(kx,ky,4,2.5,(i/23)*Math.PI,0,Math.PI*2); c.fill();
      }
      c.fillStyle='#C880FF'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
      c.fillText('مشيج (بويضة / حيوان منوي)',cx2,cy2+cr2+22);
      c.fillStyle='#9B59B6'; c.font=`bold ${Math.min(18,w*0.04)}px Tajawal`;
      c.fillText('23 🧬',cx2,cy2+cr2+42);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_fertilisation(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_fertilisation) simState.repro_fertilisation={t:0,stage:0,divCount:0,autoDiv:false};
  const S=simState.repro_fertilisation;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧫 مراحل التطور المبكر</div>
      <button class="ctrl-btn play" id="btnNextStage" onclick="simState.repro_fertilisation.stage=Math.min(5,simState.repro_fertilisation.stage+1)">التالي ▶</button>
      <button class="ctrl-btn reset" onclick="simState.repro_fertilisation.stage=0">↺ من البداية</button>
    </div>
    <div class="info-box" id="stageInfo" style="font-size:13px;line-height:2;margin-top:8px">
      المرحلة ١ — البويضة المخصّبة
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ كم عدد الخلايا بعد 3 انقسامات؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">2³ = 8 خلايا — كل انقسام يضاعف العدد</div>
    </div>`);

  const stages=[
    {name:'البويضة المخصّبة',cells:1,color:'#E8962A',desc:'خلية واحدة تحتوي 46 كروموسوم'},
    {name:'مرحلة 2 خلايا',cells:2,color:'#27AE60',desc:'الانقسام الأول — خليتان متماثلتان'},
    {name:'مرحلة 4 خلايا',cells:4,color:'#2980B9',desc:'الانقسام الثاني — أربع خلايا'},
    {name:'مرحلة 8 خلايا',cells:8,color:'#8E44AD',desc:'الانقسام الثالث — ثماني خلايا'},
    {name:'الكرة الخلوية (16+)',cells:16,color:'#C0392B',desc:'تتشكّل الكرة الخلوية'},
    {name:'التعشيش في الرحم',cells:0,color:'#E67E22',desc:'الكرة الخلوية تتعشّش في جدار الرحم'},
  ];

  function draw(){
    if(currentSim!=='repro_fertilisation') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.03;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#1A0A2E'); bg.addColorStop(1,'#2E0A4E');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    const st=stages[S.stage];
    const el=document.getElementById('stageInfo');
    if(el) el.innerHTML=`المرحلة ${S.stage+1}: <strong>${st.name}</strong><br><span style="font-size:12px">${st.desc}</span>`;

    c.fillStyle='#FFD080'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText(st.name,w/2,h*0.1);

    const cx=w/2, cy=h*0.48;
    const outerR=Math.min(w*0.28,h*0.32);

    if(S.stage<5){
      // رسم الكرة الخلوية
      c.strokeStyle=st.color+'66'; c.lineWidth=2;
      c.beginPath(); c.arc(cx,cy,outerR,0,Math.PI*2); c.stroke();

      const n=st.cells;
      if(n===1){
        const gr=c.createRadialGradient(cx-outerR*0.3,cy-outerR*0.3,5,cx,cy,outerR);
        gr.addColorStop(0,'rgba(255,200,80,0.9)'); gr.addColorStop(0.7,st.color); gr.addColorStop(1,st.color+'88');
        c.fillStyle=gr; c.beginPath(); c.arc(cx,cy,outerR,0,Math.PI*2); c.fill();
        c.fillStyle='rgba(100,40,10,0.6)'; c.beginPath(); c.arc(cx,cy,outerR*0.35,0,Math.PI*2); c.fill();
        c.fillStyle='white'; c.font=`bold ${outerR*0.25}px Tajawal`; c.fillText('46🧬',cx,cy+outerR*0.1);
      } else {
        const angleStep=Math.PI*2/n;
        const cellR=outerR/(n<=4?2.5:3.5);
        const cellDist=outerR-(cellR+4);
        for(let i=0;i<n;i++){
          const ang=angleStep*i+S.t*0.008;
          const dx=Math.cos(ang)*cellDist*(n>8?0.7:1);
          const dy=Math.sin(ang)*cellDist*(n>8?0.7:1);
          const gr2=c.createRadialGradient(cx+dx-cellR*0.3,cy+dy-cellR*0.3,2,cx+dx,cy+dy,cellR);
          gr2.addColorStop(0,'rgba(255,255,255,0.8)'); gr2.addColorStop(0.4,st.color); gr2.addColorStop(1,st.color+'99');
          c.fillStyle=gr2; c.beginPath(); c.arc(cx+dx,cy+dy,cellR,0,Math.PI*2); c.fill();
          c.strokeStyle='rgba(255,255,255,0.3)'; c.lineWidth=1; c.stroke();
        }
      }
    } else {
      // تعشيش في الرحم
      const wallY=cy+outerR*0.5;
      c.fillStyle='rgba(200,100,50,0.3)'; c.fillRect(0,wallY,w,h-wallY);
      c.fillStyle='#C0392B'; c.font=`${Math.min(12,w*0.026)}px Tajawal`;
      c.fillText('جدار الرحم',w/2,wallY+20);
      // الكرة الخلوية
      const bR=outerR*0.55;
      for(let i=0;i<12;i++){
        const ang=i/12*Math.PI*2+S.t*0.005;
        const dx=Math.cos(ang)*bR*0.7, dy=Math.sin(ang)*bR*0.7;
        const r2=bR*0.28;
        c.fillStyle='rgba(232,150,42,0.7)'; c.beginPath(); c.arc(cx+dx,wallY-r2*0.5+dy*0.5,r2,0,Math.PI*2); c.fill();
      }
      c.strokeStyle='#E8962A'; c.lineWidth=2; c.beginPath(); c.arc(cx,wallY,bR,0,Math.PI*2); c.stroke();
      c.fillStyle='#FFD080'; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
      c.fillText('تعشيش في جدار الرحم ✅',cx,wallY-bR-15);
    }

    // شريط التقدم
    const pw=w*0.8, px=(w-pw)/2, barY=h*0.88;
    c.fillStyle='rgba(255,255,255,0.1)'; c.beginPath(); c.roundRect(px,barY,pw,8,4); c.fill();
    c.fillStyle=st.color; c.beginPath(); c.roundRect(px,barY,pw*(S.stage+1)/stages.length,8,4); c.fill();
    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.min(11,w*0.024)}px Tajawal`;
    c.fillText(`${S.stage+1} / ${stages.length}`,w/2,barY+22);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_development(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_development) simState.repro_development={t:0,week:4,dragging:false};
  const S=simState.repro_development;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📅 أسبوع الحمل: <span id="wkDisp" style="color:#FFD700;font-weight:bold">${S.week}</span></div>
      <input type="range" min="4" max="40" step="1" value="${S.week}"
        oninput="simState.repro_development.week=+this.value;document.getElementById('wkDisp').textContent=this.value"
        style="width:100%;margin:8px 0">
    </div>
    <div class="info-box" id="devInfo" style="font-size:13px;line-height:1.9;margin-top:8px">
      الأسبوع 4: قطعة صغيرة جداً
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ متى يبدأ القلب بالنبض؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">القلب يبدأ نبضه نحو الأسبوع 5-6 من الحمل</div>
    </div>`);

  const devStages=[
    {w:4,  size:0.04, desc:'جنين صغير جداً — تبدأ أعضاء رئيسية بالتشكّل', heart:false},
    {w:8,  size:0.09, desc:'الأعضاء الرئيسية تتشكّل — القلب ينبض', heart:true},
    {w:12, size:0.15, desc:'الجنين يتحرك — يمكن رؤيته بالأشعة الصوتية', heart:true},
    {w:20, size:0.26, desc:'يسمع الأصوات ويستجيب للضوء', heart:true},
    {w:28, size:0.38, desc:'عيناه تفتحان — يتدرب على التنفس', heart:true},
    {w:36, size:0.52, desc:'شبه مكتمل — يستعد للولادة', heart:true},
    {w:40, size:0.62, desc:'مكتمل النمو ✅ — جاهز للولادة', heart:true},
  ];

  function draw(){
    if(currentSim!=='repro_development') return;
    const w2=cv.width,h2=cv.height;
    c.clearRect(0,0,w2,h2);
    S.t+=0.04;

    // خلفية
    const bg=c.createLinearGradient(0,0,0,h2);
    bg.addColorStop(0,'#1A0A2E'); bg.addColorStop(1,'#3A1060');
    c.fillStyle=bg; c.fillRect(0,0,w2,h2);

    // جد الأقرب للأسبوع الحالي
    const wk=S.week;
    const st=devStages.reduce((a,b)=>Math.abs(b.w-wk)<Math.abs(a.w-wk)?b:a);
    // تحديث المعلومات
    const el=document.getElementById('devInfo');
    if(el) el.innerHTML=`الأسبوع <strong style="color:#FFD700">${wk}</strong>: ${st.desc}`;

    c.fillStyle='#FFD080'; c.font=`bold ${Math.min(16,w2*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText(`الأسبوع ${wk} من الحمل`,w2/2,h2*0.1);

    // الرحم
    const rx=w2/2, ry=h2*0.52;
    const rW=Math.min(w2*0.55,h2*0.55);
    c.fillStyle='rgba(200,100,80,0.2)'; c.strokeStyle='rgba(200,120,80,0.5)'; c.lineWidth=3;
    c.beginPath(); c.ellipse(rx,ry,rW/2,rW*0.6,0,0,Math.PI*2); c.fill(); c.stroke();

    // الجنين
    const fSize=st.size*Math.min(rW*0.85, h2*0.6);
    const pulse=st.heart?1+Math.sin(S.t*8)*0.04:1;
    const gr=c.createRadialGradient(rx-fSize*0.15,ry-fSize*0.15,fSize*0.05,rx,ry,fSize*pulse);
    gr.addColorStop(0,'rgba(255,200,150,0.95)'); gr.addColorStop(0.6,'rgba(230,160,120,0.85)'); gr.addColorStop(1,'rgba(200,120,100,0.4)');
    c.fillStyle=gr; c.beginPath(); c.arc(rx,ry,fSize*pulse,0,Math.PI*2); c.fill();

    if(wk>=12){
      // رأس
      c.fillStyle='rgba(255,200,150,0.8)'; c.beginPath();
      c.arc(rx+fSize*0.55,ry-fSize*0.3,fSize*0.35,0,Math.PI*2); c.fill();
    }

    if(st.heart){
      // نبضة قلب
      const hpulse=(Math.sin(S.t*8)+1)/2;
      c.fillStyle=`rgba(255,80,80,${0.5+hpulse*0.5})`;
      c.font=`${fSize*0.5}px Arial`; c.textAlign='center';
      c.fillText('❤',rx,ry+fSize*0.25);
    }

    // شريط المقياس
    c.fillStyle='rgba(255,255,255,0.15)'; c.beginPath(); c.roundRect(w2*0.1,h2*0.87,w2*0.8,10,5); c.fill();
    c.fillStyle='#FFD700'; c.beginPath(); c.roundRect(w2*0.1,h2*0.87,w2*0.8*(wk-4)/36,10,5); c.fill();
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.min(12,w2*0.027)}px Tajawal`;
    c.fillText(`الأسبوع ${wk} من 40`,w2/2,h2*0.92);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_growth(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_growth) simState.repro_growth={t:0,age:0,gender:'male'};
  const S=simState.repro_growth;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧒 العمر: <span id="ageDisp" style="color:#FFD700;font-weight:bold">${S.age}</span> سنة</div>
      <input type="range" min="0" max="18" step="1" value="${S.age}"
        oninput="simState.repro_growth.age=+this.value;document.getElementById('ageDisp').textContent=this.value"
        style="width:100%;margin:8px 0">
    </div>
    <div class="ctrl-section" style="margin-top:8px">
      <div class="ctrl-label">الجنس</div>
      <div style="display:flex;gap:8px">
        <button class="ctrl-btn" style="${S.gender==='male'?'background:#2980B9;color:white':''}" onclick="simState.repro_growth.gender='male'">👦 ذكر</button>
        <button class="ctrl-btn" style="${S.gender==='female'?'background:#E91E9C;color:white':''}" onclick="simState.repro_growth.gender='female'">👧 أنثى</button>
      </div>
    </div>
    <div class="info-box" id="growthInfo" style="font-size:13px;line-height:1.9;margin-top:8px">
      ابدأ بتحريك شريط العمر
    </div>`);

  const mileStones=[
    {age:0,  label:'مولود',       heightF:0.28, color:'#F39C12'},
    {age:2,  label:'طفل صغير',    heightF:0.35, color:'#27AE60'},
    {age:6,  label:'طفل',         heightF:0.48, color:'#2980B9'},
    {age:12, label:'مراهق مبكر',  heightF:0.66, color:'#8E44AD'},
    {age:15, label:'مراهق',       heightF:0.82, color:'#E74C3C'},
    {age:18, label:'بالغ',        heightF:1.0,  color:'#1A8FA8'},
  ];
  const puberty={male:'تبدأ المراهقة (البلوغ) عادةً بين 11-13 سنة: نمو سريع وتغيرات في الصوت',female:'تبدأ المراهقة (البلوغ) عادةً بين 10-12 سنة: نمو الثدي وبدء الدورة الشهرية'};

  function draw(){
    if(currentSim!=='repro_growth') return;
    const w2=cv.width,h2=cv.height;
    c.clearRect(0,0,w2,h2);
    S.t+=0.03;

    const bg=c.createLinearGradient(0,0,0,h2);
    bg.addColorStop(0,'#0F2A1E'); bg.addColorStop(1,'#1E4A32');
    c.fillStyle=bg; c.fillRect(0,0,w2,h2);

    const age=S.age;
    // حساب الطول
    const ms=mileStones.reduce((a,b)=>b.age<=age?b:a);
    const nextMs=mileStones.find(m=>m.age>age)||ms;
    const frac=ms.age===nextMs.age?1:(age-ms.age)/(nextMs.age-ms.age);
    const heightF=ms.heightF+(nextMs.heightF-ms.heightF)*frac;

    const el=document.getElementById('growthInfo');
    if(el){
      let info=`العمر: <strong style="color:#FFD700">${age}</strong> سنة — ${ms.label}`;
      if(age>=10&&age<=16) info+=`<br><small style="color:#FFB0B0">⚠️ ${puberty[S.gender]}</small>`;
      el.innerHTML=info;
    }

    c.fillStyle='#80FFB0'; c.font=`bold ${Math.min(16,w2*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText(`مراحل النمو — العمر ${age} سنة`,w2/2,h2*0.08);

    // رسم الشخصية
    const maxH=h2*0.62;
    const personH=maxH*heightF;
    const baseY=h2*0.82;
    const cx=w2/2;
    const col=S.gender==='male'?'#3498DB':'#E91E9C';

    // رأس
    const headR=personH*0.15;
    c.fillStyle=col+'CC'; c.beginPath(); c.arc(cx,baseY-personH+headR,headR,0,Math.PI*2); c.fill();
    c.strokeStyle=col; c.lineWidth=2; c.stroke();
    // جسم
    c.strokeStyle=col; c.lineWidth=Math.max(2,personH*0.04);
    c.beginPath(); c.moveTo(cx,baseY-personH+headR*2); c.lineTo(cx,baseY-personH*0.35); c.stroke();
    // ذراعان
    c.beginPath(); c.moveTo(cx-personH*0.18,baseY-personH*0.6); c.lineTo(cx,baseY-personH*0.55); c.lineTo(cx+personH*0.18,baseY-personH*0.6); c.stroke();
    // قدمان
    c.beginPath(); c.moveTo(cx,baseY-personH*0.35); c.lineTo(cx-personH*0.12,baseY); c.stroke();
    c.beginPath(); c.moveTo(cx,baseY-personH*0.35); c.lineTo(cx+personH*0.12,baseY); c.stroke();

    // علامة الطول
    c.strokeStyle='rgba(255,255,100,0.4)'; c.lineWidth=1; c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(cx+personH*0.25,baseY-personH); c.lineTo(cx+personH*0.25,baseY); c.stroke();
    c.setLineDash([]);
    c.fillStyle='#FFD700'; c.font=`bold ${Math.min(13,w2*0.03)}px Tajawal`;
    c.textAlign='left';
    c.fillText(`${Math.round(50+heightF*120)} سم`,cx+personH*0.28,baseY-personH*0.5);
    c.textAlign='center';

    // مرحلة
    c.fillStyle=ms.color; c.font=`bold ${Math.min(14,w2*0.032)}px Tajawal`;
    c.fillText(ms.label,cx,h2*0.9);

    // شريط تقدم العمر
    c.fillStyle='rgba(255,255,255,0.1)'; c.beginPath(); c.roundRect(w2*0.08,h2*0.94,w2*0.84,8,4); c.fill();
    c.fillStyle=ms.color; c.beginPath(); c.roundRect(w2*0.08,h2*0.94,w2*0.84*(age/18),8,4); c.fill();

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_lifestyle(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_lifestyle) simState.repro_lifestyle={t:0,choices:{sleep:7,exercise:3,fruits:3,smoking:0,stress:2}};
  const S=simState.repro_lifestyle;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌙 ساعات النوم: <span id="ls_sleep" style="color:#FFD700">${S.choices.sleep}</span></div>
      <input type="range" min="4" max="10" step="1" value="${S.choices.sleep}"
        oninput="simState.repro_lifestyle.choices.sleep=+this.value;document.getElementById('ls_sleep').textContent=this.value"
        style="width:100%;margin:4px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🏃 أيام الرياضة أسبوعياً: <span id="ls_ex" style="color:#FFD700">${S.choices.exercise}</span></div>
      <input type="range" min="0" max="7" step="1" value="${S.choices.exercise}"
        oninput="simState.repro_lifestyle.choices.exercise=+this.value;document.getElementById('ls_ex').textContent=this.value"
        style="width:100%;margin:4px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🍎 حصص الفواكه والخضار يومياً: <span id="ls_fr" style="color:#FFD700">${S.choices.fruits}</span></div>
      <input type="range" min="0" max="7" step="1" value="${S.choices.fruits}"
        oninput="simState.repro_lifestyle.choices.fruits=+this.value;document.getElementById('ls_fr').textContent=this.value"
        style="width:100%;margin:4px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🚬 مستوى التدخين: <span id="ls_sm" style="color:#FF6060">${S.choices.smoking}</span></div>
      <input type="range" min="0" max="5" step="1" value="${S.choices.smoking}"
        oninput="simState.repro_lifestyle.choices.smoking=+this.value;document.getElementById('ls_sm').textContent=this.value"
        style="width:100%;margin:4px 0">
    </div>`);

  function draw(){
    if(currentSim!=='repro_lifestyle') return;
    const w2=cv.width,h2=cv.height;
    c.clearRect(0,0,w2,h2);
    S.t+=0.03;

    const bg=c.createLinearGradient(0,0,0,h2);
    bg.addColorStop(0,'#0A1E2A'); bg.addColorStop(1,'#0D2E40');
    c.fillStyle=bg; c.fillRect(0,0,w2,h2);

    c.fillStyle='#80FFD0'; c.font=`bold ${Math.min(16,w2*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('نمط الحياة وصحة الجسم',w2/2,h2*0.08);

    const ch=S.choices;
    const healthScore=Math.min(100,Math.max(0,
      (ch.sleep>=7?20:ch.sleep>=6?12:5)+
      (ch.exercise>=4?25:ch.exercise>=2?15:5)+
      (ch.fruits>=5?20:ch.fruits>=3?12:4)+
      (ch.smoking===0?25:ch.smoking<=2?10:0)+
      (15)
    ));

    // عقرب الصحة
    const meterCX=w2/2, meterCY=h2*0.42;
    const meterR=Math.min(w2*0.3,h2*0.28);
    // نصف دائرة
    c.strokeStyle='rgba(255,255,255,0.1)'; c.lineWidth=meterR*0.28;
    c.beginPath(); c.arc(meterCX,meterCY,meterR,Math.PI,0); c.stroke();
    // ألوان الصحة
    const grad=c.createLinearGradient(meterCX-meterR,meterCY,meterCX+meterR,meterCY);
    grad.addColorStop(0,'#E74C3C'); grad.addColorStop(0.5,'#F39C12'); grad.addColorStop(1,'#27AE60');
    c.strokeStyle=grad; c.lineWidth=meterR*0.26;
    c.beginPath(); c.arc(meterCX,meterCY,meterR,Math.PI,Math.PI+(healthScore/100)*Math.PI); c.stroke();
    // مؤشر
    const angle=Math.PI+(healthScore/100)*Math.PI;
    c.strokeStyle='white'; c.lineWidth=3;
    c.beginPath(); c.moveTo(meterCX,meterCY);
    c.lineTo(meterCX+Math.cos(angle)*meterR*0.85,meterCY+Math.sin(angle)*meterR*0.85);
    c.stroke();
    c.fillStyle='white'; c.beginPath(); c.arc(meterCX,meterCY,8,0,Math.PI*2); c.fill();

    // درجة الصحة
    const color=healthScore>70?'#27AE60':healthScore>40?'#F39C12':'#E74C3C';
    c.fillStyle=color; c.font=`bold ${meterR*0.35}px Tajawal`; c.textAlign='center';
    c.fillText(Math.round(healthScore),meterCX,meterCY-8);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.min(12,w2*0.027)}px Tajawal`;
    c.fillText('/ 100',meterCX,meterCY+12);

    // نصائح
    const tips=[];
    if(ch.sleep<7) tips.push('💤 زد ساعات النوم إلى 8-9 ساعات');
    if(ch.exercise<3) tips.push('🏃 مارس الرياضة 3 أيام أسبوعياً على الأقل');
    if(ch.fruits<3) tips.push('🥦 تناول المزيد من الفواكه والخضار');
    if(ch.smoking>0) tips.push('🚭 التدخين يضر بالصحة — أقلع عنه!');
    if(tips.length===0) tips.push('✅ رائع! أنت تتبع نمط حياة صحياً');

    tips.slice(0,3).forEach((tip,i)=>{
      c.fillStyle=i===0&&ch.smoking>0?'#FF8080':'rgba(255,255,255,0.85)';
      c.font=`${Math.min(12.5,w2*0.028)}px Tajawal`;
      c.fillText(tip,w2/2,h2*0.72+i*22);
    });

    c.fillStyle=color; c.font=`bold ${Math.min(14,w2*0.032)}px Tajawal`;
    c.fillText(healthScore>70?'✅ نمط حياة صحي!':`⚠️ يحتاج تحسيناً`,w2/2,h2*0.92);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الوحدة ٨ — الأملاح (PhET-style محسّن)
// ══════════════════════════════════════════════════════════

function salts_what(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_what) simState.salts_what={t:0,sel:-1,dragging:false,dropX:0,dropY:0,dropped:false,dropAnim:0};
  const S=simState.salts_what;

  const salts=[
    {name:'كلوريد الصوديوم',formula:'NaCl',emoji:'🧂',color:'#7F8C8D',shine:'#BDC3C7',use:'حفظ الأغذية وإضفاء النكهة',acid:'HCl',base:'NaOH',ions:['Na⁺','Cl⁻']},
    {name:'كبريتات النحاس',formula:'CuSO₄',emoji:'🔵',color:'#2980B9',shine:'#5DADE2',use:'مبيد فطري للبذور',acid:'H₂SO₄',base:'Cu(OH)₂',ions:['Cu²⁺','SO₄²⁻']},
    {name:'نترات الأمونيوم',formula:'NH₄NO₃',emoji:'🌱',color:'#27AE60',shine:'#58D68D',use:'سماد زراعي',acid:'HNO₃',base:'NH₃',ions:['NH₄⁺','NO₃⁻']},
    {name:'كربونات الكالسيوم',formula:'CaCO₃',emoji:'📝',color:'#95A5A6',shine:'#BFC9CA',use:'طباشير السبورة والحجر الجيري',acid:'H₂CO₃',base:'Ca(OH)₂',ions:['Ca²⁺','CO₃²⁻']},
    {name:'كبريتات الألومنيوم',formula:'Al₂(SO₄)₃',emoji:'🎨',color:'#8E44AD',shine:'#BB8FCE',use:'تثبيت الأصباغ بالألياف',acid:'H₂SO₄',base:'Al(OH)₃',ions:['Al³⁺','SO₄²⁻']},
    {name:'كربونات المغنيسيوم',formula:'MgCO₃',emoji:'🤸',color:'#E67E22',shine:'#F0B27A',use:'جفاف اليدين في الرياضة',acid:'H₂CO₃',base:'Mg(OH)₂',ions:['Mg²⁺','CO₃²⁻']},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧂 اختر الملح لتحليله</div>
      ${salts.map((s,i)=>`<button class="ctrl-btn" style="margin:2px 0;width:100%;text-align:right;padding:6px 10px;${i===S.sel?'background:'+s.color+';color:white;':'font-size:13px'}" onclick="simState.salts_what.sel=${i};simState.salts_what.dropped=false;simState.salts_what.dropAnim=0">${s.emoji} ${s.name}</button>`).join('')}
    </div>
    ${S.sel>=0?`<button class="ctrl-btn play" style="margin-top:6px;width:100%" onclick="simState.salts_what.dropped=true;simState.salts_what.dropAnim=0">💧 أذِب في الماء</button>`:''}
    <div class="q-box" style="margin-top:8px">
      <strong>❓ الملح = ؟ + ؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الملح = حمض + قاعدة (بعد تفاعل التعادل) — مثل: HCl + NaOH → NaCl + H₂O</div>
    </div>`);

  function draw(){
    if(currentSim!=='salts_what') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.04;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#E8F4F8'); bg.addColorStop(1,'#D0E8F0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(S.sel<0){
      c.fillStyle='#1A8FA8'; c.font=`bold ${Math.min(18,w*0.04)}px Tajawal`;
      c.textAlign='center'; c.fillText('اختر ملحاً من القائمة لتحليله',w/2,h*0.45);
      c.font=`${Math.min(13,w*0.03)}px Tajawal`; c.fillStyle='#7A9AB0';
      c.fillText('ستظهر الأيونات والبنية الكيميائية',w/2,h*0.56);
      animFrame=requestAnimationFrame(draw); return;
    }

    const s=salts[S.sel];
    // عنوان
    c.fillStyle=s.color; c.font=`bold ${Math.min(17,w*0.038)}px Tajawal`;
    c.textAlign='center'; c.fillText(`${s.emoji} ${s.name}`,w/2,h*0.09);
    c.fillStyle='#555'; c.font=`bold ${Math.min(14,w*0.032)}px monospace`;
    c.fillText(s.formula,w/2,h*0.16);

    if(!S.dropped){
      // بلورات الملح تتحرك
      for(let i=0;i<12;i++){
        const ang=(i/12)*Math.PI*2+S.t*0.3;
        const r=Math.min(w*0.2,h*0.18)+Math.sin(S.t+i)*4;
        const bx=w/2+Math.cos(ang)*r, by=h*0.48+Math.sin(ang)*r*0.55;
        const sz=12+Math.sin(S.t*0.5+i)*3;
        c.fillStyle=s.color+'CC';
        c.beginPath(); c.roundRect(bx-sz/2,by-sz/2,sz,sz,3); c.fill();
      }
      c.fillStyle=s.color; c.font=`${Math.min(40,h*0.12)}px Arial`;
      c.textAlign='center'; c.fillText(s.emoji,w/2,h*0.56);
      c.fillStyle='rgba(26,143,168,0.6)'; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
      c.fillText('اضغط "أذِب في الماء" لرؤية الأيونات',w/2,h*0.73);
    } else {
      // ذوبان الملح — أيونات تنفصل
      if(S.dropAnim<100) S.dropAnim++;
      const prog=S.dropAnim/100;

      // كأس ماء
      const bx2=w*0.2, bw2=w*0.6, by2=h*0.22;
      const waterColor=`rgba(${s.color.match(/\d+/g).map(Number).map((v,i)=>Math.min(255,v+100)).join(',')},${0.15+prog*0.25})`;
      c.fillStyle=waterColor; c.beginPath(); c.roundRect(bx2,by2,bw2,h*0.6,8); c.fill();
      c.strokeStyle=s.color+'88'; c.lineWidth=2; c.stroke();
      c.fillStyle='#3498DB44'; c.fillRect(bx2+2,by2+2,bw2-4,h*0.05); // حافة
      c.fillStyle='rgba(80,160,210,0.4)'; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
      c.textAlign='center'; c.fillText('ماء H₂O',w/2,by2+h*0.06);

      // أيونات تتحرك
      s.ions.forEach((ion,ii)=>{
        const cnt=5;
        for(let j=0;j<cnt;j++){
          const ang=(ii*Math.PI+j/cnt*Math.PI*2)+S.t*(0.4+ii*0.15);
          const d=(0.15+prog*0.3)*Math.min(w,h)*0.35;
          const ix=w/2+Math.cos(ang)*d, iy=h*0.52+Math.sin(ang)*d*0.5;
          const col=ii===0?s.color:'#C0392B';
          c.fillStyle=col+'CC'; c.beginPath(); c.arc(ix,iy,9,0,Math.PI*2); c.fill();
          c.fillStyle='white'; c.font=`bold ${Math.min(8,w*0.018)}px monospace`;
          c.textAlign='center'; c.fillText(ion,ix,iy+3);
        }
      });

      if(prog>0.5){
        c.fillStyle=s.color; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
        c.fillText(`الاستخدام: ${s.use}`,w/2,h*0.88);
        c.fillStyle='#27AE60'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
        c.fillText(`من: ${s.acid} + ${s.base}`,w/2,h*0.94);
      }
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function salts_metal(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_metal) simState.salts_metal={t:0,reaction:0,metal:'zinc',acid:'H₂SO₄',bubbles:[],dissolve:0,reacted:false};
  const S=simState.salts_metal;

  const metals={
    zinc:     {name:'الخارصين (Zn)',color:'#7F8C8D',shine:'#BDC3C7',salt:'كبريتات الخارصين',saltF:'ZnSO₄',saltColor:'rgba(127,140,141,0.5)',reacts:true,rate:1.2},
    magnesium:{name:'المغنيسيوم (Mg)',color:'#BDC3C7',shine:'#D5DBDB',salt:'كبريتات المغنيسيوم',saltF:'MgSO₄',saltColor:'rgba(189,195,199,0.4)',reacts:true,rate:2.0},
    iron:     {name:'الحديد (Fe)',color:'#8B6914',shine:'#B7950B',salt:'كبريتات الحديد',saltF:'FeSO₄',saltColor:'rgba(46,204,113,0.5)',reacts:true,rate:0.8},
    copper:   {name:'النحاس (Cu)',color:'#E67E22',shine:'#F0B27A',salt:'لا يتفاعل مع الأحماض المخففة',saltF:'—',saltColor:'transparent',reacts:false,rate:0},
    gold:     {name:'الذهب (Au)',color:'#D4AC0D',shine:'#F7DC6F',salt:'لا يتفاعل',saltF:'—',saltColor:'transparent',reacts:false,rate:0},
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔩 اختر الفلز</div>
      ${Object.entries(metals).map(([k,v])=>`<button class="ctrl-btn" style="margin:2px 0;width:100%;text-align:right;${k===S.metal?'background:'+v.color+';color:white;':''}" onclick="simState.salts_metal.metal='${k}';simState.salts_metal.reaction=0;simState.salts_metal.bubbles=[];simState.salts_metal.dissolve=0;simState.salts_metal.reacted=false">${v.name}</button>`).join('')}
    </div>
    <div class="ctrl-section" style="margin-top:8px">
      <button class="ctrl-btn play" style="width:100%" onclick="simState.salts_metal.reaction=1">➕ أضف الفلز للحمض</button>
      <button class="ctrl-btn reset" style="width:100%;margin-top:4px" onclick="simState.salts_metal.reaction=0;simState.salts_metal.bubbles=[];simState.salts_metal.dissolve=0;simState.salts_metal.reacted=false">↺ إعادة</button>
    </div>
    <div class="info-box" style="font-size:12px;line-height:1.9;margin-top:8px">
      📐 فلز + حمض → <strong>ملح + هيدروجين H₂</strong><br>
      <small>(الفلزات غير النشطة لا تتفاعل)</small>
    </div>`);

  function draw(){
    if(currentSim!=='salts_metal') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.05;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F8F0E8'); bg.addColorStop(1,'#EDE4D5');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    const m=metals[S.metal];

    // عنوان
    c.fillStyle='#1A8FA8'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText('نشاط 2-8 · تحضير ملح باستخدام فلز وحمض',w/2,h*0.07);

    // رسم الكأس بشكل أفضل
    const bx=w*0.25,by=h*0.12,bw=w*0.5,bh=h*0.62;
    // جوانب الكأس
    c.strokeStyle='#AAA'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(bx-bw*0.04,by); c.lineTo(bx,by+bh); c.stroke();
    c.beginPath(); c.moveTo(bx+bw+bw*0.04,by); c.lineTo(bx+bw,by+bh); c.stroke();
    c.beginPath(); c.moveTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.stroke();

    // سائل الحمض
    const acidY=by+bh*0.22;
    const acidGrad=c.createLinearGradient(bx,acidY,bx,by+bh);
    if(S.reaction>0 && m.reacts && S.dissolve>30){
      acidGrad.addColorStop(0,m.saltColor.replace('0.5','0.35')); acidGrad.addColorStop(1,m.saltColor.replace('0.5','0.6'));
    } else {
      acidGrad.addColorStop(0,'rgba(173,216,230,0.4)'); acidGrad.addColorStop(1,'rgba(144,238,144,0.6)');
    }
    c.fillStyle=acidGrad; c.fillRect(bx+1,acidY,bw-2,by+bh-acidY-1);
    c.fillStyle=S.reaction>0&&m.reacts&&S.dissolve>30?m.color:'#27AE60';
    c.font=`${Math.min(12,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText(S.reaction>0&&m.reacts&&S.dissolve>30?m.saltF:'H₂SO₄ (حمض مخفف)',bx+bw/2,acidY+h*0.07);

    if(S.reaction>0){
      if(m.reacts){
        // الفلز يذوب
        S.dissolve=Math.min(100,S.dissolve+m.rate*0.4);
        const remain=1-S.dissolve/100;
        if(remain>0.05){
          const mh=h*0.12*remain;
          const mGrad=c.createLinearGradient(bx+bw*0.3,acidY-mh,bx+bw*0.7,acidY);
          mGrad.addColorStop(0,m.shine); mGrad.addColorStop(1,m.color);
          c.fillStyle=mGrad; c.beginPath(); c.roundRect(bx+bw*0.32,acidY-mh,bw*0.36,mh+4,4); c.fill();
          c.strokeStyle=m.color; c.lineWidth=1.5; c.stroke();
        }
        // فقاعات H₂
        if(Math.random()<0.18*m.rate && S.bubbles.length<35){
          S.bubbles.push({x:bx+bw*(0.25+Math.random()*0.5),y:by+bh*0.8,r:2+Math.random()*4,vy:-1.2-Math.random()*1.2,phase:Math.random()*6});
        }
        S.bubbles=S.bubbles.filter(b=>b.y>by);
        S.bubbles.forEach(b=>{
          b.y+=b.vy; b.x+=Math.sin(S.t*2+b.phase)*1.2;
          c.strokeStyle=`rgba(150,200,255,${0.6+b.r/8})`; c.lineWidth=1.5;
          c.beginPath(); c.arc(b.x,b.y,b.r,0,Math.PI*2); c.stroke();
        });
        // H₂ يتصاعد
        if(S.dissolve>5){
          c.fillStyle='rgba(41,128,185,0.8)'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
          c.fillText('↑ غاز H₂',bx+bw/2,by+h*0.02);
        }
        // ناتج
        if(S.dissolve>50){
          c.fillStyle=m.color; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
          c.fillText('الملح الناتج: '+m.salt,bx+bw/2,h*0.85);
          c.font=`bold ${Math.min(14,w*0.032)}px monospace`; c.fillStyle=m.color;
          c.fillText(m.saltF,bx+bw/2,h*0.92);
        }
      } else {
        // لا يتفاعل
        c.fillStyle=m.color;
        c.beginPath(); c.roundRect(bx+bw*0.3,by+bh*0.55,bw*0.4,h*0.1,4); c.fill();
        c.fillStyle='#C0392B'; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
        c.fillText('❌ لا يتفاعل!',bx+bw/2,h*0.85);
        c.fillStyle='#555'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
        c.fillText('الفلزات غير النشطة لا تحلّ محل الهيدروجين',bx+bw/2,h*0.92);
      }
    } else {
      // الفلز فوق الكأس
      const mGrad2=c.createLinearGradient(bx+bw*0.3,by-h*0.14,bx+bw*0.7,by-h*0.04);
      mGrad2.addColorStop(0,m.shine); mGrad2.addColorStop(1,m.color);
      c.fillStyle=mGrad2; c.beginPath(); c.roundRect(bx+bw*0.3,by-h*0.15,bw*0.4,h*0.12,4); c.fill();
      c.strokeStyle=m.color; c.lineWidth=1.5; c.stroke();
      c.fillStyle='rgba(255,255,255,0.7)'; c.font=`bold ${Math.min(11,w*0.025)}px monospace`;
      c.textAlign='center'; c.fillText(m.name.match(/\((\w+)\)/)?.[1]||'M',bx+bw*0.5,by-h*0.1);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function salts_oxide(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_oxide) simState.salts_oxide={t:0,step:0,heat:0,stirAngle:0};
  const S=simState.salts_oxide;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔵 تحضير كبريتات النحاس</div>
      <button class="ctrl-btn play" style="width:100%" onclick="simState.salts_oxide.step=Math.min(5,simState.salts_oxide.step+1)">التالي ▶</button>
      <button class="ctrl-btn reset" style="width:100%;margin-top:4px" onclick="simState.salts_oxide.step=0;simState.salts_oxide.heat=0">↺ إعادة</button>
    </div>
    <div class="info-box" id="oxideInfo" style="font-size:12px;line-height:1.9;margin-top:8px">
      أكسيد النحاس + حمض الكبريتيك → كبريتات النحاس + ماء<br>
      <strong>CuO + H₂SO₄ → CuSO₄ + H₂O</strong>
    </div>`);

  const steps=[
    {title:'١. صبّ حمض الكبريتيك',color:'rgba(144,238,144,0.4)',label:'H₂SO₄',desc:'صبّ ~100 mL من الحمض في الكأس',showHeat:false,showStir:false,showCrystal:false},
    {title:'٢. إضافة أكسيد النحاس الأسود',color:'rgba(30,20,10,0.6)',label:'CuO أسود',desc:'أضف مسحوق CuO الأسود إلى الحمض',showHeat:false,showStir:false,showCrystal:false},
    {title:'٣. التسخين مع التحريك',color:'rgba(30,20,10,0.5)',label:'تسخين 🔥',desc:'سخّن ببطء مع تحريك مستمر',showHeat:true,showStir:true,showCrystal:false},
    {title:'٤. اللون يتحوّل للأزرق ✅',color:'rgba(41,128,185,0.55)',label:'CuSO₄ أزرق!',desc:'اللون الأزرق يعني اكتمال التفاعل',showHeat:false,showStir:false,showCrystal:false},
    {title:'٥. الترشيح',color:'rgba(41,128,185,0.45)',label:'سائل مرشّح',desc:'رشّح لإزالة CuO غير المتفاعل',showHeat:false,showStir:false,showCrystal:false},
    {title:'٦. التبخير — بلورات CuSO₄ ✅',color:'rgba(41,128,185,0.8)',label:'بلورات!',desc:'بخّر حتى تظهر البلورات الزرقاء الجميلة',showHeat:true,showStir:false,showCrystal:true},
  ];

  function draw(){
    if(currentSim!=='salts_oxide') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.05;
    if(steps[S.step].showHeat) S.heat=Math.min(100,S.heat+0.8);
    S.stirAngle+=steps[S.step].showStir?0.08:0;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#EEF2F7'); bg.addColorStop(1,'#E0E8F0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    const st=steps[S.step];
    const el=document.getElementById('oxideInfo');
    if(el) el.innerHTML=`<strong>${st.title}</strong><br>${st.desc}<br><small>CuO + H₂SO₄ → CuSO₄ + H₂O</small>`;

    c.fillStyle='#2980B9'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText(st.title,w/2,h*0.08);

    // كأس مخبرية بشكل حقيقي
    const bx=w*0.25,by=h*0.12,bw=w*0.5,bh=h*0.55;
    // جسم الكأس
    c.strokeStyle='#AAA'; c.lineWidth=2;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx+bw*0.04,by+bh); c.stroke();
    c.beginPath(); c.moveTo(bx+bw,by); c.lineTo(bx+bw-bw*0.04,by+bh); c.stroke();
    c.beginPath(); c.moveTo(bx+bw*0.04,by+bh); c.lineTo(bx+bw-bw*0.04,by+bh); c.stroke();
    // حافة الكأس
    c.strokeStyle='#CCC'; c.lineWidth=6;
    c.beginPath(); c.moveTo(bx-5,by); c.lineTo(bx+bw+5,by); c.stroke();
    // قياسات جانبية
    for(let i=1;i<=4;i++){
      const ly=by+bh-bh*(i/5);
      c.strokeStyle='rgba(0,0,0,0.1)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(bx+5,ly); c.lineTo(bx+20,ly); c.stroke();
    }

    // سائل
    const liquidY=by+bh*0.15;
    c.fillStyle=st.color;
    c.beginPath(); c.moveTo(bx+4,liquidY); c.lineTo(bx+bw-4,liquidY); c.lineTo(bx+bw-bw*0.04,by+bh-1); c.lineTo(bx+bw*0.04,by+bh-1); c.closePath(); c.fill();
    c.fillStyle='white'; c.font=`bold ${Math.min(13,w*0.028)}px monospace`; c.textAlign='center';
    c.fillText(st.label,bx+bw/2,liquidY+h*0.1);

    // حرارة
    if(st.showHeat){
      for(let i=0;i<6;i++){
        const hx=bx+bw*(0.15+i*0.14);
        const amp=6+Math.sin(S.t*3+i)*3;
        c.strokeStyle=`rgba(231,76,60,${0.5+S.heat/200})`; c.lineWidth=2;
        c.beginPath(); c.moveTo(hx,by+bh+h*0.06); c.quadraticCurveTo(hx-8,by+bh+h*0.03,hx,by+bh); c.stroke();
      }
    }

    // محرك
    if(st.showStir){
      const sx=bx+bw/2, sy=liquidY+h*0.12;
      c.strokeStyle='#888'; c.lineWidth=2;
      c.beginPath(); c.moveTo(sx,by); c.lineTo(sx,sy-8); c.stroke();
      c.save(); c.translate(sx,sy); c.rotate(S.stirAngle);
      c.strokeStyle='#666'; c.lineWidth=3;
      c.beginPath(); c.moveTo(-bw*0.2,0); c.lineTo(bw*0.2,0); c.stroke();
      c.restore();
    }

    // بلورات
    if(st.showCrystal){
      for(let i=0;i<8;i++){
        const cx2=bx+bw*(0.15+i*0.1);
        const cy2=by+bh-h*0.04-Math.random()*0.01*h;
        const cs=8+Math.sin(S.t*0.3+i)*2;
        c.fillStyle='rgba(41,128,185,0.85)';
        c.save(); c.translate(cx2,cy2); c.rotate(S.t*0.01+i);
        c.beginPath(); c.rect(-cs/2,-cs/2,cs,cs); c.fill();
        c.strokeStyle='rgba(100,180,230,0.8)'; c.lineWidth=1; c.stroke();
        c.restore();
      }
    }

    // شريط التقدم
    c.fillStyle='rgba(0,0,0,0.1)'; c.beginPath(); c.roundRect(w*0.1,h*0.85,w*0.8,8,4); c.fill();
    c.fillStyle='#2980B9'; c.beginPath(); c.roundRect(w*0.1,h*0.85,w*0.8*(S.step+1)/steps.length,8,4); c.fill();
    c.fillStyle='#2980B9'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText(`الخطوة ${S.step+1} من ${steps.length}`,w/2,h*0.93);
    if(S.step===5) c.fillText('CuO + H₂SO₄ → CuSO₄ + H₂O ✅',w/2,h*0.97);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function salts_carbonate(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_carbonate) simState.salts_carbonate={t:0,reaction:0,bubbles:[],co2prog:0,limeTest:false,pourAnim:0};
  const S=simState.salts_carbonate;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🫧 تفاعل كربونات مع حمض</div>
      <button class="ctrl-btn play" style="width:100%" onclick="simState.salts_carbonate.reaction=1;simState.salts_carbonate.pourAnim=0">➕ أضف كربونات النحاس</button>
      <button class="ctrl-btn" style="width:100%;margin-top:4px;background:#27AE60;color:white" onclick="simState.salts_carbonate.limeTest=true">🧪 اختبر بماء الجير</button>
      <button class="ctrl-btn reset" style="width:100%;margin-top:4px" onclick="simState.salts_carbonate.reaction=0;simState.salts_carbonate.bubbles=[];simState.salts_carbonate.co2prog=0;simState.salts_carbonate.limeTest=false;simState.salts_carbonate.pourAnim=0">↺ إعادة</button>
    </div>
    <div class="info-box" style="font-size:12px;line-height:1.9;margin-top:8px">
      كربونات + حمض →<br>
      <strong>ملح + ماء + CO₂</strong><br>
      CO₂ يُعكّر ماء الجير ← تأكيد ✅
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ كيف نُثبت أن الغاز المنطلق هو CO₂؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">نمرّره في ماء الجير Ca(OH)₂ — يتعكّر → يُكوّن CaCO₃ الأبيض الغير ذائب</div>
    </div>`);

  function draw(){
    if(currentSim!=='salts_carbonate') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.05;
    if(S.reaction>0) S.co2prog=Math.min(1,S.co2prog+0.006);

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0FFF4'); bg.addColorStop(1,'#E0F8E8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#27AE60'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText('نشاط 3-8 · كربونات الفلزات والأحماض',w/2,h*0.07);

    // كأس التفاعل
    const bx=w*0.08,bw=w*0.44,by=h*0.12,bh=h*0.55;
    c.strokeStyle='#AAA'; c.lineWidth=2;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx+bw*0.03,by+bh); c.stroke();
    c.beginPath(); c.moveTo(bx+bw,by); c.lineTo(bx+bw-bw*0.03,by+bh); c.stroke();
    c.beginPath(); c.moveTo(bx+bw*0.03,by+bh); c.lineTo(bx+bw-bw*0.03,by+bh); c.stroke();
    c.strokeStyle='#DDD'; c.lineWidth=5; c.beginPath(); c.moveTo(bx-4,by); c.lineTo(bx+bw+4,by); c.stroke();

    const liqY=by+bh*0.25;
    const liqColor=S.reaction>0&&S.co2prog>0.3?'rgba(41,128,185,0.45)':'rgba(144,238,144,0.4)';
    c.fillStyle=liqColor; c.fillRect(bx+2,liqY,bw-4,by+bh-liqY-1);
    c.fillStyle=S.reaction>0&&S.co2prog>0.3?'#2980B9':'#27AE60';
    c.font=`${Math.min(11,w*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText(S.reaction>0&&S.co2prog>0.3?'CuCl₂ (أزرق)':'HCl مخفف',bx+bw/2,liqY+h*0.06);

    // فقاعات
    if(S.reaction>0){
      if(Math.random()<0.22 && S.bubbles.length<40){
        S.bubbles.push({x:bx+bw*(0.2+Math.random()*0.6),y:by+bh*0.75,r:2+Math.random()*4.5,vy:-1.3-Math.random()*1.2,phase:Math.random()*6});
      }
      S.bubbles=S.bubbles.filter(b=>b.y>by-5);
      S.bubbles.forEach(b=>{
        b.y+=b.vy; b.x+=Math.sin(S.t*2.5+b.phase)*1.5;
        c.strokeStyle=`rgba(100,220,130,${0.5+b.r/12})`; c.lineWidth=1.5;
        c.beginPath(); c.arc(b.x,b.y,b.r,0,Math.PI*2); c.stroke();
      });
      c.fillStyle='rgba(39,174,96,0.8)'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
      c.fillText('↑ CO₂ فوران!',bx+bw/2,by-h*0.01);
    }

    // كأس ماء الجير
    const gx=w*0.57,gw=w*0.38,gy=h*0.24,gh=h*0.38;
    c.strokeStyle='#AAA'; c.lineWidth=2;
    c.beginPath(); c.moveTo(gx,gy); c.lineTo(gx+gw*0.03,gy+gh); c.stroke();
    c.beginPath(); c.moveTo(gx+gw,gy); c.lineTo(gx+gw-gw*0.03,gy+gh); c.stroke();
    c.beginPath(); c.moveTo(gx+gw*0.03,gy+gh); c.lineTo(gx+gw-gw*0.03,gy+gh); c.stroke();
    c.strokeStyle='#DDD'; c.lineWidth=5; c.beginPath(); c.moveTo(gx-3,gy); c.lineTo(gx+gw+3,gy); c.stroke();

    const limeAlpha=S.limeTest?0.3+S.co2prog*0.5:0.3;
    const limeColor=S.limeTest&&S.co2prog>0.4?`rgba(200,200,200,${limeAlpha})`:'rgba(240,248,255,0.5)';
    c.fillStyle=limeColor; c.fillRect(gx+2,gy+gh*0.2,gw-4,gh*0.8);
    c.fillStyle=S.limeTest&&S.co2prog>0.4?'#7F8C8D':'#3498DB';
    c.font=`${Math.min(11,w*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText('ماء الجير Ca(OH)₂',gx+gw/2,gy+gh*0.45);
    if(S.limeTest&&S.co2prog>0.4){
      c.fillStyle='#8B7355'; c.font=`bold ${Math.min(12,w*0.027)}px Tajawal`;
      c.fillText('تعكّر! ✅ CO₂ مؤكّد',gx+gw/2,gy+gh*0.72);
    }
    c.fillStyle='#666'; c.font=`${Math.min(11,w*0.024)}px Tajawal`;
    c.fillText('اختبار CO₂',gx+gw/2,gy-h*0.018);

    // سهم CO₂
    if(S.reaction>0 && S.co2prog>0.2){
      c.strokeStyle='rgba(39,174,96,0.6)'; c.lineWidth=2; c.setLineDash([5,4]);
      c.beginPath(); c.moveTo(bx+bw,by+bh*0.15); c.bezierCurveTo(w*0.52,by,w*0.52,gy+gh*0.1,gx,gy+gh*0.25); c.stroke();
      c.setLineDash([]);
      c.fillStyle='rgba(39,174,96,0.8)'; c.font=`${Math.min(10,w*0.023)}px Tajawal`;
      c.fillText('CO₂ ←',w*0.52,by+h*0.02);
    }

    // معادلة
    c.fillStyle='#27AE60'; c.font=`bold ${Math.min(11,w*0.024)}px monospace`;
    c.fillText('Cu₂CO₃ + 2HCl → 2CuCl + H₂O + CO₂',w/2,h*0.83);
    c.fillStyle=S.co2prog>0.6?'#1E8449':'#AAA'; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText(S.co2prog>0.6?'✅ التفاعل اكتمل — ملح + ماء + CO₂':'أضف الكربونات للبدء',w/2,h*0.9);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الوحدة ٩ — الصوت (PhET-style محسّن)
// ══════════════════════════════════════════════════════════

const SoundEngine = (function(){
  let ctx=null;
  function getCtx(){ if(!ctx) ctx=new(window.AudioContext||window.webkitAudioContext)(); return ctx; }
  return {
    tone(freq=440, dur=0.4, vol=0.25, type='sine'){
      try{
        const a=getCtx(); const g=a.createGain(); const o=a.createOscillator();
        o.type=type; o.frequency.value=freq;
        g.gain.setValueAtTime(vol,a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
        o.connect(g); g.connect(a.destination);
        o.start(); o.stop(a.currentTime+dur);
      }catch(e){}
    },
    chord(freqs=[261,329,392], dur=0.6, vol=0.18){ freqs.forEach(f=>this.tone(f,dur,vol)); },
    drum(dur=0.15, vol=0.3){
      try{
        const a=getCtx(); const g=a.createGain(); const buf=a.createBuffer(1,a.sampleRate*dur,a.sampleRate);
        const d=buf.getChannelData(0); for(let i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*Math.exp(-i/d.length*15);
        const src=a.createBufferSource(); src.buffer=buf;
        g.gain.setValueAtTime(vol,a.currentTime); g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+dur);
        src.connect(g); g.connect(a.destination); src.start();
      }catch(e){}
    },
    silence(){}
  };
})();

function sound_pitch(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_pitch) simState.sound_pitch={t:0,loudness:0.5,pitch:440,playReal:false};
  const S=simState.sound_pitch;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔊 شدة الصوت (السعة): <span id="spLoud" style="color:#FFD700">${S.loudness<0.3?'هادئ 🔈':S.loudness<0.7?'متوسط 🔉':'قوي 🔊'}</span></div>
      <input type="range" min="0.05" max="1" step="0.05" value="${S.loudness}"
        oninput="simState.sound_pitch.loudness=+this.value;document.getElementById('spLoud').textContent=+this.value<0.3?'هادئ 🔈':+this.value<0.7?'متوسط 🔉':'قوي 🔊'"
        style="width:100%;margin:6px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🎵 حدة الصوت / التردد: <span id="spPitch" style="color:#FFD700">${S.pitch} Hz</span></div>
      <input type="range" min="100" max="1000" step="25" value="${S.pitch}"
        oninput="simState.sound_pitch.pitch=+this.value;document.getElementById('spPitch').textContent=this.value+' Hz'"
        style="width:100%;margin:6px 0">
      <div style="display:flex;justify-content:space-between;font-size:11px;color:rgba(255,255,255,0.5)"><span>غليظ 🎸</span><span>رفيع 🎻</span></div>
    </div>
    <button class="ctrl-btn play" style="width:100%;margin-top:6px" onclick="
      try{
        const a=new(AudioContext||webkitAudioContext)();
        const o=a.createOscillator(); const g=a.createGain();
        o.frequency.value=simState.sound_pitch.pitch;
        g.gain.setValueAtTime(simState.sound_pitch.loudness*0.4,a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+1.2);
        o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime+1.2);
      }catch(e){}
    ">▶ اسمع الصوت الحقيقي 🔊</button>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:2">
      🔊 الشدة → سعة الموجة (ارتفاعها)<br>
      🎵 الحدة → تردد الموجة (عدد الموجات/ث)
    </div>`);

  function draw(){
    if(currentSim!=='sound_pitch') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.06;

    // خلفية شاشة أوسيلوسكوب
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#050D05'); bg.addColorStop(1,'#0A1A0A');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    // شبكة
    c.strokeStyle='rgba(0,140,0,0.12)'; c.lineWidth=0.5;
    for(let x=0;x<w;x+=w/10){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); }
    for(let y=0;y<h;y+=h/8){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); }

    const amp=S.loudness*h*0.3;
    const freq=S.pitch/300;
    const midY=h*0.5;

    // خط صفر
    c.strokeStyle='rgba(0,200,0,0.25)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(0,midY); c.lineTo(w,midY); c.stroke();

    // الموجة الرئيسية
    c.strokeStyle='#00FF44'; c.lineWidth=2.5;
    c.shadowColor='#00FF44'; c.shadowBlur=10;
    c.beginPath();
    for(let x=0;x<=w;x+=2){
      const y=midY+Math.sin((x/w)*freq*Math.PI*8+S.t)*amp;
      x===0?c.moveTo(x,y):c.lineTo(x,y);
    }
    c.stroke(); c.shadowBlur=0;

    // قياس السعة
    c.strokeStyle='#FF4444'; c.lineWidth=1.5; c.setLineDash([3,3]);
    c.beginPath(); c.moveTo(w*0.06,midY-amp); c.lineTo(w*0.17,midY-amp); c.stroke();
    c.beginPath(); c.moveTo(w*0.06,midY+amp); c.lineTo(w*0.17,midY+amp); c.stroke();
    c.beginPath(); c.moveTo(w*0.09,midY-amp); c.lineTo(w*0.09,midY+amp); c.stroke();
    c.setLineDash([]);
    c.fillStyle='#FF6666'; c.font=`${Math.min(11,w*0.024)}px Tajawal`;
    c.textAlign='right'; c.fillText('سعة',w*0.085,midY-amp*0.5);
    c.textAlign='center';

    // قياس التردد (فترة واحدة)
    const waveLen=w/(freq*4);
    c.strokeStyle='#44AAFF'; c.lineWidth=1.5; c.setLineDash([3,3]);
    c.beginPath(); c.moveTo(w*0.25,midY+amp+15); c.lineTo(w*0.25+waveLen,midY+amp+15); c.stroke();
    c.setLineDash([]);
    c.fillStyle='#44AAFF'; c.font=`${Math.min(10,w*0.022)}px Tajawal`;
    c.fillText('↔ فترة',w*0.25+waveLen/2,midY+amp+28);

    // معلومات
    c.fillStyle='#00DD33'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
    c.fillText(`الشدة: ${S.loudness<0.3?'🔈 هادئ':S.loudness<0.7?'🔉 متوسط':'🔊 قوي'}  |  التردد: ${S.pitch} Hz`,w/2,h*0.08);
    c.fillStyle='#44FFAA'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText(`الحدة: ${S.pitch<300?'غليظ 🎸':S.pitch<700?'متوسط 🎹':'رفيع 🎻'}`,w/2,h*0.94);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function sound_vibration(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_vibration) simState.sound_vibration={t:0,length:0.6,amplitude:0.5,mass:1,plucked:false,pluckT:0};
  const S=simState.sound_vibration;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📏 طول المسطرة: <span id="svLen" style="color:#FFD700">${Math.round(S.length*30)} cm</span></div>
      <input type="range" min="0.2" max="1" step="0.05" value="${S.length}"
        oninput="simState.sound_vibration.length=+this.value;document.getElementById('svLen').textContent=Math.round(+this.value*30)+'cm'"
        style="width:100%;margin:6px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">↕ مقدار الجذب: <span id="svAmp" style="color:#FFD700">${Math.round(S.amplitude*100)}%</span></div>
      <input type="range" min="0.1" max="1" step="0.05" value="${S.amplitude}"
        oninput="simState.sound_vibration.amplitude=+this.value;document.getElementById('svAmp').textContent=Math.round(+this.value*100)+'%'"
        style="width:100%;margin:6px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚖️ الوزن المعلّق: <span id="svMass" style="color:#FFD700">${S.mass}</span> وحدة</div>
      <input type="range" min="1" max="5" step="1" value="${S.mass}"
        oninput="simState.sound_vibration.mass=+this.value;document.getElementById('svMass').textContent=+this.value"
        style="width:100%;margin:6px 0">
    </div>
    <button class="ctrl-btn play" style="width:100%;margin-top:6px" onclick="
      simState.sound_vibration.plucked=true;
      simState.sound_vibration.pluckT=0;
      try{
        const f=1.5/(simState.sound_vibration.length*Math.sqrt(simState.sound_vibration.mass))*180;
        const a=new(AudioContext||webkitAudioContext)();
        const o=a.createOscillator(); const g=a.createGain();
        o.frequency.value=Math.max(80,Math.min(800,f));
        g.gain.setValueAtTime(0.3*simState.sound_vibration.amplitude,a.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+1.5);
        o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime+1.5);
      }catch(e){}
    ">🎸 اقرع المسطرة</button>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:2">
      طول أطول → تردد أقل (أبطأ)<br>
      كتلة أكبر → تردد أقل
    </div>`);

  function draw(){
    if(currentSim!=='sound_vibration') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.05; if(S.plucked) S.pluckT++;
    // تناقص بعد القرع
    const decay=S.plucked?Math.max(0,1-S.pluckT/120):1;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#1A1205'); bg.addColorStop(1,'#2E2005');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#FFD080'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('الاهتزازات — السعة والتردد',w/2,h*0.07);

    const freq=1.5/(S.length*Math.sqrt(S.mass));
    const deflection=S.amplitude*h*0.18*Math.sin(S.t*freq*6)*decay;

    // طاولة
    c.fillStyle='#8B6914'; c.beginPath(); c.roundRect(w*0.05,h*0.12,w*0.9,h*0.05,4); c.fill();

    // المسطرة (عازف الاهتزاز)
    const anchorX=w*0.28, anchorY=h*0.17;
    const rulerLen=S.length*h*0.5;
    const tipX=anchorX+deflection*0.5, tipY=anchorY+rulerLen;

    // ظل توهج
    if(Math.abs(deflection)>5){
      c.shadowColor='rgba(100,150,255,0.4)'; c.shadowBlur=12;
    }
    c.strokeStyle='#4A90D9'; c.lineWidth=7;
    c.beginPath(); c.moveTo(anchorX,anchorY); c.quadraticCurveTo(anchorX+deflection*0.7,anchorY+rulerLen*0.5,tipX,tipY); c.stroke();
    c.shadowBlur=0;
    // وزن
    const mSize=14+S.mass*4;
    const mGrad=c.createRadialGradient(tipX,tipY+mSize*0.5,2,tipX,tipY+mSize*0.5,mSize);
    mGrad.addColorStop(0,'#BDC3C7'); mGrad.addColorStop(1,'#7F8C8D');
    c.fillStyle=mGrad; c.beginPath(); c.roundRect(tipX-mSize/2,tipY,mSize,mSize*S.mass,4); c.fill();
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`bold ${mSize*0.55}px Tajawal`; c.textAlign='center';
    c.fillText(`${S.mass}W`,tipX,tipY+mSize*S.mass*0.6);

    // خط الاتزان
    c.strokeStyle='rgba(255,100,100,0.3)'; c.lineWidth=1; c.setLineDash([5,4]);
    c.beginPath(); c.moveTo(anchorX-w*0.07,tipY); c.lineTo(anchorX+w*0.07,tipY); c.stroke();
    c.setLineDash([]);
    // سهم السعة
    c.strokeStyle='rgba(255,80,80,0.6)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(anchorX-w*0.06,tipY-S.amplitude*h*0.18); c.lineTo(anchorX-w*0.06,tipY+S.amplitude*h*0.18); c.stroke();
    c.fillStyle='#FF8888'; c.font=`${Math.min(10,w*0.022)}px Tajawal`; c.textAlign='right';
    c.fillText('سعة',anchorX-w*0.07,tipY);
    c.textAlign='center';

    // موجة صوتية تنتشر
    for(let i=0;i<5;i++){
      const waveX=anchorX+w*0.12+i*w*0.12;
      const wAlpha=0.4-i*0.07;
      const wAmp=S.amplitude*h*0.1*decay*(1-i*0.15)*Math.sin(S.t*freq*6-i*0.8);
      if(wAlpha>0&&waveX<w*0.9){
        c.strokeStyle=`rgba(100,200,100,${wAlpha})`; c.lineWidth=1.5;
        c.beginPath();
        for(let y=h*0.2;y<h*0.8;y+=3){
          const xOff=Math.sin((y-h*0.5)*0.08)*wAmp*0.5;
          y===h*0.2?c.moveTo(waveX+xOff,y):c.lineTo(waveX+xOff,y);
        }
        c.stroke();
      }
    }

    // قراءات
    const Hz=(freq*15).toFixed(1);
    c.fillStyle='rgba(0,0,0,0.5)'; c.beginPath(); c.roundRect(w*0.55,h*0.32,w*0.4,h*0.3,8); c.fill();
    c.strokeStyle='rgba(100,180,255,0.3)'; c.lineWidth=1; c.stroke();
    c.fillStyle='#80C4FF'; c.font=`bold ${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText('📊 القراءات',w*0.75,h*0.41);
    c.fillStyle='#FFD700'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText(`التردد: ${Hz} Hz`,w*0.75,h*0.49);
    c.fillStyle='#80FF80';
    c.fillText(`الطول: ${Math.round(S.length*30)} cm`,w*0.75,h*0.54);
    c.fillStyle='#FFA0A0';
    c.fillText(`الوزن: ${S.mass} وحدة`,w*0.75,h*0.59);

    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText(S.length>0.7?'مسطرة طويلة → تردد أقل':S.length<0.35?'مسطرة قصيرة → تردد أعلى':'اضغط "اقرع المسطرة" لسماع الصوت',w/2,h*0.88);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function sound_travel(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_travel) simState.sound_travel={t:0,vacuum:false,medium:'air',waves:[],particles:[]};
  const S=simState.sound_travel;

  const mediums={
    air:  {name:'هواء',speed:1.0,color:'#3498DB',bgTop:'#87CEEB',bgBot:'#B0DCF0',pColor:'#3498DB',speedLabel:'343 م/ث'},
    water:{name:'ماء', speed:3.5,color:'#1A5276',bgTop:'#1B6CA8',bgBot:'#2E86C1',pColor:'#7FB3D3',speedLabel:'1480 م/ث'},
    solid:{name:'مادة صلبة',speed:10,color:'#7D6608',bgTop:'#C39A4A',bgBot:'#D4B060',pColor:'#F0C060',speedLabel:'5000 م/ث'},
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌊 الوسط الناقل</div>
      ${Object.entries(mediums).map(([k,v])=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.medium===k?'background:'+v.color+';color:white;':''}" onclick="simState.sound_travel.medium='${k}';simState.sound_travel.waves=[];simState.sound_travel.particles=[]">${k==='air'?'🌬️':k==='water'?'💧':'🪨'} ${v.name} (${v.speedLabel})</button>`).join('')}
    </div>
    <div class="ctrl-section" style="margin-top:8px">
      <label style="display:flex;align-items:center;gap:8px;cursor:pointer;color:white">
        <input type="checkbox" ${S.vacuum?'checked':''} onchange="simState.sound_travel.vacuum=this.checked;simState.sound_travel.waves=[];simState.sound_travel.particles=[]">
        <span>🔕 فراغ (لا جزيئات)</span>
      </label>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:2">
      الصوت = موجة ضغط في الوسط المادي<br>
      الجزيئات تهتز وتدفع بعضها<br>
      في الفراغ: لا جزيئات → لا صوت
    </div>`);

  // تهيئة الجسيمات
  function initParticles(){
    S.particles=[];
    if(S.vacuum) return;
    const med=mediums[S.medium];
    const rows=S.medium==='solid'?6:4;
    const cols=12;
    for(let r=0;r<rows;r++) for(let col=0;col<cols;col++)
      S.particles.push({
        bx:(col+0.5)/cols,by:0.25+r*(0.5/rows),
        dx:0,phase:col*0.3+r*0.7,med:S.medium
      });
  }
  if(S.particles.length===0) initParticles();

  function draw(){
    if(currentSim!=='sound_travel') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.04;

    if(S.vacuum){
      c.fillStyle='#080818'; c.fillRect(0,0,w,h);
      // نجوم
      for(let i=0;i<40;i++){
        const sx=(Math.sin(i*137)*0.5+0.5)*w, sy=(Math.cos(i*97)*0.5+0.5)*h;
        c.fillStyle=`rgba(255,255,255,${0.3+Math.sin(S.t+i)*0.2})`; c.beginPath(); c.arc(sx,sy,1,0,Math.PI*2); c.fill();
      }
      c.fillStyle='#FF4444'; c.font=`bold ${Math.min(19,w*0.042)}px Tajawal`; c.textAlign='center';
      c.fillText('🔕 الصوت لا ينتقل في الفراغ!',w/2,h*0.42);
      c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.min(13,w*0.03)}px Tajawal`;
      c.fillText('لا توجد جزيئات لنقل الاهتزاز',w/2,h*0.55);
      c.fillStyle='rgba(255,255,255,0.3)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
      c.fillText('الفضاء الخارجي — صمت مطبق ✨',w/2,h*0.68);
      animFrame=requestAnimationFrame(draw); return;
    }

    const med=mediums[S.medium];
    // خلفية
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,med.bgTop); bg.addColorStop(1,med.bgBot);
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // إضافة موجات دورية
    if(S.t%0.5<0.04) S.waves.push({x:w*0.12,alpha:1});
    S.waves=S.waves.filter(wv=>wv.x<w*1.1&&wv.alpha>0.02);
    S.waves.forEach(wv=>{ wv.x+=med.speed*3.5; wv.alpha*=0.97; });

    // رسم الجسيمات مع الاهتزاز
    S.particles.forEach(p=>{
      let wavePush=0;
      S.waves.forEach(wv=>{
        const dist=Math.abs(p.bx*w-wv.x);
        if(dist<w*0.12) wavePush+=Math.sin((p.bx*w-wv.x)*0.04)*wv.alpha*18;
      });
      p.dx=wavePush;
      const px=p.bx*w+p.dx, py=p.by*h;
      c.fillStyle=S.medium==='solid'?`hsl(${40+p.bx*20},60%,55%)`:med.pColor+'CC';
      const pr=S.medium==='solid'?5:3.5;
      c.beginPath(); c.arc(px,py,pr,0,Math.PI*2); c.fill();
      if(S.medium==='solid'){
        c.strokeStyle=med.pColor+'40'; c.lineWidth=0.8;
        if(p.bx<0.9) c.beginPath(), c.moveTo(px,py), c.lineTo(px+w/12,py), c.stroke();
      }
    });

    // موجات الضغط كمؤشرات بصرية
    S.waves.forEach(wv=>{
      const g=c.createLinearGradient(wv.x-20,0,wv.x+20,0);
      g.addColorStop(0,'transparent'); g.addColorStop(0.5,med.color+Math.round(wv.alpha*80).toString(16).padStart(2,'0')); g.addColorStop(1,'transparent');
      c.fillStyle=g; c.fillRect(wv.x-20,h*0.18,40,h*0.64);
    });

    // مصدر الصوت
    c.fillStyle=med.color+'CC'; c.font=`${Math.min(32,h*0.1)}px Arial`;
    c.textAlign='center'; c.fillText('🔊',w*0.1,h*0.55);

    // أذن
    c.fillText('👂',w*0.9,h*0.55);

    // إشارة الإرسال
    S.waves.filter(wv=>wv.x>w*0.7).forEach(wv=>{
      c.fillStyle=`rgba(255,220,50,${wv.alpha*0.8})`; c.font=`${Math.min(20,h*0.07)}px Arial`;
      c.fillText('🎵',w*0.87,h*0.35);
    });

    // معلومات
    c.fillStyle='rgba(0,0,0,0.45)'; c.beginPath(); c.roundRect(w*0.3,h*0.04,w*0.4,h*0.14,8); c.fill();
    c.fillStyle='white'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
    c.fillText(`سرعة الصوت في ${med.name}: ${med.speedLabel}`,w/2,h*0.1);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText('أسرع في المواد الصلبة > السوائل > الغازات',w/2,h*0.15);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function sound_oscilloscope(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_oscilloscope) simState.sound_oscilloscope={t:0,amp:0.5,freq:2,showLabels:true,freeze:false,frozenT:0};
  const S=simState.sound_oscilloscope;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔊 شدة الصوت (السعة): <span id="soAmp" style="color:#00FF88">${S.amp<0.15?'صمت':S.amp<0.5?'هادئ 🔈':'قوي 🔊'}</span></div>
      <input type="range" min="0" max="1" step="0.05" value="${S.amp}"
        oninput="simState.sound_oscilloscope.amp=+this.value;document.getElementById('soAmp').textContent=+this.value<0.05?'صمت':+this.value<0.5?'هادئ 🔈':'قوي 🔊'"
        style="width:100%;margin:6px 0">
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🎵 حدة الصوت (التردد): <span id="soFreq" style="color:#44DDFF">${S.freq<2.5?'غليظ 🎸':S.freq<4?'متوسط 🎹':'رفيع 🎻'}</span></div>
      <input type="range" min="0.8" max="6" step="0.4" value="${S.freq}"
        oninput="simState.sound_oscilloscope.freq=+this.value;document.getElementById('soFreq').textContent=+this.value<2.5?'غليظ 🎸':+this.value<4?'متوسط 🎹':'رفيع 🎻'"
        style="width:100%;margin:6px 0">
    </div>
    <div style="display:flex;gap:6px;margin-top:6px">
      <button class="ctrl-btn" style="flex:1" onclick="simState.sound_oscilloscope.freeze=!simState.sound_oscilloscope.freeze;simState.sound_oscilloscope.frozenT=simState.sound_oscilloscope.t;this.textContent=simState.sound_oscilloscope.freeze?'▶ تشغيل':'⏸ تجميد'">⏸ تجميد</button>
      <button class="ctrl-btn" style="flex:1" onclick="simState.sound_oscilloscope.showLabels=!simState.sound_oscilloscope.showLabels">🏷 مسميات</button>
    </div>
    <div class="info-box" style="margin-top:8px;font-size:12px;line-height:2">
      📊 السعة أكبر = الصوت أقوى<br>
      📊 الموجات أقرب = التردد أعلى (رفيع)
    </div>`);

  function draw(){
    if(currentSim!=='sound_oscilloscope') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    if(!S.freeze) S.t+=0.06;

    // شاشة أوسيلوسكوب
    c.fillStyle='#050F05'; c.fillRect(0,0,w,h);
    // إطار
    c.strokeStyle='rgba(0,200,0,0.3)'; c.lineWidth=2;
    c.beginPath(); c.roundRect(8,8,w-16,h-16,6); c.stroke();
    // شبكة
    c.strokeStyle='rgba(0,160,0,0.1)'; c.lineWidth=0.5;
    for(let x=0;x<w;x+=w/10){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); }
    for(let y=0;y<h;y+=h/8){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); }
    // محور X
    c.strokeStyle='rgba(0,220,0,0.2)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(0,h/2); c.lineTo(w,h/2); c.stroke();

    const amp=S.amp*h*0.36;
    const midY=h/2;

    if(S.amp<0.05){
      // صمت
      c.strokeStyle='#00FF44'; c.lineWidth=2;
      c.beginPath(); c.moveTo(0,midY); c.lineTo(w,midY); c.stroke();
      c.fillStyle='rgba(255,80,80,0.7)'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
      c.textAlign='center'; c.fillText('🔕 صمت — لا اهتزاز',w/2,h*0.4);
    } else {
      // موجة جيبية
      c.strokeStyle='#00FF44'; c.lineWidth=2.5;
      c.shadowColor='rgba(0,255,68,0.4)'; c.shadowBlur=12;
      c.beginPath();
      for(let x=0;x<=w;x+=1.5){
        const y=midY+Math.sin((x/w)*S.freq*Math.PI*4+S.t)*amp;
        x===0?c.moveTo(x,y):c.lineTo(x,y);
      }
      c.stroke(); c.shadowBlur=0;

      if(S.showLabels){
        // سعة
        c.strokeStyle='rgba(255,60,60,0.7)'; c.lineWidth=1.5; c.setLineDash([3,3]);
        c.beginPath(); c.moveTo(w*0.05,midY-amp); c.lineTo(w*0.18,midY-amp); c.stroke();
        c.beginPath(); c.moveTo(w*0.05,midY+amp); c.lineTo(w*0.18,midY+amp); c.stroke();
        c.beginPath(); c.moveTo(w*0.09,midY-amp); c.lineTo(w*0.09,midY+amp); c.stroke();
        c.setLineDash([]);
        c.fillStyle='#FF7777'; c.font=`${Math.min(11,w*0.024)}px Tajawal`;
        c.textAlign='right'; c.fillText('سعة',w*0.08,midY-amp*0.45);

        // فترة
        const period=w/(S.freq*2);
        c.strokeStyle='rgba(68,170,255,0.7)'; c.lineWidth=1.5; c.setLineDash([3,3]);
        c.beginPath(); c.moveTo(w*0.3,midY+amp+12); c.lineTo(w*0.3+period,midY+amp+12); c.stroke();
        c.setLineDash([]);
        c.fillStyle='#44AAFF'; c.font=`${Math.min(10,w*0.022)}px Tajawal`;
        c.textAlign='center'; c.fillText('← فترة واحدة →',w*0.3+period/2,midY+amp+26);
        c.textAlign='center';
      }
    }

    // معلومات
    c.fillStyle='#00EE44'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
    c.textAlign='center'; c.fillText(`الشدة: ${S.amp<0.05?'🔕 صمت':S.amp<0.35?'🔈 هادئ':S.amp<0.7?'🔉 متوسط':'🔊 قوي'}  |  الحدة: ${S.freq<2.5?'🎸 غليظ':S.freq<4?'🎹 متوسط':'🎻 رفيع'}`,w/2,h*0.07);
    c.fillStyle='rgba(0,200,100,0.7)'; c.font=`${Math.min(10,w*0.023)}px Tajawal`;
    c.fillText(S.freeze?'⏸ متجمّد':'التردد: '+S.freq.toFixed(1)+' × | السعة: '+Math.round(S.amp*100)+'%',w/2,h*0.95);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}



// أسئلة الوحدة 7 (ماذا نستنتج؟)
// ══════════════════════════════════════════════════════════
// إضافة الأسئلة للـ SIM_QUESTIONS
Object.assign(SIM_QUESTIONS, {
  circsystem:{
    q:'ما الوظيفة الرئيسية للجهاز الدوري في الإنسان؟',
    opts:['هضم الطعام','نقل الأكسجين والمواد الغذائية لجميع خلايا الجسم','تنظيم الحرارة فقط','إنتاج الهرمونات'],
    ans:1,
    fb:'✅ الجهاز الدوري يضخ الدم لتوصيل O₂ والجلوكوز لكل خلية، وإزالة CO₂ والفضلات. القلب + الدم + الأوعية الدموية هم أبطال هذه المهمة!'
  },
  heart8:{
    q:'كم عدد حجرات القلب في الإنسان؟',
    opts:['حجرتان فقط','ثلاث حجرات','أربع حجرات','ست حجرات'],
    ans:2,
    fb:'✅ للقلب 4 حجرات: أذين أيمن + بطين أيمن (الجانب الأيمن = دم غير مؤكسج) + أذين أيسر + بطين أيسر (الجانب الأيسر = دم مؤكسج).'
  },
  blood8:{
    q:'أي مكوّن من مكوّنات الدم يحمل الأكسجين؟',
    opts:['البلازما','خلايا الدم البيضاء','الصفائح الدموية','خلايا الدم الحمراء'],
    ans:3,
    fb:'✅ خلايا الدم الحمراء تحتوي على الهيموجلوبين — الصبغة الحمراء التي ترتبط بالأكسجين في الرئتين وتحمله لكل أنسجة الجسم!'
  },
  vessels8:{
    q:'ما الفرق الرئيسي بين الشرايين والأوردة؟',
    opts:['الشرايين أرق جداراً','الشرايين تحمل الدم من القلب — الأوردة تحمله إلى القلب','الأوردة تحمل الدم المؤكسج دائماً','لا فرق بينهما'],
    ans:1,
    fb:'✅ الشرايين تحمل الدم من القلب (بضغط عالٍ → جدران سميكة مرنة). الأوردة تحمله إلى القلب (بضغط أقل → جدران أرق + صمامات تمنع الرجوع).'
  },
  lungs8:{
    q:'ما وظيفة الحجاب الحاجز في عملية التنفس؟',
    opts:['ينتج الأكسجين','يصفّي الهواء من الجراثيم','يتحرك لأعلى وأسفل مسبباً الشهيق والزفير','يتحكم في صوت الكلام'],
    ans:2,
    fb:'✅ عند الشهيق: الحجاب الحاجز ينخفض → الضغط في الرئتين يقل → الهواء يدخل. عند الزفير: الحجاب يرتفع → الضغط يزيد → الهواء يخرج!'
  },
  gasex8:{
    q:'لماذا تُعدّ الحويصلات الهوائية صغيرة جداً أمراً مفيداً؟',
    opts:['لتوفير المساحة فقط','لتقليل الهواء الداخل','لزيادة مساحة السطح الكلية مما يسرّع تبادل الغازات','لأنها أسهل في التصنيع'],
    ans:2,
    fb:'✅ 300 مليون حويصلة صغيرة = مساحة سطح إجمالية 70 م² (كملعب تنس!). كلما صغرت الحويصلة، زادت نسبة المساحة/الحجم → انتشار O₂ وCO₂ أسرع!'
  },
  respiration8:{
    q:'ما ناتجا التنفس الهوائي داخل الخلايا؟',
    opts:['الأكسجين والجلوكوز','ثاني أكسيد الكربون والماء والطاقة','الأكسجين والطاقة فقط','الجلوكوز والماء'],
    ans:1,
    fb:'✅ جلوكوز + أكسجين → ثاني أكسيد الكربون + ماء + طاقة. الطاقة تُستخدم لكل وظائف الجسم، والـ CO₂ والماء يُطرحان عبر الرئتين!'
  },
  fitness8:{
    q:'لماذا يرتفع معدل النبض أثناء التمرين؟',
    opts:['لأن القلب يتعب','لضخ المزيد من O₂ والجلوكوز للعضلات النشطة','لتبريد الجسم','لأسباب مجهولة'],
    ans:1,
    fb:'✅ العضلات النشطة تحتاج O₂ وجلوكوز أكثر للتنفس الخلوي. القلب يضخ أسرع → المزيد من الدم → المزيد من O₂ والطاقة. لهذا نلهث ونتعرق!'
  },
  smoking8:{
    q:'أي مكوّن من دخان السجائر يمنع خلايا الدم الحمراء من حمل الأكسجين؟',
    opts:['النيكوتين','القطران','أول أكسيد الكربون','الجسيمات الدقيقة'],
    ans:2,
    fb:'✅ أول أكسيد الكربون CO يرتبط بالهيموجلوبين أقوى 200× من O₂! فيحتل مكانه ويمنع حمل الأكسجين → المدخّن يعاني من نقص أكسجين مزمن.'
  },
  // ── أسئلة الوحدة 8 (الأملاح) ──
  salts_what:{
    q:'كيف تتكوّن الأملاح من الأحماض؟',
    opts:['بإضافة الماء للحمض','باستبدال الهيدروجين في الحمض بفلز أو أيون فلزي','بتسخين الحمض','بتبريد الحمض'],
    ans:1,
    fb:'✅ الملح يتكوّن عندما يحلّ الفلز محل الهيدروجين في الحمض. مثال: HCl + Zn → ZnCl₂ + H₂ — كلوريد الخارصين هو الملح!'
  },
  salts_metal:{
    q:'ما الغاز المنطلق عند تفاعل فلز نشط مع حمض مخفف؟',
    opts:['الأكسجين','ثاني أكسيد الكربون','الهيدروجين','النيتروجين'],
    ans:2,
    fb:'✅ عند تفاعل الفلز مع الحمض: فلز + حمض → ملح + هيدروجين↑. يمكن التحقق منه بالشعلة المشتعلة — ينطفئ مع صوت "فرقعة" مميزة!'
  },
  salts_oxide:{
    q:'لماذا نستخدم أكسيد الفلز بدلاً من الفلز مباشرة لتحضير بعض الأملاح؟',
    opts:['لأنه أرخص','لأن الفلزات غير النشطة كالنحاس لا تتفاعل مع الأحماض مباشرة','لأن الأكسيد يُعطي لوناً أجمل','لأن الأكسيد أسرع في الذوبان'],
    ans:1,
    fb:'✅ النحاس والذهب والفضة فلزات غير نشطة — لا تتفاعل مع الأحماض المخففة. الحل: نستخدم أكسيدها (مثل CuO) الذي يتفاعل بسهولة مع الحمض!'
  },
  salts_carbonate:{
    q:'ما المنتجات الثلاثة لتفاعل الكربونات مع الحمض؟',
    opts:['ملح وماء فقط','ملح وأكسجين وماء','ملح وماء وثاني أكسيد الكربون','حمض وفلز وهيدروجين'],
    ans:2,
    fb:'✅ كربونات + حمض → ملح + ماء + CO₂↑. الفوران الذي تراه هو ثاني أكسيد الكربون! يمكن التحقق منه بتمريره في ماء الجير — يُعكّره!'
  },
  // ── أسئلة الوحدة 9 (الصوت) ──
  sound_pitch:{
    q:'ما الفرق بين شدة الصوت وحدة الصوت؟',
    opts:['هما نفس الشيء','الشدة تعني قوة الصوت (عالٍ/هادئ) — الحدة تعني رفاعته (رفيع/غليظ)','الحدة تعني قوة الصوت — الشدة تعني رفاعته','لا يوجد فرق علمي بينهما'],
    ans:1,
    fb:'✅ الشدة (Loudness) تُحدَّد بسعة الاهتزاز — صوت قوي = اهتزاز أكبر. الحدة (Pitch) تُحدَّد بالتردد — صوت رفيع = تردد أعلى (Hz أكثر)!'
  },
  sound_vibration:{
    q:'ما تأثير تقصير طول المسطرة المهتزة على تردد اهتزازها؟',
    opts:['يقل التردد','يزيد التردد','لا يتأثر التردد','يصبح التردد صفراً'],
    ans:1,
    fb:'✅ المسطرة القصيرة تهتز أسرع → تردد أعلى! والعكس: المسطرة الطويلة تهتز أبطأ → تردد أقل. هذا المبدأ يُستخدم في ضبط الآلات الموسيقية!'
  },
  sound_travel:{
    q:'لماذا لا يستطيع الصوت الانتقال في الفراغ؟',
    opts:['لأن الصوت أبطأ من الضوء','لأنه يحتاج وسطاً مادياً من جزيئات لنقل الاهتزاز','لأن الفراغ بارد جداً','لأن الصوت موجة ضوئية'],
    ans:1,
    fb:'✅ الصوت موجة ميكانيكية — تحتاج جزيئات تدفع بعضها بعضاً لنقل الاهتزاز. في الفراغ لا توجد جزيئات → لا صوت! لهذا لا نسمع انفجارات النجوم!'
  },
  sound_oscilloscope:{
    q:'على شاشة جهاز رسم الذبذبات — ماذا يعني ارتفاع الموجة أكثر؟',
    opts:['الصوت أكثر حدة (رفيع أكثر)','الصوت أعلى شدة (أقوى)','الصوت أبطأ انتقالاً','الصوت أكثر تردداً'],
    ans:1,
    fb:'✅ ارتفاع الموجة = السعة الأكبر = شدة أعلى = صوت أقوى! أما الحدة (رفيع/غليظ) فتُحدَّد بعدد الموجات في نفس الفضاء — كلما ازدادت كلما كان الصوت أرفع!'
  },
  // ── أسئلة الوحدة 10 (التكاثر والتطوّر) ──
  repro_gametes:{
    q:'لماذا يحتوي كلٌّ من البويضة والحيوان المنوي على 23 كروموسوماً فقط؟',
    opts:['لأنها خلايا صغيرة','حتى تكون البويضة المخصبة 23+23=46 كروموسوم وهو العدد الطبيعي لخلايا الجسم','لأن 23 رقم مقدّس','لتوفير الطاقة'],
    ans:1,
    fb:'✅ لو كان كل مشيج يحمل 46 كروموسوماً، لأصبح في البويضة المخصبة 92 — وهذا يُسبّب مشاكل وراثية. الطبيعة ذكية: 23+23=46 ✅ دائماً!'
  },
  repro_fertilisation:{
    q:'أين يحدث الإخصاب عادةً في جسم الأنثى؟',
    opts:['في الرحم','في المبيض','في قناة البيض','في المهبل'],
    ans:2,
    fb:'✅ الإخصاب يحدث في قناة البيض! البويضة تخرج من المبيض وتدخل قناة البيض حيث تلتقي بالحيوانات المنوية. ثم تنتقل البويضة المخصبة إلى الرحم للانغراس.'
  },
  repro_development:{
    q:'ما وظيفة المشيمة للجنين؟',
    opts:['حمايته من الصدمات','إنتاج السائل الأمنيوني','نقل الغذاء والأكسجين من دم الأم للجنين','تنظيم درجة حرارة الجنين فقط'],
    ans:2,
    fb:'✅ المشيمة = نظام دعم الحياة للجنين! تنقل O₂ والجلوكوز والمواد الغذائية من دم الأم، وتُزيل CO₂ والفضلات من دم الجنين. الحبل السرّي يربط الجنين بها.'
  },
  repro_growth:{
    q:'كيف يحدث النمو في جسم الإنسان؟',
    opts:['بزيادة حجم الخلايا فقط','بانقسام الخلايا ونموها — خلية واحدة تصبح ملايين','بدخول خلايا جديدة من الطعام','بالتنفس فقط'],
    ans:1,
    fb:'✅ بدأت بخلية واحدة (البويضة المخصبة) ثم انقسمت: 1→2→4→8→16... حتى أصبح جسمك من تريليونات الخلايا! النمو = انقسام متواصل + نمو الخلايا.'
  },
  repro_lifestyle:{
    q:'كيف يؤثر التدخين خلال الحمل على الجنين؟',
    opts:['لا يؤثر لأن المشيمة تحمي الجنين','يجعله أذكى','النيكوتين يدخل دم الجنين ويُبطئ نموه ويقلل وزنه عند الولادة','يؤثر فقط بعد الولادة'],
    ans:2,
    fb:'✅ النيكوتين يعبر المشيمة ويصل لدم الجنين — يُبطئ النمو ويُقلل وزن المولود ويزيد خطر أمراض مستقبلية كالسكري. الأمهات اللواتي دخّنّ قبل الحمل تواجهن مشاكل أيضاً!'
  }
});

// ══════════════════════════════════════════════════════════
// أسئلة الوحدة (الصف التاسع — الأحماض والقواعد)
// ══════════════════════════════════════════════════════════
Object.assign(SIM_QUESTIONS, {
  g9acidprop: {
    q: 'أيّ من الخصائص التالية تميّز الأحماض عن القواعد؟',
    opts: [
      'طعمها مُرّ وملمسها زلق',
      'طعمها حامض وتُحوّل ورقة تبّاع الشمس للأحمر',
      'لا تتفاعل مع المعادن',
      'رقمها الهيدروجيني دائماً أعلى من 7'
    ],
    ans: 1,
    fb: '✅ الأحماض طعمها حامض ومُؤكِّلة وتُحوّل ورقة تبّاع الشمس للأحمر ورقمها pH < 7. أما القواعد فطعمها مُرّ وملمسها زلق وتُحوّل الورقة للأزرق ورقمها pH > 7.'
  },
  g9indicator: {
    q: 'ما لون ورقة تبّاع الشمس عند غمسها في محلول قلوي؟',
    opts: [
      'أحمر',
      'أصفر',
      'أزرق',
      'لا يتغيّر اللون'
    ],
    ans: 2,
    fb: '✅ في المحاليل القلوية تتحوّل ورقة تبّاع الشمس للأزرق، وفي الحمضية للأحمر، وتبقى بنفسجية في المتعادلة. الكاشف العام يُعطي ألواناً مختلفة لكل قيمة pH!'
  },
  g9phscale: {
    q: 'محلول رقمه الهيدروجيني pH = 3 — كيف تُصنِّفه؟',
    opts: [
      'قلوي قوي',
      'متعادل',
      'حمضي متوسط القوة',
      'قلوي ضعيف'
    ],
    ans: 2,
    fb: '✅ مقياس pH يتراوح من 0 إلى 14. pH أقل من 7 = حمضي، pH = 7 = متعادل، pH أكبر من 7 = قلوي. pH = 3 حمضي متوسط (مثل الخل)، بينما pH = 1 حمضي قوي جداً!'
  },
  g9ions: {
    q: 'أيّ الأيونات يكون تركيزه أعلى في المحلول الحمضي؟',
    opts: [
      'أيونات OH⁻',
      'أيونات H⁺',
      'أيونات Na⁺',
      'التركيز متساوٍ دائماً'
    ],
    ans: 1,
    fb: '✅ في المحلول الحمضي: تركيز H⁺ > تركيز OH⁻. في القلوي: تركيز OH⁻ > تركيز H⁺. في المتعادل: H⁺ = OH⁻. هذا هو مبدأ برونستد-لوري للأحماض والقواعد!'
  },
  g9oxides: {
    q: 'ما الذي يُنتَج عند إذابة أكسيد لافلزي (حمضي) في الماء؟',
    opts: [
      'قاعدة/هيدروكسيد',
      'ملح فقط',
      'حمض',
      'غاز الهيدروجين'
    ],
    ans: 2,
    fb: '✅ أكسيد اللافلز + ماء → حمض. مثال: SO₃ + H₂O → H₂SO₄ (حمض الكبريتيك). أما أكسيد الفلز + ماء → قاعدة. والأكاسيد المتذبذبة (كـ Al₂O₃) تتفاعل مع الاثنين!'
  }
});
// ── الوحدة السابعة ──
Object.assign(SIM_QUESTIONS, {
  g9wordeq: {
    q: 'في المعادلة اللفظية: "ماغنيسيوم + أكسجين ← أكسيد الماغنيسيوم" — ما المواد المتفاعلة؟',
    opts: ['أكسيد الماغنيسيوم فقط','الماغنيسيوم والأكسجين','الأكسجين فقط','أكسيد الماغنيسيوم والأكسجين'],
    ans: 1,
    fb: '✅ المواد المتفاعلة هي التي تبدأ بها: الماغنيسيوم + الأكسجين. أما الناتج فهو أكسيد الماغنيسيوم.'
  },
  g9balance: {
    q: 'لموازنة المعادلة: H₂ + O₂ → H₂O — ما المعاملات الصحيحة؟',
    opts: ['H₂ + O₂ → H₂O','2H₂ + O₂ → 2H₂O','H₂ + 2O₂ → 2H₂O','2H₂ + 2O₂ → 2H₂O'],
    ans: 1,
    fb: '✅ 2H₂ + O₂ → 2H₂O صحيحة. على اليسار: 4H+2O. على اليمين: 4H+2O ✓. لا تغيّر الصيَغ، غيّر المعاملات فقط!'
  },
  g9statesym: {
    q: 'ما رمز الحالة الصحيح للمادة المذابة في الماء (محلول مائي)؟',
    opts: ['(s)','(l)','(g)','(aq)'],
    ans: 3,
    fb: '✅ (aq) من aqueous تعني مذاب في الماء. أما (s)=صلب، (l)=سائل، (g)=غاز.'
  },
  g9saltacid: {
    q: 'ما الملح الناتج عن تفاعل NaOH مع H₂SO₄؟',
    opts: ['NaCl','Na₂SO₄','NaNO₃','هيدروكسيد الصوديوم'],
    ans: 1,
    fb: '✅ NaOH + H₂SO₄ → Na₂SO₄ + H₂O. الملح كبريتات الصوديوم لأن الحمض هو حمض الكبريتيك!'
  },
  g9saltmetal: {
    q: 'ماذا يُنتَج عند تفاعل الزنك مع حمض الهيدروكلوريك؟',
    opts: ['كلوريد الزنك + أكسجين','أكسيد الزنك + ماء','كلوريد الزنك + هيدروجين','هيدروكسيد الزنك + كلور'],
    ans: 2,
    fb: '✅ Zn + 2HCl → ZnCl₂ + H₂↑. الفلز+الحمض → ملح+هيدروجين. الهيدروجين يُصدر فرقعة عند الإشعال!'
  },
  g9saltmake: {
    q: 'لماذا نُضيف فائضاً من الفلز أو الأكسيد في الطريقة أ لتحضير الملح الذائب؟',
    opts: ['لزيادة درجة الحرارة','للتأكد من استهلاك الحمض بالكامل','لتسريع التبخير','لتلوين المحلول'],
    ans: 1,
    fb: '✅ نُضيف فائضاً لضمان استهلاك كل الحمض. ثم نُرشّح الفائض ونُبخّر للحصول على بلورات الملح النقي!'
  },
  g9salttitra: {
    q: 'ما المقصود بنقطة النهاية في تجربة المعايرة؟',
    opts: ['عند غليان المحلول','عند تساوي الكميتين','عند تغير لون الكاشف','عند نفاد الحمض'],
    ans: 2,
    fb: '✅ نقطة النهاية هي تغيّر لون الكاشف دلالةً على اكتمال التعادل. عندها نوقف الإضافة ونقيس الحجم!'
  },
  // ── الوحدة التاسعة: التحليل الكيميائي ──
  g9watergas: {
    q: 'ما الكاشف الكيميائي المستخدَم للتحقق من وجود الماء؟',
    opts: ['ورقة تبّاع الشمس الحمراء','كبريتات النحاس (II) اللامائية','ماء الجير','حمض الهيدروكلوريك'],
    ans: 1,
    fb: '✅ كبريتات النحاس (II) اللامائية تتحوّل من الأبيض إلى الأزرق عند إضافة الماء: CuSO₄(أبيض) + 5H₂O → CuSO₄·5H₂O(أزرق). كلوريد الكوبالت اللامائي يتحوّل من الأزرق إلى الوردي أيضاً!'
  },
  g9flametest: {
    q: 'ما لون لهب البنسن الناتج عن وجود أيونات الصوديوم Na⁺؟',
    opts: ['أحمر قرمزي','أصفر مستمر','أرجواني','أخضر-أزرق'],
    ans: 1,
    fb: '✅ Na⁺ يُعطي لوناً أصفر برتقالياً مستمراً وقوياً جداً. Li⁺ أحمر قرمزي، K⁺ أرجواني، Cu²⁺ أخضر-أزرق. الأصفر القوي للصوديوم قد يُخفي ألوان الأيونات الأخرى!'
  },
  g9cationppt: {
    q: 'ما الراسب الناتج عند إضافة NaOH إلى محلول يحتوي على Fe³⁺؟',
    opts: ['راسب أزرق فاتح','راسب أخضر فاتح','راسب بني-محمر','لا يوجد راسب'],
    ans: 2,
    fb: '✅ Fe³⁺ + 3OH⁻ → Fe(OH)₃↓ (بني-محمر). أما Fe²⁺ فيُعطي راسباً أخضر فاتحاً، وCu²⁺ راسباً أزرق فاتحاً. لون الراسب هو المفتاح لتمييز الكاتيونات!'
  },
  g9aniontest: {
    q: 'ما الاختبار الكيميائي المستخدَم للكشف عن أيونات الكبريتات SO₄²⁻؟',
    opts: ['إضافة نترات الفضة AgNO₃','إضافة كلوريد الباريوم BaCl₂ + HCl','إضافة حمض HCl فقط','اختبار اللهب'],
    ans: 1,
    fb: '✅ كلوريد الباريوم يُعطي راسباً أبيض مع SO₄²⁻: Ba²⁺ + SO₄²⁻ → BaSO₄↓ (أبيض). يُضاف HCl أولاً لإزالة CO₃²⁻. الراسب الأبيض لا يذوب في HCl وهذا هو دليل التأكيد!'
  },
  g9chemlab: {
    q: 'في التحليل النوعي، ما الخطوة الأولى لتحديد هوية مركّب مجهول؟',
    opts: ['اختبار الترسيب مباشرةً','تحديد نوع الكاتيون ثم الأنيون','إضافة الأحماض فوراً','قياس درجة الغليان'],
    ans: 1,
    fb: '✅ التحليل النوعي يبدأ بتحديد الكاتيون (باستخدام اختبار اللهب والترسيب) ثم الأنيون (بنترات الفضة وكلوريد الباريوم والأحماض). هذا الترتيب المنهجي يضمن نتائج دقيقة!'
  },
  // ── الوحدة العاشرة: الأرض والغلاف الجوّي ──
  g9aircomp: {
    q: 'ما النسبة المئوية التقريبية للنيتروجين في الهواء الجاف؟',
    opts: ['21%','50%','78%','99%'],
    ans: 2,
    fb: '✅ الهواء يتكوّن تقريباً من 78% نيتروجين (N₂) + 21% أكسجين (O₂) + 0.9% أرغون + 0.04% ثاني أكسيد الكربون + غازات نادرة أخرى. النيتروجين هو المكوّن الرئيسي!'
  },
  g9combustion: {
    q: 'ما الناتج الرئيسي لاحتراق الميثان CH₄ احتراقاً غير كامل (مع نقص الأكسجين)؟',
    opts: ['ثاني أكسيد الكربون CO₂','أكسيد الكربون CO','ثاني أكسيد الكبريت SO₂','النيتروجين N₂'],
    ans: 1,
    fb: '✅ الاحتراق غير الكامل (نقص O₂) ينتج أكسيد الكربون CO السام: 2CH₄ + 3O₂ → 2CO + 4H₂O. أما الاحتراق الكامل (O₂ وفير) فينتج CO₂ + H₂O. CO خطير لأنه يرتبط بالهيموغلوبين!'
  },
  g9acidrain: {
    q: 'أيٌّ من الغازات التالية يُساهم بشكل رئيسي في تكوُّن المطر الحمضي؟',
    opts: ['النيتروجين N₂ والأكسجين O₂','ثاني أكسيد الكبريت SO₂ وأكاسيد النيتروجين NOₓ','الأرغون والهيليوم','ثاني أكسيد الكربون وبخار الماء فقط'],
    ans: 1,
    fb: '✅ SO₂ + H₂O → H₂SO₃ (حمض الكبريتوز) | NO₂ + H₂O → HNO₃ (حمض النيتريك). هذه الأحماض تخفّض pH المطر إلى ما دون 5.6 مما يُسبّب المطر الحمضي الضار!'
  },
  g9greenhouse: {
    q: 'أيٌّ من الغازات التالية أكثر فاعلية كغاز دفيئة بـ 20 مرة مقارنةً بثاني أكسيد الكربون؟',
    opts: ['النيتروجين N₂','الأرغون Ar','الميثان CH₄','الأكسجين O₂'],
    ans: 2,
    fb: '✅ الميثان CH₄ فاعليته كغاز دفيئة تُقارب 20 مرة أكثر من CO₂! يصدر من مناجم الفحم والمواشي والمكبّات. وغازات الدفيئة الرئيسية هي: CO₂ وCH₄ وبخار الماء وأكاسيد النيتروجين.'
  },
  g9limestone: {
    q: 'ما الناتجان الرئيسيان للتفكك الحراري لكربونات الكالسيوم CaCO₃؟',
    opts: ['CaO + CO₂','Ca + CO₃','CaCl₂ + H₂O','Ca(OH)₂ + CO'],
    ans: 0,
    fb: '✅ CaCO₃(s) → CaO(s) + CO₂(g) — التفكك الحراري عند درجات حرارة مرتفعة جداً. CaO (الجير الحيّ) يتفاعل مع الماء: CaO + H₂O → Ca(OH)₂ (الجير المطفأ) القلوي الذي يُعادل التربة الحمضية!'
  }
});


window.addEventListener('DOMContentLoaded', function() {
  _checkSubscription();
  // إظهار الفوتر في الصفحة الرئيسية عند التحميل
  setTimeout(_updateFooterVisibility, 100);
});


// ══════════════════════════════════════════════════════════
// دوال الجزء الثاني — التكاثر (الوحدة 8)
// ══════════════════════════════════════════════════════════

function repro_gametes2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_gametes2) simState.repro_gametes2={t:0};
  const S=simState.repro_gametes2;

  const comparisons=[
    {icon:'🥚',name:'البويضة',size:'كبيرة (0.1 مم)',motion:'لا تتحرك',num:'واحدة شهرياً',chrom:'23',color:'#E8962A'},
    {icon:'🏊',name:'الحيوان المنوي',size:'صغيرة جداً',motion:'تسبح بذيلها',num:'ملايين',chrom:'23',color:'#1A8FA8'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 مقارنة الأمشاج</div>
      <div class="info-box" style="font-size:13px;line-height:2;margin-top:6px">
        🥚 البويضة: كبيرة، لا تتحرك، 23 كروموسوم<br>
        🏊 الحيوان المنوي: صغير، يسبح، 23 كروموسوم<br>
        ✅ بعد الإخصاب: 23+23 = <strong>46</strong>
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا ينتج ملايين الحيوانات المنوية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">معظمها لا يصل — الرحلة طويلة وصعبة. الطبيعة تعوّض بالكمية لضمان نجاح الإخصاب.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما الفرق بين التكاثر الجنسي واللاجنسي؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الجنسي: مشيجان → تنوع جيني. اللاجنسي: كائن واحد → نسخ متطابقة. الجنسي يُنتج تنوعاً يساعد على التكيف.</div>
    </div>`);

  function draw(){
    if(currentSim!=='repro_gametes') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.03;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0A1628'); bg.addColorStop(1,'#142040');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#80D4FF'; c.font=`bold ${Math.min(17,w*0.038)}px Tajawal`;
    c.textAlign='center'; c.fillText('مقارنة الأمشاج',w/2,h*0.08);

    comparisons.forEach((item,i)=>{
      const cx2=(i===0?w*0.27:w*0.73), cy2=h*0.45;
      const r=Math.min(w*0.18,h*0.2);
      const glow=c.createRadialGradient(cx2,cy2,0,cx2,cy2,r*1.4);
      glow.addColorStop(0,item.color+'33'); glow.addColorStop(1,'transparent');
      c.fillStyle=glow; c.beginPath(); c.arc(cx2,cy2,r*1.4,0,Math.PI*2); c.fill();
      const gr=c.createRadialGradient(cx2-r*0.3,cy2-r*0.3,r*0.1,cx2,cy2,r);
      gr.addColorStop(0,item.color+'EE'); gr.addColorStop(1,item.color+'88');
      c.fillStyle=gr; c.beginPath(); c.arc(cx2,cy2,r,0,Math.PI*2); c.fill();
      c.strokeStyle=item.color; c.lineWidth=2; c.stroke();
      c.font=`${Math.min(r*0.65,38)}px Arial`; c.textAlign='center';
      c.fillText(item.icon,cx2,cy2+r*0.2);
      c.fillStyle='white'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
      c.fillText(item.name,cx2,cy2+r+20);
      [`الحجم: ${item.size}`,`الحركة: ${item.motion}`,`العدد: ${item.num}`,`الكروموسومات: ${item.chrom}`].forEach((txt,j)=>{
        c.fillStyle='rgba(255,255,255,0.75)'; c.font=`${Math.min(11,w*0.024)}px Tajawal`;
        c.fillText(txt,cx2,cy2+r+38+j*17);
      });
    });

    c.fillStyle='#FFD700'; c.font=`bold ${Math.min(26,h*0.08)}px Arial`;
    c.textAlign='center'; c.fillText('+',w/2,h*0.48);
    c.fillStyle='#FFD700'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
    c.fillText('✅ إخصاب → 46 كروموسوم → كائن جديد',w/2,h*0.88);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_fertilisation2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_fertilisation2) simState.repro_fertilisation2={t:0};
  const S=simState.repro_fertilisation2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📊 رحلة الزيجوت</div>
      <div class="info-box" style="font-size:12px;line-height:2.1;margin-top:6px">
        ١ 🥚 إخصاب → زيجوت (46 كروموسوم)<br>
        ２ ⚪⚪ يومان → خليتان<br>
        ３ ⚪×4 ثلاثة أيام → 4 خلايا<br>
        ４ 🔵 أربعة أيام → مورولا<br>
        ٥ 🏠 6-10 أيام → تعشيش في الرحم
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ بعد كم يوم يتعشّش الجنين في الرحم؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">حوالي 6-10 أيام بعد الإخصاب — الكرة الخلوية تنتقل عبر قناة البيض وتنغرس في جدار الرحم.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما الفرق بين التوأم المتطابق وغير المتطابق؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">المتطابق: زيجوت واحدة تنقسم → متطابقان وراثياً. غير المتطابق: بويضتان + حيوانان منويان → مختلفان وراثياً.</div>
    </div>`);

  const stages=[
    {icon:'🥚',label:'إخصاب',x:0.1,color:'#E8962A'},
    {icon:'⚪⚪',label:'يومان',x:0.28,color:'#27AE60'},
    {icon:'⚪×4',label:'٣ أيام',x:0.46,color:'#2980B9'},
    {icon:'🔵',label:'مورولا',x:0.64,color:'#8E44AD'},
    {icon:'🏠',label:'تعشيش',x:0.82,color:'#C0392B'},
  ];

  function draw(){
    if(currentSim!=='repro_fertilisation') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.025;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0D1A2E'); bg.addColorStop(1,'#1A2E50');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#FFD080'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('رحلة الزيجوت من الإخصاب للتعشيش',w/2,h*0.07);

    const lineY=h*0.5;
    c.strokeStyle='rgba(255,200,100,0.35)'; c.lineWidth=3;
    c.beginPath(); c.moveTo(w*0.08,lineY); c.lineTo(w*0.9,lineY); c.stroke();

    stages.forEach((st,i)=>{
      const sx=st.x*w;
      const pulse=1+Math.sin(S.t*2+i*1.2)*0.08;
      c.fillStyle=st.color; c.beginPath(); c.arc(sx,lineY,10*pulse,0,Math.PI*2); c.fill();
      c.font=`${Math.min(22,h*0.07)}px Arial`; c.textAlign='center';
      c.fillText(st.icon,sx,lineY-h*0.16);
      c.fillStyle=st.color; c.font=`bold ${Math.min(11,w*0.025)}px Tajawal`;
      c.fillText(st.label,sx,lineY+h*0.1);
      if(i<stages.length-1){
        c.strokeStyle='rgba(255,200,100,0.5)'; c.lineWidth=1.5;
        const nx=stages[i+1].x*w;
        c.beginPath(); c.moveTo(sx+14,lineY); c.lineTo(nx-14,lineY); c.stroke();
      }
    });

    c.fillStyle='rgba(255,255,255,0.55)'; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
    c.textAlign='center'; c.fillText('قناة البيض → الرحم في 6-10 أيام 🧬',w/2,h*0.92);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_development2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_development2) simState.repro_development2={t:0,trimester:0};
  const S=simState.repro_development2;

  const trimData=[
    {title:'الثلاثية الأولى (أسابيع 1-12)',color:'#8E44AD',icon:'🔮',size:0.07,
     points:['تتشكّل الأعضاء الرئيسية','القلب يبدأ النبض (أ5-6)','الجنين ~6 سم — 14 غ','الغثيان شائع']},
    {title:'الثلاثية الثانية (أسابيع 13-26)',color:'#2980B9',icon:'👶',size:0.22,
     points:['الجنين يتحرك ويركل','تتشكّل البصمات والشعر','الجنين ~35 سم — 900 غ','يمكن تحديد الجنس']},
    {title:'الثلاثية الثالثة (أسابيع 27-40)',color:'#27AE60',icon:'🍼',size:0.4,
     points:['نمو سريع في الوزن','الرئتان تنضجان','الجنين ~50 سم — 3-4 كغ','استعداد للولادة']},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📅 ثلاثيات الحمل</div>
      ${trimData.map((td,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.trimester===i?'background:'+td.color+';color:white':''}" onclick="simState.repro_development2.trimester=${i}">${td.icon} ${td.title.substring(0,18)}</button>`).join('')}
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما دور المشيمة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">المشيمة تنقل O₂ والغذاء من دم الأم للجنين، وتُخرج CO₂ والفضلات — دون أن يختلط الدمان مباشرة.</div>
    </div>`);

  function draw(){
    if(currentSim!=='repro_development') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.03;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#1A0A2E'); bg.addColorStop(1,'#2E1050');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    const td=trimData[S.trimester];
    c.fillStyle=td.color; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
    c.textAlign='center'; c.fillText(td.title,w/2,h*0.08);

    const fSize=td.size*Math.min(w*0.5,h*0.55);
    const cx2=w*0.3, cy2=h*0.48;
    const pulse=1+Math.sin(S.t*8)*0.03;
    const gr=c.createRadialGradient(cx2-fSize*0.2,cy2-fSize*0.2,fSize*0.05,cx2,cy2,fSize*pulse);
    gr.addColorStop(0,'rgba(255,200,150,0.95)'); gr.addColorStop(0.7,'rgba(230,160,120,0.8)'); gr.addColorStop(1,'rgba(200,120,100,0.3)');
    c.fillStyle=gr; c.beginPath(); c.arc(cx2,cy2,fSize*pulse,0,Math.PI*2); c.fill();
    if(S.trimester>0){
      c.fillStyle='rgba(255,200,150,0.8)'; c.beginPath();
      c.arc(cx2+fSize*0.6,cy2-fSize*0.35,fSize*0.38,0,Math.PI*2); c.fill();
    }
    c.font=`${Math.min(fSize*0.6,32)}px Arial`; c.textAlign='center';
    c.fillText(td.icon,cx2,cy2+fSize*0.22);

    const bx2=w*0.55, startY=h*0.24;
    td.points.forEach((pt,i)=>{
      const py2=startY+i*(h*0.155);
      c.fillStyle='rgba(255,255,255,0.07)'; c.beginPath(); c.roundRect(bx2,py2-13,w*0.4,28,5); c.fill();
      c.fillStyle=td.color; c.font=`bold ${Math.min(12,w*0.025)}px Arial`; c.textAlign='left';
      c.fillText('✓',bx2+6,py2+4);
      c.fillStyle='rgba(255,255,255,0.88)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
      c.fillText(pt,bx2+24,py2+4);
    });
    c.textAlign='center';
    c.fillStyle='rgba(255,255,255,0.1)'; c.beginPath(); c.roundRect(w*0.1,h*0.88,w*0.8,10,5); c.fill();
    c.fillStyle=td.color; c.beginPath(); c.roundRect(w*0.1,h*0.88,w*0.8*[0.3,0.65,1][S.trimester],10,5); c.fill();
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_growth2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_growth2) simState.repro_growth2={t:0};
  const S=simState.repro_growth2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📊 مراحل النمو الإنساني</div>
      <div class="info-box" style="font-size:12px;line-height:2;margin-top:6px">
        🍼 رضاعة (0-2): نمو سريع جداً<br>
        🎒 طفولة (3-12): تعلّم وتطور<br>
        🧑 مراهقة (10-18): بلوغ وتغيرات<br>
        👨 بلوغ (18+): نمو مكتمل
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما هرمون البلوغ في الذكور والإناث؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الذكور: التستوستيرون (من الخصيتين). الإناث: الإستروجين والبروجستيرون (من المبيضين). كلاهما يتحكم في التغيرات الجسدية عند البلوغ.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما التغيرات المشتركة بين الجنسين عند البلوغ؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">نمو الشعر في الإبط والعانة، ازدياد التعرق، حبوب البشرة، نمو سريع في الطول، تطور الجهاز التناسلي، تغيرات عاطفية.</div>
    </div>`);

  const stages=[
    {name:'رضاعة',age:'0-2',icon:'🍼',color:'#F39C12',desc:'3× الوزن الأولي'},
    {name:'طفولة مبكرة',age:'3-6',icon:'🎒',color:'#27AE60',desc:'لغة وحركة'},
    {name:'طفولة متأخرة',age:'7-12',icon:'📚',color:'#2980B9',desc:'تعلّم اجتماعي'},
    {name:'مراهقة',age:'10-18',icon:'🧑',color:'#8E44AD',desc:'بلوغ وتغيرات'},
    {name:'بلوغ',age:'18+',icon:'👨‍🎓',color:'#1A8FA8',desc:'نمو مكتمل'},
  ];

  function draw(){
    if(currentSim!=='repro_growth') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.02;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0E2218'); bg.addColorStop(1,'#1A3D2A');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#80FFB0'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('مراحل النمو الإنساني',w/2,h*0.07);

    const barW=w*0.8/stages.length;
    stages.forEach((st,i)=>{
      const bx2=w*0.1+i*barW;
      const barH=h*(0.15+i*0.08);
      const by2=h*0.82-barH;
      const active=Math.floor(S.t*0.5)%stages.length===i;
      const gr=c.createLinearGradient(bx2,by2,bx2,h*0.82);
      gr.addColorStop(0,st.color+'EE'); gr.addColorStop(1,st.color+'66');
      c.fillStyle=gr; c.beginPath(); c.roundRect(bx2+4,by2,barW-8,barH,6); c.fill();
      if(active){ c.strokeStyle='white'; c.lineWidth=2; c.stroke(); }
      c.font=`${Math.min(18,barW*0.5)}px Arial`; c.textAlign='center';
      c.fillText(st.icon,bx2+barW/2,by2-8);
      c.fillStyle=st.color; c.font=`bold ${Math.min(10,w*0.022)}px Tajawal`;
      c.fillText(st.name,bx2+barW/2,h*0.87);
      c.fillStyle='rgba(255,255,255,0.55)'; c.font=`${Math.min(9,w*0.02)}px Tajawal`;
      c.fillText(st.age+' سنة',bx2+barW/2,h*0.91);
    });
    const cur=stages[Math.floor(S.t*0.5)%stages.length];
    c.fillStyle='rgba(0,0,0,0.35)'; c.beginPath(); c.roundRect(w*0.1,h*0.93,w*0.8,h*0.055,6); c.fill();
    c.fillStyle=cur.color; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText(cur.desc,w/2,h*0.96);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function repro_lifestyle2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.repro_lifestyle2) simState.repro_lifestyle2={t:0,sel:0};
  const S=simState.repro_lifestyle2;

  const topics=[
    {name:'التغذية',icon:'🥗',color:'#27AE60',
     good:['بروتين: بيض ولحم وبقوليات','كالسيوم: ألبان وخضار ورقية','حمض الفوليك قبل الحمل'],
     bad:['الأغذية المصنّعة الزائدة','السكر المكرّر الزائد','الحمية القاسية']},
    {name:'النشاط البدني',icon:'🏃',color:'#2980B9',
     good:['30 دقيقة يومياً على الأقل','مشي وسباحة ودراجة','تقوّي العظام والقلب'],
     bad:['جلوس مطوّل >8 ساعات','الإفراط في التمرين','الخمول التام']},
    {name:'الصحة النفسية',icon:'🧠',color:'#8E44AD',
     good:['نوم 8-9 ساعات للمراهقين','التحدث مع المقربين','هوايات وأنشطة ممتعة'],
     bad:['الإجهاد المزمن','العزلة الاجتماعية','التنمر والمشاكل المكبوتة']},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">نمط الحياة الصحي</div>
      ${topics.map((t,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.sel===i?'background:'+t.color+';color:white':''}" onclick="simState.repro_lifestyle2.sel=${i}">${t.icon} ${t.name}</button>`).join('')}
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا يحتاج المراهقون نوماً أكثر؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الدماغ والجسم ينموان بسرعة — هرمون النمو يُفرز أثناء النوم العميق. قلة النوم تؤثر على الذاكرة والتركيز.</div>
    </div>`);

  function draw(){
    if(currentSim!=='repro_lifestyle') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.025;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0A1820'); bg.addColorStop(1,'#142030');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    const tp=topics[S.sel];
    c.fillStyle=tp.color; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText(`${tp.icon} ${tp.name} — مقارنة`,w/2,h*0.08);

    const colW=w*0.42;
    c.fillStyle='rgba(39,174,96,0.12)'; c.beginPath(); c.roundRect(w*0.04,h*0.13,colW,h*0.72,10); c.fill();
    c.strokeStyle='#27AE6055'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='#27AE60'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
    c.fillText('✅ مفيد',w*0.04+colW/2,h*0.19);
    tp.good.forEach((pt,i)=>{
      c.fillStyle='rgba(255,255,255,0.82)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
      c.fillText(pt,w*0.04+colW/2,h*0.28+i*h*0.15);
    });

    c.fillStyle='rgba(192,57,43,0.12)'; c.beginPath(); c.roundRect(w*0.54,h*0.13,colW,h*0.72,10); c.fill();
    c.strokeStyle='#C0392B55'; c.lineWidth=1.5; c.stroke();
    c.fillStyle='#C0392B'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
    c.fillText('❌ ضار',w*0.54+colW/2,h*0.19);
    tp.bad.forEach((pt,i)=>{
      c.fillStyle='rgba(255,200,200,0.82)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
      c.fillText(pt,w*0.54+colW/2,h*0.28+i*h*0.15);
    });

    c.fillStyle='rgba(255,255,255,0.45)'; c.font=`bold ${Math.min(15,h*0.05)}px Arial`;
    c.fillText('VS',w/2,h*0.52);
    c.fillStyle='rgba(255,255,255,0.45)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText('اختر موضوعاً للمقارنة',w/2,h*0.92);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// دوال الجزء الثاني — الأملاح (الوحدة 8)
// ══════════════════════════════════════════════════════════

function salts_what2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_what2) simState.salts_what2={t:0};
  const S=simState.salts_what2;

  const examples=[
    {acid:'HCl',base:'NaOH',salt:'NaCl',name:'كلوريد الصوديوم',color:'#7F8C8D'},
    {acid:'H₂SO₄',base:'CuO',salt:'CuSO₄',name:'كبريتات النحاس',color:'#2980B9'},
    {acid:'HNO₃',base:'KOH',salt:'KNO₃',name:'نترات البوتاسيوم',color:'#27AE60'},
    {acid:'HCl',base:'Mg(OH)₂',salt:'MgCl₂',name:'كلوريد المغنيسيوم',color:'#E67E22'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧂 تسمية الأملاح ومعادلاتها</div>
      <div class="info-box" style="font-size:12px;line-height:2;margin-top:6px">
        القاعدة: اسم الفلز + اسم الأنيون<br>
        HCl + NaOH → <strong>كلوريد الصوديوم</strong><br>
        H₂SO₄ + CuO → <strong>كبريتات النحاس</strong>
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما ناتج: H₂SO₄ + ZnO ؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">ZnSO₄ + H₂O — كبريتات الخارصين + ماء. أكسيد الخارصين قاعدة تتفاعل مع الحمض لتنتج ملح + ماء.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما أيونات NaCl في الماء؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">Na⁺ (موجب) + Cl⁻ (سالب) — ينفصلان في الماء مكوّنَين محلولاً موصّلاً للكهرباء.</div>
    </div>`);

  function draw(){
    if(currentSim!=='salts_what') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.025;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F8FF'); bg.addColorStop(1,'#E0EEFF');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1A5276'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('حمض + قاعدة → ملح + ماء',w/2,h*0.07);

    const idx=Math.floor(S.t*0.4)%examples.length;
    const ex=examples[idx];
    const midY=h*0.35;
    const parts=[
      {text:ex.acid,color:'#C0392B',label:'حمض'},
      {text:'+',color:'#333',label:''},
      {text:ex.base,color:'#27AE60',label:'قاعدة'},
      {text:'→',color:'#555',label:''},
      {text:ex.salt,color:ex.color,label:'ملح ✅'},
      {text:'+',color:'#333',label:''},
      {text:'H₂O',color:'#3498DB',label:'ماء'},
    ];
    const partW=w/(parts.length+1);
    parts.forEach((p,i)=>{
      const px=(i+0.8)*partW;
      c.fillStyle=p.color; c.font=`bold ${Math.min(14,w*0.03)}px monospace`;
      c.fillText(p.text,px,midY);
      if(p.label){ c.fillStyle='rgba(0,0,0,0.45)'; c.font=`${Math.min(10,w*0.022)}px Tajawal`; c.fillText(p.label,px,midY+18); }
    });
    c.fillStyle=ex.color; c.font=`bold ${Math.min(18,w*0.04)}px Tajawal`;
    c.fillText(ex.name,w/2,h*0.55);

    // جدول
    const rows=[['الحمض','يعطي H⁺',ex.acid],['القاعدة','يعطي OH⁻',ex.base],['الملح','أيون+ + أيون-',ex.salt]];
    const tX=w*0.08, tY=h*0.64, tW=w*0.84, cellH=h*0.075, colW2=tW/3;
    ['المركّب','طبيعته','مثال'].forEach((col,i)=>{
      c.fillStyle='#1A5276'; c.fillRect(tX+i*colW2,tY,colW2-2,cellH);
      c.fillStyle='white'; c.font=`bold ${Math.min(11,w*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText(col,tX+i*colW2+colW2/2,tY+cellH*0.62);
    });
    rows.forEach((row,ri)=>{
      row.forEach((cell,ci)=>{
        c.fillStyle=ri%2===0?'rgba(0,0,0,0.06)':'rgba(0,0,0,0.02)';
        c.fillRect(tX+ci*colW2,tY+cellH*(ri+1),colW2-2,cellH);
        c.fillStyle='#333'; c.font=`${Math.min(11,w*0.023)}px Tajawal`;
        c.fillText(cell,tX+ci*colW2+colW2/2,tY+cellH*(ri+1)+cellH*0.62);
      });
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function salts_metal2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_metal2) simState.salts_metal2={t:0};
  const S=simState.salts_metal2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ سلسلة النشاط الكيميائي</div>
      <div class="info-box" style="font-size:12px;line-height:2;margin-top:6px">
        أكثر نشاطاً → يتفاعل مع ماء + أحماض<br>
        K > Na > Mg > Al > Zn > Fe > Cu > Ag > Au<br>
        الفلزات فوق H تتفاعل مع الأحماض
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا لا يتفاعل الذهب مع الأحماض؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الذهب في أسفل سلسلة النشاط — يحتاج الماء الملكي (HCl+HNO₃) فقط. لهذا يُستخدم للمجوهرات — لا يصدأ ولا يتآكل.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ معادلة الخارصين مع H₂SO₄؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">Zn + H₂SO₄ → ZnSO₄ + H₂↑ — الخارصين يحلّ محل الهيدروجين لأنه فوقه في السلسلة.</div>
    </div>`);

  const metals=['K','Na','Mg','Al','Zn','Fe','Ni','Cu','Ag','Au'];
  const colors=['#E74C3C','#E67E22','#BDC3C7','#95A5A6','#7F8C8D','#8B6914','#AAB7B8','#E67E22','#C0C0C0','#D4AC0D'];
  const active=[true,true,true,true,true,true,true,false,false,false];

  function draw(){
    if(currentSim!=='salts_metal') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.02;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F5F5DC'); bg.addColorStop(1,'#EDE8D0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#2C3E50'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText('سلسلة النشاط الكيميائي للفلزات',w/2,h*0.07);

    // سهم النشاط
    c.strokeStyle='rgba(231,76,60,0.4)'; c.lineWidth=3;
    c.beginPath(); c.moveTo(w*0.06,h*0.85); c.lineTo(w*0.06,h*0.15); c.stroke();
    c.beginPath(); c.moveTo(w*0.03,h*0.18); c.lineTo(w*0.06,h*0.15); c.lineTo(w*0.09,h*0.18); c.stroke();
    c.save(); c.translate(w*0.03,h*0.5); c.rotate(-Math.PI/2);
    c.fillStyle='#C0392B'; c.font=`bold ${Math.min(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('النشاط يزداد ↑',0,0); c.restore();

    const bw2=(w*0.85)/metals.length;
    metals.forEach((m,i)=>{
      const bx2=w*0.12+i*bw2;
      const heightRatio=0.08+(metals.length-1-i)*0.07;
      const bh=h*heightRatio, by2=h*0.82-bh;
      const gr=c.createLinearGradient(bx2,by2,bx2,h*0.82);
      gr.addColorStop(0,colors[i]+'EE'); gr.addColorStop(1,colors[i]+'88');
      c.fillStyle=gr; c.beginPath(); c.roundRect(bx2+2,by2,bw2-4,bh,4); c.fill();
      c.fillStyle=active[i]?'#27AE60':'#C0392B'; c.font=`${Math.min(10,w*0.022)}px Arial`;
      c.textAlign='center'; c.fillText(active[i]?'✓':'✗',bx2+bw2/2,by2-5);
      c.fillStyle='#2C3E50'; c.font=`bold ${Math.min(10,bw2*0.5)}px monospace`;
      c.fillText(m,bx2+bw2/2,h*0.87);
    });

    // خط فاصل عند النحاس
    const hIdx=7;
    const lineX=w*0.12+hIdx*bw2;
    c.strokeStyle='rgba(231,76,60,0.5)'; c.lineWidth=2; c.setLineDash([5,4]);
    c.beginPath(); c.moveTo(lineX,h*0.12); c.lineTo(lineX,h*0.84); c.stroke();
    c.setLineDash([]);
    c.fillStyle='#C0392B'; c.font=`${Math.min(10,w*0.022)}px Tajawal`;
    c.textAlign='center'; c.fillText('← تتفاعل مع الأحماض | لا تتفاعل →',lineX,h*0.11);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function salts_oxide2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_oxide2) simState.salts_oxide2={t:0,sel:0};
  const S=simState.salts_oxide2;

  const oxides=[
    {name:'أكسيد النحاس',formula:'CuO',acid:'H₂SO₄',salt:'CuSO₄',saltName:'كبريتات النحاس',color:'#2980B9'},
    {name:'أكسيد الحديد',formula:'Fe₂O₃',acid:'HCl',salt:'FeCl₃',saltName:'كلوريد الحديد',color:'#C0392B'},
    {name:'أكسيد الزنك',formula:'ZnO',acid:'H₂SO₄',salt:'ZnSO₄',saltName:'كبريتات الخارصين',color:'#7F8C8D'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 أكسيد فلز + حمض</div>
      ${oxides.map((ox,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.sel===i?'background:'+ox.color+';color:white':''}" onclick="simState.salts_oxide2.sel=${i}">${ox.formula} + ${ox.acid}</button>`).join('')}
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:8px">
      أكسيد الفلز + حمض → ملح + ماء<br>
      <small>لا ينطلق H₂ (لأن الأكسيد قاعدة، لا فلز)</small>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما الفرق عن تفاعل الفلز+حمض؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">فلز + حمض → ملح + H₂↑. أكسيد + حمض → ملح + H₂O فقط. الأكسيد قاعدة بالفعل فلا ينطلق هيدروجين.</div>
    </div>`);

  function draw(){
    if(currentSim!=='salts_oxide') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.03;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#FAFAFA'); bg.addColorStop(1,'#F0F0F0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    const ox=oxides[S.sel];
    c.fillStyle=ox.color; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
    c.textAlign='center'; c.fillText(`${ox.formula} + ${ox.acid} → ${ox.salt} + H₂O`,w/2,h*0.08);

    // رسم معادلة مرئية
    const drawB=(bx,by,bw,bh,liqColor,label)=>{
      c.strokeStyle='#AAA'; c.lineWidth=2;
      c.beginPath(); c.moveTo(bx,by); c.lineTo(bx+bw*0.04,by+bh); c.stroke();
      c.beginPath(); c.moveTo(bx+bw,by); c.lineTo(bx+bw-bw*0.04,by+bh); c.stroke();
      c.beginPath(); c.moveTo(bx+bw*0.04,by+bh); c.lineTo(bx+bw-bw*0.04,by+bh); c.stroke();
      c.strokeStyle='#CCC'; c.lineWidth=5; c.beginPath(); c.moveTo(bx-3,by); c.lineTo(bx+bw+3,by); c.stroke();
      c.fillStyle=liqColor; c.fillRect(bx+2,by+bh*0.25,bw-4,bh*0.73);
      c.fillStyle='#444'; c.font=`bold ${Math.min(11,w*0.025)}px monospace`; c.textAlign='center';
      c.fillText(label,bx+bw/2,by+bh*0.55);
    };

    drawB(w*0.07,h*0.15,w*0.32,h*0.55,'rgba(144,238,144,0.4)',ox.acid);
    drawB(w*0.62,h*0.15,w*0.34,h*0.55,ox.color+'44',ox.salt);

    // الأكسيد
    c.fillStyle='#2C2C2CSS'; c.fillStyle='rgba(80,60,40,0.8)'; c.beginPath();
    c.roundRect(w*0.2,h*0.12,w*0.12,h*0.07,4); c.fill();
    c.fillStyle='white'; c.font=`bold ${Math.min(11,w*0.024)}px monospace`; c.textAlign='center';
    c.fillText(ox.formula,w*0.26,h*0.17);

    c.strokeStyle='#555'; c.lineWidth=2;
    c.beginPath(); c.moveTo(w*0.43,h*0.43); c.lineTo(w*0.58,h*0.43); c.stroke();
    c.beginPath(); c.moveTo(w*0.55,h*0.4); c.lineTo(w*0.58,h*0.43); c.lineTo(w*0.55,h*0.46); c.stroke();

    c.fillStyle=ox.color; c.font=`bold ${Math.min(13,w*0.029)}px Tajawal`;
    c.fillText(ox.saltName,w*0.62+w*0.17,h*0.62);
    c.fillStyle='#3498DB'; c.font=`${Math.min(11,w*0.025)}px monospace`;
    c.fillText('+ H₂O',w*0.62+w*0.17,h*0.72);

    c.fillStyle='rgba(0,0,0,0.55)'; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText('❌ لا ينطلق غاز H₂ (فرق عن الفلز مباشرة)',w/2,h*0.85);
    c.fillStyle='#27AE60'; c.font=`bold ${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText('ملح + ماء فقط ✅',w/2,h*0.91);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function salts_carbonate2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.salts_carbonate2) simState.salts_carbonate2={t:0};
  const S=simState.salts_carbonate2;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 مقارنة طرق تحضير الأملاح</div>
      <div class="info-box" style="font-size:12px;line-height:2;margin-top:6px">
        1️⃣ فلز + حمض → ملح + H₂↑<br>
        2️⃣ أكسيد + حمض → ملح + H₂O<br>
        3️⃣ كربونات + حمض → ملح + H₂O + CO₂↑<br>
        4️⃣ حمض + قاعدة → ملح + H₂O
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ كيف نختبر CO₂؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">نمرّره في ماء الجير Ca(OH)₂ — يتعكّر ويتشكّل راسب أبيض من CaCO₃. هذا الاختبار خاص بـ CO₂.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا تُستخدم الكربونات في إطفاء الحرائق؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">CO₂ الناتج يُغطي اللهب ويمنع الأكسجين — طفايات CO₂ تعمل على هذا المبدأ.</div>
    </div>`);

  const methods=[
    {label:'فلز + حمض',eq:'Zn + H₂SO₄ → ZnSO₄ + H₂↑',gas:'H₂ ↑',color:'#3498DB',icon:'🔩'},
    {label:'أكسيد + حمض',eq:'CuO + H₂SO₄ → CuSO₄ + H₂O',gas:'لا غاز',color:'#8E44AD',icon:'⬛'},
    {label:'كربونات + حمض',eq:'CaCO₃ + 2HCl → CaCl₂ + H₂O + CO₂',gas:'CO₂ ↑',color:'#27AE60',icon:'🪨'},
    {label:'تعادل',eq:'NaOH + HCl → NaCl + H₂O',gas:'لا غاز',color:'#E67E22',icon:'🧪'},
  ];

  function draw(){
    if(currentSim!=='salts_carbonate') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.025;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0FFF8'); bg.addColorStop(1,'#E0F8F0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1A5232'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText('طرق تحضير الأملاح — مقارنة شاملة',w/2,h*0.07);

    methods.forEach((m,i)=>{
      const row=Math.floor(i/2), col=i%2;
      const bx=col===0?w*0.04:w*0.53;
      const by=h*0.13+row*(h*0.41);
      const bw=w*0.43, bh=h*0.37;
      const active=Math.floor(S.t*0.5)%methods.length===i;
      c.fillStyle=active?m.color+'22':'rgba(255,255,255,0.7)';
      c.beginPath(); c.roundRect(bx,by,bw,bh,10); c.fill();
      c.strokeStyle=active?m.color:'rgba(0,0,0,0.08)'; c.lineWidth=active?2:1; c.stroke();
      c.fillStyle=m.color; c.font=`bold ${Math.min(12,w*0.027)}px Tajawal`;
      c.textAlign='center'; c.fillText(`${m.icon} ${m.label}`,bx+bw/2,by+bh*0.22);
      c.fillStyle='#2C3E50'; c.font=`${Math.min(9.5,w*0.021)}px monospace`;
      c.fillText(m.eq,bx+bw/2,by+bh*0.5);
      const gasColor=m.gas==='لا غاز'?'#888':m.color;
      c.fillStyle=gasColor; c.font=`bold ${Math.min(11,w*0.025)}px Tajawal`;
      c.fillText(`الغاز: ${m.gas}`,bx+bw/2,by+bh*0.78);
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// دوال الجزء الثاني — الصوت (الوحدة 9)
// ══════════════════════════════════════════════════════════

function sound_pitch2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_pitch2) simState.sound_pitch2={t:0,sel:2};
  const S=simState.sound_pitch2;

  const instruments=[
    {name:'طبلة 🥁',freq:80,color:'#E74C3C'},
    {name:'غيتار 🎸',freq:250,color:'#E67E22'},
    {name:'بيانو 🎹',freq:440,color:'#F39C12'},
    {name:'فلوت 🎷',freq:700,color:'#27AE60'},
    {name:'صافرة 📯',freq:950,color:'#2980B9'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎵 الأدوات الموسيقية والتردد</div>
      ${instruments.map((ins,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.sel===i?'background:'+ins.color+';color:white':''}" onclick="simState.sound_pitch2.sel=${i};try{const a=new(AudioContext||webkitAudioContext)();const o=a.createOscillator();const g=a.createGain();o.frequency.value=${ins.freq};g.gain.setValueAtTime(0.22,a.currentTime);g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.8);o.connect(g);g.connect(a.destination);o.start();o.stop(a.currentTime+0.8);}catch(e){}">${ins.name} — ${ins.freq} Hz</button>`).join('')}
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:6px">
      نطاق سمع الإنسان: 20 - 20,000 Hz<br>
      فوق صوتي: >20,000 Hz (الخفافيش والدلافين)
    </div>`);

  function draw(){
    if(currentSim!=='sound_pitch') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.06;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#050D05'); bg.addColorStop(1,'#0A1A0A');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(0,140,0,0.1)'; c.lineWidth=0.5;
    for(let x=0;x<w;x+=w/10){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); }
    for(let y=0;y<h;y+=h/8){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); }

    const ins=instruments[S.sel];
    c.fillStyle=ins.color; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
    c.textAlign='center'; c.fillText(`${ins.name} — ${ins.freq} Hz`,w/2,h*0.09);

    [[instruments[2].freq,'rgba(255,200,0,0.35)',0.2,'مرجع (بيانو)'],[ins.freq,ins.color+'CC',0.5,'المختار']].forEach(([freq,color,amp,label],wi)=>{
      const midY=h*(wi===0?0.35:0.65);
      const amplitude=h*0.1;
      const fRatio=freq/300;
      c.strokeStyle=color; c.lineWidth=wi===0?1.5:2.5;
      if(wi===1){ c.shadowColor=ins.color+'88'; c.shadowBlur=8; }
      c.beginPath();
      for(let x=0;x<=w;x+=2){
        const y=midY+Math.sin((x/w)*fRatio*Math.PI*8+S.t)*amplitude;
        x===0?c.moveTo(x,y):c.lineTo(x,y);
      }
      c.stroke(); c.shadowBlur=0;
      c.fillStyle=color; c.font=`${Math.min(11,w*0.024)}px Tajawal`;
      c.textAlign='right'; c.fillText(label,w*0.98,midY-amplitude-5);
    });
    c.textAlign='center';
    c.fillStyle='rgba(255,255,255,0.45)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText('اضغط على الأداة لسماعها 🎵',w/2,h*0.93);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function sound_vibration2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_vibration2) simState.sound_vibration2={t:0,sel:0};
  const S=simState.sound_vibration2;

  const objects=[
    {name:'وتر قصير مشدود',icon:'🎸',freq:2.8,color:'#E67E22',desc:'قصير + مشدود → تردد أعلى'},
    {name:'وتر طويل مرخي',icon:'🎸',freq:1.2,color:'#27AE60',desc:'طويل + مرخي → تردد أقل'},
    {name:'مسطرة قصيرة',icon:'📏',freq:3.5,color:'#3498DB',desc:'قصيرة → اهتزاز سريع'},
    {name:'مسطرة طويلة',icon:'📏',freq:1.0,color:'#8E44AD',desc:'طويلة → اهتزاز بطيء'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎵 العوامل المؤثرة على التردد</div>
      ${objects.map((o,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.sel===i?'background:'+o.color+';color:white':''}" onclick="simState.sound_vibration2.sel=${i};simState.sound_vibration2.t=0">${o.icon} ${o.name}</button>`).join('')}
    </div>
    <div class="info-box" style="font-size:12px;line-height:2;margin-top:6px">
      تردد أعلى ← طول أقل / شد أكبر / كتلة أقل
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا الأوتار الغليظة أعمق صوتاً؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الوتر الغليظ أثقل — يهتز أبطأ → تردد أقل → صوت أعمق.</div>
    </div>`);

  function draw(){
    if(currentSim!=='sound_vibration') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.05;
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#1A1205'); bg.addColorStop(1,'#2E2005');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    const ob=objects[S.sel];
    c.fillStyle=ob.color; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText(`${ob.icon} ${ob.name}`,w/2,h*0.08);

    // موجة الاهتزاز مع تناقص
    c.strokeStyle=ob.color+'CC'; c.lineWidth=2.5;
    c.shadowColor=ob.color+'88'; c.shadowBlur=8;
    c.beginPath();
    for(let x=0;x<=w;x+=2){
      const t2=x/w*6;
      const dec=Math.exp(-t2*0.5);
      const y=h*0.38+Math.sin(t2*ob.freq*Math.PI*2+S.t*2)*h*0.12*dec;
      x===0?c.moveTo(x,y):c.lineTo(x,y);
    }
    c.stroke(); c.shadowBlur=0;

    c.strokeStyle='rgba(255,255,255,0.12)'; c.lineWidth=1; c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(0,h*0.38); c.lineTo(w,h*0.38); c.stroke();
    c.setLineDash([]);

    c.fillStyle='rgba(255,255,255,0.75)'; c.font=`bold ${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText('مقارنة الأجسام',w/2,h*0.6);

    objects.forEach((o,i)=>{
      const bx=w*0.1+i*(w*0.22);
      const barH=h*0.18*(o.freq/4);
      const by=h*0.8-barH;
      const isSel=i===S.sel;
      const gr=c.createLinearGradient(bx,by,bx,h*0.8);
      gr.addColorStop(0,o.color+'EE'); gr.addColorStop(1,o.color+'66');
      c.fillStyle=gr; c.beginPath(); c.roundRect(bx+2,by,w*0.17,barH,4); c.fill();
      if(isSel){ c.strokeStyle='white'; c.lineWidth=2.5; c.stroke(); }
      c.font=`${Math.min(16,w*0.036)}px Arial`; c.textAlign='center';
      c.fillText(o.icon,bx+w*0.085,by-6);
      c.fillStyle='rgba(255,255,255,0.65)'; c.font=`${Math.min(9,w*0.02)}px Tajawal`;
      c.fillText((o.freq*100).toFixed(0)+' Hz',bx+w*0.085,h*0.84);
    });
    c.textAlign='center';
    c.fillStyle=ob.color; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText(ob.desc,w/2,h*0.92);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function sound_travel2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_travel2) simState.sound_travel2={t:0,sel:0};
  const S=simState.sound_travel2;

  const scenarios=[
    {name:'الهواء',icon:'🌬️',speed:343,color:'#3498DB',bg:'#87CEEB',desc:'جزيئات متباعدة — أبطأ'},
    {name:'الماء',icon:'💧',speed:1480,color:'#1A5276',bg:'#2E86C1',desc:'جزيئات أقرب — 4x أسرع من الهواء'},
    {name:'الفولاذ',icon:'⚙️',speed:5100,color:'#7D6608',bg:'#B7950B',desc:'جزيئات متلاصقة — 15x أسرع'},
    {name:'الفراغ',icon:'🌌',speed:0,color:'#8E44AD',bg:'#2C3E50',desc:'لا جزيئات — الصوت لا ينتقل'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔊 سرعة الصوت في الأوساط</div>
      ${scenarios.map((s,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.sel===i?'background:'+s.color+';color:white':''}" onclick="simState.sound_travel2.sel=${i}">${s.icon} ${s.name} (${s.speed||'لا ينتقل'} م/ث)</button>`).join('')}
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا نسمع الرعد بعد البرق؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الضوء يسافر 300,000 كم/ث (فوري). الصوت يسير 343 م/ث فقط. كل 3 ثوانٍ تأخير ≈ 1 كم بُعد.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا الغواصات تستخدم السونار؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الصوت ينتقل سريعاً في الماء (1480 م/ث) — السونار يُرسل موجات ويقيس وقت العودة لتحديد المسافة.</div>
    </div>`);

  function draw(){
    if(currentSim!=='sound_travel') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.04;
    const sc=scenarios[S.sel];

    if(sc.speed===0){
      c.fillStyle='#080818'; c.fillRect(0,0,w,h);
      for(let i=0;i<50;i++){
        const sx=(Math.sin(i*137)*0.5+0.5)*w, sy=(Math.cos(i*97)*0.5+0.5)*h;
        c.fillStyle=`rgba(255,255,255,${0.3+Math.sin(S.t+i)*0.2})`; c.beginPath(); c.arc(sx,sy,1,0,Math.PI*2); c.fill();
      }
      c.fillStyle='#FF4444'; c.font=`bold ${Math.min(18,w*0.04)}px Tajawal`; c.textAlign='center';
      c.fillText('🔕 الصوت لا ينتقل في الفراغ!',w/2,h*0.42);
      c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.min(13,w*0.03)}px Tajawal`;
      c.fillText('لا جزيئات لنقل الاهتزازات',w/2,h*0.54);
      animFrame=requestAnimationFrame(draw); return;
    }

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,sc.bg+'AA'); bg.addColorStop(1,sc.bg+'55');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='white'; c.font=`bold ${Math.min(15,w*0.034)}px Tajawal`;
    c.textAlign='center'; c.fillText(`${sc.icon} الصوت في ${sc.name}: ${sc.speed} م/ث`,w/2,h*0.07);

    // جزيئات
    const density=sc.name==='الفولاذ'?12:sc.name==='الماء'?8:5;
    const spacing=w/(density+1);
    for(let r=0;r<3;r++) for(let col=0;col<density;col++){
      const bx=(col+1)*spacing, by=h*0.45+(r-1)*h*0.12;
      const wave=Math.sin(S.t*3-col*0.5)*h*0.03*(sc.speed/5100);
      const pr=sc.name==='الفولاذ'?8:sc.name==='الماء'?5:3;
      c.fillStyle=sc.color+'CC'; c.beginPath(); c.arc(bx+wave,by,pr,0,Math.PI*2); c.fill();
    }

    // مقارنة الأوساط
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`bold ${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText('مقارنة السرعات',w/2,h*0.66);
    const maxBar=w*0.7;
    scenarios.filter(s=>s.speed>0).forEach((s,i)=>{
      const by2=h*0.72+i*h*0.065;
      const bw=maxBar*(s.speed/5100);
      const active=s.name===sc.name;
      c.fillStyle=active?s.color:'rgba(255,255,255,0.2)';
      c.beginPath(); c.roundRect(w*0.15,by2,bw,h*0.042,4); c.fill();
      c.fillStyle=active?'white':'rgba(255,255,255,0.5)';
      c.font=`${Math.min(10,w*0.023)}px Tajawal`; c.textAlign='left';
      c.fillText(`${s.icon} ${s.name}: ${s.speed} م/ث`,w*0.15+bw+6,by2+h*0.029);
    });
    c.textAlign='center';
    c.fillStyle=sc.color; c.font=`${Math.min(12,w*0.027)}px Tajawal`;
    c.fillText(sc.desc,w/2,h*0.94);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function sound_oscilloscope2(){
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  if(!simState.sound_oscilloscope2) simState.sound_oscilloscope2={t:0,sel:0};
  const S=simState.sound_oscilloscope2;

  const sounds=[
    {name:'نغمة نقية',type:'sine',color:'#00FF44',freq:2,amp:0.6,desc:'موجة جيبية منتظمة — نغمة صافية'},
    {name:'صوت بشري',type:'voice',color:'#44FFAA',freq:2,amp:0.5,desc:'موجة معقدة — مزيج ترددات'},
    {name:'ضوضاء',type:'noise',color:'#FF8844',freq:5,amp:0.4,desc:'موجة عشوائية — أصوات غير منتظمة'},
    {name:'نبضة طبلة',type:'drum',color:'#FF4444',freq:1,amp:0.8,desc:'سعة كبيرة تتناقص سريعاً'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📺 أنواع الموجات الصوتية</div>
      ${sounds.map((s,i)=>`<button class="ctrl-btn" style="width:100%;margin:2px 0;${S.sel===i?'background:'+s.color.replace('FF','88')+';color:#000':''}" onclick="simState.sound_oscilloscope2.sel=${i};simState.sound_oscilloscope2.t=0">${s.name}</button>`).join('')}
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما الفرق بين النغمة والضوضاء؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">النغمة: موجات منتظمة بتردد ثابت. الضوضاء: موجات عشوائية بترددات مختلطة — لا حدة محددة.</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ كيف يعمل الأوسيلوسكوب؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">يُحوّل تغيرات الضغط الهوائي إلى إشارة كهربائية ثم يرسمها — السعة = الشدة، وعدد الموجات = التردد.</div>
    </div>`);

  function draw(){
    if(currentSim!=='sound_oscilloscope') return;
    const w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h);
    S.t+=0.06;
    c.fillStyle='#050F05'; c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(0,200,0,0.25)'; c.lineWidth=2;
    c.beginPath(); c.roundRect(8,8,w-16,h-16,6); c.stroke();
    c.strokeStyle='rgba(0,160,0,0.08)'; c.lineWidth=0.5;
    for(let x=0;x<w;x+=w/10){ c.beginPath(); c.moveTo(x,0); c.lineTo(x,h); c.stroke(); }
    for(let y=0;y<h;y+=h/8){ c.beginPath(); c.moveTo(0,y); c.lineTo(w,y); c.stroke(); }

    const snd=sounds[S.sel];
    const amp=snd.amp*h*0.3, midY=h*0.45;
    c.strokeStyle=snd.color; c.lineWidth=2.5;
    c.shadowColor=snd.color+'88'; c.shadowBlur=10;
    c.beginPath();
    for(let x=0;x<=w;x+=2){
      let y;
      if(snd.type==='sine') y=midY+Math.sin((x/w)*snd.freq*Math.PI*6+S.t)*amp;
      else if(snd.type==='voice') y=midY+(Math.sin((x/w)*snd.freq*Math.PI*6+S.t)*0.6+Math.sin((x/w)*snd.freq*Math.PI*12+S.t*1.3)*0.25+Math.sin((x/w)*snd.freq*Math.PI*18+S.t*0.7)*0.15)*amp;
      else if(snd.type==='noise') y=midY+(Math.sin((x/w)*snd.freq*Math.PI*8+S.t)*0.4+(Math.random()-0.5)*0.6)*amp;
      else{ const dec=Math.exp(-(x/w)*4); y=midY+Math.sin((x/w)*snd.freq*Math.PI*4+S.t)*amp*dec; }
      x===0?c.moveTo(x,y):c.lineTo(x,y);
    }
    c.stroke(); c.shadowBlur=0;
    c.strokeStyle='rgba(0,200,0,0.18)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(0,midY); c.lineTo(w,midY); c.stroke();

    c.fillStyle=snd.color; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
    c.textAlign='center'; c.fillText(snd.name,w/2,h*0.1);
    c.fillStyle='rgba(255,255,255,0.65)'; c.font=`${Math.min(11,w*0.025)}px Tajawal`;
    c.fillText(snd.desc,w/2,h*0.88);

    // مصغرات للمقارنة
    sounds.forEach((s,i)=>{
      const bx=w*0.1+i*(w*0.2);
      const isSel=i===S.sel;
      c.strokeStyle=isSel?s.color:s.color+'44'; c.lineWidth=isSel?1.8:1;
      c.beginPath();
      for(let x2=0;x2<w*0.15;x2+=2){
        const t3=x2/(w*0.15);
        let y2;
        if(s.type==='sine') y2=Math.sin(t3*Math.PI*6+S.t)*h*0.04;
        else if(s.type==='voice') y2=(Math.sin(t3*Math.PI*6+S.t)*0.6+Math.sin(t3*Math.PI*12+S.t)*0.4)*h*0.035;
        else if(s.type==='noise') y2=(Math.sin(t3*Math.PI*8+S.t)*0.4+(Math.random()-0.5)*0.6)*h*0.03;
        else y2=Math.sin(t3*Math.PI*4+S.t)*Math.exp(-t3*4)*h*0.05;
        const drawY=h*0.73+y2;
        x2===0?c.moveTo(bx+x2,drawY):c.lineTo(bx+x2,drawY);
      }
      c.stroke();
      c.fillStyle=isSel?s.color:'rgba(255,255,255,0.35)';
      c.font=`${Math.min(9,w*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText(s.name,bx+w*0.075,h*0.82);
    });
    c.textAlign='center';
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════
//   الصف الخامس — وحدة ٤: الطريقة التي نرى بها الأشياء
// ══════════════════════════════════════════════════

