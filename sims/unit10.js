// UNIT 10 — التبايُن والتصنيف  (PhET-level v2)
// ============================================================

// ══════════════════════════════════════════════════════════
// 10-2 TAB 1 — مخطط التكرار التفاعلي (رسم حقيقي بالفأرة)
// ══════════════════════════════════════════════════════════
function simVariation1() {
  const petalData = [18,20,21,20,19,20,17,21,20,20,19,18,20,21,20,19,20,20,21,17];
  const bins = {}; petalData.forEach(v => bins[v]=(bins[v]||0)+1);
  const vals = [17,18,19,20,21];

  simState = {
    t:0, flowers: petalData.map((v,i) => ({
      id:i, val:v,
      x:0.05+Math.random()*0.88, y:0.12+Math.random()*0.68,
      col:['#E74C3C','#F39C12','#E91E63','#FF9800','#9C27B0'][i%5],
      measured:false, selected:false
    })),
    // Student-drawn bars: key=value, height=studentCount
    drawnBars: {17:0,18:0,19:0,20:0,21:0},
    draggingBar: null,  // which bar being dragged
    dragStartY: 0,
    mode:'measure',   // 'measure' | 'draw'
    showAnswer: false,
    measured: []
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📊 مخطط التكرار التفاعلي</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-top:4px">
        <strong>١.</strong> وضع القياس — اضغط الزهور لقياسها<br>
        <strong>٢.</strong> وضع الرسم — ارفع الأعمدة بنفسك!<br>
        <strong>٣.</strong> تحقق من إجابتك
      </div>
    </div>
    <div style="display:flex;gap:6px;margin-bottom:6px">
      <button class="ctrl-btn on" id="btnMeasure" style="flex:1;background:rgba(39,174,96,0.25);border-color:rgba(39,174,96,0.6);color:#2DC653">🔬 قياس</button>
      <button class="ctrl-btn" id="btnDraw" style="flex:1;background:rgba(52,152,219,0.2);border-color:rgba(52,152,219,0.5);color:#3498DB">✏️ رسم</button>
    </div>
    <button class="ctrl-btn" id="btnCheck" style="width:100%;margin-bottom:4px;background:rgba(155,89,182,0.2);border-color:rgba(155,89,182,0.5);color:#9B59B6">✅ تحقق من الإجابة</button>
    <button class="ctrl-btn" id="btnReset" style="width:100%;background:rgba(231,76,60,0.15);border-color:rgba(231,76,60,0.4);color:#E74C3C">🔄 إعادة</button>
    <div class="info-box" id="v1Info">اضغط على الزهور لمعرفة عدد بتلاتها</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٦٢):</strong><br>١- ما عدد البتلات الأكثر تكراراً؟<br>٢- ما الفرق بين البتلات الكثيرة والقليلة؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الأكثر تكراراً: 5 أو 6 بتلات (حسب البيانات).<br>٢- الأزهار ذات البتلات الكثيرة عادةً تستقطب حشرات التلقيح.</div>
  </div>
  `);

  btn('btnMeasure', () => {
    simState.mode='measure';
    document.getElementById('btnMeasure').classList.add('on');
    document.getElementById('btnDraw').classList.remove('on');
    document.getElementById('v1Info').textContent = 'اضغط على الزهور لقياسها';
  });
  btn('btnDraw', () => {
    if(simState.measured.length===0){ document.getElementById('v1Info').textContent='قِس الزهور أولاً!'; return; }
    simState.mode='draw';
    document.getElementById('btnDraw').classList.add('on');
    document.getElementById('btnMeasure').classList.remove('on');
    document.getElementById('v1Info').textContent = 'اسحب الأعمدة للأعلى والأسفل لتعبئة المخطط';
  });
  btn('btnCheck', () => {
    simState.showAnswer = !simState.showAnswer;
    document.getElementById('v1Info').textContent = simState.showAnswer ? 'الإجابة الصحيحة ظاهرة — قارن مع مخططك' : 'اضغط مجدداً لإخفاء الإجابة';
    if(simState.showAnswer) U9Sound.win();
  });
  btn('btnReset', () => {
    simState.measured=[];
    simState.drawnBars={17:0,18:0,19:0,20:0,21:0};
    simState.showAnswer=false;
    simState.flowers.forEach(f=>{f.measured=false;f.selected=false;});
    simState.mode='measure';
    document.getElementById('btnMeasure').classList.add('on');
    document.getElementById('btnDraw').classList.remove('on');
    document.getElementById('v1Info').textContent='تمت الإعادة';
    U9Sound.ping(330,0.2,0.15);
  });

  const canvas = document.getElementById('simCanvas');

  canvas.onmousedown = canvas.ontouchstart = function(e) {
    e.preventDefault();
    const rect=canvas.getBoundingClientRect();
    const mx=(e.touches?e.touches[0].clientX:e.clientX)-rect.left;
    const my=(e.touches?e.touches[0].clientY:e.clientY)-rect.top;
    const w=canvas.width, h=canvas.height;

    if(simState.mode==='measure') {
      simState.flowers.forEach(f => {
        const fx=f.x*w, fy=f.y*h;
        if(Math.hypot(mx-fx,my-fy)<24) {
          f.selected=true; f.measured=true;
          if(!simState.measured.includes(f.id)) simState.measured.push(f.id);
          document.getElementById('v1Info').innerHTML = `🌸 زهرة #${f.id+1}: <strong style="color:${f.col}">${f.val} بتلة</strong>  (تم قياس ${simState.measured.length}/20)`;
          U9Sound.ping(380+f.val*12,0.2,0.15);
          setTimeout(()=>{ f.selected=false; },400);
        }
      });
    } else if(simState.mode==='draw') {
      // Check if clicking on a bar in the draw-chart area
      const chartL=w*0.08, chartR=w*0.92, chartT=h*0.1, chartB=h*0.88;
      const barW=(chartR-chartL)/vals.length;
      vals.forEach((v,i) => {
        const bx=chartL+i*barW+barW*0.1;
        const bw=barW*0.8;
        if(mx>=bx && mx<=bx+bw && my>=chartT && my<=chartB) {
          simState.draggingBar=v;
          simState.dragStartY=my;
          simState.dragStartCount=simState.drawnBars[v];
        }
      });
    }
  };

  canvas.onmousemove = canvas.ontouchmove = function(e) {
    e.preventDefault();
    if(simState.mode!=='draw' || simState.draggingBar===null) return;
    const rect=canvas.getBoundingClientRect();
    const my=(e.touches?e.touches[0].clientY:e.clientY)-rect.top;
    const h=canvas.height;
    const maxCount=8, chartT=h*0.1, chartB=h*0.88, chartH=chartB-chartT;
    const dy=simState.dragStartY-my;
    const newCount=Math.max(0,Math.min(maxCount, simState.dragStartCount+Math.round(dy/(chartH/maxCount))));
    if(newCount!==simState.drawnBars[simState.draggingBar]) {
      simState.drawnBars[simState.draggingBar]=newCount;
      U9Sound.ping(300+newCount*40,0.08,0.05);
    }
  };

  canvas.onmouseup = canvas.ontouchend = function() { simState.draggingBar=null; };

  function draw() {
    if(currentSim!=='variation'||currentTab!==0) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0FFF4'); bg.addColorStop(1,'#E8F5E9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(simState.mode==='measure') {
      // Flower field
      c.fillStyle='rgba(30,77,43,0.6)'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
      c.fillText(`قِس الزهور — تم: ${simState.measured.length}/20`,w/2,28);

      simState.flowers.forEach(f => {
        const fx=f.x*w, fy=f.y*h;
        const r=f.measured?20:16;
        const pulse=f.selected?Math.sin(t*0.3)*4:0;
        // Petals
        for(let p=0;p<f.val;p++) {
          const ang=(p/f.val)*Math.PI*2;
          const px=fx+Math.cos(ang)*(r+pulse)*1.25;
          const py=fy+Math.sin(ang)*(r+pulse)*1.25;
          c.beginPath(); c.ellipse(px,py,(r+pulse)*0.5,(r+pulse)*0.28,ang,0,Math.PI*2);
          c.fillStyle=f.measured?f.col:`rgba(180,210,180,0.6)`; c.fill();
        }
        // Center
        c.beginPath(); c.arc(fx,fy,(r+pulse)*0.42,0,Math.PI*2);
        c.fillStyle=f.measured?'#F4D03F':'#CCC'; c.fill();
        c.strokeStyle='rgba(0,0,0,0.1)'; c.lineWidth=1; c.stroke();

        if(f.measured) {
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
          c.fillText(f.val,fx,fy+4);
          // Badge
          c.fillStyle=f.col; c.beginPath(); c.roundRect(fx-12,fy+r*1.5,24,16,8); c.fill();
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`;
          c.fillText(f.val,fx,fy+r*1.5+11);
        }
      });

      // Mini tally — top-left corner, fully inside canvas
      if(simState.measured.length>0) {
        const tally={}; simState.measured.forEach(id=>{ const v=simState.flowers[id].val; tally[v]=(tally[v]||0)+1; });
        const rowH = Math.round(h*0.052);
        const boxW = Math.round(w*0.16);
        const boxH = rowH * (vals.length+1) + 10;
        const tx = 10, ty = 40;

        // Card background
        c.fillStyle='rgba(30,45,61,0.72)';
        c.beginPath(); c.roundRect(tx, ty, boxW, boxH, 12); c.fill();
        c.strokeStyle='rgba(255,255,255,0.15)'; c.lineWidth=1;
        c.beginPath(); c.roundRect(tx, ty, boxW, boxH, 12); c.stroke();

        // Header
        c.fillStyle='rgba(255,255,255,0.18)';
        c.beginPath(); c.roundRect(tx, ty, boxW, rowH, [12,12,0,0]); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
        c.fillText('📊 جدول العدد', tx+boxW/2, ty+rowH*0.72);

        // Rows
        vals.forEach((v,i) => {
          const count = tally[v]||0;
          const ry = ty + rowH*(i+1);
          if(i%2===0){ c.fillStyle='rgba(255,255,255,0.06)'; c.fillRect(tx, ry, boxW, rowH); }
          // Value badge
          const badgeCol=['#E74C3C','#F39C12','#27AE60','#3498DB','#9B59B6'][i];
          c.fillStyle=badgeCol+'BB';
          c.beginPath(); c.roundRect(tx+6, ry+4, Math.round(boxW*0.28), rowH-8, 6); c.fill();
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
          c.fillText(v, tx+6+Math.round(boxW*0.14), ry+rowH*0.7);
          // Count bar
          const maxPossible=8;
          const barW = Math.round((boxW*0.55) * (count/maxPossible));
          if(barW>0){
            c.fillStyle=badgeCol+'99';
            c.beginPath(); c.roundRect(tx+boxW*0.38, ry+rowH*0.28, barW, rowH*0.44, 4); c.fill();
          }
          // Count number
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='right';
          c.fillText(count, tx+boxW-8, ry+rowH*0.7);
        });
      }

    } else {
      // Draw-chart mode
      const chartL=w*0.12, chartR=w*0.91, chartT=h*0.1, chartB=h*0.82;
      const chartH=chartB-chartT;
      const maxCount=8;
      const barW=(chartR-chartL)/vals.length;

      // Background panel
      c.fillStyle='white'; c.beginPath(); c.roundRect(chartL-12,chartT-12,chartR-chartL+24,chartH+16,14); c.fill();
      c.strokeStyle='rgba(39,174,96,0.3)'; c.lineWidth=1.5; c.stroke();

      c.fillStyle='#1E4D2B'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
      c.fillText('ارسم مخطط التكرار — اسحب الأعمدة!',w/2,chartT-22);

      // Grid lines
      for(let i=0;i<=maxCount;i++) {
        const gy=chartB-(i/maxCount)*chartH;
        c.strokeStyle=i%2===0?'rgba(0,0,0,0.1)':'rgba(0,0,0,0.05)'; c.lineWidth=1; c.setLineDash([3,3]);
        c.beginPath(); c.moveTo(chartL,gy); c.lineTo(chartR,gy); c.stroke(); c.setLineDash([]);
        c.fillStyle='#7A8A98'; c.font=`${Math.round(h*0.028)}px Tajawal`; c.textAlign='right';
        if(i%2===0) c.fillText(i,chartL-5,gy+4);
      }

      vals.forEach((v,i) => {
        const bx=chartL+i*barW+barW*0.08;
        const bw=barW*0.84;
        const studentCount=simState.drawnBars[v];
        const correctCount=bins[v]||0;

        // Student bar
        const bh=(studentCount/maxCount)*chartH;
        const by=chartB-bh;
        const isDragging=simState.draggingBar===v;
        const grad=c.createLinearGradient(0,by,0,chartB);
        grad.addColorStop(0,isDragging?'#1A8FA8':'#3498DB');
        grad.addColorStop(1,isDragging?'#0D6A82':'#2980B9');
        c.fillStyle=grad;
        c.beginPath(); c.roundRect(bx,by,bw,bh+1,[8,8,0,0]); c.fill();
        if(isDragging){c.strokeStyle='#FFD700';c.lineWidth=3;c.stroke();}

        // Drag handle
        c.fillStyle='rgba(255,255,255,0.9)'; c.beginPath(); c.roundRect(bx+bw/2-20,by-8,40,16,8); c.fill();
        c.fillStyle='#1A8FA8'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
        c.fillText('↕ '+studentCount,bx+bw/2,by+4);

        // Correct answer overlay
        if(simState.showAnswer) {
          const ch=(correctCount/maxCount)*chartH;
          const cy=chartB-ch;
          c.strokeStyle='#E74C3C'; c.lineWidth=3; c.setLineDash([6,3]);
          c.beginPath(); c.moveTo(bx,cy); c.lineTo(bx+bw,cy); c.stroke(); c.setLineDash([]);
          const match=studentCount===correctCount;
          c.fillStyle=match?'rgba(39,174,96,0.9)':'rgba(231,76,60,0.9)';
          c.beginPath(); c.arc(bx+bw/2,cy,10,0,Math.PI*2); c.fill();
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
          c.fillText(match?'✓':'×',bx+bw/2,cy+4);
        }

        // X-axis label
        c.fillStyle='#1E4D2B'; c.font=`bold ${Math.round(h*0.036)}px Tajawal`; c.textAlign='center';
        c.fillText(v,bx+bw/2,chartB+20);
      });

      // Axes
      c.strokeStyle='#2C3A4A'; c.lineWidth=2; c.setLineDash([]);
      c.beginPath(); c.moveTo(chartL,chartT); c.lineTo(chartL,chartB); c.lineTo(chartR,chartB); c.stroke();

      // Axis labels
      c.fillStyle='#5A6A7A'; c.font=`${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
      c.fillText('عدد البتلات ←',w/2,chartB+40);
      c.save(); c.translate(18,h/2); c.rotate(-Math.PI/2);
      c.fillText('عدد الزهور',0,0); c.restore();

      if(simState.showAnswer) {
        c.fillStyle='rgba(231,76,60,0.9)'; c.font=`${Math.round(h*0.028)}px Tajawal`; c.textAlign='right';
        c.fillText('— الإجابة الصحيحة',chartR,chartT+16);
      }
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-2 TAB 2 — استقصاء التباين البشري (قياس حقيقي)
// ══════════════════════════════════════════════════════════
function simVariation2() {
  const traits = {
    height: { label:'الطول (cm)', color:'#3498DB', min:140, max:180, unit:'cm',
      question:'ما الوسط الحسابي؟', fact:'التباين في الطول ناتج عن جينات وبيئة (تغذية)' },
    foot:   { label:'مقاس الحذاء', color:'#E74C3C', min:34, max:46, unit:'',
      question:'ما المنوال (الأكثر تكراراً)؟', fact:'مقاس الحذاء يرتبط بالطول ارتباطاً طردياً' },
    hand:   { label:'محيط الرسغ (cm)', color:'#8E44AD', min:13, max:20, unit:'cm',
      question:'ما المدى = الأكبر - الأصغر؟', fact:'محيط الرسغ مثال على التباين المستمر' }
  };

  // 15 simulated students shown as avatars
  const students = Array.from({length:15},(_,i) => ({
    id:i,
    height: 145+Math.round(Math.random()*28),
    foot: 36+Math.round(Math.random()*8),
    hand: Math.round((14+Math.random()*5)*10)/10,
    measured: false,
    x: 0.04+(i%5)*0.19,
    y: 0.15+Math.floor(i/5)*0.29
  }));

  simState = { t:0, trait:'height', students, selected:null, stats:null };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 استقصاء التباين في الإنسان</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-top:4px">
        اضغط على كل طالب لقياسه، ثم احسب الإحصائيات
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">الصفة المقاسة:</div>
      <div style="display:flex;gap:4px;flex-direction:column">
        <button class="ctrl-btn on" id="bth" style="width:100%;background:rgba(52,152,219,0.25);border-color:rgba(52,152,219,0.6);color:#3498DB">📏 الطول</button>
        <button class="ctrl-btn" id="btf" style="width:100%;background:rgba(231,76,60,0.15);border-color:rgba(231,76,60,0.4);color:#E74C3C">👟 مقاس الحذاء</button>
        <button class="ctrl-btn" id="btw" style="width:100%;background:rgba(142,68,173,0.15);border-color:rgba(142,68,173,0.4);color:#8E44AD">⌚ محيط الرسغ</button>
      </div>
    </div>
    <button class="ctrl-btn" id="btnCalcStats" style="width:100%;margin-top:4px;background:rgba(39,174,96,0.2);border-color:rgba(39,174,96,0.5);color:#2DC653">🧮 احسب الإحصائيات</button>
    <button class="ctrl-btn" id="btnMeasureAll" style="width:100%;margin-top:4px;background:rgba(26,143,168,0.2);border-color:rgba(26,143,168,0.5);color:#1A8FA8">📋 قِس الجميع</button>
    <div class="info-box" id="v2Info">اضغط على الطلاب لقياس صفاتهم</div>
    <div class="q-box" id="v2Q">...</div>
  `);

  function setTrait(key) {
    simState.trait=key; simState.stats=null;
    simState.students.forEach(s=>s.measured=false);
    document.getElementById('v2Q').innerHTML=`<strong>❓ ص٦٣:</strong> ${traits[key].question}`;
    document.getElementById('v2Info').textContent='اضغط على الطلاب لقياسهم';
    ['bth','btf','btw'].forEach(id=>document.getElementById(id).classList.remove('on'));
    U9Sound.ping(440,0.2,0.15);
  }
  btn('bth',()=>{ document.getElementById('bth').classList.add('on'); setTrait('height'); });
  btn('btf',()=>{ document.getElementById('btf').classList.add('on'); setTrait('foot'); });
  btn('btw',()=>{ document.getElementById('btw').classList.add('on'); setTrait('hand'); });
  btn('btnMeasureAll',()=>{
    simState.students.forEach(s=>s.measured=true);
    document.getElementById('v2Info').textContent='✅ تم قياس جميع الطلاب — احسب الإحصائيات';
    U9Sound.ping(523,0.25,0.2);
  });
  btn('btnCalcStats',()=>{
    const measured=simState.students.filter(s=>s.measured);
    if(measured.length<3){ document.getElementById('v2Info').textContent='قِس على الأقل 3 طلاب أولاً!'; return; }
    const vals=measured.map(s=>s[simState.trait]);
    const mean=(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1);
    const sorted=[...vals].sort((a,b)=>a-b);
    const med=sorted[Math.floor(sorted.length/2)];
    const freq={}; vals.forEach(v=>{freq[v]=(freq[v]||0)+1;});
    const mode=Object.entries(freq).sort((a,b)=>b[1]-a[1])[0][0];
    const range=Math.max(...vals)-Math.min(...vals);
    simState.stats={mean,med,mode,range,vals,min:Math.min(...vals),max:Math.max(...vals)};
    const tr=traits[simState.trait];
    document.getElementById('v2Info').innerHTML=`
      <strong style="color:${tr.color}">الإحصائيات (${measured.length} طلاب):</strong><br>
      الوسط: <strong>${mean}${tr.unit}</strong> | الوسيط: ${med} | المنوال: ${mode}<br>
      المدى: ${range} | الأصغر: ${Math.min(...vals)} | الأكبر: ${Math.max(...vals)}`;
    U9Sound.win();
  });

  document.getElementById('v2Q').innerHTML=`<strong>❓ ص٦٣:</strong> ${traits['height'].question}`;

  const canvas=document.getElementById('simCanvas');
  canvas.onclick=function(e){
    const rect=canvas.getBoundingClientRect();
    const mx=e.clientX-rect.left, my=e.clientY-rect.top;
    const w=canvas.width,h=canvas.height;
    simState.students.forEach(s=>{
      if(Math.hypot(mx-s.x*w, my-s.y*h)<22){
        s.measured=true; simState.selected=s.id;
        const tr=traits[simState.trait];
        const val=s[simState.trait];
        document.getElementById('v2Info').innerHTML=`طالب #${s.id+1}: <strong style="color:${tr.color}">${val}${tr.unit}</strong> (${tr.label})`;
        U9Sound.ping(300+val*5,0.2,0.15);
        setTimeout(()=>{simState.selected=null;},500);
      }
    });
  };

  function draw(){
    if(currentSim!=='variation'||currentTab!==1) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;
    const tr=traits[simState.trait];

    const bg=c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#F8F0FF'); bg.addColorStop(1,'#EDF7FF');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(!simState.stats) {
      // Student grid view
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
      c.fillText('اضغط على كل طالب لقياس '+tr.label,w/2,28);

      simState.students.forEach(s=>{
        const sx=s.x*w, sy=s.y*h;
        const sel=simState.selected===s.id;
        const val=s[simState.trait];
        // Bar height visualization
        const barH=((val-tr.min)/(tr.max-tr.min))*h*0.17+h*0.04;
        if(s.measured) {
          c.fillStyle=tr.color+'44';
          c.beginPath(); c.roundRect(sx-14,sy-barH+8,28,barH,[4,4,0,0]); c.fill();
          c.strokeStyle=tr.color+'88'; c.lineWidth=1.5; c.stroke();
        }
        // Avatar
        const pulse=sel?Math.sin(t*0.25)*5:0;
        const emojis=['👦','👧','🧒'];
        c.font=`${Math.round(h*0.075)}px serif`; c.textAlign='center';
        c.fillText(emojis[s.id%3],sx,sy+8+pulse);
        if(s.measured){
          c.fillStyle=tr.color; c.beginPath(); c.roundRect(sx-18,sy+16+pulse,36,18,9); c.fill();
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
          c.fillText(val+(simState.trait==='height'||simState.trait==='hand'?'':''),sx,sy+28+pulse);
        }
        if(sel){
          c.strokeStyle=tr.color; c.lineWidth=3;
          c.beginPath(); c.arc(sx,sy-2,26,0,Math.PI*2); c.stroke();
        }
      });

      const measCount=simState.students.filter(s=>s.measured).length;
      c.fillStyle='rgba(0,0,0,0.45)'; c.beginPath(); c.roundRect(w/2-80,h-32,160,24,12); c.fill();
      c.fillStyle='white'; c.font=`${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
      c.fillText(`تم قياس ${measCount}/15 طالباً`,w/2,h-15);

    } else {
      // Stats + distribution chart
      const s=simState.stats;
      const chartL=w*0.1, chartR=w*0.88, chartT=h*0.35, chartB=h*0.85;
      const chartH2=chartB-chartT;

      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
      c.fillText('توزيع '+tr.label+' للطلاب',w/2,28);

      // Stat cards
      const cards=[
        {label:'الوسط الحسابي',val:s.mean+tr.unit,col:'#3498DB'},
        {label:'الوسيط',val:s.med+tr.unit,col:'#27AE60'},
        {label:'المنوال',val:s.mode+tr.unit,col:'#8E44AD'},
        {label:'المدى',val:s.range+tr.unit,col:'#E74C3C'}
      ];
      const cardW=(w-40)/4;
      cards.forEach((card,i)=>{
        const cx2=20+i*cardW+cardW/2;
        c.fillStyle=card.col; c.beginPath(); c.roundRect(20+i*cardW,40,cardW-8,62,10); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.045)}px Tajawal`; c.textAlign='center';
        c.fillText(card.val,cx2,78);
        c.font=`${Math.round(h*0.025)}px Tajawal`;
        c.fillText(card.label,cx2,93);
      });

      // Distribution chart (dot plot)
      const freq={};
      s.vals.forEach(v=>{freq[v]=(freq[v]||0)+1;});
      const uVals=Object.keys(freq).map(Number).sort((a,b)=>a-b);
      const maxF=Math.max(...Object.values(freq));
      const barW2=(chartR-chartL)/uVals.length;

      // Bars
      uVals.forEach((v,i)=>{
        const f=freq[v];
        const bh=(f/maxF)*chartH2*0.9;
        const bx=chartL+i*barW2+barW2*0.1;
        const bw2=barW2*0.8;
        const by=chartB-bh;
        const grad=c.createLinearGradient(0,by,0,chartB);
        grad.addColorStop(0,tr.color);
        grad.addColorStop(1,tr.color+'88');
        c.fillStyle=grad; c.beginPath(); c.roundRect(bx,by,bw2,bh,[6,6,0,0]); c.fill();
        c.fillStyle=tr.color+'44'; c.strokeStyle=tr.color; c.lineWidth=1.5; c.stroke();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.034)}px Tajawal`; c.textAlign='center';
        if(f>0) c.fillText(f,bx+bw2/2,by-5);
        c.fillStyle='#1E2D3D'; c.font=`${Math.round(h*0.028)}px Tajawal`;
        c.fillText(v,bx+bw2/2,chartB+18);
      });

      // Mean line
      const mScale=(s.mean-s.min)/(s.max-s.min);
      const validVals=uVals.filter(v=>v>=s.min&&v<=s.max);
      if(validVals.length>0){
        const nearestIdx=uVals.reduce((bi,v,i)=>Math.abs(v-s.mean)<Math.abs(uVals[bi]-s.mean)?i:bi,0);
        const mx2=chartL+nearestIdx*barW2+barW2/2;
        c.strokeStyle='#E74C3C'; c.lineWidth=2.5; c.setLineDash([5,3]);
        c.beginPath(); c.moveTo(mx2,chartT); c.lineTo(mx2,chartB); c.stroke(); c.setLineDash([]);
        c.fillStyle='rgba(231,76,60,0.9)'; c.beginPath(); c.roundRect(mx2-30,chartT-20,60,18,9); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
        c.fillText('وسط: '+s.mean,mx2,chartT-7);
      }

      c.strokeStyle='#2C3A4A'; c.lineWidth=2; c.setLineDash([]);
      c.beginPath(); c.moveTo(chartL,chartT); c.lineTo(chartL,chartB); c.lineTo(chartR,chartB); c.stroke();

      c.fillStyle='#5A6A7A'; c.font=`${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText(tr.label,w/2,h-8);
      c.save(); c.translate(16,h*0.6); c.rotate(-Math.PI/2);
      c.fillText('عدد الطلاب',0,0); c.restore();

      c.fillStyle='rgba(100,100,100,0.5)'; c.font=`italic ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
      c.fillText(tr.fact,w/2,chartB+32);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-4 TAB 1 — مملكة النباتات (مقارنة تفاعلية)
// ══════════════════════════════════════════════════════════
function simPlantClass1() {
  const groups = [
    { id:'moss', name:'الحزازيّات', color:'#5D8A3C', bg:'#E8F5E9',
      emoji:'🌿', scene:'أرض رطبة',
      traits:['نباتات صغيرة جداً','تعيش في أماكن مبللة','تتكاثر بالأبواغ (Spores)','لا أزهار ولا بذور','لها أوراق رقيقة'],
      size:'صغيرة جداً', repro:'أبواغ', flowers:'لا', seeds:'لا', textbook:'ص٦٦'
    },
    { id:'fern', name:'السرخسيّات', color:'#27AE60', bg:'#F1FFF5',
      emoji:'🌱', scene:'ظل وشعاع',
      traits:['أوراقها تُسمّى الخوص (Fronds)','الأبواغ على ظهر الخوص','تعيش في الظل الرطب','أكبر من الحزازيّات','لا أزهار حقيقية'],
      size:'متوسطة', repro:'أبواغ', flowers:'لا', seeds:'لا', textbook:'ص٦٦'
    },
    { id:'conifer', name:'المخروطيّات', color:'#1A8FA8', bg:'#E3F8FF',
      emoji:'🌲', scene:'جبال باردة',
      traits:['أوراق إبريّة صلبة (Needles)','البذور في مخروطات (Cones)','أشجار كبيرة دائمة الخضرة','تتكاثر بالبذور','لا أزهار حقيقية'],
      size:'كبيرة جداً', repro:'بذور', flowers:'لا', seeds:'نعم', textbook:'ص٦٧'
    },
    { id:'flower', name:'النباتات الزهريّة', color:'#E74C3C', bg:'#FFF0F0',
      emoji:'🌸', scene:'حقول ملونة',
      traits:['تنتج أزهاراً جميلة','البذور داخل الأزهار والثمار','الأكثر تنوعاً','تشمل معظم النباتات المعروفة','تعيش في بيئات متعددة'],
      size:'متفاوتة', repro:'بذور في ثمار', flowers:'نعم', seeds:'نعم', textbook:'ص٦٧'
    }
  ];

  simState = { t:0, selected:null, compareMode:false, checklist:{} };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌿 مملكة النباتات</div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;margin-bottom:6px">
      ${groups.map(g=>`<button class="ctrl-btn" id="bp_${g.id}" 
        style="background:${g.color}22;border-color:${g.color}55;color:${g.color};font-size:13px;text-align:center;padding:8px 4px"
        onclick="(function(id){ if(simState.selected===id){simState.selected=null;document.getElementById('pInfo').textContent='اضغط على مجموعة لمعرفة خصائصها';}else{simState.selected=id;simState.compareMode=false;U9Sound.ping(440,0.12,0.1);} })('${g.id}')">
        ${g.emoji}<br><strong>${g.name}</strong>
      </button>`).join('')}
    </div>
    <button class="ctrl-btn" id="bCompare" style="width:100%;margin-bottom:4px;background:rgba(52,152,219,0.2);border-color:rgba(52,152,219,0.5);color:#3498DB">📊 مقارنة المجموعات</button>
    <div class="info-box" id="pInfo">اضغط على مجموعة لمعرفة خصائصها</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٦٧):</strong><br>١- ما الفرق بين المخروطيّات والزهريّات في طريقة التكاثر؟<br>٢- اذكر مثالاً على كلٍّ منهما.
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الزهريّات تُنتج بذوراً داخل ثمار، المخروطيّات تُنتج بذوراً مكشوفة في مخاريط.<br>٢- زهريّات: التفاح / الورد. مخروطيّات: الصنوبر / التنوب.
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- حزازيّات: أبواغ صغيرة رطبة. سرخسيّات: خوص وأبواغ على ظهرها. مخروطيّات: إبر ومخاريط. زهريّات: أزهار وثمار.<br>٢- البذور أكثر حمايةً وقدرةً على الانتشار من الأبواغ.</div>
  </div>
  </div>
  `);

  btn('bCompare',()=>{
    simState.compareMode=true; simState.selected=null;
    document.getElementById('pInfo').textContent='مقارنة جميع المجموعات جنباً إلى جنب';
    U9Sound.ping(523,0.2,0.18);
  });

  function draw(){
    if(currentSim!=='plantclass'||currentTab!==0) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#E8F8E8'); bg.addColorStop(1,'#C8E6C9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(simState.compareMode) {
      // Side-by-side comparison table
      c.fillStyle='#1E4D2B'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
      c.fillText('مقارنة مجموعات النباتات الأربع',w/2,30);

      const rows = [
        {label:'الحجم', key:'size'},
        {label:'التكاثر', key:'repro'},
        {label:'أزهار', key:'flowers'},
        {label:'بذور', key:'seeds'}
      ];
      const colW=w/5;
      const rowH=(h-70)/5;

      // Header
      c.fillStyle='rgba(30,77,43,0.85)'; c.beginPath(); c.roundRect(10,50,w-20,rowH,8); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
      c.fillText('الصفة',colW*0.5,50+rowH*0.65);
      groups.forEach((g,i)=>{
        c.fillText(g.emoji+' '+g.name,colW*(i+1.5),50+rowH*0.65);
      });

      rows.forEach((row,ri)=>{
        const ry=50+(ri+1)*rowH;
        c.fillStyle=ri%2===0?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.4)';
        c.beginPath(); c.roundRect(10,ry,w-20,rowH,4); c.fill();
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
        c.fillText(row.label,colW*0.5,ry+rowH*0.65);
        groups.forEach((g,i)=>{
          const val=g[row.key];
          const isGood=val==='نعم'||val==='أبواغ'||val==='بذور'||val==='بذور في ثمار';
          c.fillStyle=val==='نعم'?'#27AE60':val==='لا'?'#E74C3C':g.color;
          c.font=`${Math.round(h*0.028)}px Tajawal`;
          const txt=val.length>6?val.substring(0,6)+'…':val;
          c.fillText(txt,colW*(i+1.5),ry+rowH*0.65);
        });
      });

    } else if(simState.selected) {
      const g=groups.find(x=>x.id===simState.selected);
      const bob=Math.sin(t*0.06)*4;

      // Scene background
      c.fillStyle=g.bg; c.fillRect(0,0,w,h);

      // Big emoji
      c.font=`${Math.round(h*0.18)}px serif`; c.textAlign='center';
      c.fillText(g.emoji,w*0.22,h*0.48+bob);

      // ── Info panel ────────────────────────────────────
      const _lh = Math.round(h*0.046);
      const _pad = 14;
      const _hdrH = _lh + 12;
      const _subH = Math.round(h*0.036);
      const _statsH = 48;
      const _ph = _hdrH + _subH + _pad + g.traits.length*_lh + _pad + _statsH + 8;
      const _pw = w*0.54;
      const _px = w*0.43;
      const _py = Math.max(6, Math.min(h*0.05, h - _ph - 6));

      // Card shadow + bg
      c.shadowColor='rgba(0,0,0,0.18)'; c.shadowBlur=18; c.shadowOffsetY=5;
      c.fillStyle='rgba(255,255,255,0.98)';
      c.beginPath(); c.roundRect(_px,_py,_pw,_ph,16); c.fill();
      c.shadowBlur=0; c.shadowOffsetY=0;
      c.strokeStyle=g.color; c.lineWidth=3; c.stroke();

      // Header strip
      c.fillStyle=g.color;
      c.beginPath(); c.roundRect(_px,_py,_pw,_hdrH,[16,16,0,0]); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
      c.fillText(g.emoji + '  ' + g.name, _px+_pw/2, _py+_hdrH-6);

      // Textbook sub-row
      const _exY = _py+_hdrH;
      c.fillStyle=g.color+'18'; c.fillRect(_px,_exY,_pw,_subH);
      c.fillStyle=g.color; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText('📖 الكتاب ' + g.textbook, _px+_pw/2, _exY+_subH-5);

      // Traits list
      const _listTop = _exY + _subH + _pad;
      g.traits.forEach((tr,ti)=>{
        const _ry = _listTop + ti*_lh;
        if(ti%2===1){ c.fillStyle='rgba(0,0,0,0.025)'; c.fillRect(_px,_ry,_pw,_lh); }
        // Bullet dot — right side (RTL)
        c.fillStyle=g.color+'BB';
        c.beginPath(); c.arc(_px+_pw-14, _ry+_lh*0.5, 4.5, 0, Math.PI*2); c.fill();
        // Text clipped
        c.fillStyle='#1E2D3D'; c.font=`${Math.round(h*0.027)}px Tajawal`; c.textAlign='right';
        c.save(); c.beginPath(); c.rect(_px+6, _ry, _pw-26, _lh); c.clip();
        c.fillText(tr, _px+_pw-22, _ry+_lh*0.72);
        c.restore();
      });

      // Stat badges
      const _statsY = _listTop + g.traits.length*_lh + 8;
      const _stats=[{l:'الحجم',v:g.size},{l:'التكاثر',v:g.repro},{l:'أزهار',v:g.flowers},{l:'بذور',v:g.seeds}];
      _stats.forEach((st,i)=>{
        const _bx=_px+8+i*(_pw-16)/4;
        const _bc=st.v==='نعم'?'rgba(39,174,96,0.85)':st.v==='لا'?'rgba(231,76,60,0.75)':g.color+'99';
        c.fillStyle=_bc; c.beginPath(); c.roundRect(_bx,_statsY,_pw/4-6,_statsH-4,8); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
        c.fillText(st.l, _bx+(_pw/4-6)/2, _statsY+16);
        c.font=`${Math.round(h*0.022)}px Tajawal`;
        const _sv=st.v.length>6?st.v.substring(0,5)+'…':st.v;
        c.fillText(_sv, _bx+(_pw/4-6)/2, _statsY+32);
      });

      document.getElementById('pInfo').innerHTML=`<strong style="color:${g.color}">${g.name}</strong>: ${g.traits[0]}`;

    } else {
      // Default: 4 دوائر قابلة للضغط
      c.fillStyle='rgba(30,77,43,0.7)'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
      c.fillText('اضغط على مجموعة نباتية لاستكشافها',w/2,30);

      groups.forEach((g,i)=>{
        const gx=(i%2)*w/2+w/4;
        const gy=Math.floor(i/2)*h/2+h/4;
        const bob=Math.sin(t*0.06+i*1.5)*4;
        const r=Math.min(w,h)*0.13;

        c.fillStyle=g.bg+'CC'; c.beginPath(); c.arc(gx,gy+bob,r,0,Math.PI*2); c.fill();
        c.strokeStyle=g.color; c.lineWidth=3; c.stroke();
        c.font=`${Math.round(h*0.1)}px serif`; c.textAlign='center';
        c.fillText(g.emoji,gx,gy+bob+12);
        c.fillStyle=g.color; c.font=`bold ${Math.round(h*0.035)}px Tajawal`;
        c.fillText(g.name,gx,gy+r+bob+24);
        c.fillStyle='#5A6A7A'; c.font=`${Math.round(h*0.025)}px Tajawal`;
        c.fillText(g.scene,gx,gy+r+bob+42);
      });

      // تسجيل onclick على الكانفاس
      const cv2=document.getElementById('simCanvas');
      cv2.onclick=function(ev){
        const rect=cv2.getBoundingClientRect();
        const mx=(ev.clientX-rect.left)*cv2.width/rect.width;
        const my=(ev.clientY-rect.top)*cv2.height/rect.height;
        groups.forEach((g,i)=>{
          const gx2=(i%2)*cv2.width/2+cv2.width/4;
          const gy2=Math.floor(i/2)*cv2.height/2+cv2.height/4;
          const r2=Math.min(cv2.width,cv2.height)*0.13;
          if(Math.hypot(mx-gx2,my-gy2)<r2+10){
            if(simState.selected===g.id){
              simState.selected=null; // ضغطة ثانية → ارجع
              document.getElementById('pInfo').textContent='اضغط على مجموعة لمعرفة خصائصها';
            } else {
              simState.selected=g.id; simState.compareMode=false;
              U9Sound.ping(440,0.12,0.1);
              document.getElementById('pInfo').innerHTML=`<strong style="color:${g.color}">${g.name}</strong>: ${g.traits[0]}`;
            }
            groups.forEach(g2=>{ const b=document.getElementById('bp_'+g2.id); if(b) b.style.background=g2.color+(simState.selected===g2.id?'44':'22'); });
          }
        });
      };
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-4 TAB 2 — فرز النباتات (drag & drop على شاشة)
// ══════════════════════════════════════════════════════════
function simPlantClass2() {
  const groupDefs = {
    moss:    {name:'حزازيّات', color:'#5D8A3C', x:0.12, y:0.8},
    fern:    {name:'سرخسيّات', color:'#27AE60', x:0.37, y:0.8},
    conifer: {name:'مخروطيّات', color:'#1A8FA8', x:0.62, y:0.8},
    flower:  {name:'زهريّات',   color:'#E74C3C', x:0.87, y:0.8}
  };

  const plantCards = [
    {id:0,name:'الطحلب',    group:'moss',    emoji:'🟢',hint:'صغير جداً في أماكن رطبة'},
    {id:1,name:'السرخس',    group:'fern',    emoji:'🌿',hint:'أوراقه خوص، الأبواغ على ظهرها'},
    {id:2,name:'شجرة الصنوبر',group:'conifer',emoji:'🌲',hint:'إبر وثمار مخروطية'},
    {id:3,name:'الورد',     group:'flower',  emoji:'🌹',hint:'ينتج أزهاراً جميلة'},
    {id:4,name:'الحزاز',    group:'moss',    emoji:'🟩',hint:'نبات صغير أخضر رطب'},
    {id:5,name:'نبات الفراولة',group:'flower',emoji:'🍓',hint:'ينتج أزهاراً وثماراً'},
    {id:6,name:'شجرة الأرز',group:'conifer', emoji:'🎄',hint:'شجرة كبيرة إبرية'},
    {id:7,name:'سرخس الشجر',group:'fern',   emoji:'🌴',hint:'سرخس كبير نادر'}
  ];

  // Scatter cards on the canvas
  const cards = plantCards.map((p,i) => ({
    ...p,
    cx: 0.1+(i%4)*0.22, cy:0.12+(Math.floor(i/4))*0.28,
    dragging:false, placed:null, animY:0
  }));

  simState = { t:0, cards, score:0, total:plantCards.length, dragging:null, dragX:0, dragY:0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎮 فرز النباتات — اسحب للتصنيف!</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);line-height:1.6;margin-top:4px">
        اسحب كل بطاقة نبات إلى مجموعتها الصحيحة في الأسفل
      </div>
    </div>
    <div id="p2Score" style="text-align:center;font-size:28px;font-weight:800;color:#27AE60;margin:10px 0">✅ 0 / 8</div>
    <button class="ctrl-btn" id="btnP2Reset" style="width:100%;background:rgba(231,76,60,0.15);border-color:rgba(231,76,60,0.4);color:#E74C3C">🔄 إعادة</button>
    <div class="info-box" id="p2Info">اسحب النبات إلى مجموعته الصحيحة!</div>
    <div class="q-box">
      <strong>❓ أسئلة الكتاب (ص٦٧):</strong><br>
      ١- صنّف النباتات الأربع المجموعات الصحيحة.<br>
      ٢- ما الفرق بين النباتات التي تُنتج بذوراً وتلك التي تُنتج أبواغاً؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- حزازيّات: أبواغ صغيرة رطبة. سرخسيّات: خوص وأبواغ على ظهرها. مخروطيّات: إبر ومخاريط. زهريّات: أزهار وثمار.<br>٢- البذور أكثر حمايةً وقدرةً على الانتشار من الأبواغ.</div>
  </div>
  `);

  btn('btnP2Reset',()=>{
    simState.cards.forEach(c=>{c.placed=null;c.cx=plantCards[c.id].cx||c.cx;c.cy=plantCards[c.id].cy||c.cy;});
    simState.score=0; document.getElementById('p2Score').textContent='✅ 0 / 8';
    document.getElementById('p2Info').textContent='اسحب النبات إلى مجموعته الصحيحة!';
    U9Sound.ping(330,0.2,0.15);
  });

  const canvas=document.getElementById('simCanvas');
  canvas.onmousedown=canvas.ontouchstart=function(e){
    e.preventDefault();
    const rect=canvas.getBoundingClientRect();
    const mx=(e.touches?e.touches[0].clientX:e.clientX)-rect.left;
    const my=(e.touches?e.touches[0].clientY:e.clientY)-rect.top;
    const w=canvas.width,h=canvas.height;
    for(let i=simState.cards.length-1;i>=0;i--){
      const cd=simState.cards[i];
      if(cd.placed) continue;
      const cx=cd.cx*w,cy=cd.cy*h;
      if(Math.abs(mx-cx)<45&&Math.abs(my-cy)<28){
        simState.dragging=cd.id; simState.dragX=mx; simState.dragY=my;
        break;
      }
    }
  };
  canvas.onmousemove=canvas.ontouchmove=function(e){
    e.preventDefault();
    if(simState.dragging===null) return;
    const rect=canvas.getBoundingClientRect();
    simState.dragX=(e.touches?e.touches[0].clientX:e.clientX)-rect.left;
    simState.dragY=(e.touches?e.touches[0].clientY:e.clientY)-rect.top;
  };
  canvas.onmouseup=canvas.ontouchend=function(e){
    if(simState.dragging===null) return;
    const w=canvas.width,h=canvas.height;
    const cd=simState.cards[simState.dragging];
    let dropped=false;
    Object.entries(groupDefs).forEach(([gid,gd])=>{
      const gx=gd.x*w, gy=gd.y*h;
      if(Math.hypot(simState.dragX-gx,simState.dragY-gy)<55){
        if(gid===cd.group){
          cd.placed=gid; simState.score++;
          document.getElementById('p2Score').textContent=`✅ ${simState.score} / 8`;
          document.getElementById('p2Info').innerHTML=`<span style="color:#27AE60">✅ صحيح! ${cd.name} من ${gd.name}</span>`;
          U9Sound.win();
          if(simState.score===8){ setTimeout(()=>{document.getElementById('p2Info').innerHTML='<span style="color:#27AE60">🎉 ممتاز! صنَّفت جميع النباتات!</span>';},300); }
        } else {
          document.getElementById('p2Info').innerHTML=`<span style="color:#E74C3C">❌ ليس كذلك. ${cd.hint}</span>`;
          U9Sound.ping(220,0.3,0.25);
          cd.cx=plantCards[cd.id].cx||cd.cx; cd.cy=plantCards[cd.id].cy||cd.cy;
        }
        dropped=true;
      }
    });
    if(!dropped){ cd.cx=simState.dragX/w; cd.cy=simState.dragY/h; }
    simState.dragging=null;
  };

  function draw(){
    if(currentSim!=='plantclass'||currentTab!==1) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F1F8E9'); bg.addColorStop(1,'#DCEDC8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E4D2B'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
    c.fillText('اسحب كل نبات إلى مجموعته الصحيحة',w/2,26);

    // Drop zones at bottom
    Object.entries(groupDefs).forEach(([gid,gd])=>{
      const gx=gd.x*w, gy=gd.y*h;
      const placed=simState.cards.filter(cd=>cd.placed===gid);
      const col=gd.color;
      c.fillStyle=col+'22'; c.beginPath(); c.arc(gx,gy,50,0,Math.PI*2); c.fill();
      c.strokeStyle=col; c.lineWidth=2.5; c.stroke();
      c.fillStyle=col; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText(gd.name,gx,gy+68);

      // Show placed cards in zone
      placed.forEach((p,pi)=>{
        const px=gx+(pi-placed.length/2+0.5)*32;
        c.font=`${Math.round(h*0.042)}px serif`; c.fillText(p.emoji,px,gy-10);
      });
    });

    // Plant cards (unplaced)
    simState.cards.forEach(cd=>{
      if(cd.placed) return;
      const isDrag=simState.dragging===cd.id;
      const cx=isDrag?simState.dragX:cd.cx*w;
      const cy=isDrag?simState.dragY:cd.cy*h;
      const bob=isDrag?0:Math.sin(t*0.06+cd.id*0.8)*3;

      c.fillStyle=isDrag?'rgba(255,255,255,0.98)':'rgba(255,255,255,0.88)';
      c.beginPath(); c.roundRect(cx-42,cy-24+bob,84,48,12); c.fill();
      c.strokeStyle=isDrag?'#1A8FA8':'rgba(0,0,0,0.15)';
      c.lineWidth=isDrag?3:1.5; c.stroke();

      c.font=`${Math.round(h*0.05)}px serif`; c.textAlign='center';
      c.fillText(cd.emoji,cx,cy+bob);
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText(cd.name,cx,cy+22+bob);
    });

    // Progress
    const done=simState.cards.filter(cd=>cd.placed).length;
    if(done===8){
      c.fillStyle='rgba(39,174,96,0.9)'; c.beginPath(); c.roundRect(w/2-80,h*0.42,160,40,20); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
      c.fillText('🎉 أحسنت! 8/8',w/2,h*0.42+26);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-5 TAB 1 — الفقاريّات الخمس (PhET explorer)
// ══════════════════════════════════════════════════════════
function simVertebrates1() {
  const classes = [
    { id:'fish',      name:'الأسماك',      color:'#3498DB', emoji:'🐟', habitat:'ماء',
      traits:['زعانف للسباحة','تتنفس بالخياشيم (Gills)','جسم مكسو بالقشور','تضع البيض في الماء','دم بارد'],
      example:'السردين، سمك القرش', x:0.1, y:0.45 },
    { id:'amphibian', name:'البرمائيّات',  color:'#27AE60', emoji:'🐸', habitat:'ماء + يابسة',
      traits:['جلد أملس رطب بلا قشور','تتنفس بالخياشيم (صغاراً) ثم بالرئتين','تضع البيض في الماء','تعيش في الماء واليابسة','دم بارد'],
      example:'الضفدع، السلمندر', x:0.29, y:0.42 },
    { id:'reptile',   name:'الزواحف',     color:'#E67E22', emoji:'🦎', habitat:'يابسة / ماء',
      traits:['جلد حرشفي جاف','تتنفس بالرئتين','تضع البيض على اليابسة','أربعة أرجل (أو لا أرجل)','دم بارد'],
      example:'الثعبان، التمساح', x:0.5, y:0.4 },
    { id:'bird',      name:'الطيور',       color:'#9B59B6', emoji:'🦅', habitat:'هواء + يابسة',
      traits:['ريش يغطي الجسم','أجنحة للطيران','تتنفس بالرئتين','تضع البيض على اليابسة','دم حار'],
      example:'النسر، البطريق', x:0.71, y:0.38 },
    { id:'mammal',    name:'الثدييّات',   color:'#E74C3C', emoji:'🦁', habitat:'متنوع',
      traits:['شعر يغطي الجسم','تلد أطفالاً أحياء','الأطفال يرضعون حليب الأم','تتنفس بالرئتين','دم حار'],
      example:'الأسد، الحوت', x:0.89, y:0.43 }
  ];

  simState = { t:0, selected:null, quizMode:false, quizQ:null, quizScore:0, quizTotal:0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🐾 الفقاريّات الخمس</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:6px">
      ${classes.map(cl=>`<button class="ctrl-btn" id="bvc_${cl.id}"
        style="width:100%;background:${cl.color}22;border-color:${cl.color}55;color:${cl.color};text-align:right;font-size:13px"
        onclick="(function(){simState.selected='${cl.id}';simState.quizMode=false;U9Sound.ping(440,0.18,0.12);})()">
        ${cl.emoji} ${cl.name} — ${cl.example}
      </button>`).join('')}
    </div>
    <button class="ctrl-btn" id="bvQuiz" style="width:100%;background:rgba(155,89,182,0.2);border-color:rgba(155,89,182,0.5);color:#9B59B6">🎯 اختبر نفسك!</button>
    <div class="info-box" id="vertInfo">اضغط على فئة لمعرفة خصائصها</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٦٩):</strong><br>١- قارن بين الأسماك والبرمائيّات في طريقة التنفس.<br>٢- ما الخاصية المشتركة بين جميع الفقاريّات؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الأسماك تتنفس بالخياشيم، البرمائيّات تتنفس بالرئتين والجلد.<br>٢- جميعها تمتلك عموداً فقرياً.</div>
  </div>
  `);

  const quizQs = classes.map(cl=>({
    q:`أيّ من هذه خاصيّة ${cl.name}؟`,
    correct:cl.traits[0], wrong:classes.filter(x=>x.id!==cl.id).map(x=>x.traits[0]).slice(0,3),
    classId:cl.id
  }));

  btn('bvQuiz',()=>{
    simState.quizMode=true; simState.selected=null; simState.quizScore=0; simState.quizTotal=0;
    simState.quizQ=[...quizQs].sort(()=>Math.random()-0.5)[0];
    simState.quizAnswered=false;
    const opts=[simState.quizQ.correct,...simState.quizQ.wrong].sort(()=>Math.random()-0.5);
    simState.quizOpts=opts;
    document.getElementById('vertInfo').textContent='اختر الإجابة الصحيحة';
    U9Sound.ping(440,0.2,0.15);
  });

  function draw(){
    if(currentSim!=='vertebrates'||currentTab!==0) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#E3F2FD'); bg.addColorStop(1,'#B3E5FC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Habitat zones
    c.fillStyle='#64B5F6'; c.fillRect(0,h*0.65,w*0.35,h*0.35); // water
    c.fillStyle='#66BB6A'; c.fillRect(w*0.35,h*0.65,w*0.65,h*0.35); // land
    c.fillStyle='rgba(255,255,255,0.15)'; c.fillRect(0,0,w,h*0.25); // sky

    c.fillStyle='rgba(0,0,0,0.35)'; c.font=`${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText('بحر',w*0.18,h*0.95); c.fillText('يابسة',w*0.7,h*0.95);

    c.fillStyle='rgba(0,0,0,0.5)'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`;
    c.fillText('الفقاريّات — اضغط على الحيوان',w/2,26);

    if(simState.quizMode && simState.quizQ) {
      const q=simState.quizQ;
      const cl=classes.find(x=>x.id===q.classId);
      const p=14; // padding

      // ── صندوق السؤال ──
      const qBoxH=Math.round(h*0.30);
      U9.rect(c,p,p,w-p*2,qBoxH,'rgba(0,0,0,0.50)','rgba(255,255,255,0.18)',14,1.5);

      // نص السؤال — يتكسر إلى سطرين تلقائياً
      c.fillStyle='white';
      c.font=`bold ${Math.round(h*0.038)}px Tajawal`;
      c.textAlign='center';
      // تقسيم السؤال
      const words=q.q.split(' ');
      let line1='',line2='';
      words.forEach(w2=>{ if((line1+w2).length<14) line1+=w2+' '; else line2+=w2+' '; });
      c.fillText(line1.trim(), w/2, p+Math.round(h*0.075));
      if(line2.trim()) c.fillText(line2.trim(), w/2, p+Math.round(h*0.118));

      // emoji الحيوان
      c.font=`${Math.round(h*0.10)}px serif`;
      c.fillText(cl.emoji, w/2, p+qBoxH-Math.round(h*0.04));

      // ── خيارات الإجابة (شبكة 2×2) ──
      const optGap=8;
      const optTop=qBoxH+p*2;
      const optW=(w-p*2-optGap)/2;
      const optH=Math.round((h-optTop-p*2-optGap)/2);

      simState.quizOpts.forEach((opt,i)=>{
        const col=i%2, row=Math.floor(i/2);
        const ox=p+col*(optW+optGap);
        const oy=optTop+row*(optH+optGap);
        const answered=simState.quizAnswered;
        const isCorrect=opt===q.correct;
        // خلفية الخيار واضحة
        let bgCol = answered
          ? (isCorrect ? '#27AE60' : simState.chosenOpt===opt ? '#E74C3C' : 'rgba(255,255,255,0.25)')
          : 'rgba(255,255,255,0.92)';
        c.shadowColor='rgba(0,0,0,0.12)'; c.shadowBlur=8;
        c.fillStyle=bgCol;
        c.beginPath();c.roundRect(ox,oy,optW,optH,14);c.fill();
        c.shadowBlur=0;
        c.strokeStyle=answered&&isCorrect?'#27AE60':answered&&simState.chosenOpt===opt?'#E74C3C':'rgba(100,100,200,0.25)';
        c.lineWidth=answered?3:1.5;c.stroke();

        // نص الخيار
        const fs=Math.max(13,Math.round(h*0.034));
        const textCol = answered
          ? (isCorrect ? '#fff' : simState.chosenOpt===opt ? '#fff' : 'rgba(30,45,61,0.45)')
          : '#1E2D3D';
        c.fillStyle=textCol;
        c.font=`bold ${fs}px Tajawal`;c.textAlign='center';
        // تقسيم إلى سطرين إذا لزم
        const words2=opt.split(' ');
        let ln1='',ln2='';
        words2.forEach(wd=>{ if((ln1+wd).length<=8) ln1+=wd+' '; else ln2+=wd+' '; });
        ln1=ln1.trim(); ln2=ln2.trim();
        if(ln2){
          c.fillText(ln1, ox+optW/2, oy+optH*0.42);
          c.fillText(ln2, ox+optW/2, oy+optH*0.68);
        } else {
          c.fillText(opt, ox+optW/2, oy+optH*0.57);
        }
        // أيقونة النتيجة
        if(answered){
          c.font=`${Math.round(optH*0.28)}px serif`;
          if(isCorrect) c.fillText('✅',ox+20,oy+Math.round(optH*0.32));
          else if(simState.chosenOpt===opt) c.fillText('❌',ox+20,oy+Math.round(optH*0.32));
        }
      });

      if(!simState.quizAnswered) {
        const canvas=document.getElementById('simCanvas');
        canvas.onclick=function(ev){
          const rect=canvas.getBoundingClientRect();
          const scaleX=w/rect.width, scaleY=h/rect.height;
          const mx=(ev.clientX-rect.left)*scaleX;
          const my=(ev.clientY-rect.top)*scaleY;
          // نفس حسابات الشبكة 2×2 الجديدة
          const p2=14;
          const qBoxH=Math.round(h*0.30);
          const optGap=8;
          const optTop=qBoxH+p2*2;
          const optW=(w-p2*2-optGap)/2;
          const optH=Math.round((h-optTop-p2*2-optGap)/2);
          simState.quizOpts.forEach((opt,i)=>{
            const col=i%2, row=Math.floor(i/2);
            const ox=p2+col*(optW+optGap);
            const oy=optTop+row*(optH+optGap);
            if(mx>=ox&&mx<=ox+optW&&my>=oy&&my<=oy+optH){
              simState.quizAnswered=true; simState.chosenOpt=opt;
              simState.quizTotal++;
              if(opt===q.correct){
                simState.quizScore++; U9Sound.win();
                document.getElementById('vertInfo').innerHTML=`<span style="color:#27AE60">✅ صحيح! (${simState.quizScore}/${simState.quizTotal})</span>`;
              } else {
                U9Sound.ping(220,0.3,0.25);
                document.getElementById('vertInfo').innerHTML=`<span style="color:#E74C3C">❌ الصحيح: ${q.correct}</span>`;
              }
              setTimeout(()=>{
                simState.quizQ=[...quizQs].sort(()=>Math.random()-0.5)[0];
                const opts=[simState.quizQ.correct,...simState.quizQ.wrong].sort(()=>Math.random()-0.5);
                simState.quizOpts=opts; simState.quizAnswered=false;
                document.getElementById('vertInfo').textContent='اختر الإجابة الصحيحة';
              },1500);
            }
          });
        };
      }

    } else {
      // Normal explorer view
      classes.forEach(cl=>{
        const gx=cl.x*w,gy=cl.y*h,sel=simState.selected===cl.id;
        const bob=Math.sin(t*0.07+cl.x*5)*4;

        if(sel){
          c.fillStyle=cl.color+'33'; c.beginPath(); c.arc(gx,gy+bob,36,0,Math.PI*2); c.fill();
          c.strokeStyle=cl.color; c.lineWidth=3; c.stroke();
        }

        c.font=`${Math.round(h*0.09)}px serif`; c.textAlign='center';
        c.fillText(cl.emoji,gx,gy+bob);

        c.fillStyle=sel?'rgba(255,255,255,0.95)':cl.color+'DD';
        c.beginPath(); c.roundRect(gx-44,gy+36+bob,88,20,10); c.fill();
        c.fillStyle=sel?cl.color:'white'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
        c.fillText(cl.name,gx,gy+50+bob);

        if(sel) {
          // Card dimensions — generous width, auto height
          const lh = Math.round(h*0.044);          // line height
          const pad = 12;
          const hdrH = lh + 10;                    // header (name only)
          const subH = lh - 4;                     // example row
          const ph = hdrH + subH + pad + cl.traits.length * lh + pad;
          const pw = Math.min(w*0.48, Math.max(w*0.32, 220));

          // Position: center on animal, open upward, clamp
          let bx = Math.max(pad, Math.min(gx - pw/2, w - pw - pad));
          let by = gy - ph - 18;
          if(by < pad) by = gy + 58;
          if(by + ph > h - pad) by = h - ph - pad;

          // Drop shadow
          c.shadowColor = 'rgba(0,0,0,0.22)';
          c.shadowBlur  = 20;
          c.shadowOffsetY = 5;

          // Card background
          c.fillStyle = 'rgba(255,255,255,0.98)';
          c.beginPath(); c.roundRect(bx, by, pw, ph, 14); c.fill();
          c.shadowBlur = 0; c.shadowOffsetY = 0;

          // Border
          c.strokeStyle = cl.color; c.lineWidth = 2.5;
          c.beginPath(); c.roundRect(bx, by, pw, ph, 14); c.stroke();

          // ── Header strip ──────────────────────────────
          c.fillStyle = cl.color;
          c.beginPath(); c.roundRect(bx, by, pw, hdrH, [14,14,0,0]); c.fill();

          c.fillStyle = 'white';
          c.font = `bold ${Math.round(h*0.033)}px Tajawal`;
          c.textAlign = 'center';
          c.fillText(cl.emoji + '  ' + cl.name, bx + pw/2, by + hdrH - 5);

          // ── Example row ───────────────────────────────
          const exY = by + hdrH;
          c.fillStyle = cl.color + '18';
          c.fillRect(bx, exY, pw, subH);
          c.fillStyle = cl.color;
          c.font = `${Math.round(h*0.023)}px Tajawal`;
          c.textAlign = 'center';
          c.fillText('📌 مثال: ' + cl.example, bx + pw/2, exY + subH - 3);

          // ── Traits list ───────────────────────────────
          const listTop = exY + subH + pad;
          cl.traits.forEach((tr, ti) => {
            const rowY = listTop + ti * lh;

            // Zebra stripe
            if (ti % 2 === 1) {
              c.fillStyle = 'rgba(0,0,0,0.025)';
              c.fillRect(bx, rowY, pw, lh);
            }

            // Bullet on the RIGHT side (RTL)
            const dotX = bx + pw - 14;
            const dotY = rowY + lh * 0.5;
            c.fillStyle = cl.color;
            c.beginPath(); c.arc(dotX, dotY, 4, 0, Math.PI*2); c.fill();

            // Text right-aligned, leaving room for bullet
            c.fillStyle = '#1E2D3D';
            c.font = `${Math.round(h*0.026)}px Tajawal`;
            c.textAlign = 'right';

            // Clip so text can't escape card
            c.save();
            c.beginPath();
            c.rect(bx + 6, rowY, pw - 26, lh);
            c.clip();
            c.fillText(tr, bx + pw - 22, rowY + lh * 0.72);
            c.restore();
          });

          document.getElementById('vertInfo').innerHTML =
            `<strong style="color:${cl.color}">${cl.name}:</strong> ${cl.traits[0]}`;
        }
      });

      // Onclick for explorer
      const canvas=document.getElementById('simCanvas');
      canvas.onclick=function(ev){
        const rect=canvas.getBoundingClientRect();
        const mx=ev.clientX-rect.left,my=ev.clientY-rect.top;
        classes.forEach(cl=>{
          if(Math.hypot(mx-cl.x*w,my-cl.y*h)<38){
            simState.selected = simState.selected===cl.id ? null : cl.id;
            if(simState.selected) U9Sound.ping(440,0.12,0.1);
          }
        });
      };
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-5 TAB 2 — تصنيف الحيوان (سلسلة بطاقات)
// ══════════════════════════════════════════════════════════
function simVertebrates2() {
  const animals = [
    {name:'السلمون',   class:'fish',      emoji:'🐠',clue:'يعيش كل حياته في الماء ويتنفس بالخياشيم',   funFact:'يهاجر مئات الكيلومترات للتكاثر!'},
    {name:'الضفدع',   class:'amphibian', emoji:'🐸',clue:'يبدأ في الماء ثم ينتقل إلى اليابسة',         funFact:'يمكنه التنفس عبر جلده في الماء'},
    {name:'التمساح',  class:'reptile',   emoji:'🐊',clue:'جلده حرشفي ويضع البيض على اليابسة',          funFact:'يحمي أطفاله بفمه حتى الماء!'},
    {name:'النسر',    class:'bird',      emoji:'🦅',clue:'له أجنحة وريش ويرى بحدة شديدة',              funFact:'يمكنه رؤية الفريسة من 3 كم!'},
    {name:'الحوت',    class:'mammal',    emoji:'🐋',clue:'يعيش في الماء لكنه يتنفس هواءً',             funFact:'أكبر حيوان على وجه الأرض'},
    {name:'السمندل',  class:'amphibian', emoji:'🦎',clue:'جلده رطب أملس يعيش قرب الماء',               funFact:'يستطيع إعادة نمو ذيله!'},
    {name:'الثعبان',  class:'reptile',   emoji:'🐍',clue:'جلده حرشفي وليس له أرجل',                   funFact:'يشم الهواء بلسانه'},
    {name:'الدلفين',  class:'mammal',    emoji:'🐬',clue:'يُرضع صغاره ويتنفس هواءً رغم عيشه بالبحر', funFact:'يتواصل بأصوات فريدة'}
  ];

  const clsDefs={fish:'أسماك🐟',amphibian:'برمائيّات🐸',reptile:'زواحف🦎',bird:'طيور🦅',mammal:'ثدييّات🦁'};
  const clsColors={fish:'#3498DB',amphibian:'#27AE60',reptile:'#E67E22',bird:'#9B59B6',mammal:'#E74C3C'};

  simState = {
    t:0, remaining:[...animals].sort(()=>Math.random()-0.5),
    current:null, score:0, total:animals.length,
    streak:0, fb:null, showFact:false
  };
  simState.current=simState.remaining.pop()||null;

  // expose globally before controls() renders buttons
  window.tryAnswerV2 = function(cls){ if(window._tryAnswerV2Fn) window._tryAnswerV2Fn(cls); };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎯 صنِّف الحيوان!</div>
    </div>
    <div id="v2Score" style="text-align:center;font-size:26px;font-weight:800;color:#3498DB;margin:6px 0">النقاط: 0 🔥0</div>
    <div class="ctrl-section">
      <div style="display:flex;flex-direction:column;gap:3px">
        ${Object.entries(clsDefs).map(([k,v])=>`<button class="ctrl-btn" id="bva_${k}"
          style="width:100%;background:${clsColors[k]}22;border-color:${clsColors[k]}55;color:${clsColors[k]}"
          onclick="tryAnswerV2('${k}')">${v}</button>`).join('')}
      </div>
    </div>
    <div class="info-box" id="v2Info">صنِّف الحيوان بناءً على وصفه!</div>
    <div class="q-box"><strong>💡 تذكّر:</strong><br>
      أسماك: خياشيم + قشور | برمائيّات: جلد رطب<br>
      زواحف: حراشف + بيض بر | طيور: ريش<br>
      ثدييّات: شعر + إرضاع
    </div>
  `);

  window._tryAnswerV2Fn = function(cls){
    if(!simState.current||simState.fb!=null) return;
    const ok=simState.current.class===cls;
    simState.fb=ok;
    if(ok){
      simState.score++; simState.streak++; U9Sound.correct();
      document.getElementById('v2Score').textContent=`النقاط: ${simState.score} 🔥${simState.streak}`;
      U9Sound.win();
      document.getElementById('v2Info').innerHTML=`<span style="color:#27AE60">✅ صحيح! ${simState.streak>2?'🔥سلسلة '+simState.streak+'!':''}</span><br><em>${simState.current.funFact}</em>`;
    } else {
      simState.streak=0;
      U9Sound.wrong();
      document.getElementById('v2Info').innerHTML=`<span style="color:#E74C3C">❌ ${simState.current.clue}</span>`;
      document.getElementById('v2Score').textContent=`النقاط: ${simState.score} 🔥0`;
    }
    setTimeout(()=>{
      simState.current=simState.remaining.pop()||null;
      simState.fb=null;
      if(simState.current) document.getElementById('v2Info').textContent='صنِّف الحيوان!';
    },ok?1400:1800);
  };

  function draw(){
    if(currentSim!=='vertebrates'||currentTab!==1) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;
    const p=16;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F3E5F5'); bg.addColorStop(1,'#E1F5FE');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // ── انتهاء اللعبة ──
    if(!simState.current){
      const perfect=simState.score===simState.total;
      const iconSize=Math.round(h*0.18);
      c.font=`${iconSize}px serif`; c.textAlign='center';
      c.fillText(perfect?'🏆':'🎉',w/2,h*0.3);
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.072)}px Tajawal`;
      c.fillText(perfect?'مثالي!':'أحسنت!',w/2,h*0.5);
      c.fillStyle=perfect?'#F4D03F':'#27AE60'; c.font=`bold ${Math.round(h*0.058)}px Tajawal`;
      c.fillText(`${simState.score} / ${simState.total}`,w/2,h*0.63);
      c.fillStyle='#5A6A7A'; c.font=`${Math.round(h*0.034)}px Tajawal`;
      c.fillText(perfect?'حصلت على كل الإجابات!':'جرِّب مجدداً 💪',w/2,h*0.74);
      animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
      return;
    }

    const an=simState.current;
    const bounce=Math.sin(t*0.08)*4;
    const answered=simState.fb!=null;
    const col=clsColors[an.class];

    // ── البطاقة — تملأ الكانفاس بالكامل تقريباً ──
    const cw=w-p*2, ch=h-p*2;
    const cx=p, cy=p+bounce;

    // خلفية البطاقة
    const cardBg=simState.fb===true?'#E8F5E9':simState.fb===false?'#FFEBEE':'white';
    c.shadowColor='rgba(0,0,0,0.15)'; c.shadowBlur=20; c.shadowOffsetY=4;
    c.fillStyle=cardBg;
    c.beginPath(); c.roundRect(cx,cy,cw,ch,20); c.fill();
    c.shadowBlur=0; c.shadowOffsetY=0;
    c.strokeStyle=simState.fb===true?'#27AE60':simState.fb===false?'#E74C3C':col+'66';
    c.lineWidth=3; c.stroke();

    // ── رأس البطاقة بلون الفئة ──
    const hdrH=Math.round(ch*0.14);
    c.fillStyle=col;
    c.beginPath(); c.roundRect(cx,cy,cw,hdrH,[20,20,0,0]); c.fill();
    // عداد المتبقي في الرأس
    const rem=simState.remaining.length+(simState.current?1:0);
    c.fillStyle='rgba(255,255,255,0.85)'; c.font=`${Math.round(h*0.028)}px Tajawal`; c.textAlign='left';
    c.fillText(`${rem}/${simState.total}`,cx+12,cy+hdrH*0.65);
    // النقاط في الرأس
    c.textAlign='right';
    c.fillText(`🔥 ${simState.streak}`,cx+cw-12,cy+hdrH*0.65);

    // ── الـ emoji ──
    const emojiY=cy+hdrH+Math.round(ch*0.24);
    if(!answered){ c.shadowColor=col+'55'; c.shadowBlur=24; }
    c.font=`${Math.round(h*0.22)}px serif`; c.textAlign='center';
    c.fillText(an.emoji,cx+cw/2,emojiY);
    c.shadowBlur=0;

    // ── اسم الحيوان ──
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.062)}px Tajawal`; c.textAlign='center';
    c.fillText(an.name,cx+cw/2,emojiY+Math.round(h*0.07));

    // ── وصف الحيوان (سطران) ──
    c.fillStyle='#5A6A7A'; c.font=`${Math.round(h*0.032)}px Tajawal`;
    const clue=an.clue;
    const midI=clue.lastIndexOf(' ',Math.floor(clue.length/2));
    const l1=clue.slice(0,midI>0?midI:Math.floor(clue.length/2));
    const l2=clue.slice(midI>0?midI+1:Math.floor(clue.length/2));
    const descY=emojiY+Math.round(h*0.12);
    c.fillText(l1,cx+cw/2,descY);
    c.fillText(l2,cx+cw/2,descY+Math.round(h*0.038));

    // ── نتيجة الإجابة ──
    if(simState.fb===true){
      c.fillStyle=col; c.font=`bold ${Math.round(h*0.04)}px Tajawal`;
      c.fillText('✅ '+clsDefs[an.class],cx+cw/2,descY+Math.round(h*0.09));
    } else if(simState.fb===false){
      c.fillStyle='#E74C3C'; c.font=`bold ${Math.round(h*0.035)}px Tajawal`;
      c.fillText('❌ '+an.clue.slice(0,20)+'…',cx+cw/2,descY+Math.round(h*0.09));
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-6 TAB 1 — اللافقاريّات (مختبر التصنيف)
// ══════════════════════════════════════════════════════════
function simInvertebrates1() {
  const groups = [
    { id:'mollusca',   name:'الرخويّات',           color:'#8E44AD', emoji:'🐌',
      traits:['جسم رخو غير مقسَّم','لها قدم عضليّة تساعدها على الحركة','بعضها له صدفة كالحلزون','مثل: الحلزون والأخطبوط والحبّار'],
      legCount:'لا أرجل', body:'قدم عضليّة', shell:'أحياناً', segments:'لا' },
    { id:'annelida',   name:'الحلقيّات',            color:'#E67E22', emoji:'🪱',
      traits:['جسم مقسَّم إلى حلقات (Segments)','لا أرجل حقيقية','لها أشواك (Setae) تساعدها','مثل: دودة الأرض وديدان البحر'],
      legCount:'لا أرجل', body:'حلقات', shell:'لا', segments:'نعم' },
    { id:'arthropoda', name:'مفصليّات الأرجل',      color:'#3498DB', emoji:'🦗',
      traits:['أرجل مفصليّة (Jointed legs)','هيكل خارجي صلب (Exoskeleton)','أكبر مجموعة حيوانية','تشمل: الحشرات والعناكب والسرطانات'],
      legCount:'مفصليّة (متعدد)', body:'هيكل خارجي', shell:'هيكل', segments:'أحياناً' },
    { id:'insecta',    name:'الحشرات',              color:'#27AE60', emoji:'🦋',
      traits:['ستة أرجل مفصليّة','جسم ثلاثة أجزاء: رأس وصدر وبطن','زوجان من الأجنحة','قرنا استشعار (Antennae)'],
      legCount:'٦ أرجل', body:'رأس+صدر+بطن', shell:'هيكل خارجي', segments:'٣ أجزاء' },
    { id:'arachnida',  name:'العنكبوتيّات',          color:'#E74C3C', emoji:'🕷️',
      traits:['ثمانية أرجل مفصليّة','جسمان فقط (الرأس-الصدر والبطن)','لا أجنحة ولا قرون استشعار','مثل: العناكب والعقارب والقراد'],
      legCount:'٨ أرجل', body:'جزءان', shell:'هيكل خارجي', segments:'٢ أجزاء' }
  ];

  simState = { t:0, selected:null, compareMode:false };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🦀 اللافقاريّات</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:6px">
      ${groups.map(g=>`<button class="ctrl-btn" id="biv_${g.id}"
        style="width:100%;background:${g.color}22;border-color:${g.color}55;color:${g.color};text-align:right;font-size:13px"
        onclick="(function(){simState.selected='${g.id}';simState.compareMode=false;U9Sound.ping(440,0.18,0.12);})()">
        ${g.emoji} ${g.name}
      </button>`).join('')}
    </div>
    <button class="ctrl-btn" id="bInvCmp" style="width:100%;background:rgba(52,152,219,0.2);border-color:rgba(52,152,219,0.5);color:#3498DB">📊 جدول المقارنة</button>
    <div class="info-box" id="invInfo">اضغط على مجموعة لاستكشافها</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٧١):</strong><br>١- ما الفرق بين الحشرات والعنكبوتيّات في عدد الأرجل وأجزاء الجسم؟<br>٢- اذكر مجموعتين من اللافقاريّات مع مثال لكلٍّ منهما.
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الحشرات: 6 أرجل و3 أجزاء. العناكب: 8 أرجل وجزءان.<br>٢- القشريّات (مثل: الجمبري) وشوكيّات الجلد (مثل: قنفذ البحر).
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الحشرات: 6 أرجل / 3 أجزاء. العناكب: 8 أرجل / جزءان.<br>٢- عدد الأرجل وعدد أجزاء الجسم.</div>
  </div>
  </div>
  `);

  btn('bInvCmp',()=>{ simState.compareMode=true; simState.selected=null; U9Sound.ping(523,0.2,0.18); });

  function draw(){
    if(currentSim!=='invertebrates'||currentTab!==0) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#FFF3E0'); bg.addColorStop(1,'#EFEBE9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(simState.compareMode) {
      c.fillStyle='#5D3A1A'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
      c.fillText('مقارنة مجموعات اللافقاريّات',w/2,28);

      const attrs=[{label:'الأرجل',key:'legCount'},{label:'الجسم',key:'body'},{label:'قشرة',key:'shell'},{label:'حلقات',key:'segments'}];
      const colW=w/(groups.length+1);
      const rowH=(h-60)/(attrs.length+1);

      // Header row
      c.fillStyle='rgba(94,58,26,0.8)'; c.beginPath(); c.roundRect(10,50,w-20,rowH,6); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText('الصفة',colW*0.5,50+rowH*0.67);
      groups.forEach((g,i)=>{
        c.font=`${Math.round(h*0.032)}px serif`;
        c.fillText(g.emoji,colW*(i+1.5),50+rowH*0.67);
      });

      attrs.forEach((attr,ri)=>{
        const ry=50+(ri+1)*rowH;
        c.fillStyle=ri%2===0?'rgba(255,255,255,0.7)':'rgba(255,255,255,0.4)';
        c.beginPath(); c.roundRect(10,ry,w-20,rowH,4); c.fill();
        c.fillStyle='#2C3A4A'; c.font=`bold ${Math.round(h*0.029)}px Tajawal`; c.textAlign='center';
        c.fillText(attr.label,colW*0.5,ry+rowH*0.67);
        groups.forEach((g,i)=>{
          const val=g[attr.key];
          c.fillStyle=val==='نعم'?'#27AE60':val==='لا'?'#E74C3C':g.color;
          c.font=`${Math.round(h*0.024)}px Tajawal`;
          const txt=val.length>7?val.substring(0,6)+'…':val;
          c.fillText(txt,colW*(i+1.5),ry+rowH*0.67);
        });
      });

    } else if(simState.selected) {
      const g=groups.find(x=>x.id===simState.selected);
      const bg2=c.createLinearGradient(0,0,0,h);
      bg2.addColorStop(0,'#FFF'); bg2.addColorStop(1,g.color+'11');
      c.fillStyle=bg2; c.fillRect(0,0,w,h);

      const bob=Math.sin(t*0.07)*5;
      c.font=`${Math.round(h*0.2)}px serif`; c.textAlign='center';
      c.fillText(g.emoji,w*0.2,h*0.52+bob);

      const _lh2 = Math.round(h*0.046);
      const _pad2 = 14;
      const _hdrH2 = _lh2 + 12;
      const _statsH2 = 48;
      const _ph2 = _hdrH2 + _pad2 + g.traits.length*_lh2 + _pad2 + _statsH2 + 8;
      const _pw2 = w*0.56;
      const _px2 = w*0.41;
      const _py2 = Math.max(6, Math.min(h*0.05, h - _ph2 - 6));

      // Card
      c.shadowColor='rgba(0,0,0,0.18)'; c.shadowBlur=18; c.shadowOffsetY=5;
      c.fillStyle='rgba(255,255,255,0.98)';
      c.beginPath(); c.roundRect(_px2,_py2,_pw2,_ph2,16); c.fill();
      c.shadowBlur=0; c.shadowOffsetY=0;
      c.strokeStyle=g.color; c.lineWidth=3; c.stroke();

      // Header
      c.fillStyle=g.color;
      c.beginPath(); c.roundRect(_px2,_py2,_pw2,_hdrH2,[16,16,0,0]); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
      c.fillText(g.emoji + '  ' + g.name, _px2+_pw2/2, _py2+_hdrH2-6);

      // Traits list
      const _listTop2 = _py2 + _hdrH2 + _pad2;
      g.traits.forEach((tr,i)=>{
        const _ry2 = _listTop2 + i*_lh2;
        if(i%2===1){ c.fillStyle='rgba(0,0,0,0.025)'; c.fillRect(_px2,_ry2,_pw2,_lh2); }
        // Bullet right (RTL)
        c.fillStyle=g.color+'BB';
        c.beginPath(); c.arc(_px2+_pw2-14, _ry2+_lh2*0.5, 4.5, 0, Math.PI*2); c.fill();
        // Clipped text
        c.fillStyle='#1E2D3D'; c.font=`${Math.round(h*0.027)}px Tajawal`; c.textAlign='right';
        c.save(); c.beginPath(); c.rect(_px2+6,_ry2,_pw2-26,_lh2); c.clip();
        c.fillText(tr, _px2+_pw2-22, _ry2+_lh2*0.72);
        c.restore();
      });

      // Stat badges
      const _statsY2 = _listTop2 + g.traits.length*_lh2 + 8;
      const _stats2=[{l:'الأرجل',v:g.legCount},{l:'الجسم',v:g.body},{l:'قشرة',v:g.shell},{l:'حلقات',v:g.segments}];
      _stats2.forEach((st,i)=>{
        const _bx2=_px2+8+i*(_pw2-16)/4;
        const _bc2=st.v==='نعم'?'rgba(39,174,96,0.85)':st.v==='لا'?'rgba(231,76,60,0.75)':g.color+'99';
        c.fillStyle=_bc2; c.beginPath(); c.roundRect(_bx2,_statsY2,_pw2/4-6,_statsH2-4,8); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`; c.textAlign='center';
        c.fillText(st.l, _bx2+(_pw2/4-6)/2, _statsY2+16);
        c.font=`${Math.round(h*0.022)}px Tajawal`;
        const _sv2=st.v.length>7?st.v.substring(0,6)+'…':st.v;
        c.fillText(_sv2, _bx2+(_pw2/4-6)/2, _statsY2+32);
      });


    } else {
      c.fillStyle='#5D3A1A'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
      c.fillText('اللافقاريّات — حيوانات بلا عمود فقري',w/2,28);

      groups.forEach((g,i)=>{
        const gx=(i%3)*w/3+w/6+(i>=3?(w/6):0);
        const gy=i<3?h*0.32:h*0.68;
        const bob=Math.sin(t*0.07+i*1.3)*4;
        const sel=simState.selected===g.id;

        // دائرة خلفية للمحددة
        if(sel){
          c.fillStyle=g.color+'22'; c.beginPath(); c.arc(gx,gy+bob-20,50,0,Math.PI*2); c.fill();
          c.strokeStyle=g.color; c.lineWidth=3; c.stroke();
        }

        c.font=`${Math.round(h*0.1)}px serif`; c.textAlign='center';
        c.fillText(g.emoji,gx,gy+bob);

        c.fillStyle=sel?g.color:g.color+'DD';
        c.beginPath(); c.roundRect(gx-55,gy+36+bob,110,24,12); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
        c.fillText(g.name,gx,gy+52+bob);
      });

      // onclick على الكانفاس
      const cvInv=document.getElementById('simCanvas');
      cvInv.onclick=function(ev){
        const rect=cvInv.getBoundingClientRect();
        const mx=(ev.clientX-rect.left)*cvInv.width/rect.width;
        const my=(ev.clientY-rect.top)*cvInv.height/rect.height;
        groups.forEach((g,i)=>{
          const gx=(i%3)*cvInv.width/3+cvInv.width/6+(i>=3?(cvInv.width/6):0);
          const gy=i<3?cvInv.height*0.32:cvInv.height*0.68;
          if(Math.hypot(mx-gx,my-gy)<65){
            if(simState.selected===g.id){
              simState.selected=null; // ضغطة ثانية → ارجع
              const el=document.getElementById('invInfo');
              if(el) el.textContent='اضغط على مجموعة لاستكشافها';
            } else {
              simState.selected=g.id; simState.compareMode=false;
              U9Sound.ping(440,0.12,0.1);
              const el=document.getElementById('invInfo');
              if(el) el.innerHTML=`<strong style="color:${g.color}">${g.emoji} ${g.name}</strong>: ${g.traits[0]}`;
            }
            groups.forEach(g2=>{
              const b=document.getElementById('biv_'+g2.id);
              if(b) b.style.background=g2.color+(g2.id===simState.selected?'44':'22');
            });
          }
        });
      };
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-6 TAB 2 — الحشرات والعناكب (تبديل بزر)
// ══════════════════════════════════════════════════════════
function simInvertebrates2() {

  // ── بيانات الحشرة ──
  const insectParts = [
    {id:'antennae', label:'قرنا الاستشعار', desc:'تُحسّ بالروائح واللمس والصوت',          tx:0.36, ty:0.03},
    {id:'head',     label:'الرأس',          desc:'يحتوي على العينين والفم وقرني الاستشعار', tx:0.36, ty:0.14},
    {id:'wings',    label:'الأجنحة',        desc:'زوجان من الأجنحة للطيران',              tx:0.36, ty:0.29},
    {id:'thorax',   label:'الصدر',          desc:'مركز الحركة — ترتبط به الأرجل والأجنحة', tx:0.36, ty:0.38},
    {id:'legs',     label:'الأرجل (٦)',     desc:'ستة أرجل مفصليّة ترتبط بالصدر',        tx:0.36, ty:0.50},
    {id:'abdomen',  label:'البطن',          desc:'يحتوي على معظم الأعضاء الداخلية',      tx:0.36, ty:0.64},
  ];


  simState.inv2Mode = 'insect';
  const isInsect = true;
  const parts = insectParts;
  const total = parts.length;

  const labelPositions = parts.map((_,i)=>({x:0.76, y:0.08+i*(0.84/Math.max(parts.length-1,1))}));
  const labels = parts.map((p,i)=>({...p, lx:labelPositions[i].x, ly:labelPositions[i].y, placed:false}));

  simState = { ...simState, t:0, labels, completed:0, dragging:null, dragX:0, dragY:0 };

  function rebuild() {
    const isIns = simState.inv2Mode==='insect';
    const lbs = isIns ? insectParts : spiderParts;
    const ttl = lbs.length;
    controls(`
<div class="ctrl-section">
  <div class="ctrl-label">${isIns?'🦋 سِمِّ أجزاء الحشرة':'🕷️ سِمِّ أجزاء العنكبوت'}</div>
  <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-top:3px">اسحب كل تسمية إلى مكانها الصحيح</div>
</div>

<div id="inv2Score" style="text-align:center;font-size:22px;font-weight:800;color:#27AE60;margin:6px 0">✅ 0 / ${ttl}</div>
<button class="ctrl-btn" id="btnInv2Reset" style="width:100%;background:rgba(231,76,60,0.15);border-color:rgba(231,76,60,0.4);color:#E74C3C">🔄 إعادة</button>
<div class="info-box" id="inv2Info">اسحب التسمية إلى الجزء الصحيح</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (ص٧١):</strong><br>
  ١- صنِّف الحيوانات إلى حشرات وعناكب.<br>
  ٢- ما أهم فرق بين الحشرات والعناكب؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">١- الحشرات: 6 أرجل / 3 أجزاء. العناكب: 8 أرجل / جزءان.<br>٢- عدد الأرجل وعدد أجزاء الجسم.</div>
</div>
    `);
    btn('btnInv2Reset',()=>{
      simState.labels.forEach((l,i)=>{ l.placed=false; l.lx=0.75; l.ly=0.10+i*0.16; });
      simState.completed=0;
      document.getElementById('inv2Score').textContent=`✅ 0 / ${ttl}`;
      document.getElementById('inv2Info').textContent='اسحب التسمية إلى الجزء الصحيح';
      U9Sound.ping(330,0.2,0.15);
    });
  }
  rebuild();

  const canvas=document.getElementById('simCanvas');

  function getXY(e){
    const r=canvas.getBoundingClientRect();
    const t2=e.touches&&e.touches[0]||e;
    return {x:(t2.clientX-r.left)*canvas.width/r.width, y:(t2.clientY-r.top)*canvas.height/r.height};
  }

  canvas.onmousedown=canvas.ontouchstart=function(e){
    e.preventDefault();
    const {x:mx,y:my}=getXY(e);
    for(let i=simState.labels.length-1;i>=0;i--){
      const l=simState.labels[i]; if(l.placed) continue;
      if(Math.abs(mx-l.lx*canvas.width)<55&&Math.abs(my-l.ly*canvas.height)<16){
        simState.dragging=l.id; simState.dragX=mx; simState.dragY=my; break;
      }
    }
  };
  canvas.onmousemove=canvas.ontouchmove=function(e){
    e.preventDefault();
    if(!simState.dragging) return;
    const {x,y}=getXY(e);
    simState.dragX=x; simState.dragY=y;
  };
  canvas.onmouseup=canvas.ontouchend=function(){
    if(!simState.dragging) return;
    const w2=canvas.width, h2=canvas.height;
    const lbl=simState.labels.find(l=>l.id===simState.dragging);
    const isIns=simState.inv2Mode==='insect';
    const R=Math.min(w2,h2)*0.06;
    if(Math.hypot(simState.dragX-lbl.tx*w2, simState.dragY-lbl.ty*h2)<R+20){
      lbl.placed=true; simState.completed++;
      document.getElementById('inv2Score').textContent=`✅ ${simState.completed} / ${simState.labels.length}`;
      document.getElementById('inv2Info').innerHTML=`<span style="color:#27AE60">✅ ${lbl.label}: ${lbl.desc}</span>`;
      U9Sound.correct();
      if(simState.completed===simState.labels.length){ U9Sound.win(); document.getElementById('inv2Info').innerHTML=`<span style="color:#27AE60">🎉 ممتاز! تعرَّفتِ على جميع أجزاء ${isIns?'الحشرة':'العنكبوت'}!</span>`; }
    } else {
      lbl.lx=0.75; lbl.ly=0.10+simState.labels.indexOf(lbl)*0.16;
      U9Sound.ping(220,0.15,0.12);
    }
    simState.dragging=null;
  };

  function drawInsect(c,bx,w,h){
    const sc=Math.min(w,h)/520; // scale factor
    const S=sc;

    // ── خيط تعليق ──
    c.strokeStyle='rgba(120,120,120,0.4)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(bx,0); c.lineTo(bx,h*0.06); c.stroke();

    // ── قرون الاستشعار ──
    c.strokeStyle='#3E2723'; c.lineWidth=2*S;
    c.beginPath(); c.moveTo(bx-6,h*0.11); c.quadraticCurveTo(bx-38*S,h*0.02,bx-30*S,h*-0.01); c.stroke();
    c.beginPath(); c.moveTo(bx+6,h*0.11); c.quadraticCurveTo(bx+38*S,h*0.02,bx+30*S,h*-0.01); c.stroke();
    c.fillStyle='#3E2723';
    c.beginPath(); c.arc(bx-30*S,h*-0.01,4*S,0,Math.PI*2); c.fill();
    c.beginPath(); c.arc(bx+30*S,h*-0.01,4*S,0,Math.PI*2); c.fill();

    // ── الرأس ──
    const headR=26*S;
    const headY=h*0.14;
    const hg=c.createRadialGradient(bx-headR*0.3,headY-headR*0.3,2,bx,headY,headR);
    hg.addColorStop(0,'#A1887F'); hg.addColorStop(1,'#6D4C41');
    c.beginPath(); c.arc(bx,headY,headR,0,Math.PI*2);
    c.fillStyle=hg; c.fill();
    c.strokeStyle='#4E342E'; c.lineWidth=2*S; c.stroke();
    // عيون
    [-1,1].forEach(side=>{
      c.fillStyle='#1A1A2E'; c.beginPath(); c.arc(bx+side*12*S,headY-4*S,6*S,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,0.7)'; c.beginPath(); c.arc(bx+side*10*S,headY-6*S,2.5*S,0,Math.PI*2); c.fill();
    });

    // ── الأجنحة (فوق الصدر) ──
    const wFlap=Math.sin(simState.t*0.12)*0.06;
    const wA=0.50+wFlap;
    const wingY=h*0.34;
    [[bx-68*S,wingY-8*S,0.5],[bx+68*S,wingY-8*S,-0.5],
     [bx-56*S,wingY+14*S,0.3],[bx+56*S,wingY+14*S,-0.3]].forEach(([wx,wy,rot])=>{
      c.beginPath(); c.ellipse(wx,wy,34*S,15*S,rot,0,Math.PI*2);
      c.fillStyle=`rgba(173,216,230,${wA})`; c.fill();
      c.strokeStyle='rgba(121,134,203,0.8)'; c.lineWidth=1.5*S; c.stroke();
      // عروق الجناح
      c.strokeStyle='rgba(100,120,180,0.3)'; c.lineWidth=S;
      c.beginPath(); c.moveTo(wx,wy); c.lineTo(wx+(rot>0?-20:20)*S,wy-10*S); c.stroke();
    });

    // ── الصدر ──
    const thoraxY=h*0.36;
    const thoraxRx=30*S, thoraxRy=28*S;
    const tg=c.createRadialGradient(bx-thoraxRx*0.3,thoraxY-thoraxRy*0.3,3,bx,thoraxY,thoraxRx);
    tg.addColorStop(0,'#8D6E63'); tg.addColorStop(1,'#5D4037');
    c.beginPath(); c.ellipse(bx,thoraxY,thoraxRx,thoraxRy,0,0,Math.PI*2);
    c.fillStyle=tg; c.fill(); c.strokeStyle='#4E342E'; c.lineWidth=2*S; c.stroke();

    // ── الأرجل ٦ (٣ أزواج من الصدر) ──
    const legPairs=[[h*0.29],[h*0.35],[h*0.41]];
    legPairs.forEach(([ly])=>{
      c.strokeStyle='#4E342E'; c.lineWidth=2.5*S;
      // يسار
      c.beginPath(); c.moveTo(bx-thoraxRx,ly);
      c.quadraticCurveTo(bx-70*S,ly+16*S,bx-80*S,ly+34*S); c.stroke();
      // يمين
      c.beginPath(); c.moveTo(bx+thoraxRx,ly);
      c.quadraticCurveTo(bx+70*S,ly+16*S,bx+80*S,ly+34*S); c.stroke();
    });

    // ── البطن ──
    const abdY=h*0.62;
    const abdRx=26*S, abdRy=42*S;
    const ag=c.createRadialGradient(bx-abdRx*0.3,abdY-abdRy*0.4,3,bx,abdY,abdRx);
    ag.addColorStop(0,'#795548'); ag.addColorStop(1,'#4E342E');
    c.beginPath(); c.ellipse(bx,abdY,abdRx,abdRy,0,0,Math.PI*2);
    c.fillStyle=ag; c.fill(); c.strokeStyle='#3E2723'; c.lineWidth=2*S; c.stroke();
    // حلقات البطن
    for(let i=1;i<5;i++){
      c.strokeStyle='rgba(0,0,0,0.12)'; c.lineWidth=1.5*S;
      c.beginPath(); c.ellipse(bx,abdY-abdRy*0.6+i*abdRy*0.26,abdRx*0.95,3*S,0,0,Math.PI*2); c.stroke();
    }

    // ── ظل ──
    c.fillStyle='rgba(0,0,0,0.07)'; c.beginPath();
    c.ellipse(bx,h*0.88,36*S,8*S,0,0,Math.PI*2); c.fill();
  }

  function drawSpider(c,bx,w,h){
    // أحجام ثابتة نسبة للكانفاس — لا scaling معقد
    const cR = Math.round(h*0.09);   // نصف قطر الرأس-الصدر
    const aR = Math.round(h*0.10);   // نصف قطر البطن أفقي
    const aRy= Math.round(h*0.13);   // نصف قطر البطن رأسي
    const cY = Math.round(h*0.30);   // مركز الرأس-الصدر
    const aY = Math.round(h*0.62);   // مركز البطن
    const lw = Math.max(3, Math.round(h*0.007)); // سماكة الأرجل

    // ── خيط من الأعلى ──
    c.strokeStyle='rgba(180,180,210,0.6)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(bx,0); c.lineTo(bx,cY-cR); c.stroke();

    // ── ٨ أرجل — قبل رسم الجسم لتظهر خلفه ──
    // ٤ أزواج، تخرج من جانبي الرأس-الصدر
    const legData=[
      // [dy_attach, mx_offset, my_offset, ex, ey]  — من مركز الرأس-الصدر
      {dy:-cR*0.5, mx: cR*2.2, my:-cR*0.3, ex: cR*3.2, ey: cR*0.8},
      {dy:-cR*0.1, mx: cR*2.5, my: cR*0.4, ex: cR*3.6, ey: cR*1.8},
      {dy: cR*0.3, mx: cR*2.5, my: cR*1.0, ex: cR*3.4, ey: cR*0.2},
      {dy: cR*0.6, mx: cR*2.0, my: cR*0.5, ex: cR*2.8, ey:-cR*0.5},
    ];
    c.strokeStyle='#546E7A'; c.lineWidth=lw;
    legData.forEach(({dy,mx,my,ex,ey})=>{
      // يسار
      c.beginPath();
      c.moveTo(bx-cR*0.8, cY+dy);
      c.quadraticCurveTo(bx-mx, cY+my, bx-ex, cY+ey);
      c.stroke();
      // يمين
      c.beginPath();
      c.moveTo(bx+cR*0.8, cY+dy);
      c.quadraticCurveTo(bx+mx, cY+my, bx+ex, cY+ey);
      c.stroke();
    });

    // ── رابط بين الجزءين ──
    c.strokeStyle='#455A64'; c.lineWidth=Math.round(h*0.012);
    c.beginPath(); c.moveTo(bx,cY+cR); c.lineTo(bx,aY-aRy); c.stroke();

    // ── البطن ──
    const ag=c.createRadialGradient(bx-aR*0.3,aY-aRy*0.3,4,bx,aY,aR*1.2);
    ag.addColorStop(0,'#607D8B'); ag.addColorStop(1,'#263238');
    c.beginPath(); c.ellipse(bx,aY,aR,aRy,0,0,Math.PI*2);
    c.fillStyle=ag; c.fill();
    c.strokeStyle='#1C313A'; c.lineWidth=2; c.stroke();
    // نقشة الساعة الرملية
    c.fillStyle='rgba(255,200,50,0.35)';
    c.beginPath(); c.ellipse(bx,aY-aRy*0.35,aR*0.4,aRy*0.2,0,0,Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(bx,aY+aRy*0.25,aR*0.4,aRy*0.2,0,0,Math.PI*2); c.fill();

    // ── الرأس-الصدر ──
    const cg=c.createRadialGradient(bx-cR*0.3,cY-cR*0.3,4,bx,cY,cR*1.1);
    cg.addColorStop(0,'#78909C'); cg.addColorStop(1,'#455A64');
    c.beginPath(); c.arc(bx,cY,cR,0,Math.PI*2);
    c.fillStyle=cg; c.fill();
    c.strokeStyle='#37474F'; c.lineWidth=2; c.stroke();

    // ── عيون ٨ واضحة ──
    const eR=Math.max(4,Math.round(cR*0.16));
    // صف خلفي ٤
    [[-cR*0.55,-cR*0.45],[- cR*0.18,-cR*0.52],[cR*0.18,-cR*0.52],[cR*0.55,-cR*0.45]].forEach(([ex,ey])=>{
      c.fillStyle='#0A0A1A'; c.beginPath(); c.arc(bx+ex,cY+ey,eR,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.arc(bx+ex-eR*0.4,cY+ey-eR*0.4,eR*0.4,0,Math.PI*2); c.fill();
    });
    // صف أمامي ٤
    [[-cR*0.38,-cR*0.15],[-cR*0.12,-cR*0.22],[cR*0.12,-cR*0.22],[cR*0.38,-cR*0.15]].forEach(([ex,ey])=>{
      c.fillStyle='#050510'; c.beginPath(); c.arc(bx+ex,cY+ey,eR*0.85,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,0.7)'; c.beginPath(); c.arc(bx+ex-eR*0.3,cY+ey-eR*0.3,eR*0.35,0,Math.PI*2); c.fill();
    });

    // ── الحريرة ──
    const spinY=aY+aRy-4;
    c.fillStyle='#546E7A'; c.beginPath(); c.ellipse(bx,spinY,Math.round(h*0.02),Math.round(h*0.015),0,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(180,180,210,0.5)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(bx-6,spinY+6); c.lineTo(bx-8,spinY+24); c.stroke();
    c.beginPath(); c.moveTo(bx,spinY+7); c.lineTo(bx,spinY+28); c.stroke();
    c.beginPath(); c.moveTo(bx+6,spinY+6); c.lineTo(bx+8,spinY+24); c.stroke();

    // ── ظل ──
    c.fillStyle='rgba(0,0,0,0.08)';
    c.beginPath(); c.ellipse(bx,h*0.91,Math.round(h*0.09),Math.round(h*0.018),0,0,Math.PI*2); c.fill();
  }

  function draw(){
    if(currentSim!=='invertebrates'||currentTab!==1) return;
    const c=ctx(), w=W(), h=H(); simState.t++;
    const isIns=simState.inv2Mode==='insect';
    const bx=w*0.28;

    // خلفية
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,isIns?'#E8F5E9':'#ECEFF1');
    bg.addColorStop(1,isIns?'#F3E5F5':'#CFD8DC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // عنوان
    c.fillStyle=isIns?'#1E4D2B':'#263238';
    c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
    c.fillText(isIns?'سِمِّ أجزاء الحشرة — اسحب التسميات!':'سِمِّ أجزاء العنكبوت — اسحب التسميات!', w/2, 26);

    // ارسم الحشرة أو العنكبوت
    if(isIns) drawInsect(c,bx,w,h);
    else drawSpider(c,bx,w,h);

    // دوائر الأهداف + تسميات الموضوعة
    simState.labels.forEach(lbl=>{
      const tx=lbl.tx*w, ty=lbl.ty*h;
      if(lbl.placed){
        c.fillStyle=isIns?'rgba(39,174,96,0.92)':'rgba(52,152,219,0.92)';
        c.beginPath(); c.roundRect(tx-46,ty-13,92,24,12); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
        c.fillText(lbl.label,tx,ty+5);
        // خط وصل
        c.strokeStyle=isIns?'rgba(39,174,96,0.35)':'rgba(52,152,219,0.35)';
        c.lineWidth=1.5; c.setLineDash([3,3]);
        c.beginPath(); c.moveTo(tx+46,ty); c.lineTo(bx-30,ty); c.stroke(); c.setLineDash([]);
      } else {
        c.strokeStyle=isIns?'rgba(39,174,96,0.45)':'rgba(52,152,219,0.45)';
        c.lineWidth=1.5; c.setLineDash([4,4]);
        c.beginPath(); c.arc(tx,ty,18,0,Math.PI*2); c.stroke(); c.setLineDash([]);
      }
    });

    // تسميات على اليمين
    simState.labels.forEach((lbl,i)=>{
      if(lbl.placed) return;
      const isDrag=simState.dragging===lbl.id;
      const lx=isDrag?simState.dragX:lbl.lx*w;
      const ly=isDrag?simState.dragY:lbl.ly*h;
      c.shadowColor=isDrag?'rgba(0,0,0,0.3)':'transparent'; c.shadowBlur=isDrag?12:0;
      c.fillStyle=isDrag?(isIns?'#27AE60':'#3498DB'):(isIns?'rgba(39,174,96,0.88)':'rgba(52,152,219,0.88)');
      c.beginPath(); c.roundRect(lx-52,ly-14,104,26,13); c.fill();
      if(isDrag){c.strokeStyle='#FFD700';c.lineWidth=2.5;c.stroke();}
      c.shadowBlur=0;
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.027)}px Tajawal`; c.textAlign='center';
      c.fillText(lbl.label,lx,ly+6);
    });

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-7 TAB 1 — المفتاح الثنائي التفاعلي
// ══════════════════════════════════════════════════════════
function simDichotomous1() {
  // Richer tree with more animals
  const tree = {
    q:'هل له أرجل؟', icon:'🦵',
    yes:{
      q:'هل له أكثر من ٦ أرجل؟', icon:'🔢',
      yes:{
        q:'هل جسمه مكوَّن من حلقات كثيرة؟', icon:'🔄',
        yes:{
          q:'هل له أكثر من ١٠٠ رجل؟', icon:'🦶',
          yes:{name:'المئويّات 🐛', col:'#6C3483', fact:'المئويّة لها زوج واحد من الأرجل لكل حلقة'},
          no:{name:'الألفيّات 🐌', col:'#8E44AD', fact:'الألفيّة لها زوجان من الأرجل لكل حلقة'}
        },
        no:{
          q:'هل يعيش في الماء؟', icon:'🌊',
          yes:{name:'سرطان البحر 🦀', col:'#E74C3C', fact:'لها ١٠ أرجل وتتنفس بالخياشيم'},
          no:{name:'العقرب 🦂', col:'#C0392B', fact:'له ٨ أرجل وذيل سام'}
        }
      },
      no:{
        q:'هل له ٨ أرجل؟', icon:'🕷️',
        yes:{
          q:'هل يبني شبكة؟', icon:'🕸️',
          yes:{name:'العنكبوت 🕷️', col:'#9B59B6', fact:'ينسج شبكة من الحرير لاصطياد فرائسه'},
          no:{name:'العنكبوتيّات 🦟', col:'#7D3C98', fact:'ثمانية أرجل لكن لا تبني شبكة'}
        },
        no:{
          q:'هل له أجنحة؟', icon:'🦋',
          yes:{
            q:'هل يُلقِّح الأزهار؟', icon:'🌸',
            yes:{name:'النحلة / الفراشة 🐝', col:'#27AE60', fact:'من أهم الحشرات الملقِّحة للنباتات'},
            no:{name:'الذبابة / البعوضة 🦟', col:'#E67E22', fact:'حشرة طائرة لا تُلقِّح الأزهار'}
          },
          no:{name:'النملة 🐜', col:'#D35400', fact:'ستة أرجل وجسم ثلاثي بلا أجنحة'}
        }
      }
    },
    no:{
      q:'هل له جسم طري بلا قشرة صلبة؟', icon:'🐌',
      yes:{
        q:'هل جسمه مقسَّم إلى حلقات؟', icon:'🔄',
        yes:{
          q:'هل يعيش في التربة؟', icon:'🌱',
          yes:{name:'دودة الأرض 🪱', col:'#27AE60', fact:'تُخصِّب التربة وتُهوِّيها بحفر الأنفاق'},
          no:{name:'دودة البحر 🌊', col:'#1A8FA8', fact:'تعيش في البحر وجسمها مُقسَّم إلى حلقات'}
        },
        no:{
          q:'هل له صدفة؟', icon:'🐚',
          yes:{name:'الحلزون 🐌', col:'#8E44AD', fact:'يحمل صدفته على ظهره ويتحرك ببطء'},
          no:{name:'البزاق 🐌', col:'#95A5A6', fact:'مثل الحلزون تماماً لكن بلا صدفة'}
        }
      },
      no:{
        q:'هل له قشرة صلبة خارجية؟', icon:'🦪',
        yes:{
          q:'هل يعيش في الماء؟', icon:'🌊',
          yes:{name:'المحار 🦪', col:'#2E86AB', fact:'يصفِّي الماء ويُنقِّيه ويعيش مُرفَقاً بالصخور'},
          no:{name:'الشاحوط 🐌', col:'#5D6D7E', fact:'يعيش على الأرض ولديه قشرة صلبة'}
        },
        no:{name:'نجم البحر ⭐', col:'#E74C3C', fact:'له ٥ أذرع ويتنفس عبر جلده'}
      }
    }
  };

  simState = { t:0, node:tree, path:[], history:[tree], answered:null };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔑 المفتاح الثنائي</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:4px;line-height:1.5">
        أجب بنعم أو لا على كل سؤال<br>لتصل لاسم الكائن الحيّ
      </div>
    </div>
    <div id="dkQuestion" style="background:rgba(255,255,255,0.12);border-radius:12px;padding:12px;margin:8px 0;font-size:15px;color:white;line-height:1.6;min-height:52px">...</div>
    <div style="display:flex;gap:8px;margin:8px 0">
      <button class="ctrl-btn" id="btnDYes" style="flex:1;background:rgba(39,174,96,0.25);border-color:rgba(39,174,96,0.6);color:#2DC653;font-size:20px;font-weight:800;padding:12px">نعم ✓</button>
      <button class="ctrl-btn" id="btnDNo"  style="flex:1;background:rgba(231,76,60,0.2);border-color:rgba(231,76,60,0.5);color:#E74C3C;font-size:20px;font-weight:800;padding:12px">لا ✗</button>
    </div>
    <button class="ctrl-btn" id="btnDBack" style="width:100%;margin-bottom:4px;background:rgba(212,144,26,0.15);border-color:rgba(212,144,26,0.4);color:#D4901A">⬅️ خطوة للوراء</button>
    <button class="ctrl-btn" id="btnDReset" style="width:100%;background:rgba(100,100,100,0.15);border-color:rgba(100,100,100,0.3);color:#AAA">🔄 ابدأ من جديد</button>
    <div class="info-box" id="dkResult" style="margin-top:6px">...</div>
  `);

  function updateQ(){
    const n=simState.node;
    if(n.q){
      document.getElementById('dkQuestion').innerHTML=`${n.icon||'❓'} ${n.q}`;
      document.getElementById('dkResult').textContent='أجب بنعم أو لا';
      document.getElementById('btnDYes').disabled=false;
      document.getElementById('btnDNo').disabled=false;
    } else {
      document.getElementById('dkQuestion').innerHTML=`🎉 الكائن الحيّ هو:<br><strong style="font-size:22px">${n.name}</strong>`;
      document.getElementById('dkResult').innerHTML=`<em style="color:${n.col}">💡 ${n.fact}</em>`;
      document.getElementById('btnDYes').disabled=true;
      document.getElementById('btnDNo').disabled=true;
      U9Sound.win();
    }
  }
  updateQ();

  btn('btnDYes',()=>{
    if(!simState.node || !simState.node.q) return;
    simState.history.push(simState.node);
    simState.path.push({q:simState.node.q,ans:'نعم'});
    simState.node=simState.node.yes;
    simState.answered='yes';
    updateQ(); U9Sound.ping(523,0.2,0.15);
  });
  btn('btnDNo',()=>{
    if(!simState.node.q) return;
    simState.history.push(simState.node);
    simState.path.push({q:simState.node.q,ans:'لا'});
    simState.node=simState.node.no;
    simState.answered='no';
    updateQ(); U9Sound.ping(392,0.2,0.12);
  });
  btn('btnDBack',()=>{
    if(simState.history.length>1){
      simState.node=simState.history.pop();
      simState.path.pop();
      simState.answered=null;
      updateQ(); U9Sound.ping(330,0.2,0.12);
    }
  });
  btn('btnDReset',()=>{
    simState.node=tree; simState.path=[]; simState.history=[tree]; simState.answered=null;
    updateQ(); U9Sound.ping(330,0.2,0.12);
  });

  // ── Step-by-step path display (replaces cramped tree) ──────────────────
  function draw(){
    if(currentSim!=='dichotomous'||currentTab!==0) return;
    const c=ctx(), w=W(), h=H(); simState.t++;
    const t = simState.t;
    const node = simState.node;

    // ── Background ──────────────────────────────────────────────────────
    const bg=c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#F0F7FF'); bg.addColorStop(1,'#FFF8EC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(!node.q) {
      // ── RESULT SCREEN ──────────────────────────────────────────────────
      const pulse = Math.sin(t*0.08)*5;
      c.fillStyle='rgba(255,255,255,0.92)';
      c.shadowColor='rgba(0,0,0,0.15)'; c.shadowBlur=24; c.shadowOffsetY=6;
      c.beginPath(); c.roundRect(w*0.1,h*0.18+pulse,w*0.8,h*0.52,24); c.fill();
      c.shadowBlur=0; c.shadowOffsetY=0;
      c.strokeStyle=node.col||'#27AE60'; c.lineWidth=4;
      c.beginPath(); c.roundRect(w*0.1,h*0.18+pulse,w*0.8,h*0.52,24); c.stroke();

      c.fillStyle=node.col||'#27AE60';
      c.beginPath(); c.roundRect(w*0.1,h*0.18+pulse,w*0.8,h*0.09,[24,24,0,0]); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
      c.fillText('🎉 وصلت!', w/2, h*0.18+h*0.065+pulse);

      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.07)}px serif`; c.textAlign='center';
      c.fillText(node.name, w/2, h*0.38+pulse);

      c.fillStyle='rgba(26,143,168,0.1)';
      c.beginPath(); c.roundRect(w*0.15,h*0.48+pulse,w*0.7,h*0.14,14); c.fill();
      c.fillStyle='#1A8FA8'; c.font=`${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText('💡 '+node.fact, w/2, h*0.565+pulse);

      c.fillStyle='rgba(0,0,0,0.35)'; c.font=`${Math.round(h*0.028)}px Tajawal`;
      c.fillText(`وصلت في ${simState.path.length} خطوات`, w/2, h*0.73+pulse);

      // Restart hint button
      const rbX=w/2-70, rbY=h*0.77, rbW=140, rbH=36;
      c.fillStyle='rgba(26,143,168,0.85)';
      c.beginPath(); c.roundRect(rbX,rbY,rbW,rbH,18); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.028)}px Tajawal`; c.textAlign='center';
      c.fillText('🔄 ابدأ من جديد', w/2, rbY+24);
      simState._resetBtn={x:rbX,y:rbY,w:rbW,h:rbH};

    } else {
      // ── QUESTION CARD ──────────────────────────────────────────────────
      const cardW = Math.min(w*0.82, 560);
      const cardH = Math.round(h*0.24);
      const cardX = (w-cardW)/2;
      const cardY = h*0.1;

      c.shadowColor='rgba(0,0,0,0.15)'; c.shadowBlur=20; c.shadowOffsetY=6;
      c.fillStyle='white';
      c.beginPath(); c.roundRect(cardX, cardY, cardW, cardH, 18); c.fill();
      c.shadowBlur=0; c.shadowOffsetY=0;

      c.fillStyle='#1A8FA8';
      c.beginPath(); c.roundRect(cardX,cardY,cardW,Math.round(cardH*0.34),[18,18,0,0]); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      // Compute max depth of tree dynamically
      function maxDepth(n){ if(!n||!n.q) return 0; return 1+Math.max(maxDepth(n.yes),maxDepth(n.no)); }
      const treeDepth = maxDepth(tree);
      c.fillText('السؤال ' + (simState.path.length+1) + ' من ' + treeDepth, w/2, cardY+Math.round(cardH*0.25));

      // Question text
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
      const qText=node.q;
      if(qText.length>16){
        const sp=qText.lastIndexOf(' ',Math.round(qText.length/2));
        const br=sp>0?sp:Math.round(qText.length/2);
        c.fillText(qText.substring(0,br), w/2, cardY+Math.round(cardH*0.62));
        c.fillText(qText.substring(br), w/2, cardY+Math.round(cardH*0.86));
      } else {
        c.fillText(qText, w/2, cardY+Math.round(cardH*0.72));
      }

      // ── YES / NO big interactive buttons ─────────────────────────────
      const btnY = cardY + cardH + 18;
      const btnW = (cardW*0.48);
      const btnH = Math.round(h*0.2);
      const yesX = (w-cardW)/2;
      const noX  = (w)/2 + 8;

      const yHov = simState._hoverBtn==='yes';
      const nHov = simState._hoverBtn==='no';
      const yPulse = yHov ? Math.sin(t*0.15)*3 : 0;
      const nPulse = nHov ? Math.sin(t*0.15)*3 : 0;

      // YES
      c.shadowColor='rgba(39,174,96,0.3)'; c.shadowBlur=yHov?20:8; c.shadowOffsetY=yHov?6:3;
      c.fillStyle = yHov ? '#27AE60' : 'rgba(39,174,96,0.12)';
      c.strokeStyle='#27AE60'; c.lineWidth=yHov?3:2;
      c.beginPath(); c.roundRect(yesX,btnY+yPulse,btnW,btnH,16); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      c.fillStyle = yHov ? 'white' : '#27AE60';
      c.font=`bold ${Math.round(h*0.048)}px Tajawal`; c.textAlign='center';
      c.fillText('✓', yesX+btnW/2, btnY+btnH*0.38+yPulse);
      c.font=`bold ${Math.round(h*0.034)}px Tajawal`;
      c.fillText('نعم', yesX+btnW/2, btnY+btnH*0.62+yPulse);
      if(node.yes){
        c.fillStyle = yHov ? 'rgba(255,255,255,0.8)' : 'rgba(39,174,96,0.65)';
        c.font=`${Math.round(h*0.022)}px Tajawal`;
        const yPrev=node.yes.q?('← '+node.yes.q.substring(0,16)):('🎯 '+node.yes.name.split(' ')[0]);
        c.fillText(yPrev, yesX+btnW/2, btnY+btnH*0.82+yPulse);
      }

      // NO
      c.shadowColor='rgba(231,76,60,0.3)'; c.shadowBlur=nHov?20:8; c.shadowOffsetY=nHov?6:3;
      c.fillStyle = nHov ? '#E74C3C' : 'rgba(231,76,60,0.1)';
      c.strokeStyle='#E74C3C'; c.lineWidth=nHov?3:2;
      c.beginPath(); c.roundRect(noX,btnY+nPulse,btnW,btnH,16); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      c.fillStyle = nHov ? 'white' : '#E74C3C';
      c.font=`bold ${Math.round(h*0.048)}px Tajawal`; c.textAlign='center';
      c.fillText('✗', noX+btnW/2, btnY+btnH*0.38+nPulse);
      c.font=`bold ${Math.round(h*0.034)}px Tajawal`;
      c.fillText('لا', noX+btnW/2, btnY+btnH*0.62+nPulse);
      if(node.no){
        c.fillStyle = nHov ? 'rgba(255,255,255,0.8)' : 'rgba(231,76,60,0.65)';
        c.font=`${Math.round(h*0.022)}px Tajawal`;
        const nPrev=node.no.q?('← '+node.no.q.substring(0,16)):('🎯 '+node.no.name.split(' ')[0]);
        c.fillText(nPrev, noX+btnW/2, btnY+btnH*0.82+nPulse);
      }

      // ── Back button (small) ────────────────────────────────────────────
      if(simState.path.length>0){
        const bkX=(w-80)/2, bkY=btnY+btnH+10;
        c.fillStyle='rgba(212,144,26,0.15)'; c.strokeStyle='rgba(212,144,26,0.5)'; c.lineWidth=1.5;
        c.beginPath(); c.roundRect(bkX,bkY,80,28,14); c.fill(); c.stroke();
        c.fillStyle='#D4901A'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
        c.fillText('⬅️ رجوع',w/2,bkY+19);
        simState._backBtn={x:bkX,y:bkY,w:80,h:28};
      } else { simState._backBtn=null; }

      // ── Breadcrumb ────────────────────────────────────────────────────
      if(simState.path.length>0){
        const crY=h-34;
        c.fillStyle='rgba(26,143,168,0.1)';
        c.beginPath(); c.roundRect(8,crY,w-16,28,10); c.fill();
        c.strokeStyle='rgba(26,143,168,0.25)'; c.lineWidth=1; c.stroke();
        const crText=simState.path.map((p,i)=>`${i+1}. ${p.ans}`).join(' → ');
        c.fillStyle='#1A8FA8'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
        c.fillText(crText, w/2, crY+19);
      }

      // Store button zones for click detection
      simState._yesBtn={x:yesX,y:btnY,w:btnW,h:btnH};
      simState._noBtn={x:noX,y:btnY,w:btnW,h:btnH};
    }

    // Update sidebar text
    const dkEl=document.getElementById('dkQuestion');
    const dkRes=document.getElementById('dkResult');
    if(dkEl){
      if(node.q) dkEl.innerHTML=`${node.icon||'❓'} ${node.q}`;
      else dkEl.innerHTML=`🎉 <strong>${node.name}</strong>`;
    }
    if(dkRes){
      if(node.q) dkRes.textContent='اضغط على الكانفس للإجابة';
      else dkRes.innerHTML=`<em style="color:${node.col}">💡 ${node.fact}</em>`;
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }

  // ── Canvas click handler ───────────────────────────────────────────────────
  const canvas=document.getElementById('simCanvas');
  canvas.onclick=function(ev){
    const rect=canvas.getBoundingClientRect();
    const mx=(ev.clientX-rect.left)*(canvas.width/rect.width);
    const my=(ev.clientY-rect.top)*(canvas.height/rect.height);
    const hit=(b)=>b&&mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h;
    if(hit(simState._resetBtn)){
      simState.node=tree; simState.path=[]; simState.history=[tree]; simState.answered=null;
      U9Sound.ping(330,0.2,0.12); return;
    }
    if(hit(simState._backBtn)){
      if(simState.history.length>1){ simState.node=simState.history.pop(); simState.path.pop(); simState.answered=null; }
      U9Sound.ping(330,0.2,0.12); return;
    }
    if(!simState.node.q) return;
    if(hit(simState._yesBtn)){
      simState.history.push(simState.node);
      simState.path.push({q:simState.node.q,ans:'نعم'});
      simState.node=simState.node.yes; simState.answered='yes';
      U9Sound.ping(523,0.22,0.15);
    } else if(hit(simState._noBtn)){
      simState.history.push(simState.node);
      simState.path.push({q:simState.node.q,ans:'لا'});
      simState.node=simState.node.no; simState.answered='no';
      U9Sound.ping(392,0.22,0.12);
    }
  };
  canvas.onmousemove=function(ev){
    const rect=canvas.getBoundingClientRect();
    const mx=(ev.clientX-rect.left)*(canvas.width/rect.width);
    const my=(ev.clientY-rect.top)*(canvas.height/rect.height);
    const hit=(b)=>b&&mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h;
    const prev=simState._hoverBtn;
    simState._hoverBtn=hit(simState._yesBtn)?'yes':hit(simState._noBtn)?'no':null;
    canvas.style.cursor=simState._hoverBtn||hit(simState._backBtn)||hit(simState._resetBtn)?'pointer':'default';
  };
  canvas.onmouseleave=function(){ simState._hoverBtn=null; };

  draw();
}

function simDichotomous2() {
  const animals=[
    {name:'نملة 🐜',   legs:6,  wings:false, segments:3, web:false, aquatic:false},
    {name:'عنكبوت 🕷️', legs:8,  wings:false, segments:2, web:true,  aquatic:false},
    {name:'سرطان 🦀',  legs:10, wings:false, segments:0, web:false,  aquatic:true},
    {name:'دودة 🪱',   legs:0,  wings:false, segments:'many',web:false,aquatic:false},
    {name:'بزاق 🐌',   legs:0,  wings:false, segments:0, web:false, aquatic:false},
    {name:'فراشة 🦋',  legs:6,  wings:true,  segments:3, web:false, aquatic:false},
    {name:'عقرب 🦂',   legs:8,  wings:false, segments:2, web:false, aquatic:false},
    {name:'نحلة 🐝',   legs:6,  wings:true,  segments:3, web:false, aquatic:false}
  ];

  const questions=[
    {text:'هل له أكثر من ٦ أرجل؟', key:'legs', check:v=>v>6},
    {text:'هل له أجنحة؟', key:'wings', check:v=>v===true},
    {text:'هل يعيش في الماء؟', key:'aquatic', check:v=>v===true},
    {text:'هل يبني شبكة؟', key:'web', check:v=>v===true},
    {text:'هل جسمه بلا أرجل؟', key:'legs', check:v=>v===0},
    {text:'هل جسمه ٣ أجزاء؟', key:'segments', check:v=>v===3}
  ];

  simState={t:0, selected:null, currentQ:null, remaining:[...animals], filtered:[...animals], qIdx:0, results:[], showAll:false};

  window.applyDichoQ = function(qi){ if(window._applyDichoQFn) window._applyDichoQFn(qi); };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🛠️ صمِّم مفتاحك!</div>
    </div>

    <div style="background:rgba(255,255,255,0.08);border-radius:12px;padding:10px;margin:6px 0">
      <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-bottom:6px">التقدّم</div>
      <div id="d2Remain" style="font-size:22px;font-weight:800;color:#FFD700;text-align:center">8</div>
      <div style="font-size:12px;color:rgba(255,255,255,0.6);text-align:center">حيوانات متبقّية</div>
      <div style="height:6px;background:rgba(255,255,255,0.15);border-radius:3px;margin-top:8px">
        <div id="d2Bar" style="height:6px;background:#FFD700;border-radius:3px;width:100%;transition:width 0.4s"></div>
      </div>
    </div>

    <div id="d2Log" style="background:rgba(255,255,255,0.06);border-radius:12px;padding:8px;margin:6px 0;min-height:60px;max-height:200px;overflow-y:auto;font-size:12px;color:rgba(255,255,255,0.8);line-height:1.7">
      <span style="color:rgba(255,255,255,0.4)">اضغط سؤالاً على الكانفس للبدء...</span>
    </div>

    <button class="ctrl-btn" id="btnDichoReset" style="width:100%;margin-top:4px;background:rgba(231,76,60,0.15);border-color:rgba(231,76,60,0.4);color:#E74C3C">🔄 إعادة</button>
    <div class="q-box" style="margin-top:8px"><strong>🎯 الهدف:</strong> استخدم أقل عدد من الأسئلة لتحديد حيوان واحد!</div>
  `);

  function updateD2Sidebar(){
    const rem=simState.filtered.length;
    const total=animals.length;
    const remEl=document.getElementById('d2Remain');
    const barEl=document.getElementById('d2Bar');
    if(remEl) remEl.textContent=rem;
    if(barEl) barEl.style.width=Math.round((rem/total)*100)+'%';
  }

  window._applyDichoQFn = function(qi){
    const q=questions[qi];
    const yes=simState.filtered.filter(a=>q.check(a[q.key]));
    const no=simState.filtered.filter(a=>!q.check(a[q.key]));
    simState.results.push({q:q.text,yes:yes.map(a=>a.name),no:no.map(a=>a.name)});
    // Show BOTH groups on canvas, let user choose which group to keep
    // Store split result so draw() can show YES/NO split
    simState.lastYes=yes;
    simState.lastNo=no;
    simState.pendingSplit=qi;
    U9Sound.ping(440+qi*20,0.2,0.15);

    // Update sidebar log
    const logEl=document.getElementById('d2Log');
    if(logEl){
      const yNames=yes.map(a=>a.name.split(' ')[0]).join('، ')||'—';
      const nNames=no.map(a=>a.name.split(' ')[0]).join('، ')||'—';
      logEl.innerHTML+=(simState.qIdx===0?'':'<hr style="border-color:rgba(255,255,255,0.1);margin:4px 0">') +
        `<div>📌 <strong>${q.text}</strong></div>` +
        `<div style="color:#2DC653">✓ نعم: ${yNames} (${yes.length})</div>` +
        `<div style="color:#FF6B6B">✗ لا: ${nNames} (${no.length})</div>`;
      logEl.scrollTop=logEl.scrollHeight;
    }
  };

  btn('btnDichoReset',()=>{
    simState.filtered=[...animals]; simState.qIdx=0; simState.results=[];
    simState.lastYes=null; simState.lastNo=null; simState.pendingSplit=null;
    if(simState.usedQs) simState.usedQs=[];
    const logEl=document.getElementById('d2Log');
    if(logEl) logEl.innerHTML='<span style="color:rgba(255,255,255,0.4)">اضغط سؤالاً على الكانفس للبدء...</span>';
    updateD2Sidebar();
    U9Sound.ping(330,0.2,0.15);
  });

  function draw(){
    if(currentSim!=='dichotomous'||currentTab!==1) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#EEF2FF'); bg.addColorStop(1,'#FCE4EC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // ── Title ──────────────────────────────────────────────────────────────
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
    c.fillText('🛠️ صمِّم مفتاحك — اضغط سؤالاً لتصفية الحيوانات', w/2, 28);

    simState._questionBtns = [];

    // ── MODE A: Showing YES/NO split after a question ──────────────────────
    if(simState.pendingSplit !== null && simState.lastYes && simState.lastNo){
      const q = questions[simState.pendingSplit];
      const yes = simState.lastYes;
      const no  = simState.lastNo;

      // Question banner
      c.fillStyle='rgba(26,143,168,0.12)';
      c.beginPath(); c.roundRect(w*0.05, 36, w*0.9, Math.round(h*0.1), 14); c.fill();
      c.strokeStyle='#1A8FA8'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(w*0.05, 36, w*0.9, Math.round(h*0.1), 14); c.stroke();
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.034)}px Tajawal`; c.textAlign='center';
      c.fillText('📌 ' + q.text, w/2, 36 + Math.round(h*0.065));

      // Instruction
      c.fillStyle='rgba(0,0,0,0.45)'; c.font=`${Math.round(h*0.026)}px Tajawal`;
      c.fillText('اختر المجموعة التي تريد الاستمرار بها:', w/2, 36 + Math.round(h*0.1) + 22);

      // ── YES group panel ──────────────────────────────────────────────────
      const panelTop = 36 + Math.round(h*0.1) + 42;
      const panelH   = Math.round(h*0.5);
      const panelW   = w*0.44;
      const yX = w*0.03;
      const nX = w*0.53;

      // YES panel
      const yHov = simState._hoverPanel === 'yes';
      c.shadowColor='rgba(39,174,96,0.25)'; c.shadowBlur=yHov?20:8; c.shadowOffsetY=3;
      c.fillStyle=yHov?'rgba(39,174,96,0.12)':'rgba(255,255,255,0.85)';
      c.strokeStyle='#27AE60'; c.lineWidth=yHov?3:1.5;
      c.beginPath(); c.roundRect(yX, panelTop, panelW, panelH, 16); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      c.fillStyle='#27AE60'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
      c.fillText(`✓ نعم  (${yes.length})`, yX+panelW/2, panelTop+32);
      // Animals grid in YES panel
      const yGrid = Math.ceil(yes.length / 2);
      yes.forEach((a, ai) => {
        const gc = ai % 2, gr = Math.floor(ai/2);
        const ax = yX + 12 + gc*(panelW/2-8) + (panelW/2-8)/2;
        const ay = panelTop + 50 + gr*(panelH-56)/Math.max(yGrid,1) + (panelH-56)/Math.max(yGrid,1)*0.5;
        c.font=`${Math.round(h*0.056)}px serif`; c.textAlign='center';
        c.fillText(a.name.split(' ')[1]||'🐾', ax, ay);
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`;
        c.fillText(a.name.split(' ')[0], ax, ay+Math.round(h*0.04));
        c.fillStyle='#27AE60';
      });

      // NO panel
      const nHov = simState._hoverPanel === 'no';
      c.shadowColor='rgba(231,76,60,0.25)'; c.shadowBlur=nHov?20:8; c.shadowOffsetY=3;
      c.fillStyle=nHov?'rgba(231,76,60,0.1)':'rgba(255,255,255,0.85)';
      c.strokeStyle='#E74C3C'; c.lineWidth=nHov?3:1.5;
      c.beginPath(); c.roundRect(nX, panelTop, panelW, panelH, 16); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      c.fillStyle='#E74C3C'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
      c.fillText(`✗ لا  (${no.length})`, nX+panelW/2, panelTop+32);
      const nGrid = Math.ceil(no.length/2);
      no.forEach((a, ai) => {
        const gc = ai%2, gr = Math.floor(ai/2);
        const ax = nX + 12 + gc*(panelW/2-8) + (panelW/2-8)/2;
        const ay = panelTop + 50 + gr*(panelH-56)/Math.max(nGrid,1) + (panelH-56)/Math.max(nGrid,1)*0.5;
        c.font=`${Math.round(h*0.056)}px serif`; c.textAlign='center';
        c.fillText(a.name.split(' ')[1]||'🐾', ax, ay);
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.022)}px Tajawal`;
        c.fillText(a.name.split(' ')[0], ax, ay+Math.round(h*0.04));
        c.fillStyle='#E74C3C';
      });

      // Store clickable panels
      simState._yesPanel={x:yX,y:panelTop,w:panelW,h:panelH};
      simState._noPanel ={x:nX, y:panelTop,w:panelW,h:panelH};

      // Hint arrow
      c.fillStyle='rgba(0,0,0,0.35)'; c.font=`${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
      c.fillText('اضغط على المجموعة التي تريد الاستمرار بها ↑', w/2, panelTop+panelH+28);

    } else {
      // ── MODE B: Normal question selection grid ──────────────────────────
      simState._yesPanel=null; simState._noPanel=null;

      // Animal grid (top 44%)
      const cols=4, gridTop=46, gridH=h*0.44;
      const cellW=w/cols, cellH=gridH/2;
      animals.forEach((a,i)=>{
        const col=i%cols, row=Math.floor(i/cols);
        const ax=col*cellW+cellW/2, ay=gridTop+row*cellH+cellH*0.44;
        const isActive=simState.filtered.includes(a);
        const bob=isActive?Math.sin(t*0.07+i*0.8)*4:0;
        if(isActive){
          c.shadowColor='rgba(26,143,168,0.2)'; c.shadowBlur=10;
          c.fillStyle='rgba(255,255,255,0.9)';
        } else {
          c.shadowBlur=0; c.fillStyle='rgba(200,200,200,0.25)';
        }
        c.beginPath(); c.roundRect(col*cellW+6,gridTop+row*cellH+4,cellW-12,cellH-8,14); c.fill();
        if(isActive){ c.strokeStyle='#1A8FA8'; c.lineWidth=2; c.stroke(); }
        c.shadowBlur=0;
        c.globalAlpha=isActive?1:0.2;
        c.font=`${Math.round(h*0.08)}px serif`; c.textAlign='center';
        c.fillText(a.name.split(' ')[1]||'🐾', ax, ay+bob);
        c.fillStyle=isActive?'#1E2D3D':'#888';
        c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
        c.fillText(a.name.split(' ')[0], ax, ay+Math.round(h*0.058)+bob);
        if(isActive){
          c.fillStyle='rgba(26,143,168,0.85)';
          c.beginPath(); c.roundRect(ax-28,ay+Math.round(h*0.068)+bob,56,16,8); c.fill();
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.019)}px Tajawal`;
          c.fillText(`أرجل: ${a.legs}`, ax, ay+Math.round(h*0.079)+bob);
        }
        c.globalAlpha=1;
      });

      // Divider
      const divY=gridTop+gridH+6;
      c.strokeStyle='rgba(26,143,168,0.25)'; c.lineWidth=1.5; c.setLineDash([5,4]);
      c.beginPath(); c.moveTo(10,divY); c.lineTo(w-10,divY); c.stroke(); c.setLineDash([]);

      // Remaining badge
      const remCount=simState.filtered.length;
      const badgeCol=remCount===1?'#27AE60':remCount<=3?'#E67E22':'#1A8FA8';
      c.fillStyle=badgeCol+'22'; c.beginPath(); c.roundRect(w/2-70,divY+4,140,22,11); c.fill();
      c.fillStyle=badgeCol; c.font=`bold ${Math.round(h*0.025)}px Tajawal`; c.textAlign='center';
      c.fillText(`متبقّي: ${remCount} حيوانات`, w/2, divY+19);

      // Question buttons grid (2 cols)
      const qAreaTop=divY+34;
      const qCols=2;
      const qBtnW=(w-24)/qCols - 4;
      const qBtnH=Math.round((h-qAreaTop-44) / Math.ceil(questions.length/qCols)) - 4;

      questions.forEach((q,i)=>{
        const qCol=i%qCols, qRow=Math.floor(i/qCols);
        const bx=12+qCol*(qBtnW+8);
        const by=qAreaTop+qRow*(qBtnH+4);
        const isUsed=simState.usedQs&&simState.usedQs.includes(i);
        const isHov=simState._hoverQ===i;
        c.shadowColor=isHov?'rgba(26,143,168,0.3)':'transparent'; c.shadowBlur=isHov?14:0;
        c.fillStyle=isUsed?'rgba(39,174,96,0.1)':isHov?'rgba(26,143,168,0.15)':'rgba(255,255,255,0.82)';
        c.strokeStyle=isUsed?'#27AE60':isHov?'#1A8FA8':'rgba(26,143,168,0.25)';
        c.lineWidth=isHov?2.5:1.5;
        c.beginPath(); c.roundRect(bx,by,qBtnW,qBtnH,10); c.fill(); c.stroke();
        c.shadowBlur=0;
        if(isUsed){
          c.fillStyle='rgba(39,174,96,0.2)'; c.beginPath(); c.roundRect(bx+qBtnW-26,by+3,22,15,7); c.fill();
          c.fillStyle='#27AE60'; c.font=`bold ${Math.round(h*0.018)}px Tajawal`; c.textAlign='center';
          c.fillText('✓',bx+qBtnW-15,by+13);
        }
        c.fillStyle=isUsed?'#5A7A5A':isHov?'#1A8FA8':'#1E2D3D';
        c.font=`bold ${Math.round(Math.min(h*0.026,qBtnH*0.4))}px Tajawal`; c.textAlign='right';
        c.fillText(q.text, bx+qBtnW-10, by+qBtnH*0.62);
        simState._questionBtns.push({x:bx,y:by,w:qBtnW,h:qBtnH,qi:i});
      });

      // Reset button
      const rstY=h-38;
      c.fillStyle=simState._hoverReset?'rgba(231,76,60,0.7)':'rgba(231,76,60,0.12)';
      c.strokeStyle='rgba(231,76,60,0.4)'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(w/2-52,rstY,104,28,14); c.fill(); c.stroke();
      c.fillStyle=simState._hoverReset?'white':'#E74C3C';
      c.font=`bold ${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText('🔄 إعادة', w/2, rstY+19);
      simState._resetBtn2={x:w/2-52,y:rstY,w:104,h:28};

      // Victory
      if(remCount===1){
        c.fillStyle='rgba(0,0,0,0.45)';
        c.beginPath(); c.roundRect(0,0,w,h,0); c.fill();
        c.fillStyle='rgba(39,174,96,0.95)';
        c.beginPath(); c.roundRect(w*0.1,h*0.28,w*0.8,h*0.2,20); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
        c.fillText(`🎉 ${simState.filtered[0].name}`, w/2, h*0.36);
        c.font=`${Math.round(h*0.028)}px Tajawal`;
        c.fillText(`في ${simState.qIdx} أسئلة فقط!`, w/2, h*0.4);
      }
    }

    updateD2Sidebar();
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  const canvas2=document.getElementById('simCanvas');
  canvas2.onclick=function(ev){
    const _r2=canvas2.getBoundingClientRect();
    const mx=(ev.clientX-_r2.left)*canvas2.width/_r2.width, my=(ev.clientY-_r2.top)*canvas2.height/_r2.height;
    const hit=(b)=>b&&mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h;

    // ── If in split mode, clicking YES or NO panel ──────────────────────
    if(simState.pendingSplit !== null){
      if(hit(simState._yesPanel)){
        simState.filtered = simState.lastYes;
        simState.qIdx++;
        if(!simState.usedQs) simState.usedQs=[];
        if(!simState.usedQs.includes(simState.pendingSplit)) simState.usedQs.push(simState.pendingSplit);
        simState.pendingSplit=null; simState.lastYes=null; simState.lastNo=null;
        updateD2Sidebar();
        U9Sound.ping(523,0.2,0.15);
        if(simState.filtered.length===1) U9Sound.win();
        return;
      }
      if(hit(simState._noPanel)){
        simState.filtered = simState.lastNo;
        simState.qIdx++;
        if(!simState.usedQs) simState.usedQs=[];
        if(!simState.usedQs.includes(simState.pendingSplit)) simState.usedQs.push(simState.pendingSplit);
        simState.pendingSplit=null; simState.lastYes=null; simState.lastNo=null;
        updateD2Sidebar();
        U9Sound.ping(392,0.2,0.12);
        if(simState.filtered.length===1) U9Sound.win();
        return;
      }
      return; // Ignore clicks outside panels while in split mode
    }

    // ── Normal mode: reset or question buttons ──────────────────────────
    if(hit(simState._resetBtn2)){
      simState.filtered=[...animals]; simState.qIdx=0; simState.usedQs=[];
      simState.pendingSplit=null; simState.lastYes=null; simState.lastNo=null;
      const logEl=document.getElementById('d2Log');
      if(logEl) logEl.innerHTML='<span style="color:rgba(255,255,255,0.4)">اضغط سؤالاً على الكانفس للبدء...</span>';
      updateD2Sidebar();
      U9Sound.ping(330,0.2,0.15); return;
    }
    if(simState._questionBtns){
      for(const btn of simState._questionBtns){
        if(hit(btn)){
          window._applyDichoQFn(btn.qi);
          if(!simState.usedQs) simState.usedQs=[];
          if(!simState.usedQs.includes(btn.qi)) simState.usedQs.push(btn.qi);
          return;
        }
      }
    }
  };
  canvas2.onmousemove=function(ev){
    const _r2=canvas2.getBoundingClientRect();
    const mx=(ev.clientX-_r2.left)*canvas2.width/_r2.width, my=(ev.clientY-_r2.top)*canvas2.height/_r2.height;
    const hit=(b)=>b&&mx>=b.x&&mx<=b.x+b.w&&my>=b.y&&my<=b.y+b.h;
    simState._hoverQ=null; simState._hoverReset=false;
    if(simState.pendingSplit !== null){
      simState._hoverPanel=hit(simState._yesPanel)?'yes':hit(simState._noPanel)?'no':null;
      canvas2.style.cursor=simState._hoverPanel?'pointer':'default';
      return;
    }
    simState._hoverPanel=null;
    simState._hoverReset=hit(simState._resetBtn2);
    if(simState._questionBtns){
      for(const btn of simState._questionBtns){
        if(hit(btn)){ simState._hoverQ=btn.qi; break; }
      }
    }
    canvas2.style.cursor=(simState._hoverQ!==null||simState._hoverReset)?'pointer':'default';
  };
  canvas2.onmouseleave=function(){ simState._hoverQ=null; simState._hoverReset=false; };

  if(!simState.usedQs) simState.usedQs=[];

  draw();
}


// ══════════════════════════════════════════════════════════
// 10-8 TAB 1 — الجينات والصفات (PhET-style)
// ══════════════════════════════════════════════════════════
function simGenetics1() {
  const traits={
    color:{ label:'لون الشعر 💇', color:'#2C3A4A',
      alleles:[{s:'B',name:'أسود',dom:true,col:'#2C3A4A'},{s:'b',name:'أشقر',dom:false,col:'#F4D03F'},{s:'R',name:'أحمر',dom:false,col:'#C0392B'}],
      combos:[{g:'BB',res:'أسود غامق',col:'#2C3A4A'},{g:'Bb',res:'أسود (حامل)',col:'#4A6274'},{g:'bb',res:'أشقر',col:'#F4D03F'},{g:'BR',res:'أسود',col:'#2C3A4A'},{g:'bR',res:'بني',col:'#8B4513'},{g:'RR',res:'أحمر',col:'#C0392B'}]
    },
    height:{ label:'الطول 📏', color:'#27AE60',
      alleles:[{s:'T',name:'طويل',dom:true,col:'#27AE60'},{s:'t',name:'قصير',dom:false,col:'#E67E22'}],
      combos:[{g:'TT',res:'طويل جداً',col:'#1A7A44'},{g:'Tt',res:'طويل',col:'#27AE60'},{g:'tt',res:'قصير',col:'#E67E22'}]
    },
    tongue:{ label:'طيّ اللسان 👅', color:'#8E44AD',
      alleles:[{s:'R',name:'يطوي',dom:true,col:'#8E44AD'},{s:'r',name:'لا يطوي',dom:false,col:'#95A5A6'}],
      combos:[{g:'RR',res:'يطوي (سائد)',col:'#8E44AD'},{g:'Rr',res:'يطوي',col:'#9B59B6'},{g:'rr',res:'لا يطوي',col:'#95A5A6'}]
    }
  };

  simState={t:0, trait:'color', hoveredCombo:null, showDNA:false};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧬 الجينات والصفات</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:3px;margin-bottom:6px">
      <button class="ctrl-btn on" id="bgt1" style="width:100%;background:rgba(44,58,74,0.3);border-color:rgba(44,58,74,0.6);color:#AAA">💇 لون الشعر</button>
      <button class="ctrl-btn" id="bgt2" style="width:100%;background:rgba(39,174,96,0.2);border-color:rgba(39,174,96,0.5);color:#27AE60">📏 الطول</button>
      <button class="ctrl-btn" id="bgt3" style="width:100%;background:rgba(142,68,173,0.2);border-color:rgba(142,68,173,0.5);color:#8E44AD">👅 طيّ اللسان</button>
    </div>
    <button class="ctrl-btn" id="bgtDNA" style="width:100%;margin-bottom:4px;background:rgba(26,143,168,0.2);border-color:rgba(26,143,168,0.5);color:#1A8FA8">🔬 أظهر الحمض النووي</button>
    <div class="info-box" id="genInfo">اضغط على تركيب جيني لمعرفة نتيجته</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٧٤):</strong><br>١- ما الفرق بين الجين والكروموسوم؟<br>٢- أين يوجد الحمض النووي في الخليّة؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الجين: تعليمة وراثيّة واحدة. الكروموسوم: يحتوي آلاف الجينات.<br>٢- في نواة الخليّة.</div>
  </div>
  `);

  function setTrait(key){
    simState.trait=key; simState.hoveredCombo=null;
    ['bgt1','bgt2','bgt3'].forEach(id=>document.getElementById(id).classList.remove('on'));
    document.getElementById('genInfo').innerHTML=`<strong>${traits[key].label}</strong>: اضغط على تركيب جيني`;
    U9Sound.ping(440,0.2,0.15);
  }
  btn('bgt1',()=>{document.getElementById('bgt1').classList.add('on');setTrait('color');});
  btn('bgt2',()=>{document.getElementById('bgt2').classList.add('on');setTrait('height');});
  btn('bgt3',()=>{document.getElementById('bgt3').classList.add('on');setTrait('tongue');});
  btn('bgtDNA',()=>{simState.showDNA=!simState.showDNA; U9Sound.ping(440,0.2,0.15);});

  const canvas=document.getElementById('simCanvas');
  canvas.onclick=function(ev){
    const rect=canvas.getBoundingClientRect();
    const mx=ev.clientX-rect.left,my=ev.clientY-rect.top;
    const w=canvas.width,h=canvas.height;
    const tr=traits[simState.trait];
    const comboW=Math.min((w-20)/tr.combos.length - 6, w*0.13);
    const totalComboW=(comboW+6)*tr.combos.length;
    const comboStartX=(w-totalComboW)/2+comboW/2;
    const comboAreaY=h*0.55;
    const bh=Math.min(h*0.32, h-comboAreaY-30);
    tr.combos.forEach((co,i)=>{
      const cx=comboStartX+i*(comboW+6);
      const cy=comboAreaY;
      if(Math.abs(mx-cx)<comboW/2 && my>=cy && my<=cy+bh){
        simState.hoveredCombo=i;
        document.getElementById('genInfo').innerHTML=`<strong style="color:${co.col}">${co.g}</strong>: ${co.res}`;
        U9Sound.ping(400+i*30,0.2,0.15);
      }
    });
  };


  function draw(){
    if(currentSim!=='genetics'||currentTab!==0) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;
    const tr=traits[simState.trait];

    const bg=c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#FCE4EC'); bg.addColorStop(1,'#E3F2FD');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
    c.fillText('الجينات تحدِّد: '+tr.label,w/2,28);

    if(simState.showDNA){
      // DNA helix visualization
      const hx=w*0.18, hy=h*0.35, hH=h*0.5;
      c.fillStyle='#5A6A7A'; c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText('الحمض النووي DNA',hx,hy-14);
      for(let i=0;i<24;i++){
        const py=hy+i*(hH/24);
        const s1x=hx+Math.sin(i*0.65+t*0.04)*22;
        const s2x=hx-Math.sin(i*0.65+t*0.04)*22;
        const cols1=['#E74C3C','#3498DB','#27AE60','#F39C12'];
        c.beginPath(); c.arc(s1x,py,3.5,0,Math.PI*2);
        c.fillStyle=cols1[i%4]; c.fill();
        c.beginPath(); c.arc(s2x,py,3.5,0,Math.PI*2);
        c.fillStyle=cols1[(i+2)%4]; c.fill();
        c.strokeStyle='rgba(0,0,0,0.12)'; c.lineWidth=1;
        c.beginPath(); c.moveTo(s1x,py); c.lineTo(s2x,py); c.stroke();
      }
      c.strokeStyle='rgba(52,152,219,0.35)'; c.lineWidth=1.5; c.setLineDash([3,3]);
      c.beginPath();
      for(let i=0;i<=24;i++){const py=hy+i*(hH/24);const sx=hx+Math.sin(i*0.65+t*0.04)*22;i===0?c.moveTo(sx,py):c.lineTo(sx,py);}
      c.stroke(); c.setLineDash([]);

      // Arrow pointing to a segment
      const highlightY=hy+8*(hH/24);
      c.fillStyle='rgba(231,76,60,0.85)'; c.beginPath(); c.roundRect(hx+30,highlightY-12,80,24,12); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.026)}px Tajawal`; c.textAlign='center';
      c.fillText('هذا جين!',hx+70,highlightY+5);
      c.strokeStyle='#E74C3C'; c.lineWidth=2;
      c.beginPath(); c.moveTo(hx+28,highlightY); c.lineTo(hx+10,highlightY); c.stroke();
    }

    // Alleles section — fixed contrast + sizing
    const alL=simState.showDNA?w*0.42:w*0.08;
    const alW=w*0.9-alL;
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='right';
    c.fillText('الأليلات:',w-12,h*0.11);
    tr.alleles.forEach((al,i)=>{
      const ay=h*0.17+i*h*0.1;
      // Bar background (slightly lighter to ensure contrast)
      c.fillStyle=al.col+'EE'; c.beginPath(); c.roundRect(alL,ay-16,alW,32,10); c.fill();
      // Darker left badge with symbol
      c.fillStyle='rgba(0,0,0,0.25)'; c.beginPath(); c.roundRect(alL,ay-16,50,32,[10,0,0,10]); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
      c.fillText(al.s,alL+25,ay+6);
      // Name + dominance on right
      const domLabel=al.dom?'(سائد 👑)':'(متنحٍّ)';
      c.font=`bold ${Math.round(h*0.03)}px Tajawal`; c.textAlign='right';
      c.fillText(`${al.name} ${domLabel}`,alL+alW-10,ay+6);
    });

    // Combos — fixed sizing to fit canvas
    const comboAreaY=h*0.55;
    const comboW=Math.min((w-20)/tr.combos.length - 6, w*0.13);
    const totalComboW=(comboW+6)*tr.combos.length;
    const comboStartX=(w-totalComboW)/2+comboW/2;
    const bh=Math.min(h*0.32, h-comboAreaY-30);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('اضغط على تركيب جيني:',w/2,comboAreaY-12);

    tr.combos.forEach((co,i)=>{
      const cx=comboStartX+i*(comboW+6);
      const cy=comboAreaY;
      const sel=simState.hoveredCombo===i;
      const pulse=sel?Math.sin(t*0.12)*4:0;
      // Card
      c.fillStyle=sel?co.col:co.col+'CC';
      c.beginPath(); c.roundRect(cx-comboW/2,cy+pulse,comboW,bh,12); c.fill();
      if(sel){c.strokeStyle='#FFD700';c.lineWidth=3;c.stroke();}
      // Gene label — large
      c.fillStyle='white'; c.font=`bold ${Math.round(Math.min(h*0.048,comboW*0.35))}px Tajawal`; c.textAlign='center';
      c.fillText(co.g,cx,cy+bh*0.38+pulse);
      // Result — wrapped
      c.font=`${Math.round(h*0.026)}px Tajawal`;
      const res=co.res; const half=Math.ceil(res.length/2);
      if(res.length>5){
        const sp=res.lastIndexOf(' ',half);
        const br=sp>0?sp:half;
        c.fillText(res.substring(0,br),cx,cy+bh*0.6+pulse);
        c.fillText(res.substring(br),cx,cy+bh*0.76+pulse);
      } else {
        c.fillText(res,cx,cy+bh*0.62+pulse);
      }
      if(sel){
        c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(cx-comboW/2+2,cy+bh-20+pulse,comboW-4,18,[0,0,10,10]); c.fill();
        c.fillStyle=co.col; c.font=`bold ${Math.round(h*0.022)}px Tajawal`;
        c.fillText('✓ مختار',cx,cy+bh-6+pulse);
      }
    });

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// 10-8 TAB 2 — انتقال الجينات (مربع بانيت تفاعلي)
// ══════════════════════════════════════════════════════════
function simGenetics2() {
  const geneOptions=['B','b','T','t','R','r'];
  const geneColors={B:'#2C3A4A',b:'#F4D03F',T:'#27AE60',t:'#E67E22',R:'#8E44AD',r:'#95A5A6'};
  const geneNames={B:'أسود',b:'أشقر',T:'طويل',t:'قصير',R:'يطوي',r:'لا يطوي'};
  const geneDom={B:true,b:false,T:true,t:false,R:true,r:false};

  simState={t:0,fGene:'B',mGene:'b',offspring:[],spinStart:0,punnetMode:false};

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">👨‍👩‍👧 انتقال الجينات</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">جين الأب 👨:</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px">
        ${geneOptions.map(g=>`<button class="ctrl-btn" id="fg_${g}"
          style="flex:1;min-width:30px;background:${geneColors[g]}33;border-color:${geneColors[g]}77;color:${geneColors[g]};font-weight:800;font-size:16px"
          onclick="(function(){simState.fGene='${g}';U9Sound.ping(440,0.18,0.12);})()">
          ${g}
        </button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">جين الأم 👩:</div>
      <div style="display:flex;flex-wrap:wrap;gap:3px">
        ${geneOptions.map(g=>`<button class="ctrl-btn" id="mg_${g}"
          style="flex:1;min-width:30px;background:${geneColors[g]}33;border-color:${geneColors[g]}77;color:${geneColors[g]};font-weight:800;font-size:16px"
          onclick="(function(){simState.mGene='${g}';U9Sound.ping(440,0.18,0.12);})()">
          ${g}
        </button>`).join('')}
      </div>
    </div>
    <div style="display:flex;gap:6px;margin:6px 0">
      <button class="ctrl-btn" id="btnInherit" style="flex:2;background:rgba(231,76,60,0.2);border-color:rgba(231,76,60,0.5);color:#E74C3C;font-weight:800">🧬 أنتج جيلاً!</button>
      <button class="ctrl-btn" id="btnPunnet" style="flex:1;background:rgba(52,152,219,0.2);border-color:rgba(52,152,219,0.5);color:#3498DB;font-size:12px">مربع بانيت</button>
    </div>
    <div class="info-box" id="gen2Info">اختر جيناتهما ثم أنتج جيلاً جديداً</div>
    <div class="q-box"><strong>❓ ص٧٧:</strong> إذا كان الأب (Bb) والأم (Bb) — ما احتمالات ألوان شعر الأبناء؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
    <div class="q-ans-panel">BB (25%) شعر داكن — Bb (50%) شعر داكن — bb (25%) شعر فاتح.<br>النتيجة: 75% داكن، 25% فاتح.</div>
  </div>
  `);

  btn('btnInherit',()=>{
    const f=simState.fGene, m=simState.mGene;
    simState.offspring=[
      {g:f+f,fromF:f,fromM:f},{g:f+m,fromF:f,fromM:m},
      {g:m+f,fromF:m,fromM:f},{g:m+m,fromF:m,fromM:m}
    ];
    simState.spinStart=simState.t; simState.punnetMode=false;
    U9Sound.ping(523,0.25,0.2);
    const fc=geneColors[f]||'#3498DB',mc=geneColors[m]||'#E74C3C';
    document.getElementById('gen2Info').innerHTML=
      `<strong style="color:${fc}">${f}=${geneNames[f]||''}</strong> × <strong style="color:${mc}">${m}=${geneNames[m]||''}</strong> → أربعة احتمالات`;
  });
  btn('btnPunnet',()=>{ simState.punnetMode=!simState.punnetMode; U9Sound.ping(440,0.2,0.15); });

  function draw(){
    if(currentSim!=='genetics'||currentTab!==1) return;
    const c=ctx(),w=W(),h=H(); simState.t++;
    const t=simState.t;
    const gc=geneColors,gn=geneNames;

    const bg=c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#E8F5E9'); bg.addColorStop(1,'#E8EAF6');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.042)}px Tajawal`; c.textAlign='center';
    c.fillText('انتقال الجينات من الآباء إلى الأبناء',w/2,28);

    const fCol=gc[simState.fGene]||'#3498DB';
    const mCol=gc[simState.mGene]||'#E74C3C';

    if(simState.punnetMode && simState.offspring.length>0){
      // Punnett square
      const sq=Math.min(w*0.55,h*0.55), sx=w*0.22, sy=h*0.18;
      const cell=sq/2;
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.038)}px Tajawal`; c.textAlign='center';
      c.fillText('مربع بانيت',w/2,sy-16);

      // Headers
      c.fillStyle=fCol; c.font=`bold ${Math.round(h*0.05)}px Tajawal`;
      c.fillText(simState.fGene,sx+cell*0.5,sy-4);
      c.fillText(simState.fGene,sx+cell*1.5,sy-4);
      c.fillStyle=mCol;
      c.save(); c.translate(sx-12,sy+cell*0.5); c.rotate(-Math.PI/2); c.fillText(simState.mGene,0,0); c.restore();
      c.save(); c.translate(sx-12,sy+cell*1.5); c.rotate(-Math.PI/2); c.fillText(simState.mGene,0,0); c.restore();

      simState.offspring.forEach((off,i)=>{
        const col2=i%2, row2=Math.floor(i/2);
        const cx=sx+col2*cell, cy=sy+row2*cell;
        c.fillStyle=gc[off.fromF]||'#888';
        c.beginPath(); c.rect(cx,cy,cell,cell); c.fill();
        c.fillStyle='rgba(255,255,255,0.08)'; c.fillRect(cx,cy,cell/2,cell);
        c.strokeStyle='rgba(255,255,255,0.3)'; c.lineWidth=1.5; c.strokeRect(cx,cy,cell,cell);
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.05)}px Tajawal`; c.textAlign='center';
        c.fillText(off.g,cx+cell/2,cy+cell*0.55);
        c.font=`${Math.round(h*0.025)}px Tajawal`;
        c.fillText(gn[off.fromF]||'',cx+cell/2,cy+cell*0.78);
      });

    } else {
      // Parent avatars
      [[w*0.18,h*0.28,fCol,simState.fGene,'👨','الأب'],[w*0.82,h*0.28,mCol,simState.mGene,'👩','الأم']].forEach(([px,py,col,gene,avatar,label])=>{
        c.fillStyle=col+'55'; c.beginPath(); c.arc(px,py,40,0,Math.PI*2); c.fill();
        c.strokeStyle=col; c.lineWidth=2.5; c.stroke();
        c.font=`${Math.round(h*0.08)}px serif`; c.textAlign='center'; c.fillText(avatar,px,py+10);
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.032)}px Tajawal`;
        c.fillText(label+': '+gene,px,py+58);
        c.fillStyle='#7A8A98'; c.font=`${Math.round(h*0.025)}px Tajawal`;
        c.fillText(gn[gene]||'',px,py+74);
        // Gene bubble
        c.fillStyle=col; c.beginPath(); c.arc(px,py-45,16,0,Math.PI*2); c.fill();
        c.fillStyle='white'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`;
        c.fillText(gene,px,py-39);
      });

      // Arrow / lines
      c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=2;
      c.beginPath(); c.moveTo(w*0.22,h*0.32); c.quadraticCurveTo(w/2,h*0.26,w/2,h*0.5); c.stroke();
      c.beginPath(); c.moveTo(w*0.78,h*0.32); c.quadraticCurveTo(w/2,h*0.26,w/2,h*0.5); c.stroke();
      c.fillStyle='rgba(0,0,0,0.3)'; c.font=`${Math.round(h*0.027)}px Tajawal`; c.textAlign='center';
      c.fillText('نصف من كل أب',w/2,h*0.48);

      if(simState.offspring.length>0){
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.round(h*0.035)}px Tajawal`; c.textAlign='center';
        c.fillText('الأبناء المحتملون (الاحتماليّة ٢٥٪ لكل):',w/2,h*0.55);
        simState.offspring.forEach((off,i)=>{
          const ox=w*0.12+i*(w*0.2), oy=h*0.66;
          const delay=Math.max(0,(t-(simState.spinStart||0)-i*8));
          const scale=Math.min(1,delay/20);
          c.save(); c.translate(ox+w*0.09,oy); c.scale(scale,scale);
          const fc2=gc[off.fromF]||'#3498DB',mc2=gc[off.fromM]||'#E74C3C';
          c.beginPath(); c.arc(0,0,28,Math.PI,2*Math.PI); c.fillStyle=fc2; c.fill();
          c.beginPath(); c.arc(0,0,28,0,Math.PI); c.fillStyle=mc2; c.fill();
          c.strokeStyle='rgba(255,255,255,0.3)'; c.lineWidth=1.5;
          c.beginPath(); c.moveTo(-28,0); c.lineTo(28,0); c.stroke();
          c.beginPath(); c.arc(0,0,28,0,Math.PI*2); c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=2; c.stroke();
          c.fillStyle='white'; c.font=`bold ${Math.round(h*0.04)}px Tajawal`; c.textAlign='center';
          c.fillText(off.g,0,8);
          c.restore();
          if(scale>0.7){
            c.fillStyle='#5A6A7A'; c.font=`${Math.round(h*0.024)}px Tajawal`; c.textAlign='center';
            c.fillText(gn[off.fromF]||'',ox+w*0.09,oy+40);
          }
        });
      } else {
        c.fillStyle='#7A8A98'; c.font=`${Math.round(h*0.036)}px Tajawal`; c.textAlign='center';
        c.fillText('اضغط "أنتج جيلاً" لمشاهدة الأبناء',w/2,h*0.65);
      }
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){}});
  }
  draw();
}




/* ── Dark Mode ── */
(function() {
  var STORAGE_KEY = 'bayyin-dark-mode';
  function applyMode(isDark) {
    document.documentElement.classList[isDark?'add':'remove']('dark-mode');
    updateBtn(isDark);
    updateFooter(isDark);
  }
  function updateBtn(isDark) {
    var btn = document.getElementById('dm-toggle');
    if (!btn) return;
    var moon  = btn.querySelector('.dm-moon');
    var sun   = btn.querySelector('.dm-sun');
    var label = btn.querySelector('.dm-label');
    if (moon)  moon.style.display  = isDark ? 'none'  : 'block';
    if (sun)   sun.style.display   = isDark ? 'block' : 'none';
    if (label) label.textContent   = isDark ? 'فاتح'  : 'داكن';
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
  }
  function updateFooter(isDark) {
    var f = document.getElementById('sticky-credit');
    if (!f) return;
    f.style.background     = isDark ? '#1A2230' : '#f0f4f7';
    f.style.borderTopColor = isDark ? 'rgba(26,143,168,0.3)' : 'rgba(26,143,168,0.2)';
  }
  window.toggleDarkMode = function() {
    var isDark = document.documentElement.classList.toggle('dark-mode');
    try { localStorage.setItem(STORAGE_KEY, isDark ? '1' : '0'); } catch(e){}
    updateBtn(isDark); updateFooter(isDark);
  };
  var saved = ''; try { saved = localStorage.getItem(STORAGE_KEY); } catch(e){}
  if (saved === '1') document.documentElement.classList.add('dark-mode');
  document.addEventListener('DOMContentLoaded', function() {
    var isDark = document.documentElement.classList.contains('dark-mode');
    updateBtn(isDark); updateFooter(isDark);
  });
})();

/* ── Buddy ── */
var _buddyTimer = null;

function buddySay(msg, duration) {
  var wrap   = document.getElementById('buddy-wrap');
  var bubble = document.getElementById('buddy-bubble');
  var text   = document.getElementById('buddy-text');
  if (!wrap || !bubble || !text) return;
  if (wrap.classList.contains('hidden') && !wrap.classList.contains('visible')) return;
  text.textContent = msg;
  bubble.classList.remove('show');
  clearTimeout(_buddyTimer);
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      bubble.classList.add('show');
      if (duration) { _buddyTimer = setTimeout(function() { bubble.classList.remove('show'); }, duration); }
    });
  });
}

function hideBubble() {
  var bubble = document.getElementById('buddy-bubble');
  if (bubble) bubble.classList.remove('show');
  clearTimeout(_buddyTimer);
}

function toggleBubble() {
  var bubble = document.getElementById('buddy-bubble');
  if (!bubble) return;
  if (bubble.classList.contains('show')) { hideBubble(); }
  else { var t=document.getElementById('buddy-text'); buddySay(t?t.textContent:'مرحباً!', 5000); }
}

function hideBuddy() {
  var w=document.getElementById('buddy-wrap'), r=document.getElementById('buddy-restore-btn');
  if(w){w.classList.add('hidden');w.classList.remove('visible');}
  if(r) r.classList.add('show');
  try{localStorage.setItem('bayyin-buddy-hidden','1');}catch(e){}
}

function restoreBuddy() {
  var w=document.getElementById('buddy-wrap'), r=document.getElementById('buddy-restore-btn');
  if(w){w.classList.remove('hidden');w.classList.add('visible');}
  if(r) r.classList.remove('show');
  try{localStorage.setItem('bayyin-buddy-hidden','0');}catch(e){}
  setTimeout(function(){ buddySay('مرحباً مجدداً! 👋 أنا هنا إذا احتجت مساعدة.', 4000); }, 350);
}

/* ── Buddy Draggable ── */
(function() {
  var wrap, isDragging=false, hasMoved=false, startX, startY, origLeft, origTop;
  function getXY(e){ return e.touches?{x:e.touches[0].clientX,y:e.touches[0].clientY}:{x:e.clientX,y:e.clientY}; }
  function onDown(e) {
    wrap=document.getElementById('buddy-wrap'); if(!wrap) return;
    isDragging=true; hasMoved=false;
    var pt=getXY(e), rect=wrap.getBoundingClientRect();
    startX=pt.x; startY=pt.y; origLeft=rect.left; origTop=rect.top;
    wrap.style.position='fixed'; wrap.style.left=origLeft+'px'; wrap.style.top=origTop+'px';
    wrap.style.bottom='auto'; wrap.style.right='auto'; wrap.style.transition='none';
    e.preventDefault();
  }
  function onMove(e) {
    if(!isDragging) return; e.preventDefault();
    var pt=getXY(e), dx=pt.x-startX, dy=pt.y-startY;
    if(Math.abs(dx)>4||Math.abs(dy)>4) hasMoved=true;
    if(!hasMoved) return;
    wrap.style.left=Math.max(0,Math.min(window.innerWidth-100,origLeft+dx))+'px';
    wrap.style.top=Math.max(0,Math.min(window.innerHeight-140,origTop+dy))+'px';
  }
  function onUp() {
    if(!isDragging) return; isDragging=false;
    wrap=document.getElementById('buddy-wrap');
    if(wrap){ wrap.style.cursor=''; wrap.style.transition=''; }
    if(!hasMoved) toggleBubble();
    try{ if(wrap) localStorage.setItem('bayyin-buddy-pos',JSON.stringify({left:parseFloat(wrap.style.left),top:parseFloat(wrap.style.top)})); }catch(ex){}
  }
  document.addEventListener('DOMContentLoaded', function() {
    wrap=document.getElementById('buddy-wrap');
    if(!wrap) return;
    try{ var pos=JSON.parse(localStorage.getItem('bayyin-buddy-pos')||'null'); if(pos&&pos.top!=null){wrap.style.left=pos.left+'px';wrap.style.top=pos.top+'px';wrap.style.bottom='auto';wrap.style.right='auto';} }catch(ex){}
    wrap.addEventListener('mousedown',onDown,false);
    wrap.addEventListener('touchstart',onDown,{passive:false});
    document.addEventListener('mousemove',onMove,false);
    document.addEventListener('touchmove',onMove,{passive:false});
    document.addEventListener('mouseup',onUp,false);
    document.addEventListener('touchend',onUp,false);
    var char=document.getElementById('buddy-char'); if(char) char.removeAttribute('onclick');
    // Init: buddy hidden on landing
    var bh=''; try{bh=localStorage.getItem('bayyin-buddy-hidden');}catch(e){}
    wrap.classList.remove('visible');
    if(bh==='1'){ wrap.classList.add('hidden'); var r=document.getElementById('buddy-restore-btn'); if(r) r.classList.add('show'); }
  });
})();

/* ── answerQ buddy reactions ── */
var _origAnswerQ = window.answerQ;
window.answerQ = function(i) {
  if(typeof qAnswered !== 'undefined' && qAnswered) return;
  var simType = currentSim;
  var q = SIM_QUESTIONS[simType];
  if(!q) return;
  if(typeof qAnswered !== 'undefined') qAnswered = true;
  var opts = document.querySelectorAll('.q-opt');
  opts.forEach(function(el,j){
    if(j===q.ans) el.classList.add('correct');
    else if(j===i&&i!==q.ans) el.classList.add('wrong');
    el.onclick=null;
  });
  var fb = document.getElementById('qFeedback');
  if(fb){
    fb.textContent = i===q.ans ? q.fb : '❌ ليس تماماً — '+q.fb;
    fb.style.background = i===q.ans ? '#E8F5E9' : '#FFEBEE';
    fb.style.color = i===q.ans ? '#1E8449' : '#C0392B';
    fb.classList.add('show');
  }
  if(i===q.ans){
    try{U9Sound.win();}catch(e){}
    var wins=['ممتاز! 🌟 إجابة صحيحة!','أحسنت! 🎉 هذا بالضبط الجواب!','رائع! 🚀 فهمك واضح!','صح! ✅ استمر بهذا التفكير!'];
    setTimeout(function(){ buddySay(wins[Math.floor(Math.random()*wins.length)], 4000); }, 300);
  } else {
    try{U9Sound.ping(220,0.3,0.25);}catch(e){}
    var tries=['لا بأس! 💪 اقرأ التفسير.','قريب! 🤔 راجع المعلومات.','حاول مرة ثانية! 📚'];
    setTimeout(function(){ buddySay(tries[Math.floor(Math.random()*tries.length)], 4000); }, 300);
  }
};

(function(){
  var landing = document.getElementById('landing');
  if(!landing) return;
  var bg      = document.getElementById('px-bg');
  var scene   = document.getElementById('px-scene');
  var dune1   = document.getElementById('px-dune1');
  var dune2   = document.getElementById('px-dune2');
  var dune3   = document.getElementById('px-dune3');
  var hero    = document.querySelector('.hero-illustration');
  var heroTxt = document.querySelector('.hero-text');
  var ticking = false;
  function onScroll(){
    if(!ticking){ requestAnimationFrame(update); ticking=true; }
  }
  function onMouse(e){
    var cx=(e.clientX/window.innerWidth-0.5)*2;
    var cy=(e.clientY/window.innerHeight-0.5)*2;
    applyMouse(cx,cy);
  }
  function applyMouse(cx,cy){
    if(bg)      bg.style.transform      = 'translate('+cx*10+'px,'+cy*8+'px) scale(1.04)';
    if(hero)    hero.style.transform    = 'translate('+(cx*-14)+'px,'+(cy*-10)+'px)';
    if(heroTxt) heroTxt.style.transform = 'translate('+cx*6+'px,'+cy*4+'px)';
    if(dune1)   dune1.style.transform   = 'translateX('+cx*18+'px)';
    if(dune2)   dune2.style.transform   = 'translateX('+cx*10+'px)';
    if(dune3)   dune3.style.transform   = 'translateX('+cx*5+'px)';
  }
  function update(){
    var scrollY=window.scrollY||0;
    if(scene) scene.style.transform='translateY('+(scrollY*0.3)+'px)';
    ticking=false;
  }
  landing.addEventListener('mousemove',onMouse,{passive:true});
  window.addEventListener('scroll',onScroll,{passive:true});
  var style=document.createElement('style');
  style.textContent='#px-bg{transition:transform 0.1s ease-out}'
    +'.hero-illustration{transition:transform 0.12s ease-out}'
    +'.hero-text{transition:transform 0.10s ease-out}'
    +'#px-dune1,#px-dune2,#px-dune3{transition:transform 0.08s ease-out}';
  document.head.appendChild(style);
})();

// ══════════════════════════════════════════════════════════════
