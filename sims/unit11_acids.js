function simAcidBase1() {
  cancelAnimationFrame(animFrame);
  simState = { t: 0, selected: null, hover: null };
  const acids = [
    { id:'lemon', label:'عصير الليمون', icon:'🍋', ph:2.5, type:'acid', desc:'حمض الستريك — حمض ضعيف، آمن للأكل، طعمه حامض', x:0.12, y:0.25 },
    { id:'vinegar', label:'الخل', icon:'🫙', ph:3, type:'acid', desc:'حمض الأسيتيك — حمض ضعيف يُستخدم في الطبخ', x:0.32, y:0.25 },
    { id:'cola', label:'مشروب الكولا', icon:'🥤', ph:3.5, type:'acid', desc:'حمض الفوسفوريك — حمض ضعيف في المشروبات الغازية', x:0.52, y:0.25 },
    { id:'hcl', label:'حمض الهيدروكلوريك', icon:'⚗️', ph:1, type:'strong', desc:'حمض قويّ جداً — مُؤكِّل خطير، يُستخدم في المختبر فقط', x:0.12, y:0.65 },
    { id:'sulfuric', label:'حمض الكبريتيك', icon:'🔴', ph:1, type:'strong', desc:'حمض قويّ مُؤكِّل — يُذيب المعادن والجلد، خطير جداً', x:0.35, y:0.65 },
    { id:'nitric', label:'حمض النيتريك', icon:'🟠', ph:1.5, type:'strong', desc:'حمض قويّ — مادة مُهيِّجة، يُستخدم في الصناعة', x:0.58, y:0.65 },
  ];
  controls(`
    <div style="padding:8px 0 4px;font-size:15px;color:#555;text-align:center">انقر على أي مادة لمعرفة خصائصها</div>
    <div id="acidInfoBox" style="margin-top:8px;padding:12px;background:rgba(26,143,168,0.07);border-radius:10px;min-height:60px;font-size:15px;color:#1A8FA8;text-align:center;line-height:1.6">اختر مادة من الرسم 👆</div>
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
      <span style="background:rgba(231,76,60,0.1);color:#C0392B;padding:4px 10px;border-radius:12px;font-size:13px">⚠️ حمض قويّ = مُؤكِّل</span>
      <span style="background:rgba(243,156,18,0.1);color:#D4901A;padding:4px 10px;border-radius:12px;font-size:13px">🍋 حمض ضعيف = آمن نسبياً</span>
    </div>
    <div style="margin-top:10px;padding:8px;background:#fff8e1;border-radius:8px;font-size:14px;color:#795548;text-align:center">
      📖 ص80 — الأحماض في كلّ مكان
    </div>
    <div class="q-box">
      <strong>❓ أسئلة الكتاب (ص٨٠-٨١):</strong><br>
      ١- اذكر طعاماً يحتوي على حمض.<br>
      ٢- ماذا يعني «مُسبِّب للتآكل»؟<br>
      ٣- ماذا يجب أن تفعل عند انسكاب حمض؟
    
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الليمون / الخل / البرتقال (أي طعام حامض).<br>٢- مادة تُذيب وتُتلف المواد الأخرى عند ملامستها.<br>٣- اغسل المنطقة فوراً بكثير من الماء.</div>
  </div>`);
  const canvas = document.getElementById('simCanvas');
  function draw() {
    const c = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    c.clearRect(0, 0, w, h);
    // bg
    c.fillStyle = '#F5F8FA'; c.fillRect(0,0,w,h);
    // title sections
    c.fillStyle = 'rgba(231,76,60,0.08)'; c.beginPath(); c.roundRect(w*0.05,h*0.08,w*0.9,h*0.38,12); c.fill();
    c.fillStyle = 'rgba(231,76,60,0.55)'; c.font='bold 14px Tajawal'; c.textAlign='center';
    c.fillText('أحماض ضعيفة — موجودة في الطعام', w/2, h*0.115);
    c.fillStyle = 'rgba(180,0,0,0.1)'; c.beginPath(); c.roundRect(w*0.05,h*0.52,w*0.9,h*0.38,12); c.fill();
    c.fillStyle = 'rgba(180,0,0,0.7)'; c.font='bold 14px Tajawal'; c.textAlign='center';
    c.fillText('أحماض قويّة — خطيرة ⚠️', w/2, h*0.555);
    simState.t += 0.025;
    acids.forEach((a, idx) => {
      const ax = a.x * w, ay = a.y * h;
      const isHover = simState.hover === a.id, isSel = simState.selected === a.id;
      const r = isHover || isSel ? 44 : 40;
      const bob = Math.sin(simState.t + idx) * (isHover ? 5 : 3);
      const cy2 = ay + bob;
      // glow
      if(isSel){ c.shadowBlur=18; c.shadowColor=a.type==='strong'?'#E74C3C':'#F4A522'; }
      // bottle shape
      c.fillStyle = a.type==='strong' ? 'rgba(231,76,60,0.18)' : 'rgba(243,156,18,0.15)';
      c.beginPath(); c.ellipse(ax, cy2, r, r*0.9, 0, 0, Math.PI*2); c.fill();
      c.fillStyle = a.type==='strong' ? '#C0392B' : '#E67E22';
      c.font = `${r*0.75}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(a.icon, ax, cy2);
      c.shadowBlur = 0;
      // label
      c.font='bold 12px Tajawal'; c.textAlign='center'; c.textBaseline='top';
      c.fillStyle = isSel ? '#1A8FA8' : '#555';
      c.fillText(a.label, ax, cy2 + r + 4);
      // pH badge
      const badgeTxt = 'pH ' + a.ph;
      c.fillStyle = a.type==='strong'?'rgba(192,57,43,0.85)':'rgba(230,126,34,0.85)';
      const bw = c.measureText(badgeTxt).width + 14;
      c.beginPath(); c.roundRect(ax - bw/2, cy2 - r - 22, bw, 16, 6); c.fill();
      c.fillStyle='#fff'; c.font='bold 11px Tajawal'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(badgeTxt, ax, cy2 - r - 14);
    });
    animFrame = requestAnimationFrame(draw);
  }
  canvas.onclick = function(e) {
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * canvas.width / r.width;
    const my = (e.clientY - r.top) * canvas.height / r.height;
    acids.forEach(a => {
      const ax = a.x * canvas.width, ay = a.y * canvas.height;
      if(Math.hypot(mx-ax, my-ay) < 48) {
        simState.selected = a.id;
        U9Sound.ping();
        const box = document.getElementById('acidInfoBox');
        if(box) {
          box.innerHTML = `<strong style="font-size:17px">${a.icon} ${a.label}</strong><br>
            <span style="color:#888">pH = ${a.ph}</span><br>${a.desc}`;
          box.style.background = a.type==='strong'?'rgba(192,57,43,0.1)':'rgba(243,156,18,0.1)';
          box.style.color = a.type==='strong'?'#C0392B':'#D4901A';
        }
      }
    });
  };
  canvas.onmousemove = function(e) {
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX - r.left) * canvas.width / r.width;
    const my = (e.clientY - r.top) * canvas.height / r.height;
    simState.hover = null;
    acids.forEach(a => { if(Math.hypot(mx - a.x*canvas.width, my - a.y*canvas.height) < 48) simState.hover = a.id; });
    canvas.style.cursor = simState.hover ? 'pointer' : 'default';
  };
  draw();
}

// ── 11-1 Tab 2: القلويّات ──
function simAcidBase2() {
  cancelAnimationFrame(animFrame);
  simState = { t: 0, selected: null };
  const bases = [
    { id:'soap', label:'محلول الصابون', icon:'🧴', ph:10, desc:'قلويّ ضعيف — يُستخدم للتنظيف، لزج الملمس', x:0.15, y:0.3 },
    { id:'toothpaste', label:'معجون الأسنان', icon:'🪥', ph:9, desc:'قلويّ ضعيف — يعادل حمض الفم ويحمي الأسنان', x:0.38, y:0.3 },
    { id:'bicarb', label:'بيكربونات الصوديوم', icon:'🥛', ph:8.5, desc:'قلويّ ضعيف — يُستخدم في الخبز وعلاج عُسر الهضم', x:0.62, y:0.3 },
    { id:'bleach', label:'الكلور المخفّف', icon:'🟡', ph:12, desc:'قلويّ قويّ — مُؤكِّل، يُستخدم للتعقيم بحذر', x:0.22, y:0.72 },
    { id:'naoh', label:'هيدروكسيد الصوديوم', icon:'⬜', ph:13, desc:'قلويّ قويّ جداً — مُؤكِّل خطير، يُذيب الدهون والبروتينات', x:0.5, y:0.72 },
    { id:'lime', label:'هيدروكسيد الكالسيوم', icon:'🪨', ph:12.5, desc:'قلويّ قويّ — يُستخدم في معالجة التربة الحمضيّة', x:0.78, y:0.72 },
  ];
  controls(`
    <div style="padding:8px 0 4px;font-size:15px;color:#555;text-align:center">انقر على أي مادة لمعرفة خصائصها</div>
    <div id="baseInfoBox" style="margin-top:8px;padding:12px;background:rgba(39,174,96,0.07);border-radius:10px;min-height:60px;font-size:15px;color:#27AE60;text-align:center;line-height:1.6">اختر مادة من الرسم 👆</div>
    <div style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center">
      <span style="background:rgba(39,174,96,0.1);color:#1E8449;padding:4px 10px;border-radius:12px;font-size:13px">🧴 قلويّ ضعيف = آمن نسبياً</span>
      <span style="background:rgba(142,68,173,0.1);color:#6C3483;padding:4px 10px;border-radius:12px;font-size:13px">⚠️ قلويّ قويّ = مُؤكِّل</span>
    </div>
    <div style="margin-top:10px;padding:8px;background:#e8f5e9;border-radius:8px;font-size:14px;color:#2E7D32;text-align:center">
      📖 ص81 — القلويّات في كلّ مكان
    </div>`);
  const canvas = document.getElementById('simCanvas');
  function draw() {
    const c = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    c.clearRect(0,0,w,h);
    c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    c.fillStyle='rgba(39,174,96,0.07)'; c.beginPath(); c.roundRect(w*0.05,h*0.08,w*0.9,h*0.38,12); c.fill();
    c.fillStyle='rgba(39,174,96,0.7)'; c.font='bold 14px Tajawal'; c.textAlign='center';
    c.fillText('قلويّات ضعيفة — شائعة في المنزل', w/2, h*0.115);
    c.fillStyle='rgba(142,68,173,0.08)'; c.beginPath(); c.roundRect(w*0.05,h*0.52,w*0.9,h*0.38,12); c.fill();
    c.fillStyle='rgba(142,68,173,0.8)'; c.font='bold 14px Tajawal'; c.textAlign='center';
    c.fillText('قلويّات قويّة — خطيرة ⚠️', w/2, h*0.555);
    simState.t += 0.025;
    bases.forEach((b, idx) => {
      const bx = b.x * w, by = b.y * h;
      const isSel = simState.selected === b.id;
      const bob = Math.sin(simState.t + idx*1.3) * 3;
      const cy2 = by + bob;
      if(isSel){ c.shadowBlur=18; c.shadowColor='#27AE60'; }
      c.fillStyle = b.ph > 11 ? 'rgba(142,68,173,0.15)' : 'rgba(39,174,96,0.15)';
      c.beginPath(); c.ellipse(bx, cy2, 40, 36, 0, 0, Math.PI*2); c.fill();
      c.fillStyle = b.ph > 11 ? '#6C3483' : '#1E8449';
      c.font='30px serif'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(b.icon, bx, cy2);
      c.shadowBlur=0;
      c.font='bold 11px Tajawal'; c.textAlign='center'; c.textBaseline='top';
      c.fillStyle = isSel ? '#27AE60' : '#555';
      c.fillText(b.label, bx, cy2 + 42);
      const bTxt = 'pH ' + b.ph;
      c.fillStyle = b.ph > 11 ? 'rgba(142,68,173,0.85)' : 'rgba(39,174,96,0.85)';
      const bw = c.measureText(bTxt).width + 14;
      c.beginPath(); c.roundRect(bx-bw/2, cy2-52, bw, 16, 6); c.fill();
      c.fillStyle='#fff'; c.font='bold 11px Tajawal'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(bTxt, bx, cy2-44);
    });
    animFrame = requestAnimationFrame(draw);
  }
  canvas.onclick = function(e) {
    const r = canvas.getBoundingClientRect();
    const mx = (e.clientX-r.left)*canvas.width/r.width, my = (e.clientY-r.top)*canvas.height/r.height;
    bases.forEach(b => {
      if(Math.hypot(mx-b.x*canvas.width, my-b.y*canvas.height) < 46) {
        simState.selected = b.id; U9Sound.ping();
        const box = document.getElementById('baseInfoBox');
        if(box){ box.innerHTML=`<strong style="font-size:17px">${b.icon} ${b.label}</strong><br><span style="color:#888">pH = ${b.ph}</span><br>${b.desc}`; }
      }
    });
  };
  draw();
}

// ── 11-2 Tab 1: ورق تبّاع الشمس ──
function simIndicator1() {
  cancelAnimationFrame(animFrame);

  const SOLUTIONS = [
    { id:'s1', label:'عصير\nالليمون',  ph:2.5, color:'#C0392B', bgCol:'rgba(220,180,80,',  type:'acid',    emoji:'🍋', typeLabel:'حمضي قوي' },
    { id:'s2', label:'ماء مالح',       ph:7,   color:'#7D6B91', bgCol:'rgba(180,195,215,', type:'neutral', emoji:'💧', typeLabel:'متعادل' },
    { id:'s3', label:'محلول\nالصابون', ph:10,  color:'#1A6A9A', bgCol:'rgba(180,210,230,', type:'base',    emoji:'🧼', typeLabel:'قلوي' },
    { id:'s4', label:'مشروب\nالكولا',  ph:3.5, color:'#8B3A2A', bgCol:'rgba(180,120,90,',  type:'acid',    emoji:'🥤', typeLabel:'حمضي' },
    { id:'s5', label:'هيدروكسيد\nالكالسيوم', ph:12, color:'#1A5276', bgCol:'rgba(190,205,220,', type:'base', emoji:'🧪', typeLabel:'قلوي قوي' },
  ];

  simState = { t:0, dipped:{} };

  // ── Controls panel ──
  controls(`
    <div class="ctrl-label">📄 ورق تبّاع الشمس</div>
    <div class="info-box" style="text-align:center;line-height:1.8">
      اسحب ورقة تبّاع الشمس<br>إلى المحلول لترى لونها
    </div>
    <div id="dipResult" style="margin-top:8px;padding:10px 12px;border-radius:10px;
      background:rgba(26,143,168,0.06);border:1.5px solid rgba(26,143,168,0.15);
      font-size:14px;color:#555;line-height:1.7;min-height:54px;
      border-right:4px solid rgba(26,143,168,0.3)">
      اسحب الورقة فوق أحد المحاليل...
    </div>
    <div id="dipScore" style="margin-top:6px;font-size:13px;color:#1A8FA8;
      text-align:center;font-weight:600"></div>
    <div style="margin-top:10px;padding:8px 10px;background:rgba(212,144,26,0.07);
      border-radius:8px;font-size:13px;color:#7A5010;line-height:1.8">
      🔴 حمض &nbsp;|&nbsp; 🟣 متعادل &nbsp;|&nbsp; 🔵 قلوي
    </div>
    <div style="margin-top:8px;padding:6px 10px;background:#f8f9fa;border-radius:8px;
      font-size:12px;color:#777;text-align:center">
      📖 ص82 — ورق تبّاع الشمس
    </div>
  `);



  const canvas = document.getElementById('simCanvas');

  // Paper state
  let paperX = 0.5, paperY = 0.14;
  let dragging = false;
  let paperColor = { r:220, g:208, b:170 }; // neutral beige
  let colorProgress = 0;
  let lastDipped = null;
  let dipCount = 0;
  let dipAnim = 0;

  // Dipping animation
  let isDipping = false;
  let dipProgress = 0;
  let dipTarget = null;
  let dipPhase = 0; // 0=descend, 1=color, 2=ascend

  function hexToRgb(hex) {
    return { r:parseInt(hex.slice(1,3),16), g:parseInt(hex.slice(3,5),16), b:parseInt(hex.slice(5,7),16) };
  }
  function lerpColor(a,b,t) {
    return { r:Math.round(a.r+(b.r-a.r)*t), g:Math.round(a.g+(b.g-a.g)*t), b:Math.round(a.b+(b.b-a.b)*t) };
  }
  function rgbStr(c,a=1){ return `rgba(${c.r},${c.g},${c.b},${a})`; }

  function draw() {
    const c = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    c.clearRect(0,0,w,h);
    simState.t += 0.02;

    // ── Background ──
    const bg = c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F8FF'); bg.addColorStop(1,'#E8EEF8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Lab bench surface
    c.fillStyle='rgba(180,160,130,0.18)';
    c.beginPath(); c.roundRect(0, h*0.72, w, h*0.28, 0); c.fill();
    c.fillStyle='rgba(160,140,110,0.3)';
    c.fillRect(0, h*0.72, w, 3);

    // Instruction text if not started
    if(dipCount===0 && !isDipping) {
      c.font=`bold 14px Tajawal`; c.fillStyle='rgba(80,110,160,0.65)';
      c.textAlign='center'; c.textBaseline='top';
      c.fillText('↓  اسحبي الورقة نحو أي كأس', w/2, h*0.04);
    }

    // ── Advance dip animation ──
    if(isDipping) {
      dipProgress += 0.022;
      if(dipPhase===0 && dipProgress>0.38) dipPhase=1;
      else if(dipPhase===1) {
        const blend=(dipProgress-0.38)/0.37;
        colorProgress=Math.min(1, blend*1.3);
        paperColor=lerpColor(paperColor, hexToRgb(dipTarget.color), colorProgress);
        if(dipProgress>0.75) dipPhase=2;
      } else if(dipPhase===2 && dipProgress>=1.0) {
        isDipping=false; dipProgress=0; dipPhase=0;
        paperX=0.5; paperY=0.14;
      }
    }

    // ── Draw beakers ──
    const n = SOLUTIONS.length;
    SOLUTIONS.forEach((sol, i) => {
      const bx = w * (0.1 + i * (0.82/(n-1)));
      const by = h * 0.68;
      const bW = Math.min(w*0.14, 62);
      const bH = bW * 1.2;
      const isDipped = simState.dipped[sol.id];
      const isActive = isDipping && dipTarget && dipTarget.id===sol.id;

      // Beaker glass body
      const glassG = c.createLinearGradient(bx-bW/2,0,bx+bW/2,0);
      glassG.addColorStop(0,'rgba(220,235,255,0.6)');
      glassG.addColorStop(0.3,'rgba(255,255,255,0.15)');
      glassG.addColorStop(0.7,'rgba(255,255,255,0.1)');
      glassG.addColorStop(1,'rgba(200,220,255,0.5)');
      c.fillStyle=glassG;
      c.strokeStyle=isActive?'rgba(26,143,168,0.8)':'rgba(120,150,200,0.4)';
      c.lineWidth=isActive?2.5:1.8;
      c.beginPath();
      c.moveTo(bx-bW/2+4, by-bH);
      c.lineTo(bx-bW/2, by);
      c.quadraticCurveTo(bx-bW/2, by+8, bx-bW/2+8, by+8);
      c.lineTo(bx+bW/2-8, by+8);
      c.quadraticCurveTo(bx+bW/2, by+8, bx+bW/2, by);
      c.lineTo(bx+bW/2-4, by-bH);
      c.closePath(); c.fill(); c.stroke();

      // Beaker rim/spout
      c.strokeStyle=isActive?'rgba(26,143,168,0.8)':'rgba(120,150,200,0.5)';
      c.lineWidth=3;
      c.beginPath();
      c.moveTo(bx-bW/2+4,by-bH); c.lineTo(bx-bW/2-3,by-bH-8);
      c.moveTo(bx+bW/2-4,by-bH); c.lineTo(bx+bW/2+3,by-bH-8);
      c.stroke();

      // Liquid inside beaker — هادئ ومرئي قبل وبعد الغمس
      const liqH = bH * 0.68;
      const liqY = by - liqH + 4;

      if(!isDipped && !isActive) {
        // قبل الغمس — لون المادة الطبيعي بشفافية عالية
        c.fillStyle = sol.bgCol + '0.18)';
      } else if(isActive) {
        c.fillStyle = sol.bgCol + '0.32)';
      } else {
        // بعد الغمس — أوضح قليلاً
        c.fillStyle = sol.bgCol + '0.42)';
      }
      c.beginPath();
      c.moveTo(bx-bW/2+3, liqY);
      c.lineTo(bx-bW/2+1, by+2);
      c.lineTo(bx+bW/2-1, by+2);
      c.lineTo(bx+bW/2-3, liqY);
      c.closePath(); c.fill();

      // Liquid surface shimmer
      c.fillStyle='rgba(255,255,255,0.28)';
      c.beginPath(); c.ellipse(bx, liqY+2, bW/2-6, 4, 0, 0, Math.PI*2); c.fill();

      // Ripple when paper dips
      if(isActive && dipPhase>=1) {
        const rp=(dipProgress-0.38)*80;
        const ra=Math.max(0, 0.6-(dipProgress-0.38)*1.2);
        c.strokeStyle=`rgba(255,255,255,${ra})`;
        c.lineWidth=2;
        c.beginPath(); c.ellipse(bx, liqY+6, rp*0.4, rp*0.12, 0, 0, Math.PI*2); c.stroke();
      }

      // Color strip inside beaker after dipping (paper left a stain)
      if(isDipped) {
        const sc2=hexToRgb(sol.color);
        const stripG=c.createLinearGradient(0,liqY,0,by);
        stripG.addColorStop(0,`rgba(${sc2.r},${sc2.g},${sc2.b},0)`);
        stripG.addColorStop(0.4,`rgba(${sc2.r},${sc2.g},${sc2.b},0.35)`);
        stripG.addColorStop(1,`rgba(${sc2.r},${sc2.g},${sc2.b},0.5)`);
        c.fillStyle=stripG;
        c.beginPath();
        c.moveTo(bx-bW/2+3, liqY); c.lineTo(bx-bW/2+1, by+2);
        c.lineTo(bx+bW/2-1, by+2); c.lineTo(bx+bW/2-3, liqY);
        c.closePath(); c.fill();
      }

      // Emoji label on beaker
      c.font=`${Math.round(bW*0.45)}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(sol.emoji, bx, by-bH*0.35);

      // Text label below
      c.font=`bold ${Math.max(9,Math.round(w*0.018))}px Tajawal`;
      c.fillStyle='#334'; c.textAlign='center'; c.textBaseline='top';
      const lLines=sol.label.split('\n');
      lLines.forEach((line,li)=>c.fillText(line, bx, by+12+li*14));

      // pH label
      c.font=`bold ${Math.max(10,Math.round(w*0.02))}px Tajawal`;
      c.fillStyle='#1A8FA8';
      c.fillText('pH '+sol.ph, bx, by+12+lLines.length*14);

      // Ripple ring
      if(lastDipped===sol.id && dipAnim>0) {
        const dc=hexToRgb(sol.color);
        c.strokeStyle=`rgba(${dc.r},${dc.g},${dc.b},${dipAnim})`;
        c.lineWidth=2.5;
        c.beginPath(); c.ellipse(bx, by-bH*0.4, (1-dipAnim)*bW*0.8, (1-dipAnim)*bW*0.25, 0, 0, Math.PI*2); c.stroke();
        dipAnim=Math.max(0,dipAnim-0.022);
      }
    });

    // ── Paper position during animation ──
    let drawPX=paperX*w, drawPY=paperY*h;
    let submergeDepth=0;

    if(isDipping && dipTarget) {
      const bi=SOLUTIONS.findIndex(s=>s.id===dipTarget.id);
      const bx=w*(0.1+bi*(0.82/(n-1)));
      const by=h*0.68, bH=Math.min(w*0.14,62)*1.2;
      const restY=0.14*h;

      if(dipPhase===0) {
        const t=dipProgress/0.38;
        drawPX=paperX*w+(bx-paperX*w)*t;
        drawPY=restY+(by-bH*0.7-restY)*t;
        submergeDepth=0;
      } else if(dipPhase===1) {
        drawPX=bx; drawPY=by-bH*0.7;
        submergeDepth=Math.min(44,(dipProgress-0.38)/0.37*44);
      } else {
        const t=(dipProgress-0.75)/0.25;
        drawPX=bx+(0.5*w-bx)*t;
        drawPY=(by-bH*0.7)+(0.14*h-(by-bH*0.7))*t;
        submergeDepth=Math.max(0,44-t*44);
      }
    }

    // ── Draw litmus paper — bigger & clearer ──
    c.save();
    const px=drawPX, py=drawPY;
    const pW=22, pHstrip=56, pHhandle=28;
    const fc=paperColor;

    // Drop shadow
    c.fillStyle='rgba(0,0,0,0.1)';
    c.beginPath(); c.ellipse(px+4, py+pHhandle+pHstrip+4, pW*0.5, 5, 0, 0, Math.PI*2); c.fill();

    // Handle (wooden/beige grip)
    const hGrad=c.createLinearGradient(px-pW/2,0,px+pW/2,0);
    hGrad.addColorStop(0,'#E8D8A8'); hGrad.addColorStop(0.5,'#F4E8C0'); hGrad.addColorStop(1,'#D8C898');
    c.fillStyle=hGrad;
    c.strokeStyle='rgba(140,110,50,0.3)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(px-pW/2, py, pW, pHhandle, [4,4,0,0]); c.fill(); c.stroke();

    // Grip lines on handle
    for(let i=0;i<4;i++) {
      c.strokeStyle='rgba(120,90,40,0.2)'; c.lineWidth=0.8;
      c.beginPath(); c.moveTo(px-pW/2+4, py+7+i*5); c.lineTo(px+pW/2-4, py+7+i*5); c.stroke();
    }

    // Strip — with clipping for submerged part
    c.save();
    const visH=Math.max(2, pHstrip-submergeDepth);
    c.beginPath(); c.rect(px-pW/2, py+pHhandle, pW, visH); c.clip();

    // Color bleeds up from bottom
    const blendT=colorProgress;
    const beigePx=Math.round(pHstrip*(1-blendT));
    const colorPx=pHstrip-beigePx;

    // Beige top portion
    if(beigePx>0 && beigePx<visH) {
      c.fillStyle='rgba(220,208,170,1)';
      c.beginPath(); c.rect(px-pW/2+1, py+pHhandle, pW-2, Math.min(beigePx,visH)); c.fill();
    }

    // Colored bottom portion — gradient for realism
    if(colorPx>0) {
      const sy=py+pHhandle+beigePx;
      const sh=Math.min(colorPx, visH-beigePx);
      if(sh>0) {
        // Color bleeds: gradient from light at top edge to full at bottom
        const cg=c.createLinearGradient(0, sy, 0, sy+sh);
        cg.addColorStop(0, `rgba(${fc.r},${fc.g},${fc.b},${0.5+blendT*0.3})`);
        cg.addColorStop(0.3, `rgba(${fc.r},${fc.g},${fc.b},${0.7+blendT*0.25})`);
        cg.addColorStop(1,   `rgba(${fc.r},${fc.g},${fc.b},1)`);
        c.fillStyle=cg;
        c.beginPath(); c.rect(px-pW/2+1, sy, pW-2, sh); c.fill();

        // "Wet" spreading effect at the boundary
        if(blendT>0.05 && blendT<0.99) {
          c.fillStyle=`rgba(${fc.r},${fc.g},${fc.b},0.3)`;
          c.beginPath(); c.ellipse(px, sy+2, pW/2-1, 4, 0, 0, Math.PI*2); c.fill();
        }
      }
    } else {
      // Full beige
      c.fillStyle='rgba(220,208,170,1)';
      c.beginPath(); c.rect(px-pW/2+1, py+pHhandle, pW-2, visH); c.fill();
    }

    // Paper texture lines
    c.strokeStyle='rgba(0,0,0,0.06)'; c.lineWidth=0.6;
    for(let i=0;i<7;i++){
      const ly=py+pHhandle+4+i*7;
      if(ly<py+pHhandle+visH-2){ c.beginPath(); c.moveTo(px-pW/2+3,ly); c.lineTo(px+pW/2-3,ly); c.stroke(); }
    }

    // Shine on paper
    c.fillStyle='rgba(255,255,255,0.22)';
    c.beginPath(); c.rect(px-pW/2+2, py+pHhandle+1, 5, visH-2); c.fill();

    // Paper outline
    c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1.2;
    c.beginPath(); c.roundRect(px-pW/2, py+pHhandle, pW, visH, [0,0,4,4]); c.stroke();

    c.restore(); // unclip

    // "ورق تباع الشمس" label
    if(!isDipping) {
      c.font=`bold 12px Tajawal`; c.fillStyle='rgba(60,45,20,0.85)';
      c.textAlign='center'; c.textBaseline='top';
      c.fillText('ورق تبّاع الشمس', px, py+pHhandle+pHstrip+6);
    }

    // Color result badge floating above
    if(colorProgress>0.45 && lastDipped && !isDipping) {
      const dp=SOLUTIONS.find(s=>s.id===lastDipped);
      if(dp) {
        const badgeText = `${dp.typeLabel} — ${dp.label.replace('\n',' ')}`;
        c.font='bold 13px Tajawal';
        const textW = c.measureText(badgeText).width;
        const badgeW = textW + 28;   // نص + هامش كافٍ
        const badgeH = 32;
        // خلفية محايدة هادئة — لا علاقة لها بلون المحلول
        c.fillStyle='rgba(30,45,70,0.10)';
        c.strokeStyle='rgba(30,45,70,0.30)';
        c.lineWidth=1.5;
        c.beginPath(); c.roundRect(px-badgeW/2, py-48, badgeW, badgeH, 10); c.fill(); c.stroke();
        c.fillStyle='rgba(30,45,70,0.85)';
        c.textAlign='center'; c.textBaseline='middle';
        c.fillText(badgeText, px, py-48+badgeH/2);
      }
    }

    c.restore();

    animFrame=requestAnimationFrame(draw);
  }

  // ── Drag logic ──
  function getPos(e){
    const r=canvas.getBoundingClientRect();
    const touch=e.touches&&e.touches[0]||e;
    return { x:(touch.clientX-r.left)*canvas.width/r.width, y:(touch.clientY-r.top)*canvas.height/r.height };
  }
  function onStart(e){
    if(isDipping) return;
    e.preventDefault&&e.preventDefault();
    const pos=getPos(e);
    const px=paperX*canvas.width, py=(paperY+0.05)*canvas.height;
    if(Math.hypot(pos.x-px, pos.y-py)<60) dragging=true;
  }
  function onMove(e){
    if(!dragging||isDipping) return;
    e.preventDefault&&e.preventDefault();
    const pos=getPos(e);
    paperX=Math.max(0.05,Math.min(0.95,pos.x/canvas.width));
    paperY=Math.max(0.03,Math.min(0.65,(pos.y-35)/canvas.height));
  }
  function onEnd(e){
    if(!dragging||isDipping) return;
    dragging=false;
    const py2=paperY*canvas.height;
    if(py2>canvas.height*0.38){
      const n=SOLUTIONS.length;
      let closest=null, minDist=Infinity;
      SOLUTIONS.forEach((sol,i)=>{
        const bx=0.1+i*(0.82/(n-1));
        const d=Math.abs(paperX-bx);
        if(d<minDist){minDist=d;closest=sol;}
      });
      if(closest && minDist<0.13){
        isDipping=true; dipProgress=0; dipPhase=0;
        dipTarget=closest; lastDipped=closest.id;
        dipAnim=1; dipCount++;
        colorProgress=0;
        simState.dipped[closest.id]=true;
        U9Sound.ping(600,0.15,0.12);
        setTimeout(()=>{
          const box=document.getElementById('dipResult');
          if(box){
            box.innerHTML=`
              <div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:4px">
                <span style="font-size:22px">${closest.emoji}</span>
                <strong style="font-size:15px;color:#222">${closest.label.replace('\n',' ')}</strong>
              </div>
              <div style="color:${closest.color};font-weight:700;font-size:15px">
                ${closest.typeLabel} — pH ${closest.ph}
              </div>
              <div style="font-size:13px;color:#555;margin-top:3px">
                ${closest.type==='acid'?'الورقة تحمرّ 🔴 — حمض':closest.type==='neutral'?'الورقة تبقى بنفسجية 🟣 — متعادل':'الورقة تزرقّ 🔵 — قلوي'}
              </div>`;
            box.style.borderRight=`4px solid ${closest.color}`;
          }
          const sc=document.getElementById('dipScore');
          const done=Object.keys(simState.dipped).length;
          if(sc) sc.textContent=`✅ ${done} من ${SOLUTIONS.length} محاليل مكتملة`;
          if(done===SOLUTIONS.length)
            setTimeout(()=>buddySay('ممتاز! 🌟 اختبرتِ جميع المحاليل — أحمر=حمض، بنفسجي=متعادل، أزرق=قلوي!',7000),500);
        },600);
        return;
      }
    }
    paperX=0.5; paperY=0.14;
  }

  canvas.onmousedown=onStart; canvas.onmousemove=onMove; canvas.onmouseup=onEnd;
  canvas.addEventListener('touchstart',onStart,{passive:false});
  canvas.addEventListener('touchmove',onMove,{passive:false});
  canvas.addEventListener('touchend',onEnd,{passive:false});
  draw();
}

// ── 11-2 Tab 2: صنع كاشفك — تفاعلي ──
function simIndicator2() {
  cancelAnimationFrame(animFrame);

  const STEPS = [
    { id:'cut',   title:'١- اقطع المادة النباتية', icon:'✂️', btn:'✂️ اضغط للقطع',    color:'#E91E63', done:false },
    { id:'grind', title:'٢- اطحن الأجزاء',         icon:'🪨', btn:'🪨 اضغط للطحن',    color:'#9C27B0', done:false },
    { id:'filter',title:'٣- صفّي السائل',           icon:'🫗', btn:'🫗 اضغط للتصفية',  color:'#673AB7', done:false },
    { id:'test',  title:'٤- اختبر موادّ مختلفة',   icon:'🧪', btn:'🧪 اختبر الآن',    color:'#3F51B5', done:false },
    { id:'record',title:'٥- سجّل الألوان',          icon:'📝', btn:'📝 سجّل النتائج',  color:'#2196F3', done:false },
  ];

  const RESULTS = [
    { material:'عصير الليمون',        color:'rgba(240,215,100,0.45)', colorSolid:'#C8A830', ph:'pH 2', label:'حمضي 🔴' },
    { material:'الماء',               color:'rgba(195,225,245,0.38)', colorSolid:'#90B8CC', ph:'pH 7', label:'متعادل 💜' },
    { material:'محلول الصابون',       color:'rgba(195,228,245,0.38)', colorSolid:'#90B8CC', ph:'pH 9', label:'قلوي 🟢' },
    { material:'هيدروكسيد الصوديوم', color:'rgba(210,218,228,0.38)', colorSolid:'#A0ACBA', ph:'pH 13',label:'قلوي قوي 🔵' },
  ];

  simState = {
    t: 0,
    step: 0,
    anim: null,
    animT: 0,
    particles: [],
    liquid: 0,
    testIdx: -1,      // أنبوبة الاختبار الحالية (-1 = لم نبدأ)
    completed: [],    // الأنابيب المكتملة [0,1,2,3]
    recorded: [],
    done: false,
  };

  // ── Controls panel ──
  controls(`
    <div style="font-size:13px;color:#888;margin-bottom:10px;text-align:center">مراحل صنع الكاشف الطبيعي</div>
    <div id="stepsList" style="display:flex;flex-direction:column;gap:5px">
      ${STEPS.map((s,i)=>`
        <div id="stepItem${i}" style="padding:7px 10px;border-radius:8px;
          background:${i===0?'rgba(26,143,168,0.12)':'rgba(0,0,0,0.03)'};
          border:1.5px solid ${i===0?'rgba(26,143,168,0.4)':'rgba(0,0,0,0.08)'};
          font-size:13px;color:#444;display:flex;align-items:center;gap:6px">
          <span id="stepCheck${i}" style="font-size:15px">${s.icon}</span>
          <span>${s.title}</span>
        </div>`).join('')}
    </div>
    <button id="actionBtn" onclick="ind2Action()"
      style="margin-top:12px;width:100%;padding:13px;border-radius:10px;
      background:linear-gradient(135deg,#E91E63,#C2185B);color:white;border:none;
      font-family:Tajawal;font-size:15px;font-weight:700;cursor:pointer;
      box-shadow:0 4px 14px rgba(233,30,99,0.4);transition:all 0.2s">
      ✂️ اضغط للقطع
    </button>
    <div id="ind2Msg" style="margin-top:8px;font-size:13px;text-align:center;
      color:#888;min-height:18px"></div>
    <div style="margin-top:8px;padding:7px;background:#f8f9fa;border-radius:8px;
      font-size:12px;color:#777;text-align:center">📖 ص83 — نشاط 2-11</div>
    <div class="q-box" style="margin-top:8px"><strong>❓ ص٨٢:</strong> كيف يُوضِّح الكاشف الفرق بين الحمض والقلويّ؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">يتحوّل لون الكاشف لألوان مختلفة — أحمر/برتقالي للأحماض، وأزرق/أخضر للقلويّات.</div>
    </div>
  `);

  // ── Global action handler ──
  window.ind2Action = function() {
    const s = STEPS[simState.step];
    if(simState.anim) return; // animation in progress

    // Special: step 3 (test) — button triggers current testIdx tube
    if(s.id === 'test') {
      if(simState.testIdx < 0) simState.testIdx = 0;
      simState.anim = 'test';
      simState.animT = 0;
      const btn = document.getElementById('actionBtn');
      if(btn){ btn.textContent='⏳ جارٍ...'; btn.style.opacity='0.7'; btn.style.cursor='wait'; }
      U9Sound.ping(523, 0.2, 0.15);
      return;
    }

    simState.anim = s.id;
    simState.animT = 0;

    // Generate particles based on step
    simState.particles = [];
    if(s.id === 'cut') {
      // Red cabbage leaf pieces falling
      for(let i=0;i<18;i++) simState.particles.push({
        x: 0.3+Math.random()*0.4, y: -0.05-Math.random()*0.2,
        vy: 0.004+Math.random()*0.006, vx: (Math.random()-0.5)*0.003,
        r: 8+Math.random()*12, a: Math.random()*Math.PI*2,
        col: `rgba(${150+Math.floor(Math.random()*80)},${20+Math.floor(Math.random()*40)},${80+Math.floor(Math.random()*60)},0.85)`,
        shape: Math.random()>0.5?'leaf':'rect'
      });
    } else if(s.id === 'grind') {
      // Grinding particles spiraling
      for(let i=0;i<24;i++) simState.particles.push({
        angle: (i/24)*Math.PI*2, r: 0.08+Math.random()*0.12,
        speed: 0.04+Math.random()*0.03,
        col: `rgba(${120+Math.floor(Math.random()*80)},${10+Math.floor(Math.random()*30)},${100+Math.floor(Math.random()*60)},0.8)`,
        size: 4+Math.random()*8, life:1
      });
    } else if(s.id === 'filter') {
      simState.liquid = 0;
    }

    // Update button to show "جارٍ..."
    const btn = document.getElementById('actionBtn');
    if(btn){ btn.textContent = '⏳ جارٍ...'; btn.style.opacity='0.7'; btn.style.cursor='wait'; }

    U9Sound.ping(523, 0.2, 0.15);
  };

  window.ind2SelectTest = function(idx) {
    simState.testIdx = idx;
    U9Sound.ping(660, 0.15, 0.12);
  };

  const canvas = document.getElementById('simCanvas');

  function draw() {
    const c = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    c.clearRect(0,0,w,h);
    simState.t += 0.02;

    const step = simState.step;
    const S = STEPS[step];

    // ── Background gradient ──
    const bg = c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0, '#FAFBFF');
    bg.addColorStop(1, '#F0F4FF');
    c.fillStyle = bg; c.fillRect(0,0,w,h);

    // ── Progress bar at top ──
    c.fillStyle = 'rgba(0,0,0,0.06)';
    c.beginPath(); c.roundRect(w*0.1, 12, w*0.8, 8, 4); c.fill();
    c.fillStyle = S.color;
    c.beginPath(); c.roundRect(w*0.1, 12, w*0.8*(step+1)/STEPS.length, 8, 4); c.fill();
    c.font='bold 11px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
    c.fillText(`الخطوة ${step+1} من ${STEPS.length}`, w/2, 10);

    // ── STEP-SPECIFIC ANIMATIONS ──
    if(step === 0) drawStepCut(c,w,h);
    else if(step === 1) drawStepGrind(c,w,h);
    else if(step === 2) drawStepFilter(c,w,h);
    else if(step === 3) drawStepTest(c,w,h);
    else if(step === 4) drawStepRecord(c,w,h);

    // ── Advance animation ──
    if(simState.anim) {
      simState.animT += 0.007;
      if(simState.animT >= 1) {
        finishStep();
      }
    }

    animFrame = requestAnimationFrame(draw);
  }

  // ── Step 1: Cut ──
  function drawStepCut(c,w,h) {
    // Cabbage head
    const cx=w/2, cy=h*0.35;
    const bob = Math.sin(simState.t)*4;

    if(!simState.anim) {
      // Idle: cabbage bouncing
      c.save(); c.translate(cx, cy+bob);
      drawCabbage(c, 0, 0, 70);
      c.restore();
      // Scissors hint
      c.font='32px serif'; c.textAlign='center';
      c.fillText('✂️', cx+80, cy+bob-20);
      c.font='14px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
      c.fillText('اضغط الزر للقطع!', w/2, h*0.6);
    } else {
      // Animation: cabbage gets cut, pieces fly
      const t = simState.animT;
      // Draw shrinking cabbage
      c.save(); c.translate(cx, cy);
      drawCabbage(c, 0, 0, 70*(1-t*0.5));
      c.restore();
      // Scissors moving
      c.save(); c.translate(cx + (t-0.5)*120, cy - 20);
      c.font=`${28+t*10}px serif`; c.textAlign='center';
      c.fillText('✂️', 0, 0);
      c.restore();
      // Particles flying out
      simState.particles.forEach(p => {
        p.y += p.vy * (t*2+0.5);
        p.x += p.vx;
        p.a += 0.05;
        const px=p.x*w, py=p.y*h+h*0.2+t*h*0.4;
        if(py>h+20) return;
        c.save(); c.translate(px,py); c.rotate(p.a);
        c.fillStyle = p.col;
        if(p.shape==='leaf') {
          c.beginPath(); c.ellipse(0,0,p.r,p.r*0.5,0,0,Math.PI*2); c.fill();
        } else {
          c.fillRect(-p.r/2,-p.r/2,p.r,p.r);
        }
        c.restore();
      });
    }
  }

  function drawCabbage(c, x, y, r) {
    // Outer leaves
    const cols=['#C0392B','#922B21','#A93226','#CB4335'];
    for(let i=0;i<8;i++){
      const a=(i/8)*Math.PI*2;
      c.fillStyle=cols[i%cols.length];
      c.beginPath(); c.ellipse(x+Math.cos(a)*r*0.6, y+Math.sin(a)*r*0.6, r*0.55, r*0.38, a, 0, Math.PI*2); c.fill();
    }
    // Center
    c.fillStyle='#8E2020';
    c.beginPath(); c.arc(x,y,r*0.42,0,Math.PI*2); c.fill();
    c.fillStyle='rgba(255,255,255,0.15)';
    c.beginPath(); c.arc(x-r*0.12,y-r*0.12,r*0.18,0,Math.PI*2); c.fill();
  }

  // ── Step 2: Grind ──
  function drawStepGrind(c,w,h) {
    const cx=w/2, cy=h*0.38;
    // Mortar (هاون)
    c.fillStyle='#8D8D8D';
    c.beginPath(); c.ellipse(cx,cy+55,65,18,0,0,Math.PI*2); c.fill();
    c.fillStyle='#A0A0A0';
    c.beginPath();
    c.moveTo(cx-65,cy+55); c.quadraticCurveTo(cx-70,cy-15,cx-45,cy-20);
    c.lineTo(cx+45,cy-20); c.quadraticCurveTo(cx+70,cy-15,cx+65,cy+55); c.closePath(); c.fill();
    c.fillStyle='rgba(255,255,255,0.12)';
    c.beginPath(); c.ellipse(cx-10,cy+10,25,35,Math.PI/6,0,Math.PI*2); c.fill();

    // Purple-red liquid filling (natural red cabbage juice color)
    const fill = simState.anim ? Math.min(simState.animT*1.4, 0.85) : 0;
    if(fill>0) {
      const liquidH = fill*70;
      c.fillStyle=`rgba(180,120,150,${fill*0.28})`;
      c.beginPath();
      c.moveTo(cx-60+fill*15, cy+55-liquidH);
      c.quadraticCurveTo(cx, cy+55-liquidH-8, cx+60-fill*15, cy+55-liquidH);
      c.lineTo(cx+60, cy+55); c.quadraticCurveTo(cx,cy+72,cx-60,cy+55); c.closePath(); c.fill();
    }

    // Pestle (مدقة)
    const pestleAngle = simState.anim ? Math.sin(simState.animT*Math.PI*8)*0.4 : Math.sin(simState.t)*0.15;
    c.save(); c.translate(cx+20, cy-30); c.rotate(pestleAngle);
    c.fillStyle='#B0B0B0';
    c.beginPath(); c.roundRect(-8,-55,16,85,8); c.fill();
    c.fillStyle='#999';
    c.beginPath(); c.ellipse(0,30,14,10,0,0,Math.PI*2); c.fill();
    c.restore();

    // Particles inside mortar (pieces)
    if(!simState.anim) {
      // Show cabbage pieces waiting
      [{x:-20,y:20},{x:10,y:15},{x:-5,y:30},{x:25,y:25}].forEach(p=>{
        c.fillStyle='rgba(150,30,80,0.8)';
        c.beginPath(); c.ellipse(cx+p.x,cy+p.y,9,6,Math.random()*Math.PI,0,Math.PI*2); c.fill();
      });
      c.font='14px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
      c.fillText('اضغط للطحن!', w/2, h*0.72);
    } else {
      // Grinding particles
      simState.particles.forEach(p=>{
        p.angle += p.speed;
        const t=simState.animT;
        const radius = p.r*w*(1-t*0.5);
        const px=cx+Math.cos(p.angle)*radius;
        const py=cy+30+Math.sin(p.angle)*radius*0.4;
        const alpha=Math.max(0, 1-t*0.5);
        c.fillStyle=p.col.replace('0.8)', `${alpha})`);
        c.beginPath(); c.arc(px,py,p.size*(1-t*0.6),0,Math.PI*2); c.fill();
      });
    }
  }

  // ── Step 3: Filter ──
  function drawStepFilter(c,w,h) {
    const cx=w/2;
    // Funnel
    c.strokeStyle='#888'; c.lineWidth=2;
    c.beginPath(); c.moveTo(cx-55,h*0.2); c.lineTo(cx,h*0.45); c.lineTo(cx+55,h*0.2); c.stroke();
    c.beginPath(); c.moveTo(cx-55,h*0.2); c.lineTo(cx+55,h*0.2); c.stroke();
    // Filter paper
    c.fillStyle='rgba(255,240,200,0.6)'; c.strokeStyle='#DEB887';
    c.beginPath(); c.moveTo(cx-50,h*0.21); c.lineTo(cx,h*0.44); c.lineTo(cx+50,h*0.21); c.closePath();
    c.fill(); c.stroke();
    // Tube below
    c.strokeStyle='#666';
    c.beginPath(); c.moveTo(cx-5,h*0.45); c.lineTo(cx-5,h*0.7); c.stroke();
    c.beginPath(); c.moveTo(cx+5,h*0.45); c.lineTo(cx+5,h*0.7); c.stroke();
    // Test tube
    c.fillStyle='rgba(200,200,255,0.3)'; c.strokeStyle='#888';
    c.beginPath(); c.roundRect(cx-18,h*0.65,36,55,18); c.fill(); c.stroke();

    // Liquid dripping
    const fill = simState.anim ? Math.min(simState.animT*1.2, 1) : simState.liquid;
    if(fill>0) {
      // Drop in tube
      const dropY=h*0.45+fill*(h*0.25);
      c.fillStyle='rgba(160,100,130,0.4)';
      c.beginPath(); c.arc(cx,dropY,4,0,Math.PI*2); c.fill();
      // Liquid in test tube
      const liqH=fill*40;
      c.fillStyle='rgba(170,110,140,0.3)';
      c.beginPath(); c.roundRect(cx-14,h*0.65+55-liqH,28,liqH,liqH<18?liqH:0); c.fill();
    }
    if(!simState.anim) {
      c.font='14px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
      c.fillText('اضغط للتصفية!', w/2, h*0.78);
    }
    if(simState.anim) simState.liquid = Math.min(simState.animT, 1);
  }

  // ── Step 4: Test materials ──
  function drawStepTest(c,w,h) {
    const labels=['ليمون','ماء','صابون','NaOH'];
    const phLabels=['pH 2','pH 7','pH 9','pH 13'];

    // 4 test tubes side by side
    RESULTS.forEach((res,i)=>{
      const tx = w*0.12 + i*(w*0.22);
      const ty = h*0.2;
      const isSelected   = simState.testIdx === i;
      const isAnimating  = simState.anim === 'test' && simState.testIdx === i;
      const isDone       = (simState.completed && simState.completed.indexOf(i) >= 0) || simState.done;
      const fillRatio    = isAnimating ? Math.min(simState.animT*1.3,1) : isDone ? 1 : 0;

      // Tube glass outline
      c.fillStyle = isSelected ? 'rgba(26,143,168,0.06)':'rgba(245,248,255,0.7)';
      c.strokeStyle = isSelected ? '#1A8FA8' : '#AAA';
      c.lineWidth = isSelected?2:1.5;
      c.beginPath(); c.roundRect(tx-14,ty,28,80,14); c.fill(); c.stroke();
      // Glass shine
      c.fillStyle='rgba(255,255,255,0.4)';
      c.beginPath(); c.roundRect(tx-10,ty+4,6,30,3); c.fill();

      // Liquid — natural color
      if(fillRatio>0){
        const liqH=fillRatio*62;
        c.fillStyle = res.color;
        c.beginPath(); c.roundRect(tx-11,ty+80-liqH,22,liqH, liqH<12?liqH:0); c.fill();
        // Liquid surface shimmer
        c.fillStyle='rgba(255,255,255,0.35)';
        c.beginPath(); c.ellipse(tx, ty+80-liqH+2, 9, 2.5, 0, 0, Math.PI*2); c.fill();
      }

      // Label
      c.font=`bold 11px Tajawal`; c.fillStyle='#444'; c.textAlign='center';
      c.fillText(labels[i], tx, ty+96);
      c.font='10px Tajawal'; c.fillStyle='#888';
      c.fillText(phLabels[i], tx, ty+108);

      // Tap indicator
      if(!simState.anim && (simState.testIdx == null || simState.testIdx <= i)) {
        c.font='18px serif'; c.textAlign='center';
        c.fillText('👆', tx, ty-8);
      }
    });

    // Canvas click: allow clicking the CURRENT tube as alternative to button
    if(!canvas._ind2Click) {
      canvas._ind2Click = function(e){
        if(simState.step!==3 || simState.anim) return;
        const rect=canvas.getBoundingClientRect();
        const mx=(e.clientX-rect.left)*(canvas.width/rect.width);
        const my=(e.clientY-rect.top)*(canvas.height/rect.height);
        const cw=canvas.width, ch=canvas.height;
        const i = simState.testIdx < 0 ? 0 : simState.testIdx;
        const tx=cw*0.12+i*(cw*0.22), ty=ch*0.2;
        if(mx>tx-22&&mx<tx+22&&my>ty-10&&my<ty+90){
          window.ind2Action();
        }
      };
      canvas.addEventListener('click', canvas._ind2Click);
    }

    // Dropper animation
    if(simState.anim && simState.testIdx>=0){
      const i=simState.testIdx;
      const tx=w*0.12+i*(w*0.22);
      const t=simState.animT;
      const dropperY=h*0.05+t*h*0.22;
      c.font=`${20+t*5}px serif`; c.textAlign='center';
      c.fillText('💧', tx, dropperY);
    }

    // Instruction
    if(simState.testIdx<0){
      c.font='14px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
      c.fillText('اضغط على كل أنبوبة لإضافة الكاشف!', w/2, h*0.75);
    } else if(!simState.done){
      const remaining=RESULTS.length-simState.testIdx-(simState.anim?0:1);
      c.font='13px Tajawal'; c.fillStyle='#666'; c.textAlign='center';
      c.fillText(remaining>0?`${remaining} أنابيب متبقية — اضغط عليها`:'✅ كل الأنابيب جاهزة!', w/2,h*0.75);
    }
  }

  // ── Step 5: Record ──
  function drawStepRecord(c,w,h) {
    c.font='bold 16px Tajawal'; c.fillStyle='#333'; c.textAlign='center';
    c.fillText('نتائج الكاشف الطبيعي 🌸', w/2, h*0.15);

    const rowH=50, startY=h*0.22;
    RESULTS.forEach((res,i)=>{
      const y=startY+i*rowH;
      const show=simState.anim?simState.animT>(i/RESULTS.length):simState.done;
      if(!show) return;
      // Row bg
      c.fillStyle=i%2===0?'rgba(0,0,0,0.03)':'rgba(0,0,0,0.01)';
      c.beginPath(); c.roundRect(w*0.05,y,w*0.9,rowH-4,6); c.fill();
      // Color swatch — natural color with border
      c.fillStyle = res.colorSolid;
      c.strokeStyle = 'rgba(0,0,0,0.15)';
      c.lineWidth = 1;
      c.beginPath(); c.arc(w*0.12,y+rowH/2-2,13,0,Math.PI*2); c.fill(); c.stroke();
      // Shine on swatch
      c.fillStyle='rgba(255,255,255,0.4)';
      c.beginPath(); c.arc(w*0.12-4,y+rowH/2-7,5,0,Math.PI*2); c.fill();
      // Material name
      c.font='bold 13px Tajawal'; c.fillStyle='#333'; c.textAlign='right';
      c.fillText(res.material, w*0.88, y+rowH/2+1);
      // Label — use dark readable color
      c.font='12px Tajawal'; c.fillStyle='#555'; c.textAlign='left';
      c.fillText(res.label+' '+res.ph, w*0.18, y+rowH/2+1);
    });

    if(!simState.anim && !simState.done){
      c.font='14px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
      c.fillText('اضغط لتسجيل النتائج!', w/2, h*0.85);
    }
    if(simState.done){
      c.font='bold 15px Tajawal'; c.fillStyle='#27AE60'; c.textAlign='center';
      c.fillText('🎉 أحسنت! حضّرتِ الكاشف الطبيعي بنجاح!', w/2, h*0.88);
    }
  }

  // ── Finish step and advance ──
  function finishStep(){
    const step=simState.step;
    simState.anim=null; simState.animT=0;
    STEPS[step].done=true;

    // Special: step 3 (test) — need all 4 tubes
    if(step===3){
      const justDone = simState.testIdx;
      if(!simState.completed) simState.completed = [];
      simState.completed.push(justDone); // mark this tube as permanently filled
      if(justDone < RESULTS.length-1){
        // Move to next tube
        simState.testIdx = justDone + 1;
        const tubeNames = ['عصير الليمون','الماء','محلول الصابون','هيدروكسيد الصوديوم'];
        const nextCol   = RESULTS[simState.testIdx].color;
        const btn = document.getElementById('actionBtn');
        if(btn){
          btn.textContent = `🧪 اختبر ${tubeNames[simState.testIdx]}`;
          btn.style.background = `linear-gradient(135deg,${nextCol},${nextCol}CC)`;
          btn.style.boxShadow  = `0 4px 14px ${nextCol}66`;
          btn.style.opacity    = '1';
          btn.style.cursor     = 'pointer';
        }
        const msg = document.getElementById('ind2Msg');
        if(msg) msg.textContent = `✅ ${tubeNames[justDone]} — تم! (${justDone+1} من ${RESULTS.length})`;
        U9Sound.ping(660,0.18,0.12);
        return; // stay on step 3
      }
      // All 4 tubes done — fall through to advance
    }

    // Advance to next step
    if(step<STEPS.length-1){
      const nextStep=step+1;
      simState.step=nextStep;
      if(step===3) simState.testIdx=-1; // reset for display

      // Update step list highlight
      STEPS.forEach((_,i)=>{
        const el=document.getElementById('stepItem'+i);
        if(!el) return;
        if(i<nextStep){ el.style.background='rgba(39,174,96,0.1)'; el.style.borderColor='rgba(39,174,96,0.4)'; }
        else if(i===nextStep){ el.style.background='rgba(26,143,168,0.12)'; el.style.borderColor='rgba(26,143,168,0.4)'; }
        else { el.style.background='rgba(0,0,0,0.03)'; el.style.borderColor='rgba(0,0,0,0.08)'; }
        const check=document.getElementById('stepCheck'+i);
        if(check) check.textContent = i<nextStep?'✅':STEPS[i].icon;
      });

      // Update button
      const ns=STEPS[nextStep];
      const btn=document.getElementById('actionBtn');
      if(btn){
        btn.textContent=ns.btn;
        btn.style.background=`linear-gradient(135deg,${ns.color},${ns.color}CC)`;
        btn.style.boxShadow=`0 4px 14px ${ns.color}66`;
        btn.style.opacity='1'; btn.style.cursor='pointer';
      }
      const msg=document.getElementById('ind2Msg');
      if(msg) msg.textContent=`✅ ${STEPS[step].title} — تم!`;
      U9Sound.ping(660,0.2,0.15);

    } else {
      // All done!
      simState.done=true;
      const btn=document.getElementById('actionBtn');
      if(btn){btn.textContent='🎉 تم بنجاح!';btn.style.background='linear-gradient(135deg,#27AE60,#1E8449)';btn.style.opacity='1';}
      const msg=document.getElementById('ind2Msg');
      if(msg) msg.textContent='';
      U9Sound.win();
      buddySay('رائع! 🌸 حضّرتِ الكاشف الطبيعي بنجاح — الآن يمكنك تمييز الأحماض من القلويّات!', 6000);
    }
  }

  draw();
}

// ── 11-3 Tab 1: مقياس pH التفاعلي ──
function simPhScale1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, phVal:7, probe:{ x:0.5, y:0.35, dragging:false } };
  const phColors = ['#C0392B','#D35400','#E67E22','#F39C12','#F1C40F','#D4E157','#7DC67E','#4CAF50','#26A69A','#0097A7','#006064','#1565C0','#283593','#4A148C'];
  const phLabels = [
    {ph:0,name:'حمض كبريتيك مركّز'},{ph:2,name:'حمض الهيدروكلوريك'},{ph:2.5,name:'عصير الليمون'},
    {ph:3,name:'الخل'},{ph:4,name:'عصير الطماطم'},{ph:6,name:'الحليب'},{ph:7,name:'الماء المقطّر'},
    {ph:8,name:'بيكربونات الصودا'},{ph:9,name:'الصابون'},{ph:11,name:'الأمونيا'},{ph:13,name:'هيدروكسيد الصوديوم'},
  ];
  controls(`
    <div style="font-size:14px;color:#555;text-align:center;margin-bottom:8px">اسحب المسبار لقياس pH أي محلول</div>
    <div style="display:flex;justify-content:center;align-items:center;gap:12px;margin-bottom:8px">
      <span style="font-size:28px;font-weight:bold" id="phDisplay">7.0</span>
      <span style="font-size:14px" id="phTypeBadge" style="padding:4px 10px;border-radius:12px;background:#e8f5e9;color:#27AE60">متعادل</span>
    </div>
    <div id="phNameDisplay" style="text-align:center;font-size:13px;color:#888;margin-bottom:8px">الماء المقطّر</div>
    <input type="range" min="0" max="14" step="0.1" value="7" id="phSlider" style="width:100%;accent-color:#1A8FA8">
    <div style="margin-top:8px;display:flex;justify-content:space-between;font-size:12px;color:#888">
      <span>0 حمض قويّ</span><span>7 متعادل</span><span>14 قلويّ قويّ</span>
    </div>
    <div style="margin-top:8px;padding:6px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#555;text-align:center">📖 ص84 — مقياس الرقم الهيدروجينيّ</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٨٤-٨٥):</strong><br>١- ما الرقم الهيدروجينيّ (pH) لمحلول متعادل؟<br>٢- سائل رقمه الهيدروجينيّ 1 — ما نوعه؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الرقم الهيدروجينيّ للمحلول المتعادل = 7.<br>٢- حمض قويّ.</div>
  </div>`);
  function getPhColor(ph) {
    const idx = Math.min(13, Math.floor(ph));
    return phColors[idx] || '#9B59B6';
  }
  function updatePhDisplay(v) {
    const el=document.getElementById('phDisplay'), badge=document.getElementById('phTypeBadge'), nm=document.getElementById('phNameDisplay');
    if(el) { el.textContent = parseFloat(v).toFixed(1); el.style.color = getPhColor(v); }
    const type = v < 7 ? 'حمض' : v > 7 ? 'قلويّ' : 'متعادل';
    const typeBg = v < 7 ? '#FDEDEC' : v > 7 ? '#EBF5FB' : '#E9F7EF';
    const typeC = v < 7 ? '#C0392B' : v > 7 ? '#2471A3' : '#239B56';
    if(badge) { badge.textContent=type; badge.style.background=typeBg; badge.style.color=typeC; }
    // find closest name
    let closest = phLabels[0], minDist = 99;
    phLabels.forEach(l => { if(Math.abs(l.ph-v) < minDist){ minDist=Math.abs(l.ph-v); closest=l; } });
    if(nm && minDist < 1) nm.textContent = closest.name;
    else if(nm) nm.textContent = '';
  }
  sl('phSlider', function() { simState.phVal = parseFloat(this.value); updatePhDisplay(simState.phVal);  });
  const canvas = document.getElementById('simCanvas');
  function draw() {
    const c = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t += 0.02;
    // pH bar
    const barX=w*0.07, barY=h*0.12, barW=w*0.86, barH=32;
    for(let i=0;i<=14;i++){
      const segW = barW/14;
      const grad = c.createLinearGradient(barX+i*segW,0,barX+(i+1)*segW,0);
      grad.addColorStop(0, phColors[Math.min(i,13)]);
      grad.addColorStop(1, phColors[Math.min(i+1,13)]);
      c.fillStyle=grad; c.fillRect(barX+i*segW, barY, segW+1, barH);
    }
    c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(barX,barY,barW,barH,8); c.stroke();
    // tick marks
    for(let i=0;i<=14;i++){
      const tx = barX + i*barW/14;
      c.strokeStyle='rgba(255,255,255,0.6)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(tx,barY+barH-6); c.lineTo(tx,barY+barH); c.stroke();
      c.font='11px Tajawal'; c.fillStyle='#444'; c.textAlign='center'; c.textBaseline='top';
      c.fillText(i, tx, barY+barH+4);
    }
    // labels
    c.font='bold 13px Tajawal'; c.fillStyle='rgba(192,57,43,0.9)'; c.textAlign='left'; c.textBaseline='top';
    c.fillText('← أكثر حامضيّة', barX, barY+barH+22);
    c.fillStyle='rgba(41,128,185,0.9)'; c.textAlign='right';
    c.fillText('أكثر قلويّة →', barX+barW, barY+barH+22);
    // indicator probe
    const pv = simState.phVal;
    const probX = barX + pv * barW/14;
    c.strokeStyle='#333'; c.lineWidth=2;
    c.beginPath(); c.moveTo(probX, barY-10); c.lineTo(probX, barY+barH+8); c.stroke();
    c.fillStyle=getPhColor(pv);
    c.beginPath(); c.arc(probX, barY-14, 10, 0, Math.PI*2); c.fill();
    c.strokeStyle='#fff'; c.lineWidth=1.5; c.stroke();
    c.font='bold 12px Tajawal'; c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(pv.toFixed(0), probX, barY-14);
    // big beaker with color
    const beakX=w/2, beakY=h*0.65, beakW=110, beakH=120;
    c.strokeStyle='rgba(0,0,0,0.2)'; c.lineWidth=2.5;
    c.fillStyle='rgba(255,255,255,0.4)';
    c.beginPath(); c.roundRect(beakX-beakW/2, beakY-beakH/2, beakW, beakH, 10); c.fill(); c.stroke();
    const liquidColor = getPhColor(pv);
    const r=parseInt(liquidColor.slice(1,3),16), g=parseInt(liquidColor.slice(3,5),16), b=parseInt(liquidColor.slice(5,7),16);
    c.fillStyle=`rgba(${r},${g},${b},0.4)`;
    c.beginPath(); c.roundRect(beakX-beakW/2+6, beakY, beakW-12, beakH/2-6, 6); c.fill();
    // universal indicator strip
    c.fillStyle=liquidColor; c.fillRect(beakX-5, beakY-beakH/2+10, 10, 70);
    c.font='bold 16px Tajawal'; c.fillStyle=liquidColor; c.textAlign='center'; c.textBaseline='middle';
    const pType = pv<7?'حمض':pv>7?'قلويّ':'متعادل';
    c.fillText(`pH = ${pv.toFixed(1)} — ${pType}`, beakX, beakY + beakH/2 + 22);
    // wave animation in beaker
    c.save(); c.beginPath(); c.roundRect(beakX-beakW/2+6, beakY, beakW-12, beakH/2-6, 6); c.clip();
    c.fillStyle = `rgba(${r},${g},${b},0.15)`;
    for(let xi=0;xi<beakW;xi+=2){
      const wy = Math.sin(xi*0.2 + simState.t*2)*4;
      c.fillRect(beakX-beakW/2+xi, beakY+wy, 2, 10);
    }
    c.restore();
    animFrame = requestAnimationFrame(draw);
  }
  draw(); updatePhDisplay(7);
}

// ── 11-3 Tab 2: اختبر المحاليل ──
function simPhScale2() {
  cancelAnimationFrame(animFrame);
  const liquids = [
    { name:'عصير الليمون', ph:2.5, emoji:'🍋' },
    { name:'ماء مالح', ph:7, emoji:'🧂' },
    { name:'محلول الصابون', ph:9, emoji:'🧴' },
    { name:'مشروب الكولا', ph:3.5, emoji:'🥤' },
    { name:'الحليب', ph:6.5, emoji:'🥛' },
    { name:'الكلور المخفّف', ph:11, emoji:'🫧' },
  ];
  const phColors = ['#C0392B','#D35400','#E67E22','#F39C12','#F1C40F','#D4E157','#7DC67E','#4CAF50','#26A69A','#0097A7','#006064','#1565C0','#283593','#4A148C'];
  simState = { t:0, selected:null, results:{} };
  controls(`
    <div style="font-size:14px;color:#555;text-align:center;margin-bottom:8px">انقر على أي محلول لقياس رقمه الهيدروجينيّ</div>
    <div id="testResult" style="padding:12px;background:rgba(26,143,168,0.07);border-radius:10px;font-size:15px;color:#1A8FA8;text-align:center;min-height:60px;line-height:1.6">اختر محلولاً للاختبار 👆</div>
    <div style="margin-top:8px;font-size:12px;color:#888;text-align:center">استخدم الكاشف العام وسجّل النتائج</div>
    <button onclick="simState.results={};U9Sound.thud()" style="margin-top:8px;width:100%;padding:8px;border-radius:8px;background:rgba(192,57,43,0.1);border:1.5px solid rgba(192,57,43,0.3);color:#C0392B;font-family:Tajawal;font-size:14px;cursor:pointer">🔄 إعادة الاختبار</button>`);
  const canvas = document.getElementById('simCanvas');
  function draw() {
    const c = canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t += 0.02;
    // pH bar at top
    const barX=w*0.07, barY=h*0.06, barW=w*0.86, barH=20;
    for(let i=0;i<=13;i++){
      c.fillStyle=phColors[i]; c.fillRect(barX+i*barW/14, barY, barW/14+1, barH);
    }
    c.strokeStyle='rgba(0,0,0,0.1)'; c.lineWidth=1; c.beginPath(); c.roundRect(barX,barY,barW,barH,6); c.stroke();
    for(let i=0;i<=14;i++){ c.font='10px Tajawal'; c.fillStyle='#555'; c.textAlign='center'; c.fillText(i,barX+i*barW/14,barY+barH+12); }
    // beakers
    const cols = 3, rows = 2;
    liquids.forEach((liq, idx) => {
      const col = idx % cols, row = Math.floor(idx/cols);
      const bx = (col+0.5) * w/cols, by = h*0.3 + row * h*0.32;
      const isSel = simState.selected === idx;
      const tested = simState.results[idx] !== undefined;
      const phC = phColors[Math.min(13, Math.floor(liq.ph))];
      const r2=parseInt(phC.slice(1,3),16), g2=parseInt(phC.slice(3,5),16), b2=parseInt(phC.slice(5,7),16);
      c.strokeStyle = isSel ? '#1A8FA8' : 'rgba(0,0,0,0.18)';
      c.lineWidth = isSel ? 2.5 : 1.5;
      c.fillStyle='rgba(255,255,255,0.7)';
      c.beginPath(); c.roundRect(bx-36, by-46, 72, 80, 8); c.fill(); c.stroke();
      if(tested){
        c.fillStyle=`rgba(${r2},${g2},${b2},0.35)`;
        c.beginPath(); c.roundRect(bx-32, by-16, 64, 44, 6); c.fill();
      }
      c.font='26px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(liq.emoji, bx, by-22);
      c.font='bold 11px Tajawal'; c.fillStyle='#444'; c.textAlign='center'; c.textBaseline='top'; c.fillText(liq.name, bx, by+36);
      if(tested){
        // indicator arrow
        const arrowX = barX + liq.ph * barW/14;
        c.strokeStyle=phC; c.lineWidth=2;
        c.beginPath(); c.moveTo(arrowX, barY+barH); c.lineTo(arrowX, barY+barH+10); c.stroke();
        c.fillStyle=phC; c.beginPath(); c.arc(arrowX, barY+barH+14, 5, 0, Math.PI*2); c.fill();
        c.font='bold 11px Tajawal'; c.fillStyle=phC; c.textAlign='center'; c.textBaseline='top';
        c.fillText('pH '+liq.ph, bx, by+22);
      }
    });
    animFrame = requestAnimationFrame(draw);
  }
  canvas.onclick = function(e){
    const r=canvas.getBoundingClientRect(), mx=(e.clientX-r.left)*canvas.width/r.width, my=(e.clientY-r.top)*canvas.height/r.height;
    const w=canvas.width, h=canvas.height, cols=3;
    liquids.forEach((liq, idx) => {
      const col=idx%cols, row=Math.floor(idx/cols);
      const bx=(col+0.5)*w/cols, by=h*0.3+row*h*0.32;
      if(Math.abs(mx-bx)<40 && Math.abs(my-by)<46){
        simState.selected=idx; simState.results[idx]=liq.ph; U9Sound.ping();
        const phC=phColors[Math.min(13,Math.floor(liq.ph))];
        const type=liq.ph<7?'حمض 🍋':liq.ph>7?'قلويّ 🧴':'متعادل ⚖️';
        const box=document.getElementById('testResult');
        if(box){box.innerHTML=`<strong>${liq.emoji} ${liq.name}</strong><br>pH = <strong style="color:${phC}">${liq.ph}</strong> — ${type}`;box.style.color=phC;}
      }
    });
  };
  draw();
}

// ── 11-4 Tab 1: تفاعل التعادُل ──
function simNeutral1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, acidVol:50, baseVol:0, ph:1, mixing:false, particles:[] };
  for(let i=0;i<30;i++) simState.particles.push({x:Math.random(),y:Math.random(),type:'H',vx:(Math.random()-0.5)*0.002,vy:(Math.random()-0.5)*0.002});
  controls(`
    <div style="font-size:14px;color:#555;text-align:center;margin-bottom:8px">أضف القلويّ تدريجياً لمعادلة الحمض</div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <div style="text-align:center">
        <div style="font-size:22px">🔴</div>
        <div style="font-size:12px;color:#888">حمض</div>
        <div style="font-size:16px;font-weight:bold;color:#C0392B" id="acidVolLbl">50 mL</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:22px">⚗️</div>
        <div style="font-size:12px;color:#888">pH الحالي</div>
        <div style="font-size:22px;font-weight:bold" id="neutralPhLbl" style="color:#C0392B">1.0</div>
      </div>
      <div style="text-align:center">
        <div style="font-size:22px">🔵</div>
        <div style="font-size:12px;color:#888">قلويّ</div>
        <div style="font-size:16px;font-weight:bold;color:#2471A3" id="baseVolLbl">0 mL</div>
      </div>
    </div>
    <input type="range" min="0" max="50" step="1" value="0" id="baseSlider" style="width:100%;accent-color:#2471A3">
    <div style="margin-top:8px;font-size:12px;color:#888;text-align:center">اسحب لإضافة القلويّ → pH يرتفع</div>
    <div id="neutralMsg" style="margin-top:6px;padding:8px;border-radius:8px;font-size:14px;text-align:center;background:rgba(26,143,168,0.07);color:#1A8FA8;min-height:36px"></div>
    <div style="margin-top:8px;padding:6px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#555;text-align:center">📖 ص86 — التعادُل</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٨٦-٨٧):</strong><br>١- ما لون الكاشف العام عندما يكون المحلول متعادلاً؟<br>٢- ما نوع التفاعل الذي يحدث عند خلط حمض مع قلويّ؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- اللون الأخضر.<br>٢- تفاعل التعادُل (Neutralisation).</div>
  </div>`);
  const phColors = ['#C0392B','#D35400','#E67E22','#F39C12','#F1C40F','#D4E157','#7DC67E','#4CAF50','#26A69A','#0097A7','#006064','#1565C0','#283593','#4A148C'];
  function getPh(base) { if(base<25) return 1+(base/25)*5.8; if(base===25) return 7; return 7+(base-25)/25*6; }
  function getPhColor(ph) { return phColors[Math.min(13,Math.floor(ph))]; }
  sl('baseSlider', function(){
    const bv = parseInt(this.value);
    simState.baseVol = bv; simState.acidVol = 50 - bv/2;
    simState.ph = getPh(bv);
    document.getElementById('baseVolLbl').textContent = bv + ' mL';
    document.getElementById('acidVolLbl').textContent = (50).toFixed(0) + ' mL';
    const lbl = document.getElementById('neutralPhLbl');
    if(lbl){ lbl.textContent = simState.ph.toFixed(1); lbl.style.color=getPhColor(simState.ph); }
    const msg = document.getElementById('neutralMsg');
    if(msg){
      if(bv<20) msg.textContent='الحمض لا يزال قويّاً — أضف المزيد من القلويّ 💧';
      else if(bv<24) msg.textContent='يقترب المحلول من التعادُل...';
      else if(bv===25||bv===24||bv===26) { msg.textContent='✅ تعادُل تام! pH = 7 — الكاشف أخضر 🟢'; msg.style.color='#27AE60'; U9Sound.win(); }
      else msg.textContent='المحلول أصبح قلويّاً — تم تجاوز نقطة التعادُل';
    }
    // update particles
    simState.particles.forEach(p => { p.type = simState.ph < 7 ? 'H' : simState.ph > 7 ? 'OH' : 'neutral'; });
  });
  const canvas = document.getElementById('simCanvas');
  function draw(){
    const c=canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t += 0.025;
    const ph = simState.ph;
    const phC = getPhColor(ph);
    const r2=parseInt(phC.slice(1,3),16), g2=parseInt(phC.slice(3,5),16), b2=parseInt(phC.slice(5,7),16);
    // beaker
    const bx=w/2, by=h*0.55, bw=160, bh=140;
    c.strokeStyle='rgba(0,0,0,0.2)'; c.lineWidth=2.5;
    c.fillStyle='rgba(255,255,255,0.35)';
    c.beginPath(); c.roundRect(bx-bw/2, by-bh/2, bw, bh, 10); c.fill(); c.stroke();
    // liquid
    const fillH = bh * 0.6;
    c.fillStyle=`rgba(${r2},${g2},${b2},0.4)`;
    c.beginPath(); c.roundRect(bx-bw/2+5, by+bh/2-fillH, bw-10, fillH, 6); c.fill();
    // wave
    c.save(); c.beginPath(); c.roundRect(bx-bw/2+5,by+bh/2-fillH,bw-10,fillH,6); c.clip();
    c.fillStyle=`rgba(${r2},${g2},${b2},0.2)`;
    for(let xi=0;xi<bw-10;xi+=3){const wy=Math.sin(xi*0.15+simState.t*2)*6; c.fillRect(bx-bw/2+5+xi,by+bh/2-fillH+wy,3,12);}
    c.restore();
    // particles
    simState.particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if(p.x<0.15||p.x>0.85) p.vx=-p.vx;
      if(p.y<0.35||p.y>0.75) p.vy=-p.vy;
      const px2=p.x*w, py2=p.y*h;
      c.fillStyle = p.type==='H'?'rgba(192,57,43,0.7)': p.type==='OH'?'rgba(41,128,185,0.7)':'rgba(39,174,96,0.6)';
      c.beginPath(); c.arc(px2, py2, 5, 0, Math.PI*2); c.fill();
      c.font='9px Tajawal'; c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(p.type==='H'?'H⁺':p.type==='OH'?'OH⁻':'💧', px2, py2);
    });
    // pH display
    c.font='bold 24px Tajawal'; c.fillStyle=phC; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('pH = ' + ph.toFixed(1), bx, by+bh/2+30);
    // pH bar
    const barX=w*0.07, barY=h*0.06, barW=w*0.86, barH=18;
    for(let i=0;i<=13;i++){c.fillStyle=phColors[i]; c.fillRect(barX+i*barW/14,barY,barW/14+1,barH);}
    c.strokeStyle='rgba(0,0,0,0.1)'; c.lineWidth=1; c.beginPath(); c.roundRect(barX,barY,barW,barH,5); c.stroke();
    const arrowX = barX + ph*barW/14;
    c.strokeStyle='#333'; c.lineWidth=2;
    c.beginPath(); c.moveTo(arrowX,barY+barH); c.lineTo(arrowX,barY+barH+10); c.stroke();
    c.fillStyle=phC; c.beginPath(); c.arc(arrowX,barY+barH+14,6,0,Math.PI*2); c.fill();
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 11-4 Tab 2: السحّاحة ──
function simNeutral2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, drops:0, ph:13, particles:[], flowing:false, flowT:0 };
  controls(`
    <div style="font-size:14px;color:#555;text-align:center;margin-bottom:8px">أضف الحمض قطرةً قطرةً باستخدام السحّاحة</div>
    <button id="dropBtn" style="width:100%;padding:10px;border-radius:10px;background:rgba(231,76,60,0.12);border:1.5px solid rgba(231,76,60,0.35);color:#C0392B;font-family:Tajawal;font-size:15px;font-weight:bold;cursor:pointer">💧 أضف قطرة حمض</button>
    <div style="margin-top:8px;display:flex;justify-content:space-between">
      <div style="text-align:center;padding:8px;background:rgba(26,143,168,0.07);border-radius:8px;flex:1">
        <div style="font-size:12px;color:#888">الحجم المُضاف</div>
        <div style="font-size:18px;font-weight:bold;color:#1A8FA8" id="dropCount">0 mL</div>
      </div>
      <div style="width:8px"></div>
      <div style="text-align:center;padding:8px;background:rgba(26,143,168,0.07);border-radius:8px;flex:1">
        <div style="font-size:12px;color:#888">pH الحالي</div>
        <div style="font-size:22px;font-weight:bold" id="burettePhLbl">13.0</div>
      </div>
    </div>
    <div id="buretteMsg" style="margin-top:8px;padding:8px;border-radius:8px;font-size:14px;text-align:center;background:rgba(26,143,168,0.07);color:#1A8FA8;min-height:36px"></div>
    <button onclick="simState.drops=0;simState.ph=13;simState.particles=[];document.getElementById('dropCount').textContent='0 mL';document.getElementById('burettePhLbl').textContent='13.0';document.getElementById('burettePhLbl').style.color='#283593';document.getElementById('buretteMsg').textContent='';U9Sound.thud()" style="margin-top:8px;width:100%;padding:7px;border-radius:8px;background:rgba(0,0,0,0.04);border:1px solid rgba(0,0,0,0.1);font-family:Tajawal;font-size:13px;cursor:pointer">🔄 إعادة التجربة</button>
    <div style="margin-top:6px;padding:6px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#555;text-align:center">📖 ص86 — تحضير محلول متعادل (السحّاحة)</div>`);
  const phColors=['#C0392B','#D35400','#E67E22','#F39C12','#F1C40F','#D4E157','#7DC67E','#4CAF50','#26A69A','#0097A7','#006064','#1565C0','#283593','#4A148C'];
  function getPh(drops){ if(drops<20) return 13-(drops/20)*6; if(drops===20) return 7; return Math.max(1, 7-(drops-20)/10*5); }
  function getPhColor(ph){ return phColors[Math.min(13,Math.floor(ph))]; }
  btn('dropBtn', function(){
    simState.drops += 1; simState.flowing = true; simState.flowT = 0;
    simState.ph = getPh(simState.drops);
    const lbl=document.getElementById('dropCount'); if(lbl) lbl.textContent=simState.drops+' mL';
    const pLbl=document.getElementById('burettePhLbl');
    if(pLbl){ pLbl.textContent=simState.ph.toFixed(1); pLbl.style.color=getPhColor(simState.ph); }
    simState.particles.push({x:0.45+Math.random()*0.2, y:0.5+Math.random()*0.25, vx:(Math.random()-0.5)*0.003, vy:(Math.random()-0.5)*0.003});
    if(simState.particles.length>40) simState.particles.shift();
    const msg=document.getElementById('buretteMsg');
    if(msg){
      if(simState.drops<18) { msg.textContent='القلويّ لا يزال قويّاً...'; msg.style.color='#2471A3'; }
      else if(simState.drops===20||simState.drops===19||simState.drops===21){ msg.textContent='✅ تعادُل! pH = 7 — الكاشف أخضر تماماً'; msg.style.color='#27AE60'; U9Sound.win(); }
      else if(simState.drops>21) { msg.textContent='تجاوزنا التعادُل — المحلول أصبح حمضيّاً قليلاً'; msg.style.color='#E67E22'; }
    }
  });
  const canvas = document.getElementById('simCanvas');
  function draw(){
    const c=canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=0.025;
    const ph=simState.ph;
    const phC=getPhColor(ph);
    const r2=parseInt(phC.slice(1,3),16), g2=parseInt(phC.slice(3,5),16), b2=parseInt(phC.slice(5,7),16);
    // burette (vertical tube)
    c.fillStyle='rgba(255,255,255,0.6)'; c.strokeStyle='rgba(0,0,0,0.2)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(w*0.43, h*0.04, 24, h*0.55, 6); c.fill(); c.stroke();
    // acid in burette
    const acidFill = Math.max(0, 1 - simState.drops/40);
    c.fillStyle='rgba(192,57,43,0.35)';
    c.beginPath(); c.roundRect(w*0.43+2, h*0.04+2, 20, (h*0.55-4)*acidFill, 4); c.fill();
    // drop animation
    if(simState.flowing){ simState.flowT+=0.08; if(simState.flowT>1) simState.flowing=false; }
    if(simState.flowing){
      const dropY = h*0.59 + simState.flowT*(h*0.28-h*0.59+h*0.59);
      c.fillStyle='rgba(192,57,43,0.8)';
      c.beginPath(); c.arc(w*0.455, h*0.59+simState.flowT*h*0.2, 5, 0, Math.PI*2); c.fill();
    }
    // conical flask
    const fx=w*0.5, ftop=h*0.6, fbotW=130, ftopW=40, fh=130;
    c.beginPath();
    c.moveTo(fx-ftopW/2, ftop); c.lineTo(fx-fbotW/2, ftop+fh); c.lineTo(fx+fbotW/2, ftop+fh); c.lineTo(fx+ftopW/2, ftop);
    c.closePath(); c.fillStyle='rgba(255,255,255,0.4)'; c.fill(); c.strokeStyle='rgba(0,0,0,0.18)'; c.lineWidth=2; c.stroke();
    // liquid in flask
    c.save(); c.clip();
    c.fillStyle=`rgba(${r2},${g2},${b2},0.38)`;
    c.fillRect(fx-fbotW/2, ftop+fh*0.5, fbotW, fh*0.5);
    // wave
    c.fillStyle=`rgba(${r2},${g2},${b2},0.15)`;
    for(let xi=0;xi<fbotW;xi+=3){const wy=Math.sin(xi*0.2+simState.t*3)*5; c.fillRect(fx-fbotW/2+xi, ftop+fh*0.5+wy, 3, 8);}
    c.restore();
    // particles
    simState.particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0.3||p.x>0.7) p.vx=-p.vx;
      if(p.y<0.6||p.y>0.88) p.vy=-p.vy;
      c.fillStyle=ph<7?'rgba(192,57,43,0.7)':ph>7?'rgba(41,128,185,0.7)':'rgba(39,174,96,0.6)';
      c.beginPath(); c.arc(p.x*w, p.y*h, 4, 0, Math.PI*2); c.fill();
    });
    // pH display
    c.font='bold 20px Tajawal'; c.fillStyle=phC; c.textAlign='center';
    c.fillText('pH = '+ph.toFixed(1), fx, ftop+fh+22);
    // small pH bar
    const barX=w*0.07, barY=h*0.06, barW=w*0.33, barH=14;
    for(let i=0;i<=13;i++){c.fillStyle=phColors[i]; c.fillRect(barX+i*barW/14,barY,barW/14+1,barH);}
    const arrowX=barX+ph*barW/14;
    c.strokeStyle='#333'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(arrowX,barY+barH); c.lineTo(arrowX,barY+barH+8); c.stroke();
    c.fillStyle=phC; c.beginPath(); c.arc(arrowX,barY+barH+12,5,0,Math.PI*2); c.fill();
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 11-5 Tab 1: الطبّ والأسنان ──
function simNeutralApp1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, scene:'stomach', stomachPh:2, toothPh:4.5, medicineAdded:0, pasteAdded:0 };
  controls(`
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <button onclick="simState.scene='stomach';U9Sound.ping()" id="btnStomach" style="flex:1;padding:7px;border-radius:8px;background:rgba(231,76,60,0.12);border:1.5px solid rgba(231,76,60,0.35);color:#C0392B;font-family:Tajawal;font-size:14px;cursor:pointer">😣 عُسر الهضم</button>
      <button onclick="simState.scene='teeth';U9Sound.ping()" id="btnTeeth" style="flex:1;padding:7px;border-radius:8px;background:rgba(26,143,168,0.07);border:1.5px solid rgba(26,143,168,0.2);color:#1A8FA8;font-family:Tajawal;font-size:14px;cursor:pointer">🦷 الأسنان</button>
    </div>
    <div id="appInfo" style="padding:10px;background:rgba(26,143,168,0.07);border-radius:10px;font-size:14px;color:#1A8FA8;text-align:center;min-height:54px;line-height:1.6">اختر مشهداً</div>
    <input type="range" min="0" max="10" step="1" value="0" id="appSlider" style="width:100%;margin-top:8px;accent-color:#27AE60">
    <div style="font-size:12px;color:#888;text-align:center;margin-top:2px">اسحب لإضافة العلاج</div>
    <div style="margin-top:8px;padding:6px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#555;text-align:center">📖 ص88 — تطبيقات التعادُل</div>
    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٨٨-٨٩):</strong><br>١- لماذا يكون معجون الأسنان قلويّاً؟<br>٢- لماذا يُلقي المزارعون الجيرَ على التربة الحمضيّة؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- لأنه يُعادل الحمض الذي تُنتجه البكتيريا في الفم.<br>٢- لمعادلة الحموضة الزائدة في التربة حتى تنمو النباتات بشكل أفضل.</div>
  </div>`);
  sl('appSlider', function(){
    const v=parseInt(this.value);
    if(simState.scene==='stomach'){
      simState.medicineAdded=v;
      simState.stomachPh = Math.min(7, 2 + v*0.45);
      const box=document.getElementById('appInfo');
      if(box){ box.innerHTML=`😣 المعدة: pH = <strong>${simState.stomachPh.toFixed(1)}</strong><br>${v===0?'الحمض قويّ — ألم في المعدة':v<6?'إضافة مضاد الحموضة... يتحسّن الوضع':'✅ التعادُل! الألم اختفى 😊'}`; }
    } else {
      simState.pasteAdded=v;
      simState.toothPh = Math.min(7.5, 4.5+v*0.28);
      const box=document.getElementById('appInfo');
      if(box){ box.innerHTML=`🦷 الفم: pH = <strong>${simState.toothPh.toFixed(1)}</strong><br>${v===0?'البكتيريا تُنتج الحمض — خطر على الأسنان':v<6?'المعجون يُعادل الحمض...':'✅ حماية كاملة للأسنان! 🦷✨'}`; }
    }
    U9Sound.ping();
  });
  const canvas=document.getElementById('simCanvas');
  function draw(){
    const c=canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=0.025;
    if(simState.scene==='stomach'){
      // stomach outline
      const cx=w/2, cy=h*0.48, rx=w*0.3, ry=h*0.28;
      const ph=simState.stomachPh;
      const r2=Math.round(200-ph*20), g2=Math.round(50+ph*15), b2=50;
      c.fillStyle=`rgba(${r2},${g2},${b2},0.15)`;
      c.beginPath(); c.ellipse(cx, cy, rx, ry, 0.3, 0, Math.PI*2); c.fill();
      c.strokeStyle=`rgba(${r2},${g2},${b2},0.6)`; c.lineWidth=3;
      c.beginPath(); c.ellipse(cx, cy, rx, ry, 0.3, 0, Math.PI*2); c.stroke();
      // acid particles
      for(let i=0;i<15-simState.medicineAdded;i++){
        const ang=i*0.42+simState.t; const px2=cx+Math.cos(ang)*rx*0.6, py2=cy+Math.sin(ang)*ry*0.6;
        c.fillStyle='rgba(192,57,43,0.6)'; c.beginPath(); c.arc(px2,py2,5,0,Math.PI*2); c.fill();
        c.font='9px sans-serif'; c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('H⁺',px2,py2);
      }
      // medicine
      for(let i=0;i<simState.medicineAdded;i++){
        const ang=i*0.65+simState.t*0.5; const px2=cx+Math.cos(ang)*rx*0.4, py2=cy+Math.sin(ang)*ry*0.4;
        c.fillStyle='rgba(39,174,96,0.7)'; c.beginPath(); c.arc(px2,py2,6,0,Math.PI*2); c.fill();
        c.font='9px sans-serif'; c.fillStyle='#fff'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('💊',px2,py2);
      }
      c.font='bold 20px Tajawal'; c.fillStyle=`rgb(${r2},${g2},${b2})`; c.textAlign='center';
      c.fillText('pH = '+ph.toFixed(1), cx, cy+ry+30);
      // الإيموجي يتغير حسب pH
      const faceEmoji = ph < 3.5 ? '😖' : ph < 5 ? '😣' : ph < 6.5 ? '😐' : '😊';
      const faceSize = ph < 3.5 ? 36 : ph < 5 ? 30 : 26;
      c.font=`${faceSize}px serif`; c.textAlign='left';
      c.fillText(faceEmoji, w*0.05, h*0.38);
      // نص الحالة
      c.font='bold 14px Tajawal'; c.textAlign='center';
      c.fillStyle=ph<3.5?'#C0392B':ph<5?'#E67E22':ph<6.5?'#F39C12':'#27AE60';
      c.fillText(ph<3.5?'ألم شديد!':ph<5?'يتحسّن...':ph<6.5?'أفضل':' تعادل تام ✅', cx, cy+ry+52);
    } else {
      // teeth
      const ph=simState.toothPh;
      for(let i=0;i<6;i++){
        const tx=w*(0.18+i*0.12), ty=h*0.35;
        const decay = Math.max(0, 6-simState.pasteAdded*0.8-i)*0.08;
        c.fillStyle=`rgb(${Math.round(240-decay*80)},${Math.round(240-decay*60)},${Math.round(240-decay*40)})`;
        c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1.5;
        c.beginPath(); c.roundRect(tx-18, ty-35, 36, 70, 8); c.fill(); c.stroke();
        if(decay>0.2){ c.fillStyle=`rgba(139,69,19,${decay})`; c.beginPath(); c.arc(tx,ty-10,12*decay,0,Math.PI*2); c.fill(); }
      }
      // bacteria
      for(let i=0;i<12-simState.pasteAdded;i++){
        const bx=w*(0.15+Math.random()*0.7), by=h*(0.2+Math.random()*0.15);
        c.fillStyle='rgba(192,57,43,0.5)'; c.beginPath(); c.arc(bx,by,4,0,Math.PI*2); c.fill();
      }
      c.font='bold 18px Tajawal'; c.fillStyle=ph>6.5?'#27AE60':'#C0392B'; c.textAlign='center';
      c.fillText('pH الفم = '+ph.toFixed(1), w/2, h*0.72);
      c.font='14px Tajawal'; c.fillStyle='#666';
      c.fillText(simState.pasteAdded>7?'✅ الأسنان محميّة!':'🦷 استمر في تطبيق المعجون', w/2, h*0.8);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 11-5 Tab 2: الزراعة والبحيرات ──
function simNeutralApp2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, scene:'farm', soilPh:4.5, lakePh:4.2, limeAdded:0, alkaliAdded:0 };
  controls(`
    <div style="display:flex;gap:6px;margin-bottom:10px">
      <button onclick="simState.scene='farm';U9Sound.ping()" style="flex:1;padding:7px;border-radius:8px;background:rgba(39,174,96,0.12);border:1.5px solid rgba(39,174,96,0.35);color:#27AE60;font-family:Tajawal;font-size:14px;cursor:pointer">🌾 التربة والمحاصيل</button>
      <button onclick="simState.scene='lake';U9Sound.ping()" style="flex:1;padding:7px;border-radius:8px;background:rgba(26,143,168,0.07);border:1.5px solid rgba(26,143,168,0.2);color:#1A8FA8;font-family:Tajawal;font-size:14px;cursor:pointer">🏞️ معالجة البحيرة</button>
    </div>
    <div id="appInfo2" style="padding:10px;background:rgba(26,143,168,0.07);border-radius:10px;font-size:14px;color:#1A8FA8;text-align:center;min-height:54px;line-height:1.6">اختر مشهداً</div>
    <input type="range" min="0" max="10" step="1" value="0" id="appSlider2" style="width:100%;margin-top:8px;accent-color:#27AE60">
    <div style="font-size:12px;color:#888;text-align:center;margin-top:2px">اسحب لإضافة المادة القلويّة (الجير)</div>
    <div style="margin-top:8px;padding:6px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#555;text-align:center">📖 ص88 — زراعة المحاصيل · معادلة مياه البحيرات</div>`);
  sl('appSlider2', function(){
    const v=parseInt(this.value);
    if(simState.scene==='farm'){
      simState.limeAdded=v; simState.soilPh=Math.min(7.2,4.5+v*0.27);
      const box=document.getElementById('appInfo2');
      if(box){ box.innerHTML=`🌾 pH التربة = <strong>${simState.soilPh.toFixed(1)}</strong><br>${v===0?'التربة حمضيّة — النباتات لا تنمو جيداً':v<6?'جارٍ إضافة الجير لتعديل التربة...':'✅ pH مناسب للزراعة! النباتات تنمو بشكل ممتاز 🌱'}`; }
    } else {
      simState.alkaliAdded=v; simState.lakePh=Math.min(7.5,4.2+v*0.33);
      const box=document.getElementById('appInfo2');
      if(box){ box.innerHTML=`🐟 pH البحيرة = <strong>${simState.lakePh.toFixed(1)}</strong><br>${v===0?'المطر الحمضي أضرّ بالبحيرة — الكائنات الحيّة تموت':v<6?'إضافة القلويّ يُعادل الحمض...':'✅ البحيرة آمنة! الأسماك تعيش بصحة 🐟'}`; }
    }
    U9Sound.ping();
  });
  const canvas=document.getElementById('simCanvas');
  function draw(){
    const c=canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=0.025;
    if(simState.scene==='farm'){
      const ph=simState.soilPh;
      // sky
      c.fillStyle='#d6eaf8'; c.fillRect(0,0,w,h*0.45);
      // soil
      const soilR=Math.round(139-ph*10), soilG=Math.round(90+ph*8);
      c.fillStyle=`rgb(${soilR},${soilG},50)`; c.fillRect(0,h*0.45,w,h*0.55);
      // sun
      c.fillStyle='#F9D835'; c.beginPath(); c.arc(w*0.85,h*0.12,28,0,Math.PI*2); c.fill();
      // plants growing based on pH
      const plantH = ph > 5 ? (ph-5)*0.18*h : 0;
      for(let i=0;i<6;i++){
        const px2=w*(0.12+i*0.15), pBase=h*0.45;
        if(plantH>5){
          c.strokeStyle=ph>6?'#27AE60':'#8BC34A'; c.lineWidth=3;
          c.beginPath(); c.moveTo(px2,pBase); c.lineTo(px2,pBase-plantH); c.stroke();
          // leaves
          c.fillStyle=ph>6?'rgba(39,174,96,0.8)':'rgba(139,195,74,0.7)';
          c.beginPath(); c.ellipse(px2-12,pBase-plantH*0.6,12,6,0.5,0,Math.PI*2); c.fill();
          c.beginPath(); c.ellipse(px2+12,pBase-plantH*0.4,12,6,-0.5,0,Math.PI*2); c.fill();
        }
      }
      // pH text
      c.font='bold 18px Tajawal'; c.fillStyle=ph>6.5?'#27AE60':ph>5.5?'#F39C12':'#C0392B'; c.textAlign='center';
      c.fillText('pH التربة = '+ph.toFixed(1), w/2, h*0.85);
      if(simState.limeAdded>0){
        c.font='14px Tajawal'; c.fillStyle='#8D6E63';
        c.fillText('🪨 '.repeat(Math.min(simState.limeAdded,5))+' تمّت إضافة الجير', w/2, h*0.93);
      }
    } else {
      const ph=simState.lakePh;
      // sky
      c.fillStyle='#d6eaf8'; c.fillRect(0,0,w,h*0.25);
      // mountains
      c.fillStyle='#8D9DB6';
      c.beginPath(); c.moveTo(0,h*0.25); c.lineTo(w*0.3,h*0.05); c.lineTo(w*0.6,h*0.25); c.fill();
      c.fillStyle='#B0BEC5';
      c.beginPath(); c.moveTo(w*0.4,h*0.25); c.lineTo(w*0.7,h*0.08); c.lineTo(w,h*0.25); c.fill();
      // lake
      const lakeR=ph>6?50:180, lakeG=ph>6?130:50, lakeB=ph>6?200:50;
      const grad=c.createLinearGradient(0,h*0.25,0,h);
      grad.addColorStop(0,`rgba(${lakeR},${lakeG},${lakeB},0.7)`);
      grad.addColorStop(1,`rgba(${lakeR*0.7},${lakeG*0.7},${lakeB*0.7},0.9)`);
      c.fillStyle=grad; c.beginPath(); c.ellipse(w/2,h*0.6,w*0.42,h*0.28,0,0,Math.PI*2); c.fill();
      // waves
      for(let i=0;i<5;i++){
        const wx=w*0.12+i*w*0.18, wamp=Math.sin(simState.t+i)*4;
        c.strokeStyle=`rgba(255,255,255,0.3)`; c.lineWidth=1.5;
        c.beginPath(); c.moveTo(wx,h*0.58+wamp); c.quadraticCurveTo(wx+w*0.05,h*0.56+wamp,wx+w*0.1,h*0.58+wamp); c.stroke();
      }
      // fish (appear when pH is good)
      if(ph>6){ for(let i=0;i<3;i++){
        const fx=w*(0.25+i*0.25)+Math.sin(simState.t+i)*15, fy=h*(0.55+Math.cos(simState.t*0.7+i)*0.04);
        c.font='20px serif'; c.textAlign='center'; c.fillText('🐟',fx,fy);
      }}
      c.font='bold 18px Tajawal'; c.fillStyle=ph>6.5?'#27AE60':ph>5.5?'#E67E22':'#C0392B'; c.textAlign='center';
      c.fillText('pH البحيرة = '+ph.toFixed(1), w/2, h*0.9);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 11-6 Tab 1: تصميم التجربة ──
function simAcidInquiry1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, selected:null, hypothesis:'', step:0 };
  const powders = [
    { id:'s', name:'س (مسحوق الهضم)', icon:'💊', color:'#E74C3C', desc:'مضاد الحموضة الشائع — هيدروكسيد المغنيسيوم' },
    { id:'ss', name:'ص (مسحوق الأسنان)', icon:'🦷', color:'#3498DB', desc:'كربونات الكالسيوم — مسحوق رخيص التكلفة' },
    { id:'e', name:'ع (مسحوق ع)', icon:'🧂', color:'#27AE60', desc:'بيكربونات الصوديوم — مسحوق طبيعي وآمن' },
  ];
  const variables = [
    { label:'المتغيّر المُغيَّر', val:'نوع المسحوق (س أو ص أو ع)', color:'#E74C3C' },
    { label:'المتغيّرات الثابتة', val:'حجم الحمض، تركيزه، درجة الحرارة', color:'#3498DB' },
    { label:'المتغيّر المقيس', val:'عدد الملاعق اللازمة للتعادُل (pH = 7)', color:'#27AE60' },
  ];
  controls(`
    <div style="font-size:14px;color:#555;margin-bottom:8px;text-align:center">تصميم التجربة العادلة</div>
    ${variables.map(v=>`<div style="padding:7px 10px;background:rgba(26,143,168,0.05);border-radius:8px;margin-bottom:5px;font-size:13px">
      <span style="color:${v.color};font-weight:bold">${v.label}:</span><br><span style="color:#555">${v.val}</span>
    </div>`).join('')}
    <div style="margin-top:6px;font-size:13px;font-weight:bold;color:#1A8FA8;text-align:center">انقر على مسحوق لمعرفة تفاصيله</div>
    <div id="powderInfo" style="margin-top:6px;padding:8px;background:#f8f9fa;border-radius:8px;font-size:13px;color:#666;text-align:center;min-height:40px"></div>

    <div class="q-box"><strong>❓ أسئلة الكتاب (ص٩٠-٩١):</strong><br>١- ما المسحوق الأكثر فعاليّة لتعادُل الحمض؟<br>٢- ما الذي يجعل التجربة عادلة؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- المسحوق الذي يُعادل الحمض باستخدام أقل كميّة منه.<br>٢- تغيير متغيّر واحد فقط مع ثبات الباقي.</div>
  </div>`);
  const canvas=document.getElementById('simCanvas');
  function draw(){
    const c=canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=0.025;
    // lab bench
    c.fillStyle='#DEB887'; c.beginPath(); c.roundRect(w*0.03, h*0.82, w*0.94, h*0.12, 6); c.fill();
    c.fillStyle='#C8A87A'; c.fillRect(w*0.03, h*0.82, w*0.94, 6);
    // question title
    c.font='bold 15px Tajawal'; c.fillStyle='#333'; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('أيّ مسحوق أفضل لتعادُل الحمض؟', w/2, h*0.1);
    // flask with acid
    const fx=w*0.5, fy=h*0.52;
    c.fillStyle='rgba(192,57,43,0.2)'; c.strokeStyle='rgba(0,0,0,0.2)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(fx-35,fy-55); c.lineTo(fx-55,fy+30); c.lineTo(fx+55,fy+30); c.lineTo(fx+35,fy-55); c.closePath(); c.fill(); c.stroke();
    c.fillStyle='rgba(192,57,43,0.4)'; c.beginPath(); c.moveTo(fx-45,fy+5); c.lineTo(fx-55,fy+30); c.lineTo(fx+55,fy+30); c.lineTo(fx+45,fy+5); c.closePath(); c.fill();
    c.font='12px Tajawal'; c.fillStyle='#C0392B'; c.textAlign='center'; c.fillText('حمض الهيدروكلوريك', fx, fy+46);
    c.fillText('pH = 1  |  20 mL', fx, fy+60);
    // 3 powder cups
    powders.forEach((p,i) => {
      const px2=w*(0.2+i*0.3), py2=h*0.65;
      const isSel=simState.selected===p.id;
      // cup
      c.fillStyle=isSel?`rgba(${parseInt(p.color.slice(1,3),16)},${parseInt(p.color.slice(3,5),16)},${parseInt(p.color.slice(5,7),16)},0.2)`:'rgba(220,220,220,0.4)';
      c.strokeStyle=isSel?p.color:'rgba(0,0,0,0.2)'; c.lineWidth=isSel?2.5:1.5;
      c.beginPath(); c.moveTo(px2-20,py2-15); c.lineTo(px2-25,py2+20); c.lineTo(px2+25,py2+20); c.lineTo(px2+20,py2-15); c.closePath(); c.fill(); c.stroke();
      // powder fill
      c.fillStyle=p.color+'88';
      c.beginPath(); c.moveTo(px2-18,py2+5); c.lineTo(px2-24,py2+20); c.lineTo(px2+24,py2+20); c.lineTo(px2+18,py2+5); c.closePath(); c.fill();
      c.font='20px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(p.icon, px2, py2-5);
      c.font='bold 13px Tajawal'; c.fillStyle=isSel?p.color:'#555'; c.textBaseline='top'; c.fillText(p.name.split(' ')[0], px2, py2+25);
    });
    animFrame=requestAnimationFrame(draw);
  }
  canvas.onclick=function(e){
    const r=canvas.getBoundingClientRect(), mx=(e.clientX-r.left)*canvas.width/r.width, my=(e.clientY-r.top)*canvas.height/r.height;
    const w=canvas.width, h=canvas.height;
    powders.forEach((p,i)=>{
      const px2=w*(0.2+i*0.3), py2=h*0.65;
      if(Math.abs(mx-px2)<30&&Math.abs(my-py2)<35){
        simState.selected=p.id; U9Sound.ping();
        const box=document.getElementById('powderInfo');
        if(box) box.innerHTML=`<strong>${p.icon} ${p.name}</strong><br>${p.desc}`;
      }
    });
  };
  draw();
}

// ── 11-6 Tab 2: النتائج والاستنتاج ──
function simAcidInquiry2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, running:false, progress:[0,0,0], trial:0, done:false };
  const powders = [
    { name:'س', icon:'💊', color:'#E74C3C', spoons:10, avg:10 },
    { name:'ص', icon:'🦷', color:'#3498DB', spoons:6, avg:6 },
    { name:'ع', icon:'🧂', color:'#27AE60', spoons:24, avg:24 },
  ];
  controls(`
    <div style="font-size:14px;color:#555;text-align:center;margin-bottom:8px">نتائج التجربة — ٣ تكرارات</div>
    <div style="background:white;border-radius:8px;overflow:hidden;margin-bottom:8px">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <tr style="background:rgba(26,143,168,0.1)">
          <th style="padding:6px;text-align:center;color:#1A8FA8">المسحوق</th>
          <th style="padding:6px;text-align:center;color:#1A8FA8">١</th>
          <th style="padding:6px;text-align:center;color:#1A8FA8">٢</th>
          <th style="padding:6px;text-align:center;color:#1A8FA8">٣</th>
          <th style="padding:6px;text-align:center;color:#1A8FA8">الوسط</th>
        </tr>
        <tr><td style="padding:6px;text-align:center">💊 س</td><td style="padding:6px;text-align:center;color:#E74C3C">10</td><td style="padding:6px;text-align:center;color:#E74C3C">11</td><td style="padding:6px;text-align:center;color:#E74C3C">9</td><td style="padding:6px;text-align:center;font-weight:bold;color:#E74C3C">10</td></tr>
        <tr style="background:#f8f9fa"><td style="padding:6px;text-align:center">🦷 ص</td><td style="padding:6px;text-align:center;color:#3498DB">6</td><td style="padding:6px;text-align:center;color:#3498DB">7</td><td style="padding:6px;text-align:center;color:#3498DB">5</td><td style="padding:6px;text-align:center;font-weight:bold;color:#3498DB">6</td></tr>
        <tr><td style="padding:6px;text-align:center">🧂 ع</td><td style="padding:6px;text-align:center;color:#27AE60">24</td><td style="padding:6px;text-align:center;color:#27AE60">25</td><td style="padding:6px;text-align:center;color:#27AE60">23</td><td style="padding:6px;text-align:center;font-weight:bold;color:#27AE60">24</td></tr>
      </table>
    </div>
    <div style="padding:8px;background:#E8F5E9;border-radius:8px;font-size:13px;color:#2E7D32;text-align:center">
      <strong>الاستنتاج:</strong> مسحوق ص الأكثر فعّاليّة — يحتاج أقل عدد ملاعق لتعادُل الحمض
    </div>
    <button onclick="simState.running=!simState.running;U9Sound.ping()" style="margin-top:8px;width:100%;padding:8px;border-radius:8px;background:rgba(26,143,168,0.1);border:1.5px solid rgba(26,143,168,0.3);color:#1A8FA8;font-family:Tajawal;font-size:14px;cursor:pointer">▶ عرض المخطط البياني</button>`);
  const canvas=document.getElementById('simCanvas');
  function draw(){
    const c=canvas.getContext('2d'); const w=canvas.width, h=canvas.height;
    c.clearRect(0,0,w,h); c.fillStyle='#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=0.02;
    // title
    c.font='bold 16px Tajawal'; c.fillStyle='#333'; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('عدد الملاعق اللازمة لتعادُل الحمض', w/2, h*0.1);
    // bar chart
    const chartX=w*0.12, chartY=h*0.18, chartW=w*0.76, chartH=h*0.58;
    // grid
    c.strokeStyle='rgba(0,0,0,0.07)'; c.lineWidth=1;
    [0,5,10,15,20,25,30].forEach(val=>{
      const gy=chartY+chartH-val/30*chartH;
      c.beginPath(); c.moveTo(chartX, gy); c.lineTo(chartX+chartW, gy); c.stroke();
      c.font='11px Tajawal'; c.fillStyle='#999'; c.textAlign='right'; c.textBaseline='middle'; c.fillText(val, chartX-6, gy);
    });
    // axes
    c.strokeStyle='rgba(0,0,0,0.25)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(chartX,chartY); c.lineTo(chartX,chartY+chartH); c.lineTo(chartX+chartW,chartY+chartH); c.stroke();
    // bars
    const barW2=chartW/3-24;
    powders.forEach((p,i)=>{
      const bx=chartX+i*chartW/3+12;
      if(simState.running) simState.progress[i]=Math.min(p.avg/30, simState.progress[i]+0.015);
      const bh=simState.progress[i]*chartH;
      const r2=parseInt(p.color.slice(1,3),16), g2=parseInt(p.color.slice(3,5),16), b2=parseInt(p.color.slice(5,7),16);
      // shadow bar
      c.fillStyle=`rgba(${r2},${g2},${b2},0.15)`;
      c.beginPath(); c.roundRect(bx, chartY+chartH-bh-3, barW2, bh+3, 4); c.fill();
      // actual bar
      const barGrad=c.createLinearGradient(bx,chartY+chartH-bh,bx,chartY+chartH);
      barGrad.addColorStop(0,`rgba(${r2},${g2},${b2},0.9)`);
      barGrad.addColorStop(1,`rgba(${r2*0.7},${g2*0.7},${b2*0.7},0.9)`);
      c.fillStyle=barGrad;
      c.beginPath(); c.roundRect(bx, chartY+chartH-bh, barW2, bh, 4); c.fill();
      // value label
      if(simState.progress[i]>0.05){
        c.font='bold 14px Tajawal'; c.fillStyle=p.color; c.textAlign='center'; c.textBaseline='bottom';
        c.fillText(p.avg, bx+barW2/2, chartY+chartH-bh-4);
      }
      // name
      c.font='14px Tajawal'; c.fillStyle='#444'; c.textAlign='center'; c.textBaseline='top';
      c.fillText(p.icon+' '+p.name, bx+barW2/2, chartY+chartH+6);
    });
    // Y axis label
    c.save(); c.translate(w*0.04, chartY+chartH/2); c.rotate(-Math.PI/2);
    c.font='12px Tajawal'; c.fillStyle='#888'; c.textAlign='center';
    c.fillText('عدد الملاعق', 0, 0); c.restore();
    // conclusion arrow
    if(simState.running && simState.progress[1]>0.15){
      c.strokeStyle='#3498DB'; c.lineWidth=2; c.setLineDash([4,4]);
      const bestX=chartX+1*chartW/3+12+barW2/2;
      c.beginPath(); c.moveTo(bestX, chartY+chartH-powders[1].avg/30*chartH-15);
      c.lineTo(bestX, chartY-10); c.stroke(); c.setLineDash([]);
      c.font='bold 13px Tajawal'; c.fillStyle='#3498DB'; c.textAlign='center';
      c.fillText('✅ الأفضل!', bestX, chartY-18);
    }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}


// =====================================================
// ===== وحدة الكهرباء — الصف السادس =====
// =====================================================

// ── مساعدات الكهرباء ──
function elCtx()  { return document.getElementById('simCanvas').getContext('2d'); }
function elW()    { return document.getElementById('simCanvas').width; }
function elH()    { return document.getElementById('simCanvas').height; }
function elCtrl(h){ document.getElementById('simControlsPanel').innerHTML = h; }


// =====================================================
// ===== وحدة الكهرباء — الصف السادس (تفاعلية كاملة) =====
// =====================================================
function elCtx()  { return document.getElementById('simCanvas').getContext('2d'); }
function elW()    { return document.getElementById('simCanvas').width; }
function elH()    { return document.getElementById('simCanvas').height; }
function elCtrl(h){ document.getElementById('simControlsPanel').innerHTML = h; }
function isDarkMode(){ return document.documentElement.classList.contains('dark-mode'); }

// ─────────────────────────────────────────────────────
// 5-1 TAB 1: اسحب المادة إلى الدائرة — هل تُوصّل؟
// ─────────────────────────────────────────────────────
