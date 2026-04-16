function simG5LightTravel() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">💡 الضوء والرؤية</div>
  <div class="ctrl-desc">
    اسحب مصدر الضوء 🟡 حول الشاشة وشاهد كيف تصل الأشعة للأجسام ثم تنعكس نحو العين 👁️
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📖 ماذا تعلّمنا؟</div>
  <div class="ctrl-desc">
    ① الضوء يصدر من <b>مصدر الضوء</b><br>
    ② يصطدم بالجسم فينعكس<br>
    ③ ينتقل الضوء المنعكس إلى عيننا فنرى
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٤):</strong><br>
  ١- لماذا لا نرى الأجسام في الظلام التام؟<br>
  ٢- ما الفرق بين الجسم المضيء والجسم المرئي؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">١- لأنه لا يوجد ضوء ينعكس من الأجسام إلى عيوننا.<br>٢- الجسم المضيء ينتج ضوءه بنفسه (كالشمس)، بينما الجسم المرئي يعكس ضوءاً يصله من مصدر آخر.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  if (!S.init) {
    S.init = true;
    S.srcX = 0.2; S.srcY = 0.5;
    S.dragging = false;
    S.objects = [
      { x: 0.6, y: 0.35, r: 0.04, color: '#E74C3C', label: 'كرة' },
      { x: 0.75, y: 0.65, r: 0.04, color: '#27AE60', label: 'مكعب' },
    ];
    S.showRays = true;
    cv.onmousedown = function(e) {
      const rect = cv.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / cv.offsetWidth;
      const my = (e.clientY - rect.top) / cv.offsetHeight;
      const dx = mx - S.srcX, dy = my - S.srcY;
      if (Math.sqrt(dx*dx+dy*dy) < 0.06) S.dragging = true;
    };
    cv.ontouchstart = function(e) {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      const t = e.touches[0];
      const mx = (t.clientX - rect.left) / cv.offsetWidth;
      const my = (t.clientY - rect.top) / cv.offsetHeight;
      const dx = mx - S.srcX, dy = my - S.srcY;
      if (Math.sqrt(dx*dx+dy*dy) < 0.08) S.dragging = true;
    };
    cv.onmousemove = function(e) {
      if (!S.dragging) return;
      const rect = cv.getBoundingClientRect();
      S.srcX = Math.max(0.05, Math.min(0.45, (e.clientX - rect.left) / cv.offsetWidth));
      S.srcY = Math.max(0.1, Math.min(0.9, (e.clientY - rect.top) / cv.offsetHeight));
    };
    cv.ontouchmove = function(e) {
      e.preventDefault();
      if (!S.dragging) return;
      const rect = cv.getBoundingClientRect();
      const t = e.touches[0];
      S.srcX = Math.max(0.05, Math.min(0.45, (t.clientX - rect.left) / cv.offsetWidth));
      S.srcY = Math.max(0.1, Math.min(0.9, (t.clientY - rect.top) / cv.offsetHeight));
    };
    cv.onmouseup = cv.ontouchend = function() { S.dragging = false; };
  }
  function draw() {
    if (currentSim !== 'g5lighttravel') return;
    c.fillStyle = '#0a0a1a';
    c.fillRect(0, 0, w, h);
    // Background stars
    c.fillStyle = 'rgba(255,255,255,0.4)';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137 + 23) % 100) / 100 * w;
      const sy = ((i * 89 + 7) % 100) / 100 * h;
      c.beginPath(); c.arc(sx, sy, 1, 0, Math.PI*2); c.fill();
    }
    const sx = S.srcX * w, sy = S.srcY * h;
    // Draw rays to each object and to eye
    S.objects.forEach(obj => {
      const ox = obj.x * w, oy = obj.y * h;
      const ang = Math.atan2(oy - sy, ox - sx);
      const dist = Math.sqrt((ox-sx)**2 + (oy-sy)**2);
      // Gradient ray
      const grad = c.createLinearGradient(sx, sy, ox, oy);
      grad.addColorStop(0, 'rgba(255,230,80,0.9)');
      grad.addColorStop(1, 'rgba(255,230,80,0.1)');
      c.strokeStyle = grad;
      c.lineWidth = 2;
      c.setLineDash([8, 4]);
      c.beginPath(); c.moveTo(sx, sy); c.lineTo(ox - obj.r*w * Math.cos(ang), oy - obj.r*h * Math.sin(ang)); c.stroke();
      c.setLineDash([]);
      // Arrow head
      c.fillStyle = 'rgba(255,230,80,0.7)';
      c.save(); c.translate(ox - obj.r*w*1.4*Math.cos(ang), oy - obj.r*h*1.4*Math.sin(ang));
      c.rotate(ang); c.beginPath(); c.moveTo(8,0); c.lineTo(-4,4); c.lineTo(-4,-4); c.fill(); c.restore();
      // Reflected ray to eye
      const eyeX = 0.92 * w, eyeY = S.srcY * h;
      const rGrad = c.createLinearGradient(ox, oy, eyeX, eyeY);
      rGrad.addColorStop(0, obj.color + '99');
      rGrad.addColorStop(1, obj.color + '33');
      c.strokeStyle = rGrad; c.lineWidth = 1.5; c.setLineDash([5,5]);
      c.beginPath(); c.moveTo(ox, oy); c.lineTo(eyeX, eyeY); c.stroke();
      c.setLineDash([]);
    });
    // Light source glow
    const grd = c.createRadialGradient(sx, sy, 0, sx, sy, w*0.1);
    grd.addColorStop(0, 'rgba(255,230,80,0.9)'); grd.addColorStop(1, 'rgba(255,230,80,0)');
    c.fillStyle = grd; c.beginPath(); c.arc(sx, sy, w*0.1, 0, Math.PI*2); c.fill();
    // Source icon
    c.fillStyle = '#FFE050'; c.beginPath(); c.arc(sx, sy, w*0.025, 0, Math.PI*2); c.fill();
    c.fillStyle = '#fff'; c.font = `bold ${Math.max(11,w*0.028)}px Tajawal`; c.textAlign = 'center';
    c.fillText('مصدر الضوء', sx, sy - w*0.045);
    c.fillText('(اسحب)', sx, sy + w*0.05);
    // Objects
    S.objects.forEach(obj => {
      c.fillStyle = obj.color;
      c.beginPath(); c.arc(obj.x*w, obj.y*h, obj.r*w, 0, Math.PI*2); c.fill();
      c.fillStyle = '#fff'; c.font = `bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign = 'center';
      c.fillText(obj.label, obj.x*w, obj.y*h + obj.r*w + 16);
    });
    // Eye
    const ex = 0.92*w, ey = S.srcY*h;
    c.fillStyle = '#fff'; c.font = `${Math.max(18,w*0.045)}px serif`; c.textAlign='center';
    c.fillText('👁️', ex, ey+8);
    // Info box
    c.fillStyle = 'rgba(255,255,255,0.1)'; c.strokeStyle='rgba(255,255,255,0.2)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*0.02, h*0.03, w*0.5, h*0.1, 8); c.fill(); c.stroke();
    c.fillStyle='#FFE050'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='right';
    c.fillText('💡 الضوء ينتقل من المصدر → يصطدم بالجسم → ينعكس → يصل للعين', w*0.51, h*0.075);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG5HowWeSee() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">👁️ كيف نرى الأشياء؟</div>
  <div class="ctrl-desc">
    شاهد الرسم المتحرّك الذي يوضّح المراحل الثلاث لعملية الرؤية
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🔢 مراحل الرؤية</div>
  <div class="ctrl-desc">
    ① مصدر الضوء يُصدر الضوء<br>
    ② الضوء يصطدم بالجسم وينعكس<br>
    ③ الضوء المنعكس يدخل العين
  </div>
</div>
<div class="q-box">
  <strong>❓ فكّر:</strong><br>
  هل يمكننا رؤية الأجسام الشفافة؟ لماذا؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">نعم، الأجسام الشفافة تسمح بمرور الضوء وتعكس جزءاً منه — لذا نستطيع رؤيتها ولو بشكل خافت.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  if (!S.init2) {
    S.init2 = true;
    S.step = 0;
    S.t = 0;
  }
  function draw() {
    if (currentSim !== 'g5lighttravel') return;
    S.t += 0.02;
    c.fillStyle = '#0d1117'; c.fillRect(0,0,w,h);
    const steps = [
      { icon:'☀️', label:'مصدر الضوء', x:0.1, y:0.5, color:'#FFD700' },
      { icon:'🍎', label:'جسم معتم', x:0.45, y:0.5, color:'#E74C3C' },
      { icon:'👁️', label:'العين', x:0.85, y:0.5, color:'#3498DB' },
    ];
    // Draw connecting arrows animated
    for (let i = 0; i < steps.length-1; i++) {
      const s1 = steps[i], s2 = steps[i+1];
      const progress = Math.min(1, (S.t % 3) / 1.5 - i * 0.4);
      if (progress > 0) {
        const ex = (s1.x + (s2.x - s1.x) * progress) * w;
        const ey = s1.y * h;
        const grad = c.createLinearGradient(s1.x*w, s1.y*h, s2.x*w, s2.y*h);
        grad.addColorStop(0,'rgba(255,220,50,0.8)'); grad.addColorStop(1,'rgba(255,220,50,0.1)');
        c.strokeStyle = grad; c.lineWidth = 3;
        c.beginPath(); c.moveTo(s1.x*w+30, s1.y*h); c.lineTo(ex, ey); c.stroke();
      }
    }
    // Draw step circles
    steps.forEach((s, i) => {
      c.fillStyle = s.color+'33'; c.strokeStyle = s.color; c.lineWidth = 2;
      c.beginPath(); c.arc(s.x*w, s.y*h, w*0.06, 0, Math.PI*2); c.fill(); c.stroke();
      c.font = `${Math.max(20,w*0.045)}px serif`; c.textAlign='center';
      c.fillText(s.icon, s.x*w, s.y*h+8);
      c.fillStyle='#fff'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`;
      c.fillText(s.label, s.x*w, s.y*h + w*0.075);
      const nums = ['①','②','③'];
      c.fillStyle=s.color; c.font=`bold ${Math.max(12,w*0.025)}px sans-serif`;
      c.fillText(nums[i], s.x*w, s.y*h - w*0.075);
    });
    // Labels
    c.fillStyle='rgba(255,255,255,0.9)'; c.font=`bold ${Math.max(12,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText('كيف نرى الأشياء؟', w/2, h*0.15);
    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.max(10,w*0.022)}px Tajawal`;
    c.fillText('الضوء يصل للجسم → ينعكس عنه → يدخل عيننا فنراه', w/2, h*0.85);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG5MirrorFlat() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🪞 المرآة المستوية</div>
  <div class="ctrl-desc">
    حرّك الماوس/إصبعك <b>للأعلى والأسفل</b> على الكانفاس لتغيير زاوية السقوط وشاهد كيف تتغيّر زاوية الانعكاس
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📐 قانون الانعكاس</div>
  <div class="ctrl-name" style="font-size:15px;font-weight:700;color:var(--teal,#1A8FA8);text-align:center;padding:8px;background:rgba(26,143,168,0.08);border-radius:8px">
    زاوية السقوط = زاوية الانعكاس
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٤ · د٢):</strong><br>
  ١- ما العمود العادي؟<br>
  ٢- ماذا يحدث لزاوية الانعكاس لو زدنا زاوية السقوط؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">١- الخط الوهمي العمودي على سطح المرآة عند نقطة السقوط — تُقاس الزوايا منه.<br>٢- تزداد زاوية الانعكاس بنفس المقدار، دائماً متساويتان.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  if (!S.mirrorInit) {
    S.mirrorInit = true;
    S.angle = 45;
    S.showNormal = true;
    cv.onmousemove = function(e) {
      const rect = cv.getBoundingClientRect();
      const mx = (e.clientX - rect.left) / cv.offsetWidth;
      const my = (e.clientY - rect.top) / cv.offsetHeight;
      S.angle = Math.max(10, Math.min(80, (1 - my) * 90));
    };
    cv.ontouchmove = function(e) {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      const t = e.touches[0];
      const my = (t.clientY - rect.top) / cv.offsetHeight;
      S.angle = Math.max(10, Math.min(80, (1 - my) * 90));
    };
  }
  function draw() {
    if (currentSim !== 'g5mirror') return;
    c.fillStyle = '#1a1a2e'; c.fillRect(0,0,w,h);
    const mx = w * 0.55, my = h * 0.5;
    const mLen = h * 0.35;
    // Mirror
    c.strokeStyle = '#C0C0FF'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(mx, my - mLen); c.lineTo(mx, my + mLen); c.stroke();
    // Mirror shine effect
    const mirGrad = c.createLinearGradient(mx-10, 0, mx+6, 0);
    mirGrad.addColorStop(0,'rgba(200,200,255,0.3)'); mirGrad.addColorStop(1,'rgba(200,200,255,0)');
    c.fillStyle = mirGrad; c.fillRect(mx-10, my-mLen, 16, mLen*2);
    c.fillStyle='#aac'; c.font=`${Math.max(10,w*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText('مرآة مستوية', mx, my + mLen + 22);
    // Normal line
    if (S.showNormal) {
      c.strokeStyle='rgba(255,255,255,0.3)'; c.lineWidth=1; c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(mx-w*0.25, my); c.lineTo(mx+w*0.25, my); c.stroke();
      c.setLineDash([]);
      c.fillStyle='rgba(255,255,255,0.5)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='left';
      c.fillText('العمود العادي', mx+w*0.01, my - 8);
    }
    // Incident ray
    const rad = S.angle * Math.PI / 180;
    const rayLen = w * 0.3;
    const ix = mx - rayLen * Math.cos(rad), iy = my - rayLen * Math.sin(rad);
    c.strokeStyle = '#FFD700'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(ix, iy); c.lineTo(mx, my); c.stroke();
    // Arrow
    c.save(); c.translate(mx, my); c.rotate(Math.PI - rad);
    c.fillStyle='#FFD700'; c.beginPath(); c.moveTo(-8,0); c.lineTo(-14,4); c.lineTo(-14,-4); c.fill(); c.restore();
    // Reflected ray
    c.strokeStyle = '#FF6B9D'; c.lineWidth = 2.5;
    c.beginPath(); c.moveTo(mx, my); c.lineTo(mx + rayLen * Math.cos(rad), iy); c.stroke();
    c.save(); c.translate(mx + rayLen * Math.cos(rad), iy); c.rotate(-rad);
    c.fillStyle='#FF6B9D'; c.beginPath(); c.moveTo(8,0); c.lineTo(0,4); c.lineTo(0,-4); c.fill(); c.restore();
    // Angle arcs
    c.strokeStyle='rgba(255,215,0,0.5)'; c.lineWidth=1.5;
    c.beginPath(); c.arc(mx, my, 40, Math.PI - rad, Math.PI); c.stroke();
    c.strokeStyle='rgba(255,107,157,0.5)';
    c.beginPath(); c.arc(mx, my, 40, -Math.PI, -rad); c.stroke();
    // Labels
    c.fillStyle='#FFD700'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText(`زاوية السقوط = ${Math.round(S.angle)}°`, ix, iy - 12);
    c.fillStyle='#FF6B9D';
    c.fillText(`زاوية الانعكاس = ${Math.round(S.angle)}°`, mx + rayLen * Math.cos(rad), iy - 12);
    // Law label
    c.fillStyle='rgba(255,255,255,0.85)'; c.font=`bold ${Math.max(11,w*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText('قانون الانعكاس: زاوية السقوط = زاوية الانعكاس', w/2, h*0.9);
    c.fillStyle='rgba(200,200,255,0.6)'; c.font=`${Math.max(10,w*0.02)}px Tajawal`;
    c.fillText('حرّك الماوس/إصبعك للأعلى والأسفل لتغيير الزاوية', w/2, h*0.95);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG5MirrorCurved() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🔄 نوع المرآة</div>
  <button class="ctrl-btn" onclick="simState.curvedInit=false;simState.mirrorType=0;simG5MirrorCurved()" style="margin-bottom:6px">🔭 مقعّرة (تجمّع)</button>
  <button class="ctrl-btn" onclick="simState.curvedInit=false;simState.mirrorType=1;simG5MirrorCurved()">🚗 محدّبة (تشتيت)</button>
  <div class="ctrl-desc">أو انقر مباشرة على الكانفاس للتبديل</div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">💡 الفرق بينهما</div>
  <div class="ctrl-desc">
    🔭 <b>المقعّرة:</b> تجمّع الأشعة في البؤرة — تُكبّر الصورة (التلسكوبات، المصابيح)<br>
    🚗 <b>المحدّبة:</b> تشتّت الأشعة — رؤية أوسع (مرايا السيارات، المتاجر)
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٤ · د٢-ب):</strong><br>
  أين تُستخدم المرايا المقعّرة في الحياة؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">المصابيح الأمامية للسيارات، تلسكوبات الفضاء، الأطباق اللاقطة للشمس، مرايا الحلاقة المكبّرة.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  if (!S.curvedInit) {
    S.curvedInit = true;
    S.mirrorType = 0; // 0=concave, 1=convex
    S.objDist = 0.5;
    cv.onclick = function() { S.mirrorType = 1 - S.mirrorType; };
  }
  function draw() {
    if (currentSim !== 'g5mirror') return;
    c.fillStyle = '#0d1120'; c.fillRect(0,0,w,h);
    const cx2 = w*0.55, cy2 = h*0.5;
    const R = h*0.4;
    const isConcave = S.mirrorType === 0;
    // Draw curved mirror arc
    c.strokeStyle = '#8888FF'; c.lineWidth = 4;
    c.beginPath();
    if (isConcave) {
      c.arc(cx2 + R*0.3, cy2, R*0.7, Math.PI*0.6, Math.PI*1.4);
    } else {
      c.arc(cx2 - R*0.3, cy2, R*0.7, -Math.PI*0.4, Math.PI*0.4);
    }
    c.stroke();
    const typeLabel = isConcave ? 'مرآة مقعّرة (تجمّع)' : 'مرآة محدّبة (تشتيت)';
    c.fillStyle='#aac'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText(typeLabel, cx2, h*0.88);
    c.fillStyle='rgba(200,200,255,0.6)'; c.font=`${Math.max(9,w*0.019)}px Tajawal`;
    c.fillText('انقر للتبديل بين المرآتين', cx2, h*0.93);
    // Draw rays
    const numRays = 5;
    for (let i = 0; i < numRays; i++) {
      const ry = cy2 + (i - numRays/2) * h * 0.08;
      c.strokeStyle = `hsl(${50 + i*20},100%,65%)`; c.lineWidth = 1.8;
      c.beginPath(); c.moveTo(w*0.05, ry); c.lineTo(cx2, ry); c.stroke();
      if (isConcave) {
        // Rays converge to focal point
        const fp = cx2 - h*0.15;
        c.beginPath(); c.moveTo(cx2, ry); c.lineTo(fp, cy2); c.stroke();
      } else {
        // Rays diverge
        const ang = (ry - cy2) / (h * 0.5) * 0.4;
        c.beginPath(); c.moveTo(cx2, ry);
        c.lineTo(cx2 - h*0.3, ry - Math.sin(ang)*h*0.35); c.stroke();
      }
    }
    if (isConcave) {
      const fp = cx2 - h*0.15;
      c.fillStyle='#FFD700'; c.font=`${Math.max(16,w*0.035)}px serif`;
      c.fillText('🔥', fp-10, cy2+8);
      c.fillStyle='#FFD700'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
      c.fillText('البؤرة', fp, cy2-16);
    }
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText(isConcave ? '🔭 المرآة المقعّرة تجمّع الأشعة المتوازية في نقطة واحدة' : '🚗 المرآة المحدّبة تشتّت الأشعة وتعطي رؤية أوسع', w/2, h*0.1);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG5BehindYou() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🔍 رؤية ما خلفك</div>
  <div class="ctrl-desc">
    حرّك الماوس/إصبعك أفقياً على الكانفاس لتغيير زاوية المرآة وشاهد كيف يتغيّر مسار الضوء
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📌 تطبيقات في الحياة</div>
  <div class="ctrl-desc">
    🚗 مرايا السيارة الجانبية والخلفية<br>
    🏪 مرايا زوايا المتاجر والمستشفيات<br>
    💈 مرايا صالونات الحلاقة المزدوجة
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٤ · د٣):</strong><br>
  لماذا تستخدم الحافلات مرايا كبيرة جانبية؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأن الحافلة طويلة والسائق لا يستطيع رؤية ما حولها مباشرة — المرايا تعكس الضوء القادم من الجوانب وتُوسّع مجال الرؤية.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  if (!S.bInit) {
    S.bInit = true; S.t = 0;
    S.mirrorAngle = 45;
    cv.onmousemove = function(e) {
      const rect = cv.getBoundingClientRect();
      S.mirrorAngle = Math.max(20, Math.min(70, (e.clientX - rect.left) / cv.offsetWidth * 90));
    };
    cv.ontouchmove = function(e) {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      S.mirrorAngle = Math.max(20, Math.min(70, (e.touches[0].clientX - rect.left) / cv.offsetWidth * 90));
    };
  }
  function draw() {
    if (currentSim !== 'g5behindyou') return;
    S.t += 0.02;
    c.fillStyle = '#111'; c.fillRect(0,0,w,h);

    // Mirror angle in radians — tilt around its center
    const mAngleRad = (S.mirrorAngle - 45) * Math.PI / 180; // -25° to +25° tilt
    const mxp = w * 0.82;
    const mcy = h * 0.5;
    const mHalf = h * 0.25;
    const mTopX = mxp + Math.sin(mAngleRad) * mHalf;
    const mTopY = mcy - Math.cos(mAngleRad) * mHalf;
    const mBotX = mxp - Math.sin(mAngleRad) * mHalf;
    const mBotY = mcy + Math.cos(mAngleRad) * mHalf;

    // Object behind (left)
    const ox = w * 0.15, oy = h * 0.5;
    c.font = `${Math.max(24,w*0.05)}px serif`; c.textAlign='center';
    c.fillText('🎁', ox, oy);
    c.fillStyle='rgba(255,180,180,0.9)'; c.font=`${Math.max(10,w*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText('جسم خلفك!', ox, oy + 28);

    // Person (viewer) — middle
    const px = w * 0.5, py = h * 0.55;
    c.font = `${Math.max(28,w*0.06)}px serif`; c.textAlign='center';
    c.fillText('🧑', px, py);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(10,w*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText('المشاهد', px, py + 30);

    // Mirror surface
    c.strokeStyle = '#C0C0FF'; c.lineWidth = 5;
    c.beginPath(); c.moveTo(mTopX, mTopY); c.lineTo(mBotX, mBotY); c.stroke();
    // Mirror sheen
    c.strokeStyle = 'rgba(180,180,255,0.25)'; c.lineWidth = 12;
    c.beginPath(); c.moveTo(mTopX, mTopY); c.lineTo(mBotX, mBotY); c.stroke();
    c.fillStyle='#aaf'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
    c.fillText('مرآة', mxp, h * 0.85);

    // Mirror normal direction (perpendicular to mirror surface)
    const normalAngle = mAngleRad; // angle of normal from vertical

    // Ray from object to mirror (hits at mirror center)
    const toMirrorAngle = Math.atan2(mcy - oy, mxp - (ox + 20));
    c.strokeStyle='#FFD700'; c.lineWidth=2.5; c.setLineDash([7,4]);
    c.beginPath(); c.moveTo(ox + 20, oy); c.lineTo(mxp, mcy); c.stroke();
    c.setLineDash([]);
    // Arrow on incoming ray
    drawArrow(c, ox+20, oy, mxp, mcy, '#FFD700');

    // Reflection: compute reflected ray using mirror normal
    // Mirror normal vector (pointing left, perpendicular to mirror)
    const nx = -Math.cos(mAngleRad), ny = -Math.sin(mAngleRad);
    // Incoming direction
    const idx2 = mxp - (ox+20), idy = mcy - oy;
    const iLen = Math.sqrt(idx2*idx2+idy*idy);
    const inX = idx2/iLen, inY = idy/iLen;
    // Reflect: r = i - 2(i·n)n
    const dot = inX*nx + inY*ny;
    const refX = inX - 2*dot*nx;
    const refY = inY - 2*dot*ny;
    // Reflected ray endpoint (toward viewer area)
    const refLen = w * 0.45;
    const refEndX = mxp + refX * refLen;
    const refEndY = mcy + refY * refLen;

    c.strokeStyle='#FF9900'; c.lineWidth=2.5; c.setLineDash([7,4]);
    c.beginPath(); c.moveTo(mxp, mcy); c.lineTo(refEndX, refEndY); c.stroke();
    c.setLineDash([]);
    drawArrow(c, mxp, mcy, refEndX, refEndY, '#FF9900');

    // Normal dashed line on mirror
    c.strokeStyle='rgba(255,255,255,0.25)'; c.lineWidth=1; c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(mxp - nx*40, mcy - ny*40); c.lineTo(mxp + nx*60, mcy + ny*60); c.stroke();
    c.setLineDash([]);

    // Angle label
    const angleDeg = Math.round(Math.abs(S.mirrorAngle - 45));
    c.fillStyle='rgba(255,220,100,0.9)'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText(`زاوية المرآة: ${S.mirrorAngle.toFixed(0)}°`, w/2, h*0.1);
    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.max(10,w*0.02)}px Tajawal`;
    c.fillText('حرّك الماوس/إصبعك أفقياً لتغيير الزاوية', w/2, h*0.17);

    // Bottom info
    c.fillStyle='rgba(255,255,255,0.75)'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('المرايا تسمح لنا برؤية ما خلفنا وخلف الزوايا!', w/2, h*0.91);
    c.fillStyle='rgba(180,180,255,0.55)'; c.font=`${Math.max(10,w*0.02)}px Tajawal`;
    c.fillText('مثال: مرايا السيارة، مرايا المتاجر، مرايا الحلاق', w/2, h*0.96);

    animFrame = requestAnimationFrame(draw);
  }

  function drawArrow(ctx, x1, y1, x2, y2, color) {
    const ang = Math.atan2(y2-y1, x2-x1);
    const mx = x1 + (x2-x1)*0.6, my = y1 + (y2-y1)*0.6;
    ctx.fillStyle = color;
    ctx.save(); ctx.translate(mx, my); ctx.rotate(ang);
    ctx.beginPath(); ctx.moveTo(8,0); ctx.lineTo(-5,4); ctx.lineTo(-5,-4); ctx.fill();
    ctx.restore();
  }

  draw();
}

function simG5ReflectionCompare() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">✨ مقارنة الأسطح العاكسة</div>
  <div class="ctrl-desc">
    حرّك الماوس أفقياً لتغيير زاوية الضوء وشاهد كيف تختلف درجة انعكاسه على كل سطح
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📊 ترتيب الأسطح (الأعلى انعكاساً)</div>
  <div class="ctrl-desc">
    🥇 المرآة (٩٥٪)<br>
    🥈 الورق اللامع (٧٠٪)<br>
    🥉 القماش (٣٠٪)<br>
    ▪ الورق الخشن (١٠٪)
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٤ · د٤):</strong><br>
  لماذا السطوح اللامعة تعكس الضوء أفضل من الخشنة؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">السطوح اللامعة منتظمة وملساء فتعكس الأشعة بزاوية ثابتة (انعكاس منتظم). السطوح الخشنة تشتّت الأشعة في اتجاهات مختلفة (انعكاس منتشر).</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  if (!S.rInit) {
    S.rInit = true;
    S.lightAngle = 30;
    cv.onmousemove = function(e) {
      const rect = cv.getBoundingClientRect();
      S.lightAngle = Math.max(10, Math.min(80, (e.clientX-rect.left)/cv.offsetWidth*80));
    };
    cv.ontouchmove = function(e) { e.preventDefault();
      const rect = cv.getBoundingClientRect();
      S.lightAngle = Math.max(10, Math.min(80, (e.touches[0].clientX-rect.left)/cv.offsetWidth*80));
    };
  }
  const surfaces = [
    { name:'مرآة', roughness:0, color:'#E0E0FF', reflectivity:0.95 },
    { name:'ورق لامع', roughness:0.15, color:'#FFFFCC', reflectivity:0.7 },
    { name:'قماش', roughness:0.6, color:'#DEB887', reflectivity:0.3 },
    { name:'ورق خشن', roughness:1, color:'#C8A882', reflectivity:0.1 },
  ];
  function draw() {
    if (currentSim !== 'g5reflection') return;
    c.fillStyle='#0a0a18'; c.fillRect(0,0,w,h);
    const colW = w / surfaces.length;
    surfaces.forEach((surf, i) => {
      const bx = i * colW, by = h*0.55;
      // Surface
      const surfGrad = c.createLinearGradient(bx, by, bx+colW-4, by);
      surfGrad.addColorStop(0, surf.color+'AA'); surfGrad.addColorStop(1, surf.color+'55');
      c.fillStyle = surfGrad; c.fillRect(bx+2, by, colW-4, h*0.08);
      // Add texture for rough surfaces
      if (surf.roughness > 0) {
        c.strokeStyle = 'rgba(0,0,0,0.3)'; c.lineWidth = 1;
        for (let x2 = bx+2; x2 < bx+colW-2; x2 += 6) {
          const jitter = (Math.random()-0.5)*surf.roughness*8;
          c.beginPath(); c.moveTo(x2, by); c.lineTo(x2+3, by+jitter+h*0.04); c.stroke();
        }
      }
      // Incident ray
      const ry = by;
      const rx = bx + colW*0.5;
      const rad = (90 - S.lightAngle) * Math.PI/180;
      c.strokeStyle='#FFD700'; c.lineWidth=2;
      c.beginPath(); c.moveTo(rx - Math.cos(rad)*h*0.2, ry - Math.sin(rad)*h*0.2);
      c.lineTo(rx, ry); c.stroke();
      // Reflected rays (spread based on roughness)
      const numRays = Math.max(1, Math.round(1 + surf.roughness*6));
      for (let r2 = 0; r2 < numRays; r2++) {
        const spread = (r2/(numRays-1||1) - 0.5) * surf.roughness * 80 * Math.PI/180;
        const reflAngle = rad + spread;
        const brightness = surf.reflectivity / numRays * 3;
        c.strokeStyle = `rgba(255,200,100,${Math.min(0.9, brightness)})`;
        c.lineWidth = Math.max(0.5, 2 * surf.reflectivity);
        c.beginPath(); c.moveTo(rx, ry);
        c.lineTo(rx + Math.cos(reflAngle)*h*0.2, ry - Math.sin(reflAngle)*h*0.2); c.stroke();
      }
      // Labels
      c.fillStyle='rgba(255,255,255,0.85)'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`;
      c.textAlign='center'; c.fillText(surf.name, bx+colW/2, h*0.72);
      c.fillStyle=`rgba(255,200,100,${surf.reflectivity})`;
      c.font=`${Math.max(9,w*0.019)}px Tajawal`;
      c.fillText(`${Math.round(surf.reflectivity*100)}% انعكاس`, bx+colW/2, h*0.78);
    });
    c.fillStyle='rgba(255,255,255,0.85)'; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`;
    c.textAlign='center'; c.fillText('مقارنة انعكاس الضوء على أسطح مختلفة', w/2, h*0.12);
    c.fillStyle='rgba(255,220,100,0.7)'; c.font=`${Math.max(10,w*0.02)}px Tajawal`;
    c.fillText('← حرّك الماوس لتغيير زاوية الضوء →', w/2, h*0.88);
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG5ReflectionMeasure() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">📊 قياس الانعكاس</div>
  <div class="ctrl-desc">
    انقر على الأسطح المختلفة لقياس معامل انعكاسها وقارن النتائج في الجدول
  </div>
</div>
<div class="q-box">
  <strong>❓ استنتاج:</strong><br>
  ما العلاقة بين ملمس السطح ودرجة انعكاس الضوء؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">كلما كان السطح أكثر نعومة ولمعاناً، زادت درجة انعكاس الضوء بشكل منتظم. السطوح الخشنة تشتّت الضوء.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  const data = [
    {name:'مرآة',val:95,color:'#C0C0FF'},
    {name:'ألمنيوم',val:75,color:'#C0C080'},
    {name:'ورق لامع',val:55,color:'#FFFF80'},
    {name:'قماش',val:20,color:'#D2A060'},
    {name:'ورق خشن',val:8,color:'#C0A080'},
  ];
  if (!S.rmInit) {
    S.rmInit=true; S.selected=-1;
    const bW = cv.width*0.12, gap = cv.width*0.04, startX = cv.width*0.1, baseY = cv.height*0.75;
    function getBar(mx, my) {
      for (let i=0; i<data.length; i++) {
        const bx = startX + i*(bW+gap);
        const bH = (data[i].val/100)*cv.height*0.5;
        if (mx>=bx && mx<=bx+bW && my>=baseY-bH && my<=baseY) return i;
      }
      return -1;
    }
    cv.style.cursor = 'pointer';
    cv.onclick = function(e) {
      const rect = cv.getBoundingClientRect();
      const mx = (e.clientX-rect.left)/rect.width*cv.width;
      const my = (e.clientY-rect.top)/rect.height*cv.height;
      const idx = getBar(mx, my);
      S.selected = (S.selected===idx) ? -1 : idx;
    };
    cv.ontouchend = function(e) {
      e.preventDefault();
      const rect = cv.getBoundingClientRect();
      const t = e.changedTouches[0];
      const mx = (t.clientX-rect.left)/rect.width*cv.width;
      const my = (t.clientY-rect.top)/rect.height*cv.height;
      const idx = getBar(mx, my);
      S.selected = (S.selected===idx) ? -1 : idx;
    };
  }
  function draw() {
    if (currentSim !== 'g5reflection') return;
    c.fillStyle='#0d1117'; c.fillRect(0,0,w,h);
    const bW = w*0.12, gap = w*0.04, startX = w*0.1, baseY = h*0.75;
    data.forEach((d,i)=>{
      const bH = (d.val/100)*h*0.5;
      const bx = startX + i*(bW+gap);
      const isS = i===S.selected;
      const grad = c.createLinearGradient(bx,baseY-bH,bx,baseY);
      grad.addColorStop(0, isS ? '#fff' : d.color);
      grad.addColorStop(1, d.color+'44');
      c.fillStyle = grad;
      c.fillRect(bx, baseY-bH, bW, bH);
      if(isS){c.strokeStyle='#FFD700';c.lineWidth=3;c.strokeRect(bx,baseY-bH,bW,bH);}
      c.fillStyle='rgba(255,255,255,0.85)'; c.font=`bold ${Math.max(9,w*0.02)}px Tajawal`;
      c.textAlign='center'; c.fillText(d.name, bx+bW/2, baseY+20);
      c.fillStyle = isS ? '#FFD700' : d.color;
      c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`;
      c.fillText(d.val+'%', bx+bW/2, baseY-bH-10);
    });
    // Axis
    c.strokeStyle='rgba(255,255,255,0.3)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(w*0.08, h*0.18); c.lineTo(w*0.08, baseY+5); c.lineTo(w*0.95, baseY+5); c.stroke();
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(10,w*0.02)}px Tajawal`;
    c.textAlign='center'; c.fillText('نسبة انعكاس الضوء %', w/2, h*0.12);
    // Info panel on click
    if (S.selected >= 0) {
      const d = data[S.selected];
      c.fillStyle='rgba(0,0,0,0.6)'; c.beginPath(); c.roundRect(w*0.25, h*0.08, w*0.5, h*0.08, 8); c.fill();
      c.fillStyle='#FFD700'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
      c.fillText(`${d.name}: ${d.val}% انعكاس`, w/2, h*0.135);
    } else {
      c.fillStyle='rgba(255,220,100,0.6)'; c.font=`${Math.max(10,w*0.02)}px Tajawal`; c.textAlign='center';
      c.fillText('← انقر على أي عمود لعرض تفاصيله →', w/2, h*0.88);
    }
    animFrame = requestAnimationFrame(draw);
  }
  draw();
}

function simG5LightDirection() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🎯 هندسة مسار الضوء</div>
  <div class="ctrl-desc">
    انقر على المرايا لتدويرها وحاول توجيه شعاع الضوء نحو الهدف 🎯
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">💡 تذكّر</div>
  <div class="ctrl-desc">
    الضوء ينتقل في <b>خطوط مستقيمة</b> — المرايا فقط تغيّر اتجاهه عند الانعكاس
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٤ · د٥):</strong><br>
  كيف تُستخدم المرايا في الغواصات لرؤية ما فوق سطح الماء؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">يستخدم البيريسكوب مرآتَين بزاوية ٤٥° — الضوء يدخل من الأعلى، ينعكس للأسفل بالمرآة الأولى، ثم ينعكس للأمام بالمرآة الثانية نحو العين.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  if (!S.ldInit) {
    S.ldInit=true; S.t=0;
    S.mirrors = [
      {x:0.35, y:0.35, angle:45, dragging:false},
      {x:0.65, y:0.65, angle:135, dragging:false},
    ];
    S.draggingMirror = -1;
    cv.onmousedown = function(e) {
      const rect = cv.getBoundingClientRect();
      const mx=(e.clientX-rect.left)/cv.offsetWidth, my=(e.clientY-rect.top)/cv.offsetHeight;
      S.mirrors.forEach((m,i)=>{
        if(Math.abs(mx-m.x)<0.06&&Math.abs(my-m.y)<0.06) S.draggingMirror=i;
      });
    };
    cv.onmousemove = function(e) {
      if(S.draggingMirror<0) return;
      const rect = cv.getBoundingClientRect();
      S.mirrors[S.draggingMirror].x=(e.clientX-rect.left)/cv.offsetWidth;
      S.mirrors[S.draggingMirror].y=(e.clientY-rect.top)/cv.offsetHeight;
    };
    cv.ontouchstart = function(e){e.preventDefault();
      const rect=cv.getBoundingClientRect(),t=e.touches[0];
      const mx=(t.clientX-rect.left)/cv.offsetWidth,my=(t.clientY-rect.top)/cv.offsetHeight;
      S.mirrors.forEach((m,i)=>{if(Math.abs(mx-m.x)<0.08&&Math.abs(my-m.y)<0.08) S.draggingMirror=i;});
    };
    cv.ontouchmove = function(e){e.preventDefault();if(S.draggingMirror<0) return;
      const rect=cv.getBoundingClientRect(),t=e.touches[0];
      S.mirrors[S.draggingMirror].x=(t.clientX-rect.left)/cv.offsetWidth;
      S.mirrors[S.draggingMirror].y=(t.clientY-rect.top)/cv.offsetHeight;
    };
    cv.onmouseup=cv.ontouchend=function(){S.draggingMirror=-1;};
  }
  function draw() {
    if(currentSim!=='g5lightdir') return;
    S.t+=0.03;
    c.fillStyle='#090913'; c.fillRect(0,0,w,h);
    // Source
    const src={x:0.05*w, y:h/2};
    // Target
    const tgt={x:0.93*w, y:h/2};
    const grd=c.createRadialGradient(src.x,src.y,0,src.x,src.y,w*0.05);
    grd.addColorStop(0,'rgba(255,230,50,0.9)'); grd.addColorStop(1,'rgba(255,230,50,0)');
    c.fillStyle=grd; c.beginPath(); c.arc(src.x,src.y,w*0.05,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE050'; c.beginPath(); c.arc(src.x,src.y,w*0.02,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,200,50,0.7)'; c.font=`${Math.max(9,w*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText('المصدر', src.x, src.y-w*0.035);
    // Draw target
    c.strokeStyle='#FF5050'; c.lineWidth=2;
    c.beginPath(); c.arc(tgt.x,tgt.y,w*0.025,0,Math.PI*2); c.stroke();
    c.beginPath(); c.moveTo(tgt.x-w*0.03,tgt.y); c.lineTo(tgt.x+w*0.03,tgt.y); c.stroke();
    c.beginPath(); c.moveTo(tgt.x,tgt.y-w*0.03); c.lineTo(tgt.x,tgt.y+w*0.03); c.stroke();
    c.fillStyle='#FF7070'; c.font=`${Math.max(9,w*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText('الهدف', tgt.x, tgt.y-w*0.04);
    // Trace ray through mirrors
    let points = [{x:src.x, y:src.y}];
    let curX=src.x, curY=src.y, dirX=1, dirY=0;
    S.mirrors.forEach(m=>{
      const mx2=m.x*w, my2=m.y*h;
      const t2=(mx2-curX)/dirX;
      if(t2>0){
        points.push({x:curX+dirX*t2, y:curY+dirY*t2});
        curX=mx2; curY=my2;
        // Reflect: angle 45° mirror reflects X→Y, Y→X
        const tmp=dirX; dirX=-dirY; dirY=-tmp;
      }
    });
    points.push({x:curX+dirX*w, y:curY+dirY*h});
    const rayGrad=c.createLinearGradient(src.x,src.y,tgt.x,tgt.y);
    rayGrad.addColorStop(0,'rgba(255,230,80,0.9)'); rayGrad.addColorStop(1,'rgba(255,230,80,0.3)');
    c.strokeStyle=rayGrad; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(points[0].x,points[0].y);
    for(let i=1;i<points.length;i++) c.lineTo(points[i].x,points[i].y);
    c.stroke();
    // Mirrors
    S.mirrors.forEach((m,i)=>{
      const mx2=m.x*w, my2=m.y*h;
      c.save(); c.translate(mx2,my2); c.rotate(m.angle*Math.PI/180);
      c.strokeStyle='#A0A0FF'; c.lineWidth=4;
      c.beginPath(); c.moveTo(-w*0.06,0); c.lineTo(w*0.06,0); c.stroke();
      c.fillStyle='rgba(160,160,255,0.15)'; c.fillRect(-w*0.06,-3,w*0.12,6);
      c.restore();
      c.fillStyle='rgba(160,160,255,0.7)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText('اسحب', mx2, my2+w*0.045);
    });
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('حرّك المرايا لتوجيه شعاع الضوء نحو الهدف! 🎯', w/2, h*0.92);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════
//   الصف الخامس — وحدة ٥: الظلال
// ══════════════════════════════════════════════════

function simG5ShadowLab() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🌑 مختبر الظلال</div>
  <div class="ctrl-desc">
    اسحب مصدر الضوء 🕯️ أو الجسم على الكانفاس وشاهد كيف يتغيّر حجم الظل واتجاهه
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📐 متى يكبر الظل؟</div>
  <div class="ctrl-desc">
    📍 عندما يقترب الجسم من المصدر<br>
    📍 عندما يبتعد الجسم عن الشاشة<br>
    📍 عندما يكون المصدر منخفضاً
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٥ · د١):</strong><br>
  ١- ما الشروط اللازمة لتكوّن الظل؟<br>
  ٢- لماذا نرى ظلنا أطول في الصباح والمساء؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">١- مصدر ضوء + جسم معتم + سطح لاستقبال الظل.<br>٢- لأن الشمس تكون منخفضة في الأفق فزاوية سقوط أشعتها صغيرة مما يطيل الظل.</div>
</div>`;
  const cv = document.getElementById('simCanvas');
  const c = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const S = simState;
  if (!S.slInit) {
    S.slInit=true;
    S.lightX=0.15; S.lightY=0.25;
    S.objX=0.5; S.objSize=0.06;
    S.draggingLight=false; S.draggingObj=false;
    cv.onmousedown=function(e){
      const rect=cv.getBoundingClientRect();
      const mx=(e.clientX-rect.left)/cv.offsetWidth, my=(e.clientY-rect.top)/cv.offsetHeight;
      if(Math.hypot(mx-S.lightX,my-S.lightY)<0.07) S.draggingLight=true;
      else if(Math.abs(mx-S.objX)<0.07&&Math.abs(my-0.55)<0.07) S.draggingObj=true;
    };
    cv.onmousemove=function(e){
      const rect=cv.getBoundingClientRect();
      const mx=(e.clientX-rect.left)/cv.offsetWidth, my=(e.clientY-rect.top)/cv.offsetHeight;
      if(S.draggingLight){S.lightX=Math.max(0.05,Math.min(0.45,mx));S.lightY=Math.max(0.05,Math.min(0.5,my));}
      if(S.draggingObj){S.objX=Math.max(0.3,Math.min(0.8,mx));}
    };
    cv.ontouchstart=function(e){e.preventDefault();
      const rect=cv.getBoundingClientRect(),t=e.touches[0];
      const mx=(t.clientX-rect.left)/cv.offsetWidth,my=(t.clientY-rect.top)/cv.offsetHeight;
      if(Math.hypot(mx-S.lightX,my-S.lightY)<0.09) S.draggingLight=true;
      else if(Math.abs(mx-S.objX)<0.09&&Math.abs(my-0.55)<0.09) S.draggingObj=true;
    };
    cv.ontouchmove=function(e){e.preventDefault();
      const rect=cv.getBoundingClientRect(),t=e.touches[0];
      const mx=(t.clientX-rect.left)/cv.offsetWidth,my=(t.clientY-rect.top)/cv.offsetHeight;
      if(S.draggingLight){S.lightX=Math.max(0.05,Math.min(0.45,mx));S.lightY=Math.max(0.05,Math.min(0.5,my));}
      if(S.draggingObj){S.objX=Math.max(0.3,Math.min(0.8,mx));}
    };
    cv.onmouseup=cv.ontouchend=function(){S.draggingLight=false;S.draggingObj=false;};
  }
  function draw() {
    if(currentSim!=='g5shadowsize') return;
    // Background: room
    c.fillStyle='#1a1a2a'; c.fillRect(0,0,w,h);
    // Floor
    c.fillStyle='#2a2a3a'; c.fillRect(0,h*0.7,w,h*0.3);
    c.strokeStyle='rgba(255,255,255,0.1)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(0,h*0.7); c.lineTo(w,h*0.7); c.stroke();
    // Wall
    c.fillStyle='rgba(255,255,255,0.04)'; c.fillRect(w*0.85,0,w*0.15,h*0.7);
    c.fillStyle='rgba(255,255,255,0.3)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('حائط', w*0.925, h*0.15);
    // Compute shadow
    const lx=S.lightX*w, ly=S.lightY*h;
    const ox=S.objX*w, oy=h*0.65, or2=S.objSize*w;
    // Shadow on floor: project from light through object edges to floor
    const floorY=h*0.7;
    const leftEdge=ox-or2, rightEdge=ox+or2;
    // Ray from light to left edge → extended to floor
    const tLeft=(floorY-ly)/(oy-or2-ly);
    const shadowLeft=lx+(leftEdge-lx)*tLeft;
    const tRight=(floorY-ly)/(oy-or2-ly);
    const shadowRight=lx+(rightEdge-lx)*tRight;
    // Shadow shape
    const shW=Math.abs(shadowRight-shadowLeft)*1.5;
    const shX=ox - shW/2;
    c.fillStyle='rgba(0,0,0,0.7)';
    c.beginPath();
    c.ellipse(ox, floorY+6, shW/2, shW*0.12, 0, 0, Math.PI*2);
    c.fill();
    // Light rays (umbra edges)
    c.strokeStyle='rgba(255,230,80,0.2)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(lx,ly); c.lineTo(leftEdge, oy-or2); c.lineTo(shX, floorY); c.stroke();
    c.beginPath(); c.moveTo(lx,ly); c.lineTo(rightEdge, oy-or2); c.lineTo(shX+shW, floorY); c.stroke();
    // Light cone (filled area)
    c.fillStyle='rgba(255,230,80,0.06)';
    c.beginPath();
    c.moveTo(lx,ly);
    c.lineTo(shX, floorY); c.lineTo(shX+shW, floorY);
    c.closePath(); c.fill();
    // Object
    c.fillStyle='#E74C3C';
    c.beginPath(); c.arc(ox, oy, or2, 0, Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
    c.fillText('الجسم', ox, oy+or2+16); c.fillText('(اسحب)', ox, oy+or2+30);
    // Light source glow
    const g=c.createRadialGradient(lx,ly,0,lx,ly,w*0.1);
    g.addColorStop(0,'rgba(255,230,50,0.9)'); g.addColorStop(1,'rgba(255,230,50,0)');
    c.fillStyle=g; c.beginPath(); c.arc(lx,ly,w*0.1,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE050'; c.beginPath(); c.arc(lx,ly,w*0.022,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,230,50,0.8)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('المصباح (اسحب)', lx, ly-w*0.04);
    // Shadow size readout
    const shadowSize=Math.round(shW/w*100);
    c.fillStyle='rgba(0,0,0,0.5)'; c.strokeStyle='rgba(255,255,255,0.2)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*0.02,h*0.02,w*0.48,h*0.1,6); c.fill(); c.stroke();
    c.fillStyle='#FFE050'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='right';
    c.fillText(`حجم الظل: ${shadowSize} وحدة`, w*0.49, h*0.07);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`;
    c.fillText('الظل يكبر كلما اقترب المصباح من الجسم', w*0.49, h*0.1);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5ShadowInquiry() {
  // ── لوحة التحكم ──
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">📐 استقصاء الظل</div>
  <div class="ctrl-desc">اضغط على أزرار المسافة لتحريك الجسم وشاهد كيف يتغيّر طول الظل</div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📏 اختر المسافة عن المصدر</div>
  <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:6px">
    ${[10,20,30,40,50].map(d=>`
    <button id="si-btn-${d}" onclick="window._siSetDist(${d})"
      style="padding:10px 4px;border-radius:10px;border:2px solid rgba(26,143,168,0.4);
      background:rgba(26,143,168,0.1);color:#4DC4E0;font-family:Tajawal;font-size:15px;
      font-weight:700;cursor:pointer;transition:all .18s">${d}<br>
      <span style="font-size:10px;font-weight:400">سم</span></button>`).join('')}
  </div>
</div>
<div class="ctrl-section" style="padding:10px 12px;background:rgba(255,215,0,0.07);border-radius:10px;border:1px solid rgba(255,215,0,0.2)">
  <div class="ctrl-label" style="color:#FFD700">📊 القياسات المسجّلة</div>
  <div id="si-table" style="margin-top:6px;font-family:Tajawal;font-size:13px;color:rgba(255,255,255,0.75)">
    لم يُسجَّل شيء بعد — جرّب المسافات المختلفة
  </div>
</div>
<div class="q-box">
  <strong>❓ تساؤل الاستقصاء:</strong><br>
  ما العلاقة بين المسافة عن المصدر وطول الظل؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">علاقة عكسية — كلما زادت المسافة عن المصدر قلّ طول الظل، وكلما قلّت المسافة زاد طول الظل.</div>
</div>`;

  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;

  if(!S.siInit){
    S.siInit=true;
    S.siDist=20;      // المسافة الحالية (سم)
    S.siRecorded={};  // القياسات المسجّلة
    S.siAnim=0;
    S.siPrevDist=20;
    S.siTransition=1; // 0..1
  }

  // دالة عامة لتغيير المسافة
  window._siSetDist=function(d){
    if(S.siDist===d) return;
    S.siPrevDist=S.siDist;
    S.siDist=d;
    S.siTransition=0;
    // تسجيل القياس
    const shadow=Math.round(400/d);
    S.siRecorded[d]=shadow;
    // تحديث أزرار التحكم
    [10,20,30,40,50].forEach(v=>{
      const btn=document.getElementById('si-btn-'+v);
      if(!btn) return;
      const active=(v===d);
      btn.style.background=active?'rgba(26,143,168,0.45)':'rgba(26,143,168,0.1)';
      btn.style.borderColor=active?'#4DC4E0':'rgba(26,143,168,0.4)';
      btn.style.color=active?'#fff':'#4DC4E0';
      btn.style.transform=active?'scale(1.08)':'scale(1)';
    });
    // تحديث جدول القياسات
    const recorded=Object.keys(S.siRecorded).sort((a,b)=>a-b);
    const tableEl=document.getElementById('si-table');
    if(tableEl){
      if(recorded.length===0){
        tableEl.innerHTML='لم يُسجَّل شيء بعد — جرّب المسافات المختلفة';
      } else {
        tableEl.innerHTML=`<table style="width:100%;border-collapse:collapse;text-align:center">
          <tr style="color:#4DC4E0;border-bottom:1px solid rgba(255,255,255,0.15)">
            <td style="padding:4px 2px">المسافة (سم)</td>
            ${recorded.map(v=>`<td style="padding:4px 2px">${v}</td>`).join('')}
          </tr>
          <tr>
            <td style="padding:4px 2px;color:#FFD700">طول الظل (سم)</td>
            ${recorded.map(v=>`<td style="padding:4px 2px;color:#FFD700;font-weight:700">${S.siRecorded[v]}</td>`).join('')}
          </tr>
        </table>
        ${recorded.length>=3?'<div style="margin-top:6px;color:#90EE90;font-size:12px">💡 لاحظ: كلما زادت المسافة كلما قلّ الظل!</div>':''}`;
      }
    }
    try{playTick&&playTick();}catch(e){}
  };

  // تفعيل أول زر
  if(!S.siRecorded[S.siDist]) window._siSetDist(S.siDist);

  function draw(){
    if(currentSim!=='g5shadowsize') return;
    S.siAnim++;
    if(S.siTransition<1) S.siTransition=Math.min(1,S.siTransition+0.06);

    // ── الحساب ──
    const dist=S.siDist;
    const prevDist=S.siPrevDist;
    const t=S.siTransition;
    const easedDist=prevDist+(dist-prevDist)*t;

    // موضع المصباح ثابت على اليمين (الكنفاس RTL مقلوب فعلياً)
    const lightX=w*0.1,  lightY=h*0.22;
    const wallX=w*0.92;

    // موضع الجسم بناءً على المسافة (10سم=قريب، 50سم=بعيد)
    const objX=lightX + (wallX-lightX)*((easedDist-10)/(50-10))*0.65 + (wallX-lightX)*0.12;
    const objY=h*0.52;
    const objR=w*0.032;

    // طول الظل المحسوب
    const shadowLen=Math.round(400/dist);
    const shadowLenPx=(shadowLen/50)*(wallX-objX)*0.9;

    // ── الرسم ──
    // خلفية
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#0a0d18'); bg.addColorStop(1,'#111520');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // الأرض
    c.fillStyle='rgba(255,255,255,0.06)';
    c.fillRect(0,h*0.58,w,h*0.42);
    c.strokeStyle='rgba(255,255,255,0.12)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(0,h*0.58); c.lineTo(w,h*0.58); c.stroke();

    // الحائط (الشاشة)
    c.fillStyle='rgba(255,255,255,0.08)';
    c.fillRect(wallX,h*0.1,w*0.03,h*0.7);
    c.strokeStyle='rgba(255,255,255,0.2)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(wallX,h*0.1); c.lineTo(wallX,h*0.8); c.stroke();
    c.fillStyle='rgba(255,255,255,0.5)'; c.font=`${Math.max(8,w*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('الحائط', wallX+w*0.025, h*0.88);

    // أشعة الضوء
    c.strokeStyle='rgba(255,240,100,0.12)'; c.lineWidth=1;
    for(let r=-2;r<=2;r++){
      c.beginPath();
      c.moveTo(lightX, lightY+r*8);
      c.lineTo(wallX, lightY+r*25);
      c.stroke();
    }
    // أشعة الضوء الرئيسية (تحدّد الظل)
    c.strokeStyle='rgba(255,240,100,0.35)'; c.lineWidth=1.2; c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(lightX,lightY); c.lineTo(objX-objR*1.1, objY-objR); c.lineTo(wallX, h*0.58-shadowLenPx*0.5); c.stroke();
    c.beginPath(); c.moveTo(lightX,lightY); c.lineTo(objX+objR*0.8, objY+objR); c.lineTo(wallX, h*0.58); c.stroke();
    c.setLineDash([]);

    // ظل الجسم على الأرض
    const shGrad=c.createRadialGradient(objX+shadowLenPx*0.4, h*0.58, 0, objX+shadowLenPx*0.4, h*0.58, shadowLenPx*0.6);
    shGrad.addColorStop(0,'rgba(0,0,0,0.7)');
    shGrad.addColorStop(1,'rgba(0,0,0,0)');
    c.fillStyle=shGrad;
    c.beginPath(); c.ellipse(objX+shadowLenPx*0.4, h*0.585, shadowLenPx*0.55, h*0.03, 0, 0, Math.PI*2); c.fill();

    // سهم يوضح طول الظل
    const arrowY=h*0.65;
    c.strokeStyle='#FFD700'; c.lineWidth=2;
    c.beginPath(); c.moveTo(objX, arrowY); c.lineTo(objX+shadowLenPx, arrowY); c.stroke();
    // رأسا السهم
    c.fillStyle='#FFD700';
    c.beginPath(); c.moveTo(objX,arrowY-5); c.lineTo(objX,arrowY+5); c.lineTo(objX-8,arrowY); c.fill();
    c.beginPath(); c.moveTo(objX+shadowLenPx,arrowY-5); c.lineTo(objX+shadowLenPx,arrowY+5); c.lineTo(objX+shadowLenPx+8,arrowY); c.fill();
    // قيمة طول الظل
    c.fillStyle='#FFD700'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText(`${shadowLen} سم`, objX+shadowLenPx/2, arrowY-10);

    // الجسم (كرة)
    const gObj=c.createRadialGradient(objX-objR*0.3,objY-objR*0.3,0,objX,objY,objR);
    gObj.addColorStop(0,'#9B72E0'); gObj.addColorStop(1,'#5B2E9A');
    c.fillStyle=gObj;
    c.beginPath(); c.arc(objX,objY,objR,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(180,140,255,0.6)'; c.lineWidth=1.5;
    c.stroke();

    // المصباح
    const gLight=c.createRadialGradient(lightX,lightY,0,lightX,lightY,w*0.07);
    gLight.addColorStop(0,'rgba(255,240,80,0.95)'); gLight.addColorStop(1,'rgba(255,200,0,0)');
    c.fillStyle=gLight; c.beginPath(); c.arc(lightX,lightY,w*0.07,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE040'; c.beginPath(); c.arc(lightX,lightY,w*0.022,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.85)'; c.font=`${Math.max(8,w*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('المصدر', lightX, lightY+w*0.04);

    // مؤشر المسافة (سهم أفقي بين المصدر والجسم)
    const midY=h*0.76;
    c.strokeStyle='#4DC4E0'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(lightX,midY); c.lineTo(objX,midY); c.stroke();
    c.fillStyle='#4DC4E0';
    c.beginPath(); c.moveTo(lightX,midY-4); c.lineTo(lightX,midY+4); c.lineTo(lightX-7,midY); c.fill();
    c.beginPath(); c.moveTo(objX,midY-4); c.lineTo(objX,midY+4); c.lineTo(objX+7,midY); c.fill();
    c.fillStyle='#4DC4E0'; c.font=`bold ${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='center';
    c.fillText(`المسافة: ${dist} سم`, (lightX+objX)/2, midY-8);

    // صندوق المعلومات (أعلى يمين)
    c.fillStyle='rgba(0,0,0,0.55)'; c.strokeStyle='rgba(26,143,168,0.4)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*0.3,h*0.04,w*0.38,h*0.14,8); c.fill(); c.stroke();
    c.fillStyle='rgba(255,255,255,0.85)'; c.font=`bold ${Math.max(9,w*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText(`المسافة: ${dist} سم  →  الظل: ${shadowLen} سم`, w*0.49, h*0.12);
    // عدد القياسات
    const nRec=Object.keys(S.siRecorded).length;
    c.fillStyle='rgba(255,215,0,0.7)'; c.font=`${Math.max(8,w*0.016)}px Tajawal`;
    c.fillText(`✅ سجّلت ${nRec} من 5 قياسات`, w*0.49, h*0.175);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5TransparentTest() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🔬 اختبار المواد والضوء</div>
  <div class="ctrl-desc">
    انقر على كل مادة لاختبارها وشاهد كمية الضوء التي تمر عبرها
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📋 تصنيف المواد</div>
  <div class="ctrl-desc">
    🟢 <b>شفاف:</b> يسمح بمرور الضوء كله (زجاج، ماء نقي)<br>
    🟡 <b>شبه شفاف:</b> يسمح بمرور بعض الضوء (ورق مشمّع، ضباب)<br>
    🔴 <b>معتم:</b> يمنع مرور الضوء (خشب، معدن، ورق)
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٥ · د٢):</strong><br>
  لماذا نستخدم الزجاج في نوافذ البيوت؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأنه شفاف يسمح بدخول الضوء للغرفة وفي نفس الوقت يمنع دخول الهواء البارد والحشرات.</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  const materials=[
    {name:'زجاج شفاف', transmission:0.95, color:'#AEE4FF', icon:'🪟', type:'شفاف تماماً'},
    {name:'ورق مشمّع', transmission:0.55, color:'#FFFACD', icon:'📄', type:'شبه شفاف'},
    {name:'بلاستيك ملوّن', transmission:0.35, color:'#90EE90', icon:'🟩', type:'شبه شفاف'},
    {name:'ورق أبيض', transmission:0.15, color:'#F5F5F5', icon:'📃', type:'شبه معتم'},
    {name:'خشب', transmission:0, color:'#8B6914', icon:'🪵', type:'معتم'},
    {name:'حجر', transmission:0, color:'#888', icon:'🪨', type:'معتم'},
  ];
  if(!S.ttInit){
    S.ttInit=true;
    S.selected=-1;
    S.ttAnim=0;
    // إعداد النقر لتحديد المادة
    function handleClick(cx, cy){
      const rect=cv.getBoundingClientRect();
      const scaleX=cv.width/rect.width;
      const scaleY=cv.height/rect.height;
      const mx=(cx-rect.left)*scaleX;
      const my=(cy-rect.top)*scaleY;
      const colW=cv.width/materials.length;
      // منطقة النقر: العمود بأكمله
      const col=Math.floor(mx/colW);
      if(col>=0 && col<materials.length){
        S.selected=(S.selected===col)?-1:col;
        S.ttAnim=0;
        try{U5Sound&&U5Sound.ping();}catch(e){}
        try{playTick&&playTick();}catch(e){}
      }
    }
    cv.onclick=function(e){handleClick(e.clientX,e.clientY);};
    cv.ontouchend=function(e){
      e.preventDefault();
      if(e.changedTouches.length>0){handleClick(e.changedTouches[0].clientX,e.changedTouches[0].clientY);}
    };
  }
  function draw(){
    if(currentSim!=='g5transparent') return;
    S.ttAnim=(S.ttAnim||0)+1;
    const t=S.ttAnim;

    // ── خلفية متدرجة أجمل ──
    const bgGrad=c.createLinearGradient(0,0,0,h);
    bgGrad.addColorStop(0,'#0a0e1a');
    bgGrad.addColorStop(1,'#111820');
    c.fillStyle=bgGrad; c.fillRect(0,0,w,h);

    // خطوط فاصلة خفيفة بين الأعمدة
    const colW=w/materials.length;
    for(let i=1;i<materials.length;i++){
      c.strokeStyle='rgba(255,255,255,0.04)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(i*colW,h*0.14); c.lineTo(i*colW,h*0.88); c.stroke();
    }

    const sel=S.selected;

    // ── التوزيع الرأسي ──
    // 0→9%   : شمس + عنوان
    // 10→27% : شعاع ضوء فوق
    // 27→44% : كتلة المادة (+ إطار تحديد)
    // 44→72% : شعاع ضوء أسفل (متناسب مع النفاذية)
    // 73→88% : أيقونة + اسم فقط
    // 88→100%: صندوق المعلومات عند التحديد / تلميح عند عدمه

    materials.forEach((mat,i)=>{
      const bx=i*colW;
      const isSelected=(sel===i);
      const dimmed=(sel>=0 && !isSelected);
      const alpha=dimmed?0.28:1.0;
      c.globalAlpha=alpha;

      // ── شعاع الضوء الساقط ──
      const bw=colW*0.44;
      const bLeft=bx+(colW-bw)/2;
      const beamTop=h*0.10;
      const beamBot=h*0.27;
      const lgTop=c.createLinearGradient(0,beamTop,0,beamBot);
      lgTop.addColorStop(0,'rgba(255,245,120,0.95)');
      lgTop.addColorStop(1,'rgba(255,235,80,0.82)');
      c.fillStyle=lgTop;
      // شكل مستطيل مع خطوط شعاع خفيفة
      c.fillRect(bLeft, beamTop, bw, beamBot-beamTop);
      // خطوط داخلية للشعاع
      c.globalAlpha=alpha*0.3;
      c.strokeStyle='rgba(255,255,180,0.6)'; c.lineWidth=0.5;
      for(let r=0;r<3;r++){
        const rx=bLeft+bw*0.2+r*bw*0.25;
        c.beginPath(); c.moveTo(rx,beamTop); c.lineTo(rx,beamBot); c.stroke();
      }
      c.globalAlpha=alpha;

      // ── إطار التحديد الذهبي المضيء ──
      if(isSelected){
        c.globalAlpha=1;
        const glow=12+4*Math.sin(t*0.08);
        c.shadowColor='#FFD700'; c.shadowBlur=glow;
        c.strokeStyle='#FFD700'; c.lineWidth=2.5;
        c.beginPath();
        c.roundRect(bx+colW*0.05, h*0.26, colW*0.9, h*0.19, 6);
        c.stroke();
        c.shadowBlur=0;
        c.globalAlpha=alpha;
      }

      // ── كتلة المادة ──
      c.globalAlpha=isSelected?1:alpha;
      c.fillStyle=mat.color;
      c.beginPath();
      c.roundRect(bx+colW*0.07, h*0.27, colW*0.86, h*0.17, 5);
      c.fill();
      c.strokeStyle='rgba(255,255,255,0.2)'; c.lineWidth=1;
      c.stroke();

      // ── شعاع الضوء المنقول أسفل ──
      if(mat.transmission>0){
        const pulse=isSelected?(0.8+0.2*Math.sin(t*0.1)):1;
        const tAlpha=pulse*mat.transmission;
        const lgBot=c.createLinearGradient(0,h*0.44,0,h*0.72);
        lgBot.addColorStop(0,`rgba(255,240,90,${tAlpha*0.88})`);
        lgBot.addColorStop(0.6,`rgba(255,220,60,${tAlpha*0.4})`);
        lgBot.addColorStop(1,'rgba(255,200,40,0)');
        c.fillStyle=lgBot;
        c.fillRect(bLeft, h*0.44, bw, h*0.28);
      }

      // ── أيقونة + اسم فقط (بدون نوع أو %) ──
      c.globalAlpha=isSelected?1:alpha;

      // الأيقونة
      c.font=`${Math.max(16,w*0.028)}px serif`;
      c.textAlign='center';
      c.fillStyle='rgba(255,255,255,1)';
      c.fillText(mat.icon, bx+colW/2, h*0.80);

      // الاسم
      c.font=`bold ${Math.max(7,w*0.0155)}px Tajawal`;
      c.fillStyle=isSelected?'#FFD700':'rgba(255,255,255,0.85)';
      c.fillText(mat.name, bx+colW/2, h*0.87);

      c.globalAlpha=1;
    });

    c.globalAlpha=1;

    // ── الشمس والعنوان ──
    c.font=`${Math.max(22,w*0.048)}px serif`; c.textAlign='center';
    c.fillText('☀️', w/2, h*0.075);
    c.fillStyle='rgba(255,255,255,0.82)';
    c.font=`bold ${Math.max(9,w*0.021)}px Tajawal`; c.textAlign='center';
    c.fillText('أي المواد يسمح بمرور الضوء؟', w/2, h*0.135);

    // ── منطقة أسفل: تلميح أو معلومات المادة ──
    if(sel<0){
      // تلميح بسيط
      c.fillStyle='rgba(0,0,0,0.45)';
      c.beginPath(); c.roundRect(w*0.15,h*0.895,w*0.7,h*0.085,20); c.fill();
      c.fillStyle='rgba(255,215,0,0.8)';
      c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
      c.fillText('👆 انقر على أي مادة لاختبارها', w/2, h*0.948);
    } else {
      const mat=materials[sel];
      const typeColors={شفاف:'#4DC4E0',شبه:'#FFD700',معتم:'#FF6B6B'};
      const tKey=Object.keys(typeColors).find(k=>mat.type.includes(k));
      const tColor=typeColors[tKey]||'#aaa';
      const pct=Math.round(mat.transmission*100);
      const desc=mat.transmission>=0.8?'يسمح بمرور الضوء كله':
                 mat.transmission>=0.2?'يسمح بمرور جزء من الضوء':
                 'يمنع مرور الضوء تماماً';

      // خلفية الصندوق
      c.fillStyle='rgba(0,0,0,0.68)';
      c.strokeStyle=tColor+'55'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(w*0.03, h*0.89, w*0.94, h*0.10, 10); c.fill(); c.stroke();

      // اسم المادة (يسار) — وصف (وسط) — نسبة (يمين)
      const boxMid=h*0.945;
      // النسبة — يسار الشاشة (rtl فيعرض يمين)
      c.fillStyle=tColor;
      c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='right';
      c.fillText(`${pct}%`, w*0.96, boxMid);

      // الاسم — يمين الشاشة (rtl)
      c.font=`bold ${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='left';
      c.fillText(`${mat.icon} ${mat.name}`, w*0.04, boxMid);

      // الوصف — وسط
      c.fillStyle='rgba(255,255,255,0.75)';
      c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
      c.fillText(desc, w/2, boxMid);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5Silhouette() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🎭 فنّان الظلال</div>
  <div class="ctrl-desc">
    انقر على الأشكال المختلفة لاختيارها وشاهد صورتها الظلية على الشاشة
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">💡 الصورة الظلية</div>
  <div class="ctrl-desc">
    الظل يعطي شكل الجسم المعتم فقط — لا يُظهر تفاصيل اللون أو الملمس
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٥ · د٣):</strong><br>
  هل الظل يشبه الجسم دائماً بنفس الحجم؟ متى يختلف؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لا — الظل يشبه شكل الجسم لكن حجمه يتغيّر حسب المسافة بين الجسم ومصدر الضوء والشاشة. يكبر الظل كلما اقترب الجسم من المصدر.</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.silInit){S.silInit=true;S.t=0;S.currentShape=0;}
  const shapes=['🦅','✋','🐘','🏠','⭐'];
  cv.onclick=function(){S.currentShape=(S.currentShape+1)%shapes.length;};
  function draw(){
    if(currentSim!=='g5silhouette') return;
    S.t+=0.015;
    c.fillStyle='#ffd580'; c.fillRect(0,0,w,h);
    // Light source
    const lx=w*0.12, ly=h*0.3;
    const grd=c.createRadialGradient(lx,ly,0,lx,ly,w*0.25);
    grd.addColorStop(0,'rgba(255,255,200,0.95)'); grd.addColorStop(1,'rgba(255,220,100,0)');
    c.fillStyle=grd; c.beginPath(); c.arc(lx,ly,w*0.25,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE000'; c.beginPath(); c.arc(lx,ly,w*0.03,0,Math.PI*2); c.fill();
    c.fillStyle='#333'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
    c.fillText('مصدر الضوء', lx, ly+w*0.05);
    // Wall
    c.fillStyle='#e8d5b0'; c.fillRect(w*0.85,0,w*0.15,h);
    c.strokeStyle='rgba(0,0,0,0.2)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(w*0.85,0); c.lineTo(w*0.85,h); c.stroke();
    c.fillStyle='#a08060'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
    c.fillText('الحائط', w*0.925, h*0.1);
    // Object
    const shape=shapes[S.currentShape];
    const ox=w*0.5, oy=h*0.45;
    c.font=`${Math.max(50,w*0.1)}px serif`; c.textAlign='center'; c.fillText(shape, ox, oy);
    // Shadow on wall (simple projection)
    const scale=2.2;
    c.save();
    c.translate(w*0.87, oy*0.9);
    c.scale(scale*0.4, scale*0.5);
    c.globalAlpha=0.7;
    c.filter='blur(2px)';
    c.fillStyle='rgba(0,0,0,0.85)';
    c.font=`${Math.max(50,w*0.1)}px serif`; c.textAlign='center';
    c.fillText(shape, 0, 0);
    c.filter='none'; c.globalAlpha=1;
    c.restore();
    // Rays from light to shadow edge
    c.strokeStyle='rgba(255,200,50,0.3)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(lx,ly); c.lineTo(w*0.85, oy*0.6); c.stroke();
    c.beginPath(); c.moveTo(lx,ly); c.lineTo(w*0.85, oy*1.2); c.stroke();
    c.fillStyle='rgba(0,0,0,0.75)'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('انقر لتغيير الشكل!', w/2, h*0.9);
    c.fillStyle='rgba(0,0,0,0.55)'; c.font=`${Math.max(10,w*0.02)}px Tajawal`;
    c.fillText(`الشكل الحالي: ${shape} — الصورة الظلية تحتفظ بملامح الجسم`, w/2, h*0.95);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5ShadowFactor() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">📏 المسافة والزاوية</div>
  <div class="ctrl-desc">
    اسحب مصدر الضوء أعلى/أسفل لتغيير زاوية السقوط، ويميناً/يساراً لتغيير المسافة
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🔬 متغيّرات الاستقصاء</div>
  <div class="ctrl-desc">
    📍 المسافة بين المصدر والجسم<br>
    📍 زاوية سقوط الأشعة<br>
    📍 المسافة بين الجسم والشاشة
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٥ · د٤):</strong><br>
  لماذا تتغيّر أطوال ظلالنا طوال اليوم؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأن موضع الشمس يتغيّر — في الظهيرة تكون الشمس عمودياً فوقنا فيكون الظل قصيراً جداً، بينما في الصباح والمساء تكون منخفضة فيكون الظل طويلاً.</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.sfInit){S.sfInit=true;S.distance=0.4;S.angle=45;
    cv.onmousemove=function(e){
      const rect=cv.getBoundingClientRect();
      S.distance=(e.clientX-rect.left)/cv.offsetWidth;
      S.angle=30+(1-(e.clientY-rect.top)/cv.offsetHeight)*60;
    };
    cv.ontouchmove=function(e){e.preventDefault();
      const rect=cv.getBoundingClientRect(),t=e.touches[0];
      S.distance=(t.clientX-rect.left)/cv.offsetWidth;
      S.angle=30+(1-(t.clientY-rect.top)/cv.offsetHeight)*60;
    };
  }
  function draw(){
    if(currentSim!=='g5shadowfactor') return;
    c.fillStyle='#1a1a2a'; c.fillRect(0,0,w,h);
    c.fillStyle='#2a2a3a'; c.fillRect(0,h*0.72,w,h*0.28);
    const lx=S.distance*w, ly=h*0.2;
    const ox=w*0.55, oy=h*0.68, or2=w*0.04;
    // Shadow angle based on light position
    const dx=ox-lx, dy=oy-ly;
    const shadowLen=Math.sqrt(dx*dx+dy*dy)*0.4*(1-S.distance*0.5);
    const angle=Math.atan2(oy-ly,ox-lx);
    const shX=ox+Math.cos(angle)*shadowLen;
    // Draw shadow ellipse
    c.fillStyle='rgba(0,0,0,0.6)';
    c.beginPath(); c.ellipse(ox+Math.cos(angle)*shadowLen*0.5, h*0.73, shadowLen*0.5, shadowLen*0.07, 0, 0, Math.PI*2); c.fill();
    // Light rays
    c.strokeStyle='rgba(255,230,80,0.18)'; c.lineWidth=1;
    for(let i=-2;i<=2;i++){
      c.beginPath();
      c.moveTo(lx+i*20, ly); c.lineTo(ox+i*20+Math.cos(angle)*shadowLen, h*0.73); c.stroke();
    }
    // Object
    c.fillStyle='#6B4E9A';
    c.beginPath(); c.arc(ox, oy, or2, 0, Math.PI*2); c.fill();
    // Light glow
    const g=c.createRadialGradient(lx,ly,0,lx,ly,w*0.12);
    g.addColorStop(0,'rgba(255,230,50,0.95)'); g.addColorStop(1,'rgba(255,230,50,0)');
    c.fillStyle=g; c.beginPath(); c.arc(lx,ly,w*0.12,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE050'; c.beginPath(); c.arc(lx,ly,w*0.022,0,Math.PI*2); c.fill();
    // Info
    c.fillStyle='rgba(0,0,0,0.5)'; c.strokeStyle='rgba(255,255,255,0.15)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*0.02,h*0.02,w*0.55,h*0.12,6); c.fill(); c.stroke();
    c.fillStyle='#FFE050'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='right';
    c.fillText(`طول الظل: ${Math.round(shadowLen)} وحدة`, w*0.56, h*0.07);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(9,w*0.019)}px Tajawal`;
    c.fillText('حرّك الماوس: أفقياً ← موضع المصباح، عمودياً ↕ زاوية الضوء', w*0.56, h*0.11);
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('ما الذي يؤثر على حجم الظل ومكانه؟', w/2, h*0.92);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5ShadowFactorSize() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🔎 حجم الجسم والظل</div>
  <div class="ctrl-desc">
    غيّر حجم الجسم وشاهد تأثيره المباشر على حجم الظل
  </div>
</div>
<div class="q-box">
  <strong>❓ استنتاج:</strong><br>
  ما العلاقة بين حجم الجسم وحجم ظله (مع ثبات باقي المتغيّرات)؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">علاقة طردية مباشرة — كلما كبر حجم الجسم المعتم زاد حجم ظله بنفس النسبة تقريباً.</div>
</div>`;
  // Show how object size affects shadow
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.sfsInit){S.sfsInit=true;S.objSize=0.06;
    cv.onmousemove=function(e){const rect=cv.getBoundingClientRect();S.objSize=0.02+0.1*(e.clientX-rect.left)/cv.offsetWidth;};
    cv.ontouchmove=function(e){e.preventDefault();const rect=cv.getBoundingClientRect();S.objSize=0.02+0.1*(e.touches[0].clientX-rect.left)/cv.offsetWidth;};
  }
  function draw(){
    if(currentSim!=='g5shadowfactor') return;
    c.fillStyle='#0d1117'; c.fillRect(0,0,w,h);
    c.fillStyle='#1a2020'; c.fillRect(0,h*0.7,w,h*0.3);
    const lx=w*0.2,ly=h*0.2,ox=w*0.55,oy=h*0.65,or2=S.objSize*w;
    const shW=or2*2.5;
    c.fillStyle='rgba(0,0,0,0.65)';
    c.beginPath(); c.ellipse(ox,h*0.72,shW,shW*0.1,0,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(255,230,80,0.2)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(lx,ly); c.lineTo(ox-shW,h*0.72); c.stroke();
    c.beginPath(); c.moveTo(lx,ly); c.lineTo(ox+shW,h*0.72); c.stroke();
    c.fillStyle='#E74C3C';
    c.beginPath(); c.arc(ox,oy,or2,0,Math.PI*2); c.fill();
    const grd=c.createRadialGradient(lx,ly,0,lx,ly,w*0.1);
    grd.addColorStop(0,'rgba(255,230,50,0.9)'); grd.addColorStop(1,'rgba(255,230,50,0)');
    c.fillStyle=grd; c.beginPath(); c.arc(lx,ly,w*0.1,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE050'; c.beginPath(); c.arc(lx,ly,w*0.02,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.85)'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText(`حجم الجسم: ${Math.round(or2)} بكسل | حجم الظل: ${Math.round(shW*2)} بكسل`, w/2, h*0.88);
    c.fillStyle='rgba(200,200,255,0.6)'; c.font=`${Math.max(10,w*0.02)}px Tajawal`;
    c.fillText('← حرّك الماوس لتكبير وتصغير الجسم →', w/2, h*0.93);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5LightIntensity() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">☀️ قياس شدة الضوء</div>
  <div class="ctrl-desc">
    اسحب جهاز القياس أقرب وأبعد من المصدر وسجّل القراءات في الجدول
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📈 العلاقة الرياضية</div>
  <div class="ctrl-name" style="font-size:13px;font-weight:700;color:var(--teal,#1A8FA8);text-align:center;padding:8px;background:rgba(26,143,168,0.08);border-radius:8px">
    شدة الضوء ∝ ١ / المسافة²
  </div>
  <div class="ctrl-desc">
    ضاعف المسافة → تصبح الشدة ربع القيمة
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٥ · د٦):</strong><br>
  لماذا الغرف البعيدة عن النوافذ تكون أكثر عتمة؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأن شدة الضوء تتناسب عكسياً مع مربع المسافة من المصدر — كلما ابتعدنا عن النافذة تضاعفت المسافة وانخفضت شدة الإضاءة بشكل كبير.</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.liInit){S.liInit=true;S.sensorDist=0.5;
    cv.onmousemove=function(e){const rect=cv.getBoundingClientRect();S.sensorDist=Math.max(0.1,Math.min(0.95,(e.clientX-rect.left)/cv.offsetWidth));};
    cv.ontouchmove=function(e){e.preventDefault();const rect=cv.getBoundingClientRect();S.sensorDist=Math.max(0.1,Math.min(0.95,(e.touches[0].clientX-rect.left)/cv.offsetWidth));};
  }
  function draw(){
    if(currentSim!=='g5lightintensity') return;
    c.fillStyle='#05050f'; c.fillRect(0,0,w,h);
    const lx=w*0.08, ly=h*0.5;
    const intensity=1/(S.sensorDist*S.sensorDist*8+0.1);
    const normIntensity=Math.min(1,intensity);
    // Light cone
    const grd=c.createConicalGradient?null:null;
    const maxAngle=0.6;
    for(let i=0;i<30;i++){
      const t=i/30;
      const alpha=(1-t)*normIntensity*0.5;
      c.strokeStyle=`rgba(255,230,80,${alpha})`;
      c.lineWidth=2;
      c.beginPath();
      c.moveTo(lx,ly);
      c.lineTo(lx+w*0.95, ly+(t-0.5)*w*maxAngle*2);
      c.stroke();
    }
    // Source
    const sg=c.createRadialGradient(lx,ly,0,lx,ly,w*0.08);
    sg.addColorStop(0,'rgba(255,230,50,1)'); sg.addColorStop(1,'rgba(255,230,50,0)');
    c.fillStyle=sg; c.beginPath(); c.arc(lx,ly,w*0.08,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE000'; c.font=`${Math.max(16,w*0.04)}px serif`; c.textAlign='center';
    c.fillText('💡', lx, ly+8);
    // Sensor
    const sx=S.sensorDist*w;
    c.fillStyle=`rgba(255,${Math.round(normIntensity*220)},${Math.round(normIntensity*50)},0.85)`;
    c.strokeStyle='rgba(255,255,255,0.7)'; c.lineWidth=2;
    c.beginPath(); c.rect(sx-8, ly-20, 16, 40); c.fill(); c.stroke();
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`${Math.max(8,w*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText('جهاز القياس', sx, ly+32);
    c.fillText('(اسحب)', sx, ly+46);
    // Readout
    c.fillStyle='rgba(0,0,0,0.6)'; c.strokeStyle='rgba(255,255,255,0.2)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*0.3, h*0.08, w*0.65, h*0.15, 8); c.fill(); c.stroke();
    c.fillStyle='#FFE050'; c.font=`bold ${Math.max(11,w*0.025)}px Tajawal`; c.textAlign='right';
    c.fillText(`المسافة: ${Math.round(S.sensorDist*100)} سم | شدة الضوء: ${Math.round(normIntensity*100)}%`, w*0.94, h*0.14);
    // Graph points
    const pts=[0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9];
    const gX=w*0.3, gY=h*0.65, gW=w*0.65, gH=h*0.25;
    c.strokeStyle='rgba(255,255,255,0.2)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(gX,gY); c.lineTo(gX,gY+gH); c.lineTo(gX+gW,gY+gH); c.stroke();
    c.strokeStyle='#4DC4E0'; c.lineWidth=2;
    c.beginPath();
    pts.forEach((d,i)=>{
      const iv=Math.min(1,1/(d*d*8+0.1));
      const px2=gX+d*gW, py=gY+gH-iv*gH;
      i===0?c.moveTo(px2,py):c.lineTo(px2,py);
    });
    c.stroke();
    // Current point
    c.fillStyle='#FFD700';
    c.beginPath(); c.arc(gX+S.sensorDist*gW, gY+gH-normIntensity*gH, 5, 0, Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText('المسافة →', gX+gW/2, gY+gH+18);
    c.fillStyle='rgba(255,255,255,0.85)'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText('الضوء يضعف بالمسافة: كلما ابتعدنا، قلّت الشدة', w/2, h*0.96);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════
//   الصف الخامس — وحدة ٦: حركات الأرض
// ══════════════════════════════════════════════════

function simG5EarthSun() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🌍 النظام الشمسي المصغّر</div>
  <div class="ctrl-desc">
    شاهد حركة الأرض حول الشمس والقمر حول الأرض في آنٍ واحد
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📅 حقائق المدارات</div>
  <div class="ctrl-desc">
    🌍 الأرض تدور حول الشمس في <b>٣٦٥ يوماً</b><br>
    🌙 القمر يدور حول الأرض في <b>٢٩.٥ يوماً</b><br>
    🔄 الأرض تدور حول نفسها كل <b>٢٤ ساعة</b>
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٦ · د١):</strong><br>
  ١- ما الفرق بين الدوران حول المحور والدوران حول الشمس؟<br>
  ٢- ماذا يُسبّب كل منهما؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">١- الدوران حول المحور: الأرض تدور حول نفسها (٢٤ ساعة). الدوران حول الشمس: الأرض تدور في مدارها حول الشمس (٣٦٥ يوماً).<br>٢- الدوران حول المحور يسبب الليل والنهار. الدوران حول الشمس يسبب الفصول الأربعة.</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.esInit){S.esInit=true;S.t=0;S.speed=1;S.paused=false;
    cv.onclick=function(){S.paused=!S.paused;};
  }
  function draw(){
    if(currentSim!=='g5earthsun') return;
    if(!S.paused) S.t+=0.008*S.speed;
    c.fillStyle='#000510'; c.fillRect(0,0,w,h);
    // Stars
    for(let i=0;i<80;i++){
      const sx=((i*137+13)%100)/100*w, sy=((i*97+7)%100)/100*h;
      const blink=0.3+0.7*Math.sin(S.t*2+i);
      c.fillStyle=`rgba(255,255,255,${blink*0.8})`;
      c.beginPath(); c.arc(sx,sy,0.8,0,Math.PI*2); c.fill();
    }
    const cx2=w*0.5, cy2=h*0.5;
    // Sun
    const sunG=c.createRadialGradient(cx2,cy2,0,cx2,cy2,w*0.09);
    sunG.addColorStop(0,'#FFF7C0'); sunG.addColorStop(0.4,'#FFD700'); sunG.addColorStop(1,'rgba(255,150,0,0)');
    c.fillStyle=sunG; c.beginPath(); c.arc(cx2,cy2,w*0.09,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE000'; c.beginPath(); c.arc(cx2,cy2,w*0.05,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,200,0.9)'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText('الشمس ☀️', cx2, cy2+w*0.075);
    // Earth orbit
    const earthR=w*0.3;
    c.strokeStyle='rgba(255,255,255,0.12)'; c.lineWidth=1; c.setLineDash([3,3]);
    c.beginPath(); c.ellipse(cx2,cy2,earthR,earthR*0.85,0,0,Math.PI*2); c.stroke(); c.setLineDash([]);
    const earthAngle=S.t;
    const ex=cx2+earthR*Math.cos(earthAngle), ey=cy2+earthR*0.85*Math.sin(earthAngle);
    // Earth glow
    const eg=c.createRadialGradient(ex,ey,0,ex,ey,w*0.05);
    eg.addColorStop(0,'rgba(100,200,255,0.6)'); eg.addColorStop(1,'rgba(100,200,255,0)');
    c.fillStyle=eg; c.beginPath(); c.arc(ex,ey,w*0.05,0,Math.PI*2); c.fill();
    // Earth
    c.fillStyle='#1A6FA8';
    c.beginPath(); c.arc(ex,ey,w*0.032,0,Math.PI*2); c.fill();
    c.fillStyle='#27AE60';
    c.beginPath(); c.arc(ex+w*0.008,ey-w*0.005,w*0.018,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.9)'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
    c.fillText('الأرض 🌍', ex, ey+w*0.05);
    // Moon orbit around Earth
    const moonR=w*0.065;
    c.strokeStyle='rgba(255,255,255,0.08)'; c.lineWidth=1; c.setLineDash([2,2]);
    c.beginPath(); c.arc(ex,ey,moonR,0,Math.PI*2); c.stroke(); c.setLineDash([]);
    const moonAngle=S.t*12;
    const mx2=ex+moonR*Math.cos(moonAngle), my2=ey+moonR*0.8*Math.sin(moonAngle);
    c.fillStyle='#C8C8C8'; c.beginPath(); c.arc(mx2,my2,w*0.012,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(8,w*0.016)}px Tajawal`; c.textAlign='center';
    c.fillText('🌕', mx2, my2+4);
    // Info
    const dayCount=Math.floor((S.t/(Math.PI*2))*365)%365;
    c.fillStyle='rgba(0,0,0,0.55)'; c.strokeStyle='rgba(255,255,255,0.15)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*0.02,h*0.02,w*0.5,h*0.1,6); c.fill(); c.stroke();
    c.fillStyle='#4DC4E0'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='right';
    c.fillText(`اليوم: ${dayCount} من 365 🗓️`, w*0.51, h*0.065);
    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`;
    c.fillText('انقر للإيقاف/الاستمرار', w*0.51, h*0.1);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5OrbitalPaths() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🔄 مسارات الكواكب</div>
  <div class="ctrl-desc">
    شاهد المسارات البيضاوية للكواكب حول الشمس ولاحظ الفرق في سرعاتها
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">💡 قانون كيبلر</div>
  <div class="ctrl-desc">
    الكوكب الأقرب من الشمس يتحرّك <b>أسرع</b> في مداره
  </div>
</div>
<div class="q-box">
  <strong>❓ فكّر:</strong><br>
  لماذا تختلف مدة "السنة" من كوكب لآخر؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأن كل كوكب يدور في مدار مختلف — الكوكب البعيد يقطع مسافة أطول وبسرعة أبطأ، فتطول سنته. مثلاً سنة المريخ = ٦٨٧ يوماً أرضية.</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.opInit){S.opInit=true;S.t=0;}
  function draw(){
    if(currentSim!=='g5earthsun') return;
    S.t+=0.01;
    c.fillStyle='#000818'; c.fillRect(0,0,w,h);
    // Title
    c.fillStyle='rgba(255,255,255,0.9)'; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('مقارنة مدارات الكواكب', w/2, h*0.08);
    // Solar system overview: Sun + multiple planets
    const cx2=w*0.15, cy2=h*0.55;
    // Sun
    const sg=c.createRadialGradient(cx2,cy2,0,cx2,cy2,30);
    sg.addColorStop(0,'#FFF200'); sg.addColorStop(1,'rgba(255,200,0,0)');
    c.fillStyle=sg; c.beginPath(); c.arc(cx2,cy2,30,0,Math.PI*2); c.fill();
    const planets=[
      {name:'عطارد',r:w*0.08,speed:4.15,size:4,color:'#A0A0A0',period:'88 يوم'},
      {name:'الزهرة',r:w*0.14,speed:1.62,size:7,color:'#E8C080',period:'225 يوم'},
      {name:'الأرض',r:w*0.21,speed:1,size:8,color:'#4488FF',period:'365 يوم'},
      {name:'المريخ',r:w*0.29,speed:0.53,size:5,color:'#CC4400',period:'687 يوم'},
    ];
    planets.forEach(p=>{
      c.strokeStyle='rgba(255,255,255,0.1)'; c.lineWidth=1; c.setLineDash([2,4]);
      c.beginPath(); c.arc(cx2,cy2,p.r,0,Math.PI*2); c.stroke(); c.setLineDash([]);
      const angle=S.t*p.speed;
      const px2=cx2+p.r*Math.cos(angle), py=cy2+p.r*Math.sin(angle)*0.4;
      c.fillStyle=p.color;
      c.beginPath(); c.arc(px2,py,p.size,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(8,w*0.017)}px Tajawal`; c.textAlign='center';
      c.fillText(p.name, px2, py+p.size+12);
    });
    // Table of facts
    const tX=w*0.48, tY=h*0.2;
    c.fillStyle='rgba(26,143,168,0.2)'; c.strokeStyle='rgba(26,143,168,0.4)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(tX, tY, w*0.49, h*0.6, 8); c.fill(); c.stroke();
    c.fillStyle='#4DC4E0'; c.font=`bold ${Math.max(11,w*0.023)}px Tajawal`; c.textAlign='center';
    c.fillText('حقائق عن الأرض والشمس', tX+w*0.245, tY+24);
    const facts=[
      'الأرض تدور حول الشمس في 365 يوماً',
      'الأرض تدور حول نفسها في 24 ساعة',
      'الشمس أكبر من الأرض بـ 109 مرة',
      'المسافة بين الأرض والشمس: 150 مليون كم',
      'القمر يدور حول الأرض في 29 يوماً',
    ];
    facts.forEach((f,i)=>{
      c.fillStyle='rgba(255,255,255,0.85)'; c.font=`${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='right';
      c.fillText(`• ${f}`, tX+w*0.465, tY+55+i*32);
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5DayNight() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🌓 الليل والنهار</div>
  <div class="ctrl-desc">
    شاهد كيف يُسبّب دوران الأرض حول محورها تعاقب الليل والنهار
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">⏱ حقيقة مهمة</div>
  <div class="ctrl-name" style="font-size:13px;font-weight:700;color:var(--gold,#D4901A);text-align:center;padding:8px;background:rgba(212,144,26,0.08);border-radius:8px">
    الأرض تكمل دورة كاملة<br>حول محورها كل ٢٤ ساعة
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٦ · د٣):</strong><br>
  ١- لماذا نرى الشمس تشرق من الشرق؟<br>
  ٢- في أيّ اتجاه تدور الأرض حول محورها؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">١- لأن الأرض تدور من الغرب إلى الشرق، فالجزء الشرقي يواجه الشمس أولاً.<br>٢- من الغرب إلى الشرق (عكس اتجاه عقارب الساعة عند النظر من القطب الشمالي).</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.dnInit){S.dnInit=true;S.t=0;S.paused=false;
    cv.onclick=function(){S.paused=!S.paused;};
  }
  function draw(){
    if(currentSim!=='g5rotation') return;
    if(!S.paused) S.t+=0.015;
    c.fillStyle='#000820'; c.fillRect(0,0,w,h);
    // Stars on night side
    for(let i=0;i<50;i++){
      const sx=((i*173)%100)/100*w, sy=((i*97)%100)/100*h;
      c.fillStyle=`rgba(255,255,255,${0.3+0.5*Math.sin(S.t+i)})`;
      c.beginPath(); c.arc(sx,sy,0.8,0,Math.PI*2); c.fill();
    }
    // Sun far left
    const sunGrd=c.createRadialGradient(w*0.06,h*0.5,0,w*0.06,h*0.5,w*0.1);
    sunGrd.addColorStop(0,'rgba(255,255,200,1)'); sunGrd.addColorStop(1,'rgba(255,200,0,0)');
    c.fillStyle=sunGrd; c.beginPath(); c.arc(w*0.06,h*0.5,w*0.1,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE000'; c.beginPath(); c.arc(w*0.06,h*0.5,w*0.04,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,240,100,0.8)'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center';
    c.fillText('الشمس ☀️', w*0.06, h*0.5+w*0.06);
    // Light beam
    const beamGrd=c.createLinearGradient(w*0.1,0,w*0.55,0);
    beamGrd.addColorStop(0,'rgba(255,240,100,0.35)'); beamGrd.addColorStop(1,'rgba(255,240,100,0)');
    c.fillStyle=beamGrd; c.fillRect(w*0.1,0,w*0.45,h);
    // Earth rotating
    const cx2=w*0.65, cy2=h*0.5, er=Math.min(w,h)*0.22;
    // Day/night halves
    c.save(); c.beginPath(); c.arc(cx2,cy2,er,0,Math.PI*2); c.clip();
    // Night side (dark)
    c.fillStyle='#0a1428'; c.fillRect(cx2-er,cy2-er,er*2,er*2);
    // Day side (lit)
    c.fillStyle='#4DC4E0';
    const lightAngle=Math.PI; // sun is to the left
    c.beginPath(); c.arc(cx2,cy2,er,lightAngle-Math.PI/2,lightAngle+Math.PI/2); c.closePath(); c.fill();
    // Green landmasses (rotate with Earth)
    c.save(); c.translate(cx2,cy2); c.rotate(S.t);
    c.fillStyle='#27AE60';
    c.beginPath(); c.ellipse(er*0.3, -er*0.2, er*0.2, er*0.12, 0.5, 0, Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(-er*0.2, er*0.15, er*0.15, er*0.1, -0.3, 0, Math.PI*2); c.fill();
    c.beginPath(); c.ellipse(er*0.05, er*0.3, er*0.13, er*0.08, 0.2, 0, Math.PI*2); c.fill();
    // Clouds
    c.fillStyle='rgba(255,255,255,0.6)';
    c.beginPath(); c.ellipse(er*0.1,-er*0.35,er*0.12,er*0.05,0.3,0,Math.PI*2); c.fill();
    c.restore();
    // Atmosphere glow
    const atmGrd=c.createRadialGradient(cx2,cy2,er,cx2,cy2,er+15);
    atmGrd.addColorStop(0,'rgba(100,200,255,0.4)'); atmGrd.addColorStop(1,'rgba(100,200,255,0)');
    c.fillStyle=atmGrd; c.beginPath(); c.arc(cx2,cy2,er+15,0,Math.PI*2); c.fill();
    c.restore();
    // Terminator line (day/night boundary)
    c.strokeStyle='rgba(255,255,255,0.25)'; c.lineWidth=2;
    c.beginPath(); c.arc(cx2,cy2,er,lightAngle-Math.PI/2,lightAngle+Math.PI/2); c.stroke();
    // City lights on night side (simple dots)
    const cityLights=[{a:1.8,r:0.65},{a:2.3,r:0.75},{a:2.8,r:0.6},{a:3.2,r:0.7},{a:3.7,r:0.55}];
    cityLights.forEach(cl=>{
      const rot=cl.a+S.t;
      const cx3=cx2+er*cl.r*Math.cos(rot), cy3=cy2+er*cl.r*0.7*Math.sin(rot);
      // Only draw on night side
      const relAngle=((rot-lightAngle)%(Math.PI*2)+Math.PI*2)%(Math.PI*2);
      if(relAngle>Math.PI*0.6&&relAngle<Math.PI*1.9){
        c.fillStyle='rgba(255,255,150,0.8)';
        c.beginPath(); c.arc(cx3,cy3,2,0,Math.PI*2); c.fill();
      }
    });
    // Rotation indicator
    const rotDeg=Math.round((S.t%(Math.PI*2))/(Math.PI*2)*360);
    c.fillStyle='rgba(0,0,0,0.55)'; c.strokeStyle='rgba(255,255,255,0.15)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*0.35,h*0.04,w*0.6,h*0.1,6); c.fill(); c.stroke();
    c.fillStyle='#4DC4E0'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='right';
    c.fillText(`دوران الأرض: ${rotDeg}° من 360° (كل 24 ساعة)`, w*0.94, h*0.08);
    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`;
    c.fillText('انقر للإيقاف/الاستمرار', w*0.94, h*0.12);
    // Labels
    c.fillStyle='rgba(255,255,255,0.6)'; c.font=`bold ${Math.max(10,w*0.02)}px Tajawal`; c.textAlign='center';
    c.fillText('النهار', cx2+er*0.5, cy2-er*0.6);
    c.fillStyle='rgba(150,150,200,0.7)';
    c.fillText('الليل', cx2-er*0.5, cy2-er*0.6);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5Seasons() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🍂 الفصول الأربعة</div>
  <div class="ctrl-desc">
    شاهد كيف يُسبّب ميل محور الأرض تغيّر الفصول خلال دورانها حول الشمس
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🌐 سبب الفصول في عُمان</div>
  <div class="ctrl-desc">
    🌞 <b>الصيف:</b> الشمس أعلى، الأشعة أكثر تركيزاً<br>
    ❄️ <b>الشتاء:</b> الشمس أخفض، الأشعة أكثر انتشاراً<br>
    ⚠️ السبب ليس المسافة من الشمس!
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٦ · د٣-ب):</strong><br>
  لماذا تشهد عُمان صيفاً حاراً وليس شتاءً بارداً جداً؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأن عُمان تقع قرب خط الاستواء، فتصلها أشعة الشمس بزاوية كبيرة طوال العام مما يجعل درجات الحرارة مرتفعة نسبياً. الشتاء أقل حرارة لكن لا يكون بارداً كالمناطق الشمالية.</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.seasInit){S.seasInit=true;S.t=0;S.paused=false;cv.onclick=function(){S.paused=!S.paused;};}
  function draw(){
    if(currentSim!=='g5rotation') return;
    if(!S.paused) S.t+=0.01;
    c.fillStyle='#000511'; c.fillRect(0,0,w,h);
    for(let i=0;i<60;i++){
      const sx=((i*173)%100)/100*w, sy=((i*97)%100)/100*h;
      c.fillStyle=`rgba(255,255,255,${0.2+0.4*Math.sin(S.t+i)})`;
      c.beginPath(); c.arc(sx,sy,0.7,0,Math.PI*2); c.fill();
    }
    const cx2=w*0.5, cy2=h*0.5;
    // Sun center
    const sg=c.createRadialGradient(cx2,cy2,0,cx2,cy2,40);
    sg.addColorStop(0,'#FFF200'); sg.addColorStop(1,'rgba(255,200,0,0)');
    c.fillStyle=sg; c.beginPath(); c.arc(cx2,cy2,40,0,Math.PI*2); c.fill();
    c.fillStyle='#FFE000'; c.font=`${Math.max(20,w*0.045)}px serif`; c.textAlign='center'; c.fillText('☀️',cx2,cy2+8);
    // Earth orbit (tilted ellipse)
    const orR=Math.min(w,h)*0.35;
    c.strokeStyle='rgba(255,255,255,0.12)'; c.lineWidth=1; c.setLineDash([3,4]);
    c.beginPath(); c.ellipse(cx2,cy2,orR,orR*0.6,0,0,Math.PI*2); c.stroke(); c.setLineDash([]);
    // Earth position
    const ex=cx2+orR*Math.cos(S.t), ey=cy2+orR*0.6*Math.sin(S.t);
    // Tilt axis
    const tiltAngle=23.5*Math.PI/180;
    const axLen=25;
    c.strokeStyle='rgba(255,255,255,0.5)'; c.lineWidth=1.5;
    c.beginPath();
    c.moveTo(ex-Math.sin(tiltAngle)*axLen, ey-Math.cos(tiltAngle)*axLen);
    c.lineTo(ex+Math.sin(tiltAngle)*axLen, ey+Math.cos(tiltAngle)*axLen);
    c.stroke();
    // Earth
    c.fillStyle='#1a6fa8'; c.beginPath(); c.arc(ex,ey,18,0,Math.PI*2); c.fill();
    c.fillStyle='#27ae60'; c.beginPath(); c.arc(ex+5,ey-5,10,0,Math.PI*2); c.fill();
    // Season label
    const seasonAngle=((S.t%(Math.PI*2))+Math.PI*2)%(Math.PI*2);
    let season=''; let sColor='#fff';
    if(seasonAngle<Math.PI*0.5){season='🌸 الربيع';sColor='#90EE90';}
    else if(seasonAngle<Math.PI){season='☀️ الصيف';sColor='#FFD700';}
    else if(seasonAngle<Math.PI*1.5){season='🍂 الخريف';sColor='#FFA500';}
    else{season='❄️ الشتاء';sColor='#ADD8E6';}
    c.fillStyle=sColor; c.font=`bold ${Math.max(12,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText(season, ex, ey-30);
    // Explanation box
    c.fillStyle='rgba(0,0,0,0.5)'; c.strokeStyle='rgba(255,255,255,0.15)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(w*0.02,h*0.02,w*0.5,h*0.13,6); c.fill(); c.stroke();
    c.fillStyle=sColor; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='right';
    c.fillText(`الفصل الحالي: ${season}`, w*0.51, h*0.07);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(9,w*0.019)}px Tajawal`;
    c.fillText('ميل محور الأرض يسبّب تغيّر الفصول', w*0.51, h*0.1);
    c.fillText('انقر للإيقاف/الاستمرار', w*0.51, h*0.135);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5StarMap() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🗺️ خريطة السماء الليلية</div>
  <div class="ctrl-desc">
    انقر على أي نجم لمعرفة اسمه ومعلوماته، وحاول تعرّف الكوكبات
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">⭐ أبرز النجوم</div>
  <div class="ctrl-desc">
    ⭐ <b>الشمس:</b> أقرب نجم لنا<br>
    🌟 <b>سهيل:</b> ثاني ألمع نجم في السماء<br>
    🧭 <b>النجم القطبي:</b> يشير دائماً للشمال<br>
    💫 <b>المجرّة:</b> مجرتنا درب التبّانة
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٦ · د٧):</strong><br>
  لماذا لا نرى النجوم في النهار رغم أنها موجودة دائماً؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">لأن ضوء الشمس القوي يُضيء الغلاف الجوي ويجعله مضيئاً جداً — فيطغى على ضوء النجوم الباهتة. ليلاً تغيب الشمس فنرى النجوم بوضوح.</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.smInit){
    S.smInit=true;S.t=0;S.hovered=-1;
    const stars=[
      {x:0.5,y:0.2,name:'النجم القطبي',mag:2.1,color:'#FFE8D0',constellation:'الدب الأصغر'},
      {x:0.25,y:0.3,name:'الشعرى اليمانية',mag:1.5,color:'#CCE0FF',constellation:'الكلب الأكبر'},
      {x:0.75,y:0.35,name:'نجم الجدي',mag:3.6,color:'#FFE0C0',constellation:'الجدي'},
      {x:0.4,y:0.55,name:'منكب الجوزاء',mag:0.5,color:'#FFB060',constellation:'الجبار'},
      {x:0.6,y:0.58,name:'رجل الجبار',mag:0.1,color:'#B8D8FF',constellation:'الجبار'},
      {x:0.2,y:0.65,name:'الذيل',mag:1.2,color:'#FFF0D0',constellation:'العقرب'},
      {x:0.8,y:0.25,name:'الدبران',mag:0.9,color:'#FF8844',constellation:'الثور'},
      {x:0.55,y:0.42,name:'القلب',mag:1.0,color:'#FF4444',constellation:'العقرب'},
    ];
    S.stars=stars;
    cv.onmousemove=function(e){
      const rect=cv.getBoundingClientRect();
      const mx=(e.clientX-rect.left)/cv.offsetWidth, my=(e.clientY-rect.top)/cv.offsetHeight;
      S.hovered=-1;
      stars.forEach((st,i)=>{ if(Math.hypot(mx-st.x,my-st.y)<0.05) S.hovered=i; });
    };
    cv.ontouchmove=function(e){e.preventDefault();
      const rect=cv.getBoundingClientRect(),t=e.touches[0];
      const mx=(t.clientX-rect.left)/cv.offsetWidth, my=(t.clientY-rect.top)/cv.offsetHeight;
      S.hovered=-1;
      stars.forEach((st,i)=>{ if(Math.hypot(mx-st.x,my-st.y)<0.07) S.hovered=i; });
    };
  }
  function draw(){
    if(currentSim!=='g5stars') return;
    S.t+=0.005;
    // Night sky
    const bgGrd=c.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h));
    bgGrd.addColorStop(0,'#0a0a1a'); bgGrd.addColorStop(1,'#000005');
    c.fillStyle=bgGrd; c.fillRect(0,0,w,h);
    // Milky way suggestion
    c.save(); c.globalAlpha=0.15;
    const mwGrd=c.createLinearGradient(0,h*0.3,w,h*0.7);
    mwGrd.addColorStop(0,'rgba(200,200,255,0)'); mwGrd.addColorStop(0.5,'rgba(200,200,255,0.4)'); mwGrd.addColorStop(1,'rgba(200,200,255,0)');
    c.fillStyle=mwGrd; c.save(); c.rotate(-0.3);
    c.fillRect(-w*0.5,h*0.2,w*2,h*0.3); c.restore(); c.restore();
    // Background stars
    for(let i=0;i<200;i++){
      const sx=((i*137+23)%100)/100*w, sy=((i*89+7)%100)/100*h;
      const tw=(1+Math.sin(S.t*1.5+i))*0.5;
      c.fillStyle=`rgba(255,255,255,${tw*0.5})`;
      c.beginPath(); c.arc(sx,sy,Math.random()*0.8+0.2,0,Math.PI*2); c.fill();
    }
    // Named stars
    S.stars.forEach((st,i)=>{
      const sx=st.x*w, sy=st.y*h;
      const size=Math.max(3, (3-st.mag*0.8)*2.5);
      const tw=0.7+0.3*Math.sin(S.t*2+i);
      // Glow
      const g=c.createRadialGradient(sx,sy,0,sx,sy,size*4);
      g.addColorStop(0,st.color+'AA'); g.addColorStop(1,st.color+'00');
      c.fillStyle=g; c.beginPath(); c.arc(sx,sy,size*4,0,Math.PI*2); c.fill();
      // Star
      c.fillStyle=st.color;
      c.beginPath(); c.arc(sx,sy,size*tw,0,Math.PI*2); c.fill();
      // Hover info
      if(i===S.hovered){
        c.strokeStyle='rgba(255,255,255,0.4)'; c.lineWidth=1;
        c.beginPath(); c.arc(sx,sy,size*8,0,Math.PI*2); c.stroke();
        const bW=w*0.35, bH=h*0.12;
        const bx=Math.min(sx+10, w-bW-10), by=Math.max(sy-bH-10, 10);
        c.fillStyle='rgba(0,0,20,0.85)'; c.strokeStyle='rgba(255,255,255,0.25)'; c.lineWidth=1;
        c.beginPath(); c.roundRect(bx,by,bW,bH,6); c.fill(); c.stroke();
        c.fillStyle=st.color; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='right';
        c.fillText(st.name, bx+bW-8, by+22);
        c.fillStyle='rgba(255,255,255,0.75)'; c.font=`${Math.max(9,w*0.019)}px Tajawal`;
        c.fillText(`الكوكبة: ${st.constellation}`, bx+bW-8, by+42);
        c.fillText(`القدر: ${st.mag}`, bx+bW-8, by+60);
      } else {
        c.fillStyle='rgba(255,255,255,0.6)'; c.font=`${Math.max(8,w*0.016)}px Tajawal`; c.textAlign='center';
        c.fillText(st.name, sx, sy+size+14);
      }
    });
    c.fillStyle='rgba(255,255,255,0.8)'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center';
    c.fillText('خريطة النجوم العربية — مرّر الماوس فوق نجم لمعرفة تفاصيله', w/2, h*0.95);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

function simG5StarNames() {
  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">✨ أسماء النجوم</div>
  <div class="ctrl-desc">
    انقر على كل نجم لاكتشاف اسمه العربي الأصيل وموقعه في السماء
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🌍 النجوم في التراث العُماني</div>
  <div class="ctrl-desc">
    كان البحّارة العُمانيون يستخدمون النجوم للملاحة في المحيط الهندي منذ آلاف السنين — "علم الأنواء" تراث عُماني أصيل
  </div>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (و٦ · د٧-ب):</strong><br>
  كيف يستخدم البحّارة النجم القطبي في الملاحة؟
  <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
  <div class="q-ans-panel">النجم القطبي (الجدي) يبقى ثابتاً دائماً فوق القطب الشمالي — البحّار يحدّد الشمال بالنظر إليه، ثم يعرف باقي الاتجاهات. ارتفاعه فوق الأفق يُخبره بخط عرضه الجغرافي أيضاً.</div>
</div>`;
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  const w=cv.width, h=cv.height;
  const S=simState;
  if(!S.snInit){S.snInit=true;S.t=0;S.currentConst=0;S.timer=0;}
  const constellations=[
    {name:'الجبار (أوريون)',color:'#4DC4E0',stars:[{x:0.45,y:0.3},{x:0.55,y:0.28},{x:0.5,y:0.45},{x:0.42,y:0.55},{x:0.58,y:0.53},{x:0.5,y:0.65}],lines:[[0,1],[0,2],[1,2],[2,3],[2,4],[3,5],[4,5]],fact:'أوريون الجبار يُرى في معظم أنحاء العالم'},
    {name:'الدب الأكبر',color:'#FFD700',stars:[{x:0.2,y:0.2},{x:0.3,y:0.18},{x:0.4,y:0.22},{x:0.5,y:0.26},{x:0.55,y:0.38},{x:0.5,y:0.48},{x:0.4,y:0.45}],lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],fact:'مقبض المغرفة يشير نحو النجم القطبي'},
    {name:'العقرب',color:'#FF6644',stars:[{x:0.3,y:0.3},{x:0.4,y:0.35},{x:0.5,y:0.32},{x:0.55,y:0.42},{x:0.5,y:0.52},{x:0.42,y:0.6},{x:0.48,y:0.7},{x:0.56,y:0.72}],lines:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]],fact:'قلب العقرب نجم أحمر عملاق'},
  ];
  function draw(){
    if(currentSim!=='g5stars') return;
    S.t+=0.008; S.timer++;
    if(S.timer>200){S.timer=0;S.currentConst=(S.currentConst+1)%constellations.length;}
    c.fillStyle='#000010'; c.fillRect(0,0,w,h);
    for(let i=0;i<150;i++){
      const sx=((i*173)%100)/100*w, sy=((i*97)%100)/100*h;
      c.fillStyle=`rgba(255,255,255,${0.1+0.3*Math.sin(S.t*2+i)})`;
      c.beginPath(); c.arc(sx,sy,0.7,0,Math.PI*2); c.fill();
    }
    const con=constellations[S.currentConst];
    // Draw lines
    c.strokeStyle=con.color+'55'; c.lineWidth=1.5; c.setLineDash([3,3]);
    con.lines.forEach(([a,b])=>{
      const sa=con.stars[a], sb=con.stars[b];
      c.beginPath(); c.moveTo(sa.x*w,sa.y*h); c.lineTo(sb.x*w,sb.y*h); c.stroke();
    });
    c.setLineDash([]);
    // Draw stars
    con.stars.forEach(st=>{
      const g=c.createRadialGradient(st.x*w,st.y*h,0,st.x*w,st.y*h,15);
      g.addColorStop(0,con.color+'CC'); g.addColorStop(1,con.color+'00');
      c.fillStyle=g; c.beginPath(); c.arc(st.x*w,st.y*h,15,0,Math.PI*2); c.fill();
      c.fillStyle=con.color; c.beginPath(); c.arc(st.x*w,st.y*h,4,0,Math.PI*2); c.fill();
    });
    // Name
    c.fillStyle=con.color; c.font=`bold ${Math.max(14,w*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText(con.name, w/2, h*0.12);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(10,w*0.021)}px Tajawal`;
    c.fillText(con.fact, w/2, h*0.88);
    // Progress
    const prog=S.timer/200;
    c.fillStyle='rgba(255,255,255,0.15)'; c.fillRect(w*0.1,h*0.93,w*0.8,4);
    c.fillStyle=con.color; c.fillRect(w*0.1,h*0.93,w*0.8*prog,4);
    c.fillStyle='rgba(255,255,255,0.5)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText(`${S.currentConst+1} / ${constellations.length} كوكبات`, w/2, h*0.97);
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ═══ Stub functions for simG5BehindYou extra tabs ═══
// (already defined above as simG5BehindYou)

// ═══════════════════════════════════════════════════════
// الصف التاسع — الوحدة ٦: الأحماض والقواعد
// ═══════════════════════════════════════════════════════

// ── 6-1 Tab1: تصنيف المحاليل ──

// ══════════════════════════════════════════════════════════════════
// الصف التاسع — وحدة 6: خصائص الأحماض والقواعد
// نسخة مُحسَّنة: تفاعل كامل، رسوم متحركة، جودة الصف السابع
// ══════════════════════════════════════════════════════════════════

// ── 6-1 Tab1: تصنيف المحاليل (تفاعلي - انقر لتصنيف) ──
