function simG9AcidProp1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, selected:null, hover:null, classified:{} };
  const S = simState;

  const solutions = [
    { id:'lemon',  name:'عصير الليمون', icon:'🍋', ph:2.5, type:'acid',    x:0.12, y:0.38, desc:'حمض الستريك — حامض الطعم، آمن' },
    { id:'vinegar',name:'الخل',          icon:'🫙', ph:3.0, type:'acid',    x:0.30, y:0.38, desc:'حمض الإيثانويك — يُستخدم في الطبخ' },
    { id:'coffee', name:'القهوة',        icon:'☕', ph:5.0, type:'acid',    x:0.48, y:0.38, desc:'حمضي خفيف — آمن للشرب' },
    { id:'water',  name:'الماء النقي',   icon:'💧', ph:7.0, type:'neutral', x:0.66, y:0.38, desc:'pH=7 تماماً — المرجع المتعادل' },
    { id:'soap',   name:'ماء الصابون',   icon:'🧼', ph:9.0, type:'base',    x:0.12, y:0.72, desc:'قلوي خفيف — زلق الملمس' },
    { id:'ammonia',name:'محلول الأمونيا',icon:'🧪', ph:11.5,type:'base',    x:0.30, y:0.72, desc:'قلوي — رائحة نفّاذة' },
    { id:'lime',   name:'ماء الجير',     icon:'⬜', ph:12.4,type:'base',    x:0.48, y:0.72, desc:'Ca(OH)₂ — قلوي قوي' },
    { id:'hcl',    name:'حمض الهيدروكلوريك',icon:'⚠️',ph:1.0,type:'acid', x:0.66, y:0.72, desc:'حمض قوي جداً — خطر ⚠️' },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📋 التصنيف</div>
      <div class="info-box" style="margin-bottom:6px">
        <b style="color:#C0392B">🍋 حمضي (pH &lt; 7)</b><br>
        <span id="acid-list" style="font-size:12px">—</span>
      </div>
      <div class="info-box" style="background:rgba(39,174,96,0.06);border-color:rgba(39,174,96,0.2);margin-bottom:6px">
        <b style="color:#27AE60">💧 متعادل (pH = 7)</b><br>
        <span id="neutral-list" style="font-size:12px">—</span>
      </div>
      <div class="info-box" style="background:rgba(21,101,192,0.06);border-color:rgba(21,101,192,0.2)">
        <b style="color:#1565C0">🧼 قلوي (pH &gt; 7)</b><br>
        <span id="base-list" style="font-size:12px">—</span>
      </div>
    </div>
    <div id="sol-detail" class="info-box" style="min-height:54px;text-align:center">
      انقر على أي محلول لمعرفة خصائصه 👆
    </div>
    <div class="q-box">
      <strong>❓ ما الفرق بين الحمض القوي والضعيف؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الحمض القوي يتأيّن بالكامل في الماء (مثل HCl pH=1). الضعيف يتأيّن جزئياً (مثل الخل pH=3). كلما قلّ pH ازداد الحمض قوةً وخطورة.</div>
    </div>`);

  const cv = document.getElementById('simCanvas');
  function getColor(type){ return type==='acid'?'#E74C3C':type==='base'?'#2980B9':'#27AE60'; }
  function getBg(type){ return type==='acid'?'rgba(231,76,60,0.12)':type==='base'?'rgba(41,128,185,0.12)':'rgba(39,174,96,0.12)'; }

  function updateLists(){
    const acids = solutions.filter(s=>s.type==='acid').map(s=>s.name).join('، ');
    const neutrals = solutions.filter(s=>s.type==='neutral').map(s=>s.name).join('، ');
    const bases = solutions.filter(s=>s.type==='base').map(s=>s.name).join('، ');
    const el = id => document.getElementById(id);
    if(el('acid-list')) el('acid-list').textContent = acids||'—';
    if(el('neutral-list')) el('neutral-list').textContent = neutrals||'—';
    if(el('base-list')) el('base-list').textContent = bases||'—';
  }
  updateLists();

  cv.onclick = function(e){
    const r=cv.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(cv.width/r.width), my=(e.clientY-r.top)*(cv.height/r.height);
    solutions.forEach(sol=>{
      if(Math.hypot(mx-sol.x*cv.width, my-sol.y*cv.height)<40){
        S.selected = S.selected===sol.id ? null : sol.id;
        try{U9Sound.ping();}catch(e){}
        const box=document.getElementById('sol-detail');
        if(box && S.selected){
          box.innerHTML=`<strong style="font-size:16px">${sol.icon} ${sol.name}</strong><br>
            <span style="color:${getColor(sol.type)};font-weight:700">pH = ${sol.ph}</span><br>
            <span style="font-size:13px;color:#555">${sol.desc}</span>`;
          box.style.borderColor=getColor(sol.type);
          box.style.borderRight=`4px solid ${getColor(sol.type)}`;
        }
        S.classified[sol.id]=true;
        updateLists();
      }
    });
  };
  cv.onmousemove = function(e){
    const r=cv.getBoundingClientRect();
    const mx=(e.clientX-r.left)*(cv.width/r.width), my=(e.clientY-r.top)*(cv.height/r.height);
    S.hover=null;
    solutions.forEach(sol=>{ if(Math.hypot(mx-sol.x*cv.width, my-sol.y*cv.height)<44) S.hover=sol.id; });
    cv.style.cursor=S.hover?'pointer':'default';
  };

  function draw(){
    if(currentSim!=='g9acidprop'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t+=0.02;

    // Background gradient
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F8F5EF'); bg.addColorStop(1,'#EDE8E0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // pH bar
    const bx=w*0.06, by=h*0.06, bw=w*0.88, bh=16;
    const grad=c.createLinearGradient(bx,0,bx+bw,0);
    grad.addColorStop(0,'#E74C3C'); grad.addColorStop(0.35,'#F39C12');
    grad.addColorStop(0.5,'#27AE60'); grad.addColorStop(0.65,'#2980B9'); grad.addColorStop(1,'#1A237E');
    c.fillStyle=grad; c.beginPath(); c.roundRect(bx,by,bw,bh,8); c.fill();
    c.fillStyle='rgba(0,0,0,0.08)'; c.beginPath(); c.roundRect(bx,by,bw,bh/2,8); c.fill();
    [0,7,14].forEach(n=>{
      const px=bx+(n/14)*bw;
      c.fillStyle='rgba(255,255,255,0.8)'; c.fillRect(px-0.5,by,1,bh);
      c.fillStyle='#333'; c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
      c.fillText(n, px, by+bh+12);
    });
    c.fillStyle='#C0392B'; c.font=`${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='center';
    c.fillText('◀ حمضي', bx+bw*0.15, by-5);
    c.fillStyle='#27AE60'; c.fillText('متعادل', bx+bw*0.5, by-5);
    c.fillStyle='#1565C0'; c.fillText('قلوي ▶', bx+bw*0.85, by-5);

    // Sections labels
    ['حمضي 🍋','قلوي 🧼'].forEach((lbl,i)=>{
      const sx=w*(i===0?0.06:0.51), sy=h*0.27, sw=w*(i===0?0.44:0.44), sh=h*0.54;
      c.fillStyle=i===0?'rgba(231,76,60,0.04)':'rgba(41,128,185,0.04)';
      c.beginPath(); c.roundRect(sx,sy,sw,sh,12); c.fill();
      c.strokeStyle=i===0?'rgba(231,76,60,0.15)':'rgba(41,128,185,0.15)';
      c.lineWidth=1.5; c.beginPath(); c.roundRect(sx,sy,sw,sh,12); c.stroke();
    });
    // neutral zone
    c.fillStyle='rgba(39,174,96,0.04)';
    c.beginPath(); c.roundRect(w*0.59,h*0.27,w*0.1,h*0.54,12); c.fill();

    // Draw each solution as a floating bottle/beaker
    solutions.forEach((sol,idx)=>{
      const ax=sol.x*w, ay=sol.y*h;
      const isSel=S.selected===sol.id, isHov=S.hover===sol.id;
      const bob=Math.sin(S.t*1.1+idx*0.9)*(isHov?6:3);
      const cy2=ay+bob;
      const r=isHov||isSel?44:38;

      // pH dot on scale bar
      const phX=bx+(sol.ph/14)*bw;
      c.fillStyle=getColor(sol.type);
      c.beginPath(); c.arc(phX,by+bh/2,5,0,Math.PI*2); c.fill();
      c.strokeStyle='#fff'; c.lineWidth=1.5; c.stroke();

      // Connecting line from dot to icon
      c.strokeStyle=getColor(sol.type)+'55'; c.lineWidth=1;
      c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(phX,by+bh); c.lineTo(ax,cy2-r-4); c.stroke();
      c.setLineDash([]);

      // Glow for selected/hover
      if(isSel||isHov){
        c.shadowBlur=20; c.shadowColor=getColor(sol.type);
      }

      // Beaker body
      c.fillStyle=getBg(sol.type);
      c.beginPath(); c.ellipse(ax,cy2,r,r*0.85,0,0,Math.PI*2); c.fill();
      c.strokeStyle=isSel?getColor(sol.type):'rgba(0,0,0,0.12)';
      c.lineWidth=isSel?2.5:1.5; c.beginPath(); c.ellipse(ax,cy2,r,r*0.85,0,0,Math.PI*2); c.stroke();
      c.shadowBlur=0;

      // Liquid wave inside
      c.save();
      c.beginPath(); c.ellipse(ax,cy2,r-2,r*0.83,0,0,Math.PI*2); c.clip();
      c.fillStyle=getColor(sol.type)+'33';
      c.beginPath();
      c.moveTo(ax-r, cy2+r*0.2);
      for(let xi=0;xi<=r*2;xi++){
        const wave=Math.sin((xi/r)*Math.PI*2+S.t*2)*4;
        c.lineTo(ax-r+xi, cy2+wave);
      }
      c.lineTo(ax+r,cy2+r*0.85); c.lineTo(ax-r,cy2+r*0.85); c.closePath(); c.fill();
      c.restore();

      // Icon
      c.font=`${r*0.85}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(sol.icon,ax,cy2);

      // pH badge
      const phtxt=`pH ${sol.ph}`;
      c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`;
      const bwt=c.measureText(phtxt).width+12;
      c.fillStyle=getColor(sol.type)+'CC';
      c.beginPath(); c.roundRect(ax-bwt/2,cy2-r-18,bwt,16,6); c.fill();
      c.fillStyle='#fff'; c.textBaseline='middle';
      c.fillText(phtxt, ax, cy2-r-10);

      // Name
      c.fillStyle=isSel?getColor(sol.type):'#444';
      c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`; c.textBaseline='top';
      c.fillText(sol.name, ax, cy2+r*0.85+6);
    });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-1 Tab2: الأحماض العضوية ──
function simG9AcidProp2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, sel:0, hover:-1 };
  const S = simState;

  const acids = [
    { name:'حمض الإيثانويك (الخل)', formula:'CH₃COOH', source:'الخل المنزلي', ph:3.0, icon:'🫙', color:'#F4A460', strength:'ضعيف' },
    { name:'حمض الستريك', formula:'C₆H₈O₇', source:'الليمون والبرتقال', ph:2.2, icon:'🍋', color:'#FFD700', strength:'ضعيف' },
    { name:'حمض اللاكتيك', formula:'CH₃CH(OH)COOH', source:'الحليب واللبن', ph:3.5, icon:'🥛', color:'#F0F0F0', strength:'ضعيف' },
    { name:'حمض الكربونيك', formula:'H₂CO₃', source:'المشروبات الغازية', ph:3.9, icon:'🥤', color:'#87CEEB', strength:'ضعيف' },
    { name:'حمض الهيدروكلوريك', formula:'HCl', source:'حمض قوي / المعدة', ph:1.0, icon:'⚠️', color:'#FF6B6B', strength:'قوي' },
    { name:'حمض الكبريتيك', formula:'H₂SO₄', source:'بطاريات السيارات', ph:0.5, icon:'🔋', color:'#FF4444', strength:'قوي' },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🍋 اختر الحمض</div>
      <div class="ctrl-btns-grid-1" id="acid-btns">
        ${acids.map((a,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="acid-btn-${i}" onclick="simState.sel=${i};document.querySelectorAll('[id^=acid-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${a.icon} ${a.name}</button>`).join('')}
      </div>
    </div>
    <div class="q-box">
      <strong>❓ ما الفرق بين الأحماض العضوية وغير العضوية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الأحماض العضوية تحتوي على الكربون (مثل CH₃COOH) وعادة ضعيفة وموجودة في الطعام. غير العضوية كـ HCl وH₂SO₄ عادة أقوى وأكثر خطورة.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9acidprop'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const acid=acids[S.sel||0];

    // Background
    const bg=c.createLinearGradient(0,0,w,h);
    bg.addColorStop(0,'#FFF8EE'); bg.addColorStop(1,'#FFF0DD');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Animated bubbles
    for(let i=0;i<10;i++){
      const bx=(i/10)*w+(Math.sin(S.t*0.015+i)*20);
      const by=h-((S.t*0.7+i*70)%h);
      const br=4+i%4;
      c.fillStyle=acid.color+'22';
      c.beginPath(); c.arc(bx,by,br,0,Math.PI*2); c.fill();
    }

    // Big flask
    const fx=w*0.32, fy=h*0.32, fr=Math.min(w,h)*0.22;
    // Flask glow
    c.shadowBlur=30; c.shadowColor=acid.color+'88';
    const radGrad=c.createRadialGradient(fx-fr*0.3,fy-fr*0.3,fr*0.1,fx,fy,fr);
    radGrad.addColorStop(0,acid.color+'AA'); radGrad.addColorStop(1,acid.color+'44');
    c.fillStyle=radGrad; c.beginPath(); c.arc(fx,fy,fr,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle=acid.color+'CC'; c.lineWidth=3;
    c.beginPath(); c.arc(fx,fy,fr,0,Math.PI*2); c.stroke();

    // Liquid fill animated
    const fillR=fr*(0.55+0.08*Math.sin(S.t*0.04));
    c.save(); c.beginPath(); c.arc(fx,fy,fr-2,0,Math.PI*2); c.clip();
    c.fillStyle=acid.color+'55';
    const waveY=fy+fr-fillR;
    c.beginPath(); c.moveTo(fx-fr,waveY);
    for(let xi=0;xi<=fr*2;xi++){
      c.lineTo(fx-fr+xi, waveY+Math.sin((xi/fr)*Math.PI*2+S.t*0.06)*6);
    }
    c.lineTo(fx+fr,fy+fr); c.lineTo(fx-fr,fy+fr); c.closePath(); c.fill();
    c.restore();

    // Icon in flask
    c.font=`${Math.max(32,fr*0.85)}px serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(acid.icon, fx, fy+fr*0.05);

    // Info panel
    const ix=w*0.60, iy=h*0.08, iw=w*0.37, ih=h*0.84;
    c.fillStyle='rgba(255,255,255,0.93)';
    c.beginPath(); c.roundRect(ix,iy,iw,ih,14); c.fill();
    c.strokeStyle=acid.color+'66'; c.lineWidth=2;
    c.beginPath(); c.roundRect(ix,iy,iw,ih,14); c.stroke();

    const tx=ix+iw-12, lineH=h*0.065;
    c.textAlign='right'; c.textBaseline='top';

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`;
    c.fillText(acid.name, tx, iy+14);

    const rows=[
      ['الصيغة الكيميائية:', acid.formula, '#1A8FA8'],
      ['المصدر:', acid.source, '#555'],
      ['القوة:', acid.strength==='قوي'?'قوي ⚠️':'ضعيف ✅', acid.strength==='قوي'?'#C0392B':'#27AE60'],
    ];
    rows.forEach((row,ri)=>{
      const ry=iy+14+lineH*(ri+1)+8;
      c.fillStyle='#888'; c.font=`${Math.max(10,w*0.021)}px Tajawal`;
      c.fillText(row[0], tx, ry);
      c.fillStyle=row[2]||'#1E2D3D'; c.font=`bold ${Math.max(11,w*0.023)}px Tajawal`;
      c.fillText(row[1], tx, ry+lineH*0.45);
    });

    // pH gauge
    const gy=iy+14+lineH*4+12, gx=ix+8, gw=iw-20, gh=14;
    c.fillStyle='#F0F0F0'; c.beginPath(); c.roundRect(gx,gy,gw,gh,7); c.fill();
    const phGrad=c.createLinearGradient(gx,0,gx+gw,0);
    phGrad.addColorStop(0,'#E74C3C'); phGrad.addColorStop(0.5,'#27AE60'); phGrad.addColorStop(1,'#1565C0');
    c.fillStyle=phGrad; c.beginPath(); c.roundRect(gx,gy,gw,gh,7); c.fill();
    const pm=gx+(acid.ph/14)*gw;
    c.fillStyle='#1E2D3D'; c.beginPath(); c.arc(pm,gy+gh/2,10,0,Math.PI*2); c.fill();
    c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.arc(pm,gy+gh/2,10,0,Math.PI*2); c.stroke();
    c.fillStyle='#fff'; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center';
    c.fillText(acid.ph, pm, gy+gh/2+1);

    c.fillStyle='#C0392B'; c.font=`bold ${Math.max(14,w*0.03)}px Tajawal`; c.textAlign='right';
    c.fillText(`pH = ${acid.ph}`, tx, gy+gh+12);
    const str=acid.ph<3?'حمض قوي جداً ⚠️':acid.ph<5?'حمض متوسط القوة':'حمض ضعيف';
    c.fillStyle='#555'; c.font=`${Math.max(10,w*0.022)}px Tajawal`;
    c.fillText(str, tx, gy+gh+30);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-1 Tab3: القواعد والقلويات ──
function simG9AcidProp3() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, sel:0, hover:-1 };
  const S = simState;

  const bases = [
    { name:'هيدروكسيد الصوديوم', formula:'NaOH',     use:'صناعة الصابون',       ph:14,  icon:'🧴', color:'#3498DB', soluble:true },
    { name:'هيدروكسيد الكالسيوم',formula:'Ca(OH)₂',  use:'تعديل حموضة التربة', ph:12.4,icon:'⬜', color:'#95A5A6', soluble:false },
    { name:'هيدروكسيد الأمونيوم', formula:'NH₄OH',   use:'المنظفات المنزلية',   ph:11.5,icon:'🧪', color:'#9B59B6', soluble:true },
    { name:'هيدروكسيد المغنيسيوم',formula:'Mg(OH)₂', use:'علاج حموضة المعدة',  ph:10.5,icon:'💊', color:'#1ABC9C', soluble:false },
    { name:'كربونات الصوديوم',    formula:'Na₂CO₃',  use:'صناعة الزجاج',       ph:11.6,icon:'🔬', color:'#2ECC71', soluble:true },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧴 اختر القاعدة</div>
      <div class="ctrl-btns-grid-1">
        ${bases.map((b,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="base-btn-${i}" onclick="simState.sel=${i};document.querySelectorAll('[id^=base-btn-]').forEach((btn,j)=>btn.classList.toggle('active',j===${i}))">${b.icon} ${b.name}</button>`).join('')}
      </div>
    </div>
    <div class="info-box">
      🔑 القلويات: قواعد تذوب في الماء وتُعطي أيونات <b>OH⁻</b>
    </div>
    <div class="q-box">
      <strong>❓ لماذا نستخدم Mg(OH)₂ لعلاج حموضة المعدة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">هيدروكسيد المغنيسيوم قاعدة ضعيفة آمنة تُعادل حمض المعدة الزائد (HCl). يُعطي ارتياحاً سريعاً دون أن يضرّ بوظائف الجسم.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9acidprop'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const base=bases[S.sel||0];

    // Background
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F8FF'); bg.addColorStop(1,'#E8F4FD');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Beaker drawing
    const bkx=w*0.18, bky=h*0.12, bkw=w*0.28, bkh=h*0.70;

    // Beaker glass
    c.fillStyle='rgba(200,220,255,0.15)';
    c.beginPath(); c.moveTo(bkx,bky); c.lineTo(bkx,bky+bkh); c.lineTo(bkx+bkw,bky+bkh); c.lineTo(bkx+bkw,bky); c.closePath(); c.fill();
    c.strokeStyle='rgba(120,150,200,0.5)'; c.lineWidth=2;
    c.beginPath(); c.moveTo(bkx,bky); c.lineTo(bkx,bky+bkh); c.lineTo(bkx+bkw,bky+bkh); c.lineTo(bkx+bkw,bky); c.stroke();
    // Rim
    c.strokeStyle='rgba(120,150,200,0.6)'; c.lineWidth=3;
    c.beginPath(); c.moveTo(bkx-4,bky); c.lineTo(bkx+bkw+4,bky); c.stroke();

    // Liquid
    const lh=bkh*0.72;
    c.fillStyle=base.color+'22';
    c.fillRect(bkx+2, bky+bkh-lh, bkw-4, lh);
    // Wave
    c.fillStyle=base.color+'44';
    c.beginPath(); c.moveTo(bkx+2,bky+bkh-lh);
    for(let xi=0;xi<=bkw-4;xi++){
      c.lineTo(bkx+2+xi, bky+bkh-lh+Math.sin((xi/bkw)*Math.PI*4+S.t*0.07)*5);
    }
    c.lineTo(bkx+bkw-2,bky+bkh); c.lineTo(bkx+2,bky+bkh); c.closePath(); c.fill();

    // OH⁻ ions floating
    for(let i=0;i<8;i++){
      const ix=bkx+14+((i*37+S.t*0.6)%(bkw-30));
      const iy=bky+bkh-10-((i*47+S.t*0.8)%(lh-20));
      c.fillStyle=base.color+'CC';
      c.beginPath(); c.arc(ix,iy,8,0,Math.PI*2); c.fill();
      c.fillStyle='#fff'; c.font=`bold ${Math.max(7,w*0.014)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('OH⁻',ix,iy);
    }
    // Icon in beaker
    c.font=`${Math.max(28,bkw*0.55)}px serif`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(base.icon, bkx+bkw/2, bky+bkh*0.32);

    // Info panel right
    const ix=w*0.52, iy=h*0.08, iw=w*0.46, ih=h*0.85;
    c.fillStyle='rgba(255,255,255,0.95)';
    c.beginPath(); c.roundRect(ix,iy,iw,ih,14); c.fill();
    c.strokeStyle=base.color+'66'; c.lineWidth=2;
    c.beginPath(); c.roundRect(ix,iy,iw,ih,14); c.stroke();

    const tx=ix+iw-12;
    c.textAlign='right'; c.textBaseline='top';
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`;
    c.fillText(base.name, tx, iy+12);

    const rows=[
      ['الصيغة:',base.formula,'#1A8FA8'],
      ['pH:',`${base.ph}`,'#C0392B'],
      ['الاستخدام:',base.use,'#555'],
      ['تذوب في الماء؟:',base.soluble?'✅ قلوية (تذوب)':'قاعدة غير ذائبة', base.soluble?'#27AE60':'#E67E22'],
    ];
    rows.forEach((row,ri)=>{
      const ry=iy+14+ri*h*0.13;
      c.fillStyle='#888'; c.font=`${Math.max(10,w*0.021)}px Tajawal`;
      c.fillText(row[0], tx, ry+h*0.04);
      c.fillStyle=row[2]; c.font=`bold ${Math.max(11,w*0.023)}px Tajawal`;
      c.fillText(row[1], tx, ry+h*0.07);
    });

    // pH bar
    const gy=iy+h*0.58, gx=ix+8, gw=iw-20, gh=14;
    const phGrad=c.createLinearGradient(gx,0,gx+gw,0);
    phGrad.addColorStop(0,'#E74C3C'); phGrad.addColorStop(0.5,'#27AE60'); phGrad.addColorStop(1,'#1565C0');
    c.fillStyle=phGrad; c.beginPath(); c.roundRect(gx,gy,gw,gh,7); c.fill();
    const pm=gx+(base.ph/14)*gw;
    c.fillStyle='#fff'; c.beginPath(); c.arc(pm,gy+gh/2,9,0,Math.PI*2); c.fill();
    c.strokeStyle=base.color; c.lineWidth=2; c.beginPath(); c.arc(pm,gy+gh/2,9,0,Math.PI*2); c.stroke();
    c.fillStyle=base.color; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(base.ph, pm, gy+gh/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-2 Tab1: ورق تبّاع الشمس — قابل للسحب ──
function simG9Indicator1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, dipped:{}, paperX:0.5, paperY:0.12, dragging:false };
  const S = simState;

  const solutions = [
    { id:'hcl',    label:'حمض\nالهيدروكلوريك', ph:1,   color:'#C0392B', bgCol:'rgba(231,76,60,',   type:'acid',    emoji:'⚠️', typeLabel:'حمضي قوي' },
    { id:'lemon',  label:'عصير\nالليمون',        ph:2.5, color:'#E67E22', bgCol:'rgba(243,156,18,',  type:'acid',    emoji:'🍋', typeLabel:'حمضي' },
    { id:'coffee', label:'القهوة',               ph:5,   color:'#8B4513', bgCol:'rgba(139,69,19,',   type:'acid',    emoji:'☕', typeLabel:'حمضي خفيف' },
    { id:'water',  label:'الماء\nالنقي',          ph:7,   color:'#7D3C98', bgCol:'rgba(125,60,152,',  type:'neutral', emoji:'💧', typeLabel:'متعادل' },
    { id:'soap',   label:'ماء\nالصابون',          ph:9,   color:'#2980B9', bgCol:'rgba(41,128,185,',  type:'base',    emoji:'🧼', typeLabel:'قلوي' },
    { id:'ammonia',label:'الأمونيا',              ph:11.5,color:'#1A5276', bgCol:'rgba(26,82,118,',   type:'base',    emoji:'🧪', typeLabel:'قلوي قوي' },
  ];

  let paperColor={r:220,g:208,b:170};
  let isDipping=false, dipProgress=0, dipTarget=null, dipPhase=0, colorProgress=0, lastDipped=null, dipCount=0, dipAnim=0;

  function hexToRgb(hex){ return {r:parseInt(hex.slice(1,3),16),g:parseInt(hex.slice(3,5),16),b:parseInt(hex.slice(5,7),16)}; }
  function lerpColor(a,b,t){ return {r:Math.round(a.r+(b.r-a.r)*t),g:Math.round(a.g+(b.g-a.g)*t),b:Math.round(a.b+(b.b-a.b)*t)}; }

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📄 ورق تبّاع الشمس</div>
      <div class="info-box" style="text-align:center;line-height:1.8">
        اسحب ورقة تبّاع الشمس<br>نحو أي محلول لترى لونها!
      </div>
      <div id="dipResult" style="margin-top:8px;padding:10px;border-radius:10px;
        background:rgba(26,143,168,0.06);border:1.5px solid rgba(26,143,168,0.2);
        font-size:14px;color:#555;line-height:1.7;min-height:54px;">
        اسحب الورقة فوق أحد الكؤوس...
      </div>
      <div id="dipScore" style="margin-top:6px;font-size:13px;color:#1A8FA8;text-align:center;font-weight:700"></div>
    </div>
    <div style="padding:8px 10px;background:rgba(212,144,26,0.07);border-radius:8px;font-size:13px;color:#7A5010;line-height:1.8;margin-top:8px">
      🔴 حمض &nbsp;|&nbsp; 🟣 متعادل &nbsp;|&nbsp; 🔵 قلوي
    </div>
    <div class="q-box">
      <strong>❓ لماذا لا تُستخدم ورقة تبّاع الشمس لقياس pH الدقيق؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">ورقة تبّاع الشمس تُعطي 3 ألوان فقط (أحمر/بنفسجي/أزرق). للقياس الدقيق نستخدم الكاشف العام أو جهاز pH الرقمي.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9indicator'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t+=0.02;

    // Background - lab bench
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F8FF'); bg.addColorStop(1,'#E8EEF8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='rgba(180,160,130,0.18)';
    c.beginPath(); c.roundRect(0,h*0.72,w,h*0.28,0); c.fill();
    c.fillStyle='rgba(160,140,110,0.3)'; c.fillRect(0,h*0.72,w,3);

    if(dipCount===0&&!isDipping){
      c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`; c.fillStyle='rgba(80,110,160,0.65)';
      c.textAlign='center'; c.textBaseline='top';
      c.fillText('↓ اسحب الورقة نحو أي كأس', w/2, h*0.04);
    }

    // Advance dip animation
    if(isDipping){
      dipProgress+=0.022;
      if(dipPhase===0&&dipProgress>0.38) dipPhase=1;
      else if(dipPhase===1){
        const blend=(dipProgress-0.38)/0.37;
        colorProgress=Math.min(1,blend*1.3);
        paperColor=lerpColor(paperColor,hexToRgb(dipTarget.color),colorProgress);
        if(dipProgress>0.75) dipPhase=2;
      } else if(dipPhase===2&&dipProgress>=1.0){
        isDipping=false; dipProgress=0; dipPhase=0;
        S.paperX=0.5; S.paperY=0.12;
      }
    }

    // Draw beakers
    const n=solutions.length;
    solutions.forEach((sol,i)=>{
      const bx=w*(0.09+i*(0.84/(n-1)));
      const by=h*0.68, bW=Math.min(w*0.13,58), bH=bW*1.25;
      const isDipped=S.dipped[sol.id];
      const isActive=isDipping&&dipTarget&&dipTarget.id===sol.id;

      // Glass
      const glassG=c.createLinearGradient(bx-bW/2,0,bx+bW/2,0);
      glassG.addColorStop(0,'rgba(220,235,255,0.6)'); glassG.addColorStop(0.3,'rgba(255,255,255,0.15)');
      glassG.addColorStop(0.7,'rgba(255,255,255,0.1)'); glassG.addColorStop(1,'rgba(200,220,255,0.5)');
      c.fillStyle=glassG; c.strokeStyle=isActive?'rgba(26,143,168,0.8)':'rgba(120,150,200,0.4)';
      c.lineWidth=isActive?2.5:1.8;
      c.beginPath();
      c.moveTo(bx-bW/2+4,by-bH); c.lineTo(bx-bW/2,by);
      c.quadraticCurveTo(bx-bW/2,by+8,bx-bW/2+8,by+8);
      c.lineTo(bx+bW/2-8,by+8); c.quadraticCurveTo(bx+bW/2,by+8,bx+bW/2,by);
      c.lineTo(bx+bW/2-4,by-bH); c.closePath(); c.fill(); c.stroke();

      // Liquid
      const liqH=bH*0.68, liqY=by-liqH+4;
      c.fillStyle=isDipped?sol.bgCol+'0.42)':isActive?sol.bgCol+'0.32)':sol.bgCol+'0.18)';
      c.beginPath();
      c.moveTo(bx-bW/2+3,liqY); c.lineTo(bx-bW/2+1,by+2);
      c.lineTo(bx+bW/2-1,by+2); c.lineTo(bx+bW/2-3,liqY); c.closePath(); c.fill();
      // Surface shimmer
      c.fillStyle='rgba(255,255,255,0.28)';
      c.beginPath(); c.ellipse(bx,liqY+2,bW/2-6,4,0,0,Math.PI*2); c.fill();
      // Ripple
      if(isActive&&dipPhase>=1){
        const rp=(dipProgress-0.38)*80, ra=Math.max(0,0.6-(dipProgress-0.38)*1.2);
        c.strokeStyle=`rgba(255,255,255,${ra})`; c.lineWidth=2;
        c.beginPath(); c.ellipse(bx,liqY+6,rp*0.4,rp*0.12,0,0,Math.PI*2); c.stroke();
      }
      // Color stain after dip
      if(isDipped){
        const sc2=hexToRgb(sol.color);
        const stripG=c.createLinearGradient(0,liqY,0,by);
        stripG.addColorStop(0,`rgba(${sc2.r},${sc2.g},${sc2.b},0)`);
        stripG.addColorStop(0.4,`rgba(${sc2.r},${sc2.g},${sc2.b},0.35)`);
        stripG.addColorStop(1,`rgba(${sc2.r},${sc2.g},${sc2.b},0.5)`);
        c.fillStyle=stripG;
        c.beginPath(); c.moveTo(bx-bW/2+3,liqY); c.lineTo(bx-bW/2+1,by+2);
        c.lineTo(bx+bW/2-1,by+2); c.lineTo(bx+bW/2-3,liqY); c.closePath(); c.fill();
      }

      // Emoji & label
      c.font=`${Math.round(bW*0.42)}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(sol.emoji, bx, by-bH*0.35);
      c.font=`bold ${Math.max(9,Math.round(w*0.018))}px Tajawal`; c.fillStyle='#334';
      c.textBaseline='top';
      sol.label.split('\n').forEach((line,li)=>c.fillText(line,bx,by+12+li*13));
      c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(9,Math.round(w*0.019))}px Tajawal`;
      c.fillText('pH '+sol.ph, bx, by+12+sol.label.split('\n').length*13);

      // Ripple ring
      if(lastDipped===sol.id&&dipAnim>0){
        const dc=hexToRgb(sol.color);
        c.strokeStyle=`rgba(${dc.r},${dc.g},${dc.b},${dipAnim})`; c.lineWidth=2.5;
        c.beginPath(); c.ellipse(bx,by-bH*0.4,(1-dipAnim)*bW*0.8,(1-dipAnim)*bW*0.25,0,0,Math.PI*2); c.stroke();
        dipAnim=Math.max(0,dipAnim-0.022);
      }
    });

    // Draw litmus paper
    let drawPX, drawPY, submergeDepth=0;
    const restY=S.paperY*h;
    if(!isDipping){ drawPX=S.paperX*w; drawPY=restY; }
    else {
      const bx2=w*(0.09+solutions.findIndex(s=>s.id===dipTarget.id)*(0.84/(n-1)));
      const by2=h*0.68, bH2=Math.min(w*0.13,58)*1.25;
      if(dipPhase===0){ const t=dipProgress/0.38; drawPX=S.paperX*w+(bx2-S.paperX*w)*t; drawPY=restY+(by2-bH2*0.7-restY)*t; }
      else if(dipPhase===1){ drawPX=bx2; drawPY=by2-bH2*0.7; submergeDepth=Math.min(44,(dipProgress-0.38)/0.37*44); }
      else { const t=(dipProgress-0.75)/0.25; drawPX=bx2+(0.5*w-bx2)*t; drawPY=(by2-bH2*0.7)+(0.12*h-(by2-bH2*0.7))*t; submergeDepth=Math.max(0,44-t*44); }
    }

    c.save();
    const pW=22, pHstrip=54, pHhandle=26;
    const fc=paperColor;
    // Shadow
    c.fillStyle='rgba(0,0,0,0.1)';
    c.beginPath(); c.ellipse(drawPX+4,drawPY+pHhandle+pHstrip+4,pW*0.5,5,0,0,Math.PI*2); c.fill();
    // Handle
    const hGrad=c.createLinearGradient(drawPX-pW/2,0,drawPX+pW/2,0);
    hGrad.addColorStop(0,'#E8D8A8'); hGrad.addColorStop(0.5,'#F4E8C0'); hGrad.addColorStop(1,'#D8C898');
    c.fillStyle=hGrad; c.strokeStyle='rgba(140,110,50,0.3)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(drawPX-pW/2,drawPY,pW,pHhandle,[4,4,0,0]); c.fill(); c.stroke();
    for(let i=0;i<3;i++){ c.strokeStyle='rgba(120,90,40,0.2)'; c.lineWidth=0.8; c.beginPath(); c.moveTo(drawPX-pW/2+4,drawPY+7+i*6); c.lineTo(drawPX+pW/2-4,drawPY+7+i*6); c.stroke(); }
    // Strip
    c.save();
    const visH=Math.max(2,pHstrip-submergeDepth);
    c.beginPath(); c.rect(drawPX-pW/2,drawPY+pHhandle,pW,visH); c.clip();
    const blendT=colorProgress, beigePx=Math.round(pHstrip*(1-blendT)), colorPx=pHstrip-beigePx;
    if(beigePx>0&&beigePx<visH){ c.fillStyle='rgba(220,208,170,1)'; c.beginPath(); c.rect(drawPX-pW/2+1,drawPY+pHhandle,pW-2,Math.min(beigePx,visH)); c.fill(); }
    if(colorPx>0){
      const sy=drawPY+pHhandle+beigePx, sh=Math.min(colorPx,visH-beigePx);
      if(sh>0){
        const cg=c.createLinearGradient(0,sy,0,sy+sh);
        cg.addColorStop(0,`rgba(${fc.r},${fc.g},${fc.b},${0.5+blendT*0.3})`);
        cg.addColorStop(1,`rgba(${fc.r},${fc.g},${fc.b},1)`);
        c.fillStyle=cg; c.beginPath(); c.rect(drawPX-pW/2+1,sy,pW-2,sh); c.fill();
        if(blendT>0.05&&blendT<0.99){ c.fillStyle=`rgba(${fc.r},${fc.g},${fc.b},0.3)`; c.beginPath(); c.ellipse(drawPX,sy+2,pW/2-1,4,0,0,Math.PI*2); c.fill(); }
      }
    } else { c.fillStyle='rgba(220,208,170,1)'; c.beginPath(); c.rect(drawPX-pW/2+1,drawPY+pHhandle,pW-2,visH); c.fill(); }
    c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1.2;
    c.beginPath(); c.roundRect(drawPX-pW/2,drawPY+pHhandle,pW,visH,[0,0,4,4]); c.stroke();
    c.restore();
    if(!isDipping){ c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.fillStyle='rgba(60,45,20,0.85)'; c.textAlign='center'; c.textBaseline='top'; c.fillText('ورق تبّاع الشمس',drawPX,drawPY+pHhandle+pHstrip+6); }
    // Color badge
    if(colorProgress>0.45&&lastDipped&&!isDipping){
      const dp=solutions.find(s=>s.id===lastDipped);
      if(dp){ c.font='bold 13px Tajawal'; const tw=c.measureText(dp.typeLabel).width; const bwt=tw+28;
        c.fillStyle='rgba(30,45,70,0.10)'; c.strokeStyle='rgba(30,45,70,0.3)'; c.lineWidth=1.5;
        c.beginPath(); c.roundRect(drawPX-bwt/2,drawPY-48,bwt,30,10); c.fill(); c.stroke();
        c.fillStyle='rgba(30,45,70,0.85)'; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(dp.typeLabel,drawPX,drawPY-33); }
    }
    c.restore();
    animFrame=requestAnimationFrame(draw);
  }

  // Drag
  function getPos(e){ const r=cv.getBoundingClientRect(); const touch=e.touches&&e.touches[0]||e; return {x:(touch.clientX-r.left)*cv.width/r.width,y:(touch.clientY-r.top)*cv.height/r.height}; }
  function onStart(e){ if(isDipping) return; e.preventDefault&&e.preventDefault(); const pos=getPos(e); if(Math.hypot(pos.x-S.paperX*cv.width,pos.y-(S.paperY+0.05)*cv.height)<60) S.dragging=true; }
  function onMove(e){ if(!S.dragging||isDipping) return; e.preventDefault&&e.preventDefault(); const pos=getPos(e); S.paperX=Math.max(0.05,Math.min(0.95,pos.x/cv.width)); S.paperY=Math.max(0.03,Math.min(0.60,(pos.y-35)/cv.height)); }
  function onEnd(e){
    if(!S.dragging||isDipping) return; S.dragging=false;
    if(S.paperY*cv.height>cv.height*0.38){
      let closest=null,minDist=Infinity;
      solutions.forEach((sol,i)=>{ const bx=0.09+i*(0.84/(solutions.length-1)); const d=Math.abs(S.paperX-bx); if(d<minDist){minDist=d;closest=sol;} });
      if(closest&&minDist<0.13){
        isDipping=true; dipProgress=0; dipPhase=0; dipTarget=closest; lastDipped=closest.id;
        dipAnim=1; dipCount++; colorProgress=0; S.dipped[closest.id]=true;
        try{U9Sound.ping(600,0.15,0.12);}catch(e){}
        setTimeout(()=>{
          const box=document.getElementById('dipResult');
          if(box){ box.innerHTML=`<div style="display:flex;align-items:center;gap:8px;justify-content:center;margin-bottom:4px"><span style="font-size:22px">${closest.emoji}</span><strong style="font-size:15px">${closest.label.replace('\n',' ')}</strong></div><div style="color:${closest.color};font-weight:700;font-size:15px">${closest.typeLabel} — pH ${closest.ph}</div><div style="font-size:13px;color:#555;margin-top:3px">${closest.type==='acid'?'الورقة تحمرّ 🔴 — حمض':closest.type==='neutral'?'الورقة تبقى بنفسجية 🟣 — متعادل':'الورقة تزرقّ 🔵 — قلوي'}</div>`; box.style.borderRight=`4px solid ${closest.color}`; }
          const sc=document.getElementById('dipScore'); const done=Object.keys(S.dipped).length;
          if(sc) sc.textContent=`✅ ${done} من ${solutions.length} محاليل مكتملة`;
          if(done===solutions.length) setTimeout(()=>{ try{buddySay('ممتاز! 🌟 اختبرت جميع المحاليل — أحمر=حمض، بنفسجي=متعادل، أزرق=قلوي!',7000);}catch(e){} },500);
        },600); return;
      }
    }
    S.paperX=0.5; S.paperY=0.12;
  }
  cv.onmousedown=onStart; cv.onmousemove=onMove; cv.onmouseup=onEnd;
  cv.addEventListener('touchstart',onStart,{passive:false});
  cv.addEventListener('touchmove',onMove,{passive:false});
  cv.addEventListener('touchend',onEnd,{passive:false});
  draw();
}

// ── 6-2 Tab2: الكاشف العام — تفاعلي ──
function simG9Indicator2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, ph:7 };
  const S = simState;

  function getUniversalColor(ph){
    if(ph<1) return '#FF0000'; if(ph<2) return '#FF2200'; if(ph<3) return '#FF4400';
    if(ph<4) return '#FF6600'; if(ph<5) return '#FFAA00'; if(ph<6) return '#FFDD00';
    if(ph<7) return '#88CC00'; if(ph<8) return '#00AA44'; if(ph<9) return '#00AAAA';
    if(ph<10) return '#0066FF'; if(ph<11) return '#2200FF'; if(ph<12) return '#4400CC';
    if(ph<13) return '#660099'; return '#880077';
  }
  function getColorLabel(ph){
    if(ph<2) return 'أحمر قاني'; if(ph<3) return 'أحمر'; if(ph<4) return 'أحمر برتقالي';
    if(ph<5) return 'برتقالي'; if(ph<6) return 'أصفر'; if(ph<7) return 'أخضر مصفر';
    if(ph<8) return 'أخضر'; if(ph<9) return 'أخضر مزرق'; if(ph<10) return 'أزرق';
    if(ph<11) return 'أزرق غامق'; if(ph<12) return 'بنفسجي'; return 'بنفسجي غامق';
  }

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎨 اضبط الرقم الهيدروجيني</div>
      <input type="range" min="0" max="14" step="0.5" value="7"
        oninput="simState.ph=+this.value" style="width:100%;direction:ltr">
      <div style="text-align:center;margin-top:8px;font-size:24px;font-weight:800;color:var(--teal)" id="ph-val-display">pH = 7</div>
    </div>
    <div class="info-box" id="ui-result">
      لون الكاشف: <b>أخضر</b><br>التصنيف: متعادل
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📊 جدول الألوان</div>
      <div style="font-size:11px;line-height:2.2;font-family:Tajawal">
        🔴 pH 0-3 &nbsp;|&nbsp; 🟠 pH 3-5<br>
        🟡 pH 5-6 &nbsp;|&nbsp; 🟢 pH 6-8<br>
        🔵 pH 8-11 &nbsp;|&nbsp; 🟣 pH 11-14
      </div>
    </div>
    <div class="q-box">
      <strong>❓ ما ميزة الكاشف العام على ورقة تبّاع الشمس؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الكاشف العام يُعطي ألواناً مختلفة لكل قيمة pH من 0-14، مما يُتيح تحديد قيمة pH التقريبية بدقة أكبر من ورقة تبّاع الشمس التي تُعطي 3 ألوان فقط.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9indicator'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ph=S.ph||7, col=getUniversalColor(ph);

    // Update UI
    const phEl=document.getElementById('ph-val-display');
    if(phEl) phEl.textContent=`pH = ${ph}`;
    const res=document.getElementById('ui-result');
    if(res){ const type=ph<7?'حمضي 🍋':ph>7?'قلوي 🧼':'متعادل 💧'; res.innerHTML=`لون الكاشف: <b>${getColorLabel(ph)}</b><br>pH = ${ph} | ${type}`; }

    // Bg
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F8F5EF'); bg.addColorStop(1,'#EDE8E0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Big test tube / flask
    const tx=w*0.34, ty=h*0.08, tw2=w*0.32, th=h*0.72;
    // Shadow
    c.fillStyle='rgba(0,0,0,0.06)'; c.beginPath(); c.ellipse(tx+tw2/2+6,ty+th,tw2*0.4,10,0,0,Math.PI*2); c.fill();
    // Glass tube body
    c.strokeStyle='rgba(120,150,200,0.5)'; c.lineWidth=3;
    const glassG=c.createLinearGradient(tx,0,tx+tw2,0);
    glassG.addColorStop(0,'rgba(220,235,255,0.7)'); glassG.addColorStop(0.3,'rgba(255,255,255,0.2)');
    glassG.addColorStop(0.7,'rgba(255,255,255,0.1)'); glassG.addColorStop(1,'rgba(200,220,255,0.6)');
    c.fillStyle=glassG;
    c.beginPath(); c.moveTo(tx,ty); c.lineTo(tx,ty+th-tw2/2); c.quadraticCurveTo(tx,ty+th,tx+tw2/2,ty+th); c.quadraticCurveTo(tx+tw2,ty+th,tx+tw2,ty+th-tw2/2); c.lineTo(tx+tw2,ty); c.closePath(); c.fill(); c.stroke();

    // Liquid inside with wave
    const lh2=th*0.82;
    c.save();
    c.beginPath(); c.moveTo(tx+2,ty+th-lh2); c.lineTo(tx+2,ty+th-tw2/2); c.quadraticCurveTo(tx+2,ty+th-2,tx+tw2/2,ty+th-2); c.quadraticCurveTo(tx+tw2-2,ty+th-2,tx+tw2-2,ty+th-tw2/2); c.lineTo(tx+tw2-2,ty+th-lh2); c.closePath(); c.clip();
    c.fillStyle=col+'BB'; c.fillRect(tx+2,ty+th-lh2,tw2-4,lh2);
    // Wave on top
    c.fillStyle=col+'55';
    c.beginPath(); c.moveTo(tx+2,ty+th-lh2);
    for(let xi=0;xi<=tw2-4;xi++){ c.lineTo(tx+2+xi, ty+th-lh2+Math.sin((xi/(tw2))*Math.PI*3+S.t*0.08)*6); }
    c.lineTo(tx+tw2-2,ty+th-lh2-6); c.closePath(); c.fill();
    c.restore();

    // pH label in tube
    c.fillStyle='rgba(255,255,255,0.92)'; c.font=`bold ${Math.max(18,w*0.045)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`pH = ${ph}`, tx+tw2/2, ty+th*0.42);

    // Color name
    c.fillStyle=col; c.font=`bold ${Math.max(12,w*0.027)}px Tajawal`;
    c.fillText(getColorLabel(ph), tx+tw2/2, ty+th*0.57);

    // Full spectrum bar at bottom
    const barX=w*0.05, barY=h*0.87, barW=w*0.9, barH=20;
    const grad=c.createLinearGradient(barX,0,barX+barW,0);
    ['#FF0000','#FF4400','#FF8800','#FFCC00','#88CC00','#00AA44','#00AAAA','#0066FF','#4400CC','#880077'].forEach((cl,i)=>grad.addColorStop(i/9,cl));
    c.fillStyle=grad; c.beginPath(); c.roundRect(barX,barY,barW,barH,10); c.fill();
    // Gloss
    c.fillStyle='rgba(255,255,255,0.3)'; c.beginPath(); c.roundRect(barX,barY,barW,barH/2,10); c.fill();
    // Marker
    const marker=barX+(ph/14)*barW;
    c.fillStyle='#fff'; c.beginPath(); c.arc(marker,barY+barH/2,11,0,Math.PI*2); c.fill();
    c.strokeStyle='#333'; c.lineWidth=2; c.beginPath(); c.arc(marker,barY+barH/2,11,0,Math.PI*2); c.stroke();
    c.fillStyle='#333'; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ph,marker,barY+barH/2);
    [0,7,14].forEach(n=>{ c.fillStyle='#555'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='top'; c.fillText(n,barX+(n/14)*barW,barY+barH+5); });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-2 Tab3: الكاشف الطبيعي ──
function simG9Indicator3() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, selNat:0, phNat:7 };
  const S = simState;

  const naturals=[
    { name:'عصير الكرنب الأحمر', emoji:'🥬', acid:'أحمر 🔴', neutral:'بنفسجي 🟣', base:'أخضر/أصفر 💛', acC:'#FF2244', neuC:'#9933CC', basC:'#88BB00' },
    { name:'عصير التوت', emoji:'🫐', acid:'أحمر وردي 🌸', neutral:'بنفسجي 🟣', base:'أزرق 🔵', acC:'#CC2244', neuC:'#7744AA', basC:'#3355CC' },
    { name:'زهرة الهيدرانجيا', emoji:'💐', acid:'وردي/أحمر 🌸', neutral:'بنفسجي 🟣', base:'أزرق 🔵', acC:'#FF6699', neuC:'#9944BB', basC:'#4466FF' },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌸 اختر الكاشف الطبيعي</div>
      <div class="ctrl-btns-grid-1">
        ${naturals.map((n,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="nat-btn-${i}" onclick="simState.selNat=${i};document.querySelectorAll('[id^=nat-btn-]').forEach((b,j)=>{b.classList.toggle('active',j===${i})})">${n.emoji} ${n.name}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📊 قيمة pH</div>
      <input type="range" min="1" max="13" value="7" oninput="simState.phNat=+this.value" style="width:100%;direction:ltr;margin-top:6px">
      <div id="nat-ph-display" style="text-align:center;font-size:18px;font-weight:800;margin-top:6px;color:var(--teal)">pH = 7</div>
    </div>
    <div class="info-box">
      الكواشف الطبيعية مستخرجة من نباتات تحتوي على أنثوسيانين — صبغة تتأثر بدرجة الحموضة
    </div>
    <div class="q-box">
      <strong>❓ كيف تصنع كاشفاً طبيعياً من الكرنب الأحمر؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">اغلِ أوراق الكرنب الأحمر في الماء وصفّ العصير — تحصل على محلول بنفسجي يتحوّل للأحمر في الأحماض وللأخضر في القلويّات!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9indicator'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const nat=naturals[S.selNat||0];
    const ph=S.phNat||7;
    const col=ph<7?nat.acC:ph>7?nat.basC:nat.neuC;
    const label=ph<7?nat.acid:ph>7?nat.base:nat.neutral;

    const phEl=document.getElementById('nat-ph-display');
    if(phEl) phEl.textContent=`pH = ${ph}`;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F5F0FF'); bg.addColorStop(1,'#EDE8F5');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText(`${nat.emoji} ${nat.name}`, w/2, h*0.07);

    // Three flask comparison
    ['حمضي\npH < 7','متعادل\npH = 7','قلوي\npH > 7'].forEach((lbl,i)=>{
      const fx=w*(0.12+i*0.30), fy=h*0.13, fw=w*0.24, fh=h*0.52;
      const fc2=i===0?nat.acC:i===1?nat.neuC:nat.basC;
      // Flask body
      const g=c.createLinearGradient(fx,0,fx+fw,0);
      g.addColorStop(0,fc2+'44'); g.addColorStop(0.5,fc2+'88'); g.addColorStop(1,fc2+'44');
      c.fillStyle=g; c.beginPath(); c.roundRect(fx,fy,fw,fh,fw*0.35); c.fill();
      c.strokeStyle='rgba(0,0,0,0.12)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(fx,fy,fw,fh,fw*0.35); c.stroke();
      // Liquid
      c.fillStyle=fc2+'AA';
      c.beginPath(); c.roundRect(fx+4,fy+fh*0.22,fw-8,fh*0.7,fw*0.3); c.fill();
      // Wave
      c.fillStyle=fc2+'55';
      c.beginPath(); c.moveTo(fx+4,fy+fh*0.22);
      for(let xi=0;xi<=fw-8;xi++){ c.lineTo(fx+4+xi,fy+fh*0.22+Math.sin((xi/(fw))*Math.PI*2+S.t*0.06+(i*2))*5); }
      c.lineTo(fx+fw-4,fy+fh*0.25); c.closePath(); c.fill();
      // Color label
      const lpart=i===0?nat.acid:i===1?nat.neutral:nat.base;
      c.fillStyle='rgba(255,255,255,0.9)'; c.font=`bold ${Math.max(9,w*0.019)}px Tajawal`; c.textAlign='center';
      c.fillText(lpart,fx+fw/2,fy+fh*0.60);
      // Bottom label
      c.fillStyle='#333'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textBaseline='top';
      lbl.split('\n').forEach((l,li)=>c.fillText(l,fx+fw/2,fy+fh+10+li*14));
      c.textBaseline='alphabetic';
    });

    // Current pH result box
    const type=ph<7?'حمضي 🍋':ph>7?'قلوي 🧼':'متعادل 💧';
    const rbx=w*0.05, rby=h*0.80, rbw=w*0.90, rbh=h*0.14;
    c.fillStyle='rgba(255,255,255,0.92)';
    c.beginPath(); c.roundRect(rbx,rby,rbw,rbh,12); c.fill();
    c.strokeStyle=col+'99'; c.lineWidth=2; c.beginPath(); c.roundRect(rbx,rby,rbw,rbh,12); c.stroke();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center';
    c.fillText(`pH = ${ph}  |  ${type}  |  اللون: ${label}`, w/2, rby+rbh*0.55);
    // Color swatch
    c.fillStyle=col; c.beginPath(); c.roundRect(rbx+8,rby+rbh*0.2,20,rbh*0.6,6); c.fill();

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-3 Tab1: سلّم pH — تفاعلي بالهوفر ──
function simG9PhScale1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, hov:-1, sel:-1 };
  const S = simState;

  const items=[
    {ph:0,  name:'حمض الهيدروكلوريك المركّز',icon:'⚗️',col:'#FF0000'},
    {ph:1,  name:'العصارة المعدية',            icon:'🫀',col:'#FF2200'},
    {ph:2.5,name:'عصير الليمون',              icon:'🍋',col:'#FF5500'},
    {ph:3,  name:'الخل',                      icon:'🫙',col:'#FF7700'},
    {ph:5,  name:'القهوة',                    icon:'☕',col:'#FFAA00'},
    {ph:5.6,name:'المطر الطبيعي',             icon:'🌧️',col:'#CCBB00'},
    {ph:7,  name:'الماء النقي',               icon:'💧',col:'#27AE60'},
    {ph:7.4,name:'الدم',                      icon:'🩸',col:'#2ECC71'},
    {ph:8.5,name:'صودا الخبز',                icon:'🧁',col:'#1ABC9C'},
    {ph:9,  name:'معجون الأسنان',             icon:'🪥',col:'#3399FF'},
    {ph:11.5,name:'المنظفات المنزلية',         icon:'🧴',col:'#5533FF'},
    {ph:12.4,name:'ماء الجير',                icon:'⬜',col:'#4400EE'},
    {ph:14, name:'هيدروكسيد الصوديوم',        icon:'⚠️',col:'#3300BB'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📊 مقياس pH</div>
      <div class="info-box" style="margin-bottom:6px">
        <b>pH &lt; 7 → حمضي 🍋</b><br>
        <span style="font-size:12px">كلما قلّ pH ازداد الحمض قوة</span>
      </div>
      <div class="info-box" style="background:rgba(39,174,96,0.06);border-color:rgba(39,174,96,0.2);margin-bottom:6px">
        <b>pH = 7 → متعادل 💧</b><br>
        <span style="font-size:12px">H⁺ = OH⁻</span>
      </div>
      <div class="info-box" style="background:rgba(21,101,192,0.06);border-color:rgba(21,101,192,0.2)">
        <b>pH &gt; 7 → قلوي 🧼</b><br>
        <span style="font-size:12px">كلما زاد pH ازداد القلويّ قوة</span>
      </div>
    </div>
    <div id="scale-detail" class="info-box" style="min-height:48px;text-align:center">
      مرّر المؤشر على الأيقونات أو انقر لمعرفة التفاصيل
    </div>
    <div class="q-box">
      <strong>❓ بكم مرة أقوى حمض pH=1 من pH=3؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">مقياس pH لوغاريتمي — كل وحدة تعني 10 أضعاف. pH=1 أقوى من pH=3 بـ100 مرة! لهذا حمض الهيدروكلوريك أخطر بكثير من الخل.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  cv.onmousemove=function(e){
    const r=cv.getBoundingClientRect(), mx=(e.clientX-r.left)*(cv.width/r.width), my=(e.clientY-r.top)*(cv.height/r.height);
    let found=-1;
    items.forEach((it,i)=>{
      const bx=cv.width*0.08+(it.ph/14)*cv.width*0.84, by=cv.height*0.14+i*(cv.height*0.74/items.length);
      if(Math.hypot(mx-bx,my-by)<18) found=i;
    });
    if(found!==S.hov){ S.hov=found; cv.style.cursor=found>=0?'pointer':'default';
      const box=document.getElementById('scale-detail');
      if(box&&found>=0){ const it=items[found]; box.innerHTML=`<strong>${it.icon} ${it.name}</strong><br><span style="color:${it.col};font-weight:700">pH = ${it.ph}</span>`; box.style.borderColor=it.col; }
    }
  };
  cv.onclick=function(e){
    const r=cv.getBoundingClientRect(), mx=(e.clientX-r.left)*(cv.width/r.width), my=(e.clientY-r.top)*(cv.height/r.height);
    items.forEach((it,i)=>{
      const bx=cv.width*0.08+(it.ph/14)*cv.width*0.84, by=cv.height*0.14+i*(cv.height*0.74/items.length);
      if(Math.hypot(mx-bx,my-by)<18){ S.sel=S.sel===i?-1:i; try{U9Sound.ping();}catch(e){} }
    });
  };

  function draw(){
    if(currentSim!=='g9phscale'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F8F5EF'); bg.addColorStop(1,'#EDE8E0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Scale bar
    const bx=w*0.08, by=h*0.06, bw=w*0.84, bh=22;
    const grad=c.createLinearGradient(bx,0,bx+bw,0);
    grad.addColorStop(0,'#FF0000'); grad.addColorStop(0.35,'#FF8800');
    grad.addColorStop(0.5,'#27AE60'); grad.addColorStop(0.65,'#2980B9'); grad.addColorStop(1,'#3300BB');
    c.fillStyle=grad; c.beginPath(); c.roundRect(bx,by,bw,bh,11); c.fill();
    c.fillStyle='rgba(255,255,255,0.25)'; c.beginPath(); c.roundRect(bx,by,bw,bh/2,11); c.fill();
    for(let i=0;i<=14;i++){
      const px=bx+(i/14)*bw;
      c.fillStyle='rgba(255,255,255,0.6)'; c.fillRect(px-0.5,by,1,bh);
      c.fillStyle='#333'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center';
      c.fillText(i,px,by+bh+12);
    }
    c.fillStyle='#C0392B'; c.font=`${Math.max(10,w*0.02)}px Tajawal`; c.textAlign='left'; c.fillText('◀ حمضي',bx,by-5);
    c.fillStyle='#27AE60'; c.textAlign='center'; c.fillText('متعادل',bx+bw*0.5,by-5);
    c.fillStyle='#1565C0'; c.textAlign='right'; c.fillText('قلوي ▶',bx+bw,by-5);

    // Items
    items.forEach((it,i)=>{
      const px=bx+(it.ph/14)*bw;
      const py=by+bh+26+i*(h*0.68/items.length);
      const isHov=S.hov===i, isSel=S.sel===i;

      // Line from bar to item
      c.strokeStyle=it.col+(isHov||isSel?'99':'44'); c.lineWidth=isHov||isSel?1.5:1;
      c.setLineDash([4,4]);
      c.beginPath(); c.moveTo(px,by+bh); c.lineTo(px,py-14); c.stroke();
      c.setLineDash([]);

      // Dot on bar
      c.fillStyle=it.col; c.beginPath(); c.arc(px,by+bh/2,6,0,Math.PI*2); c.fill();
      c.strokeStyle='rgba(255,255,255,0.7)'; c.lineWidth=1.5; c.stroke();

      // Item circle
      const r=isHov||isSel?17:13;
      if(isHov||isSel){ c.shadowBlur=12; c.shadowColor=it.col; }
      c.fillStyle=isHov||isSel?it.col:'rgba(255,255,255,0.85)';
      c.beginPath(); c.arc(px,py,r,0,Math.PI*2); c.fill();
      c.strokeStyle=it.col; c.lineWidth=isHov||isSel?2.5:1.5; c.beginPath(); c.arc(px,py,r,0,Math.PI*2); c.stroke();
      c.shadowBlur=0;

      // Icon
      c.font=`${Math.max(12,r*0.85)}px serif`; c.textAlign='center'; c.textBaseline='middle';
      c.fillStyle=isHov||isSel?'#fff':'#333'; c.fillText(it.icon,px,py+1);

      // Tooltip for selected
      if(isSel){
        const tpW=150, tpH=42, tpX=Math.min(px+r+6, w-tpW-4), tpY=py-tpH/2;
        c.fillStyle='rgba(255,255,255,0.97)';
        c.beginPath(); c.roundRect(tpX,tpY,tpW,tpH,8); c.fill();
        c.strokeStyle=it.col+'88'; c.lineWidth=1.5; c.beginPath(); c.roundRect(tpX,tpY,tpW,tpH,8); c.stroke();
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.02)}px Tajawal`; c.textAlign='right';
        c.fillText(it.name,tpX+tpW-8,tpY+14);
        c.fillStyle=it.col; c.font=`bold ${Math.max(11,w*0.023)}px Tajawal`;
        c.fillText(`pH = ${it.ph}`,tpX+tpW-8,tpY+30);
      }
    });
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-3 Tab2: اختبر محاليل يومية — مجسّ pH تفاعلي ──
function simG9PhScale2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, selected:null, probe:{x:0.5,y:0.2}, dragging:false };
  const S = simState;

  const solutions=[
    {name:'ماء الليمون', ph:2.5, col:'#FFD700', x:0.15, y:0.45, icon:'🍋'},
    {name:'الحليب',      ph:6.5, col:'#FFFFF0', x:0.32, y:0.45, icon:'🥛'},
    {name:'الماء النقي', ph:7.0, col:'#87CEEB', x:0.50, y:0.45, icon:'💧'},
    {name:'ماء البحر',   ph:8.1, col:'#006994', x:0.67, y:0.45, icon:'🌊'},
    {name:'الأمونيا',    ph:11.5,col:'#B0E0E6', x:0.84, y:0.45, icon:'🧪'},
    {name:'المطر الحمضي',ph:4.2, col:'#D3D3D3', x:0.15, y:0.75, icon:'🌧️'},
    {name:'عصير التوت',  ph:3.3, col:'#8B008B', x:0.32, y:0.75, icon:'🫐'},
    {name:'القهوة',      ph:5.0, col:'#8B4513', x:0.50, y:0.75, icon:'☕'},
    {name:'ماء الصابون', ph:9.5, col:'#90EE90', x:0.67, y:0.75, icon:'🧼'},
    {name:'ماء الجير',   ph:12.4,col:'#E8E8E8', x:0.84, y:0.75, icon:'⬜'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 مجسّ pH</div>
      <div id="ph-reading" style="background:#1E2D3D;color:#00FF88;font-family:monospace;font-size:24px;text-align:center;padding:14px;border-radius:10px;margin:8px 0;letter-spacing:2px;box-shadow:0 0 20px rgba(0,255,136,0.2)">pH = --</div>
      <div class="info-box" id="ph-detail" style="min-height:50px">اسحب مجسّ pH نحو أي محلول لقياسه</div>
    </div>
    <div class="q-box">
      <strong>❓ لماذا pH الدم يتراوح بين 7.35-7.45 دائماً؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الجسم يُحافظ على pH الدم في نطاق ضيق لأن الإنزيمات تعمل بكفاءة فقط في هذا النطاق. أي انحراف يُسبّب حالة طارئة طبية (حماض أو قلواء الدم).</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  let measuredSol=null;

  function getPos(e){ const r=cv.getBoundingClientRect(); const touch=e.touches&&e.touches[0]||e; return {x:(touch.clientX-r.left)*cv.width/r.width,y:(touch.clientY-r.top)*cv.height/r.height}; }
  function onStart(e){ e.preventDefault&&e.preventDefault(); const pos=getPos(e); if(Math.hypot(pos.x-S.probe.x*cv.width,pos.y-S.probe.y*cv.height)<40) S.dragging=true; }
  function onMove(e){ if(!S.dragging) return; e.preventDefault&&e.preventDefault(); const pos=getPos(e); S.probe.x=Math.max(0.05,Math.min(0.95,pos.x/cv.width)); S.probe.y=Math.max(0.05,Math.min(0.92,pos.y/cv.height)); }
  function onEnd(e){
    if(!S.dragging) return; S.dragging=false;
    let closest=null, minDist=Infinity;
    solutions.forEach(sol=>{ const d=Math.hypot(S.probe.x-sol.x,S.probe.y-sol.y); if(d<minDist){minDist=d;closest=sol;} });
    if(closest&&minDist<0.12){
      measuredSol=closest; S.selected=closest.name; try{U9Sound.ping();}catch(e){}
      const type=closest.ph<7?'حمضي 🍋':closest.ph>7?'قلوي 🧼':'متعادل 💧';
      const rdEl=document.getElementById('ph-reading'); if(rdEl) rdEl.textContent=`pH = ${closest.ph}`;
      const dtEl=document.getElementById('ph-detail'); if(dtEl) dtEl.innerHTML=`<b>${closest.icon} ${closest.name}</b><br>pH = ${closest.ph} | ${type}`;
    }
  }
  cv.onmousedown=onStart; cv.onmousemove=onMove; cv.onmouseup=onEnd;
  cv.addEventListener('touchstart',onStart,{passive:false});
  cv.addEventListener('touchmove',onMove,{passive:false});
  cv.addEventListener('touchend',onEnd,{passive:false});
  cv.style.cursor='grab';

  function draw(){
    if(currentSim!=='g9phscale'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F0F4F8'); bg.addColorStop(1,'#E8EEF5');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText('اسحب مجسّ pH نحو أي محلول لقياسه', w/2, h*0.07);

    solutions.forEach(sol=>{
      const sx=sol.x*w, sy=sol.y*h, r=36;
      const isSel=S.selected===sol.name;
      // Beaker
      c.fillStyle=sol.col+'BB';
      c.strokeStyle=isSel?'#1A8FA8':'rgba(0,0,0,0.15)';
      c.lineWidth=isSel?3:1.5;
      if(isSel){ c.shadowBlur=15; c.shadowColor='#1A8FA8'; }
      c.beginPath(); c.arc(sx,sy,r,0,Math.PI*2); c.fill(); c.stroke();
      c.shadowBlur=0;
      // Wave inside
      c.save(); c.beginPath(); c.arc(sx,sy,r-2,0,Math.PI*2); c.clip();
      c.fillStyle=sol.col+'66';
      c.beginPath(); c.moveTo(sx-r,sy+r*0.2);
      for(let xi=0;xi<=r*2;xi++){ c.lineTo(sx-r+xi,sy+r*0.2+Math.sin((xi/r)*Math.PI*2+S.t*0.07)*5); }
      c.lineTo(sx+r,sy+r); c.lineTo(sx-r,sy+r); c.closePath(); c.fill();
      c.restore();
      // Icon
      c.font=`${Math.max(18,r*0.55)}px serif`; c.textAlign='center'; c.textBaseline='middle'; c.fillText(sol.icon,sx,sy+3);
      // Name
      c.fillStyle='#333'; c.font=`${Math.max(9,w*0.019)}px Tajawal`; c.textBaseline='top'; c.fillText(sol.name,sx,sy+r+6);
      if(isSel){ c.fillStyle='#C0392B'; c.font=`bold ${Math.max(9,w*0.02)}px Tajawal`; c.fillText(`pH ${sol.ph}`,sx,sy+r+20); }
    });

    // Draw pH probe (draggable)
    const px=S.probe.x*w, py=S.probe.y*h;
    // Wire
    c.strokeStyle='rgba(50,50,50,0.4)'; c.lineWidth=2; c.setLineDash([6,4]);
    c.beginPath(); c.moveTo(px,py-30); c.lineTo(px,py-60); c.stroke(); c.setLineDash([]);
    // Body of probe
    c.fillStyle='#2C3E50';
    c.beginPath(); c.roundRect(px-14,py-30,28,22,[6,6,0,0]); c.fill();
    c.fillStyle='#ECF0F1';
    c.beginPath(); c.roundRect(px-12,py-28,24,18,[4,4,0,0]); c.fill();
    // Screen on probe
    c.fillStyle='#1E8449'; c.font=`bold ${Math.max(7,w*0.013)}px monospace`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(measuredSol?`${measuredSol.ph}`:'--',px,py-19);
    // Tip
    const tipCol=measuredSol?(measuredSol.ph<7?'#E74C3C':measuredSol.ph>7?'#2980B9':'#27AE60'):'#BDC3C7';
    c.fillStyle=tipCol;
    c.beginPath(); c.roundRect(px-6,py-8,12,38,[0,0,6,6]); c.fill();
    // Tip gloss
    c.fillStyle='rgba(255,255,255,0.2)'; c.beginPath(); c.roundRect(px-4,py-6,5,34,[0,0,3,3]); c.fill();
    // Sensor bulb
    if(S.dragging){ c.shadowBlur=10; c.shadowColor=tipCol; }
    c.fillStyle=tipCol; c.beginPath(); c.arc(px,py+30,7,0,Math.PI*2); c.fill();
    c.strokeStyle='rgba(255,255,255,0.5)'; c.lineWidth=1.5; c.beginPath(); c.arc(px,py+30,7,0,Math.PI*2); c.stroke();
    c.shadowBlur=0;

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-3 Tab3: التخفيف والتركيز ──
function simG9PhScale3() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, conc:1.0, acidType:'acid' };
  const S = simState;

  function calcPh(conc,type){
    if(conc<=0) return 7;
    if(type==='acid') return Math.max(0, -Math.log10(conc));
    else return Math.min(14, 14+Math.log10(conc));
  }

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💧 التخفيف والتركيز</div>
      <div class="ctrl-name" style="font-size:13px;font-weight:400;margin-bottom:6px">نوع المحلول:</div>
      <select onchange="simState.acidType=this.value" style="width:100%;padding:8px;border-radius:8px;font-family:Tajawal;font-size:14px;border:1.5px solid rgba(0,0,0,0.1);background:var(--bg-card);color:var(--text-primary);margin-bottom:12px">
        <option value="acid">حمض الهيدروكلوريك HCl</option>
        <option value="base">هيدروكسيد الصوديوم NaOH</option>
      </select>
      <div class="ctrl-name" style="font-size:13px;font-weight:400;margin-bottom:6px">التركيز (mol/L):</div>
      <input type="range" min="0" max="4" step="0.1" value="1" oninput="simState.conc=+this.value" style="width:100%;direction:ltr">
      <div style="text-align:center;font-size:16px;font-weight:800;margin-top:6px;color:var(--teal)" id="conc-label">1.0 mol/L</div>
    </div>
    <div class="info-box" id="conc-result">pH = 0</div>
    <div class="q-box">
      <strong>❓ ماذا يحدث لـ pH الحمض عند تخفيفه بالماء؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">تخفيف الحمض يُقلل تركيز H⁺ مما يرفع pH نحو 7 (يصبح أقل حمضية). لكنه لن يصبح قلوياً أبداً بالتخفيف — يقترب من pH=7 فقط.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9phscale'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const conc=S.conc||1, type=S.acidType||'acid';
    const ph=Math.round(calcPh(conc,type)*10)/10;
    const phClamped=Math.max(0,Math.min(14,ph));

    // Update UI
    const cl=document.getElementById('conc-label'); if(cl) cl.textContent=`${conc.toFixed(1)} mol/L`;
    const cr=document.getElementById('conc-result'); if(cr){
      const t2=phClamped<7?'حمضي 🍋':phClamped>7?'قلوي 🧼':'متعادل 💧';
      cr.innerHTML=`<b>pH = ${ph.toFixed(2)}</b> → ${t2}`;
    }

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F8F5EF'); bg.addColorStop(1,'#EDE8E0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText(type==='acid'?'حمض الهيدروكلوريك HCl':'هيدروكسيد الصوديوم NaOH', w/2, h*0.07);

    // Beaker series showing dilution
    const levels=[1,0.5,0.1,0.01];
    levels.forEach((lv,i)=>{
      const bx=w*(0.12+i*0.22), by=h*0.75, bw2=w*0.16, bh2=h*0.45;
      const concLv=conc*lv;
      const phLv=calcPh(concLv,type);
      const phCl=Math.max(0,Math.min(14,phLv));
      let beakerCol;
      if(type==='acid'){ const t=phCl/7; beakerCol=`rgba(231,${Math.round(76+t*100)},60,${0.6-t*0.3})`; }
      else { const t=(phCl-7)/7; beakerCol=`rgba(41,${Math.round(128+t*50)},185,${0.3+t*0.4})`; }

      // Beaker outline
      c.strokeStyle='rgba(120,150,200,0.5)'; c.lineWidth=1.5;
      c.beginPath(); c.moveTo(bx,by-bh2); c.lineTo(bx,by); c.lineTo(bx+bw2,by); c.lineTo(bx+bw2,by-bh2); c.stroke();
      c.strokeStyle='rgba(120,150,200,0.4)'; c.lineWidth=2.5;
      c.beginPath(); c.moveTo(bx-3,by-bh2); c.lineTo(bx+bw2+3,by-bh2); c.stroke();

      // Liquid
      const liqH=bh2*0.8;
      c.fillStyle=beakerCol; c.fillRect(bx+2,by-liqH,bw2-4,liqH);
      // Wave
      c.fillStyle=beakerCol.replace(/[\d.]+\)$/,'0.3)');
      c.beginPath(); c.moveTo(bx+2,by-liqH);
      for(let xi=0;xi<=bw2-4;xi++){ c.lineTo(bx+2+xi,by-liqH+Math.sin((xi/bw2)*Math.PI*2+S.t*0.06+i)*5); }
      c.lineTo(bx+bw2-2,by-liqH-4); c.closePath(); c.fill();

      // pH label
      c.fillStyle='rgba(255,255,255,0.9)'; c.font=`bold ${Math.max(9,w*0.02)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(`pH=${phLv.toFixed(1)}`, bx+bw2/2, by-liqH*0.5);

      // Concentration below
      c.fillStyle='#444'; c.font=`${Math.max(8,w*0.018)}px Tajawal`; c.textBaseline='top';
      c.fillText(`×${lv}`, bx+bw2/2, by+6);
      c.fillText(`${concLv.toFixed(3)}M`, bx+bw2/2, by+20);
    });

    // Arrow between beakers
    for(let i=0;i<3;i++){
      const ax=w*(0.12+i*0.22)+w*0.16+4, ay=h*0.54;
      c.fillStyle='#1A8FA8'; c.font=`${Math.max(14,w*0.03)}px serif`; c.textAlign='center';
      c.fillText('→', ax+w*0.05, ay);
      c.fillStyle='#888'; c.font=`${Math.max(8,w*0.018)}px Tajawal`; c.textBaseline='top';
      c.fillText('تخفيف', ax+w*0.05, ay+h*0.04);
    }

    // pH bar at bottom
    const barX=w*0.05, barY=h*0.88, barW=w*0.9, barH=18;
    const phGrad=c.createLinearGradient(barX,0,barX+barW,0);
    phGrad.addColorStop(0,'#E74C3C'); phGrad.addColorStop(0.5,'#27AE60'); phGrad.addColorStop(1,'#1565C0');
    c.fillStyle=phGrad; c.beginPath(); c.roundRect(barX,barY,barW,barH,9); c.fill();
    c.fillStyle='rgba(255,255,255,0.3)'; c.beginPath(); c.roundRect(barX,barY,barW,barH/2,9); c.fill();
    const marker=barX+(phClamped/14)*barW;
    c.fillStyle='#1E2D3D'; c.beginPath(); c.arc(marker,barY+barH/2,11,0,Math.PI*2); c.fill();
    c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.arc(marker,barY+barH/2,11,0,Math.PI*2); c.stroke();
    c.fillStyle='#fff'; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ph.toFixed(1),marker,barY+barH/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-4 Tab1: الأيونات في المحاليل — تفاعلي ──
function simG9Ions1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, ionPh:7 };
  const S = simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚛️ اضبط pH المحلول</div>
      <input type="range" min="0" max="14" step="1" value="7"
        oninput="simState.ionPh=+this.value" style="width:100%;direction:ltr">
      <div id="ion-ph" style="text-align:center;font-size:22px;font-weight:800;margin-top:8px;color:var(--teal)">pH = 7</div>
    </div>
    <div class="info-box" id="ion-info">
      H⁺ = OH⁻ → محلول متعادل
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📚 تعريف برونستد-لوري</div>
      <div class="ctrl-name" style="font-size:13px;font-weight:400;line-height:1.9">
        🍋 <b>الحمض:</b> مانح أيون H⁺<br>
        🧼 <b>القاعدة:</b> قابلة أيون H⁺
      </div>
    </div>
    <div class="q-box">
      <strong>❓ كيف يتعادل الماء النقي نفسه؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الماء يتأيّن جزئياً: H₂O ⇌ H⁺ + OH⁻. كلا الأيونين يتشكّلان بنفس الكمية (10⁻⁷ mol/L) لذا H⁺ = OH⁻ والمحلول متعادل pH=7.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9ions'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ph=S.ionPh||7;

    // Update UI
    const phEl=document.getElementById('ion-ph'); if(phEl) phEl.textContent=`pH = ${ph}`;
    const infoEl=document.getElementById('ion-info');
    if(infoEl){
      if(ph<7) infoEl.innerHTML=`H⁺ <b style="color:#C0392B">أكثر</b> من OH⁻<br>→ محلول <b>حمضي 🍋</b>`;
      else if(ph>7) infoEl.innerHTML=`OH⁻ <b style="color:#2980B9">أكثر</b> من H⁺<br>→ محلول <b>قلوي 🧼</b>`;
      else infoEl.innerHTML=`H⁺ = OH⁻<br>→ محلول <b>متعادل 💧</b>`;
    }

    // Background
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F8FF'); bg.addColorStop(1,'#E8F0FA');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Big beaker
    const bkx=w*0.15, bky=h*0.08, bkw=w*0.70, bkh=h*0.76;
    // Glass
    const glassG=c.createLinearGradient(bkx,0,bkx+bkw,0);
    glassG.addColorStop(0,'rgba(220,235,255,0.5)'); glassG.addColorStop(0.2,'rgba(255,255,255,0.1)');
    glassG.addColorStop(0.8,'rgba(255,255,255,0.08)'); glassG.addColorStop(1,'rgba(200,220,255,0.45)');
    c.fillStyle=glassG;
    c.beginPath(); c.moveTo(bkx,bky); c.lineTo(bkx,bky+bkh); c.lineTo(bkx+bkw,bky+bkh); c.lineTo(bkx+bkw,bky); c.closePath(); c.fill();
    c.strokeStyle='rgba(120,150,200,0.45)'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(bkx,bky); c.lineTo(bkx,bky+bkh); c.lineTo(bkx+bkw,bky+bkh); c.lineTo(bkx+bkw,bky); c.stroke();
    // Rim
    c.strokeStyle='rgba(120,150,200,0.55)'; c.lineWidth=3.5;
    c.beginPath(); c.moveTo(bkx-5,bky); c.lineTo(bkx+bkw+5,bky); c.stroke();
    // Liquid tint based on pH
    const phT=ph/14;
    const liqR=Math.round(231-phT*190), liqG=Math.round(76+phT*100), liqB=Math.round(60+phT*125);
    c.fillStyle=`rgba(${liqR},${liqG},${liqB},0.08)`;
    c.fillRect(bkx+2,bky,bkw-4,bkh);

    // H+ ions count
    const hCount=ph<7?Math.floor((7-ph)*3.5+3):ph===7?3:Math.max(1,Math.floor((9-ph)));
    const ohCount=ph>7?Math.floor((ph-7)*3.5+3):ph===7?3:Math.max(1,Math.floor((9-ph)));
    const hC=Math.min(hCount,22), ohC=Math.min(ohCount,22);

    // Draw H+ ions (red)
    for(let i=0;i<hC;i++){
      const ix=bkx+20+((i*53+S.t*0.5)%(bkw-40));
      const iy=bky+bkh*0.15+((i*37+S.t*0.7)%(bkh*0.65));
      const pulse=1+Math.sin(S.t*0.1+i*0.7)*0.12;
      const r2=9*pulse;
      c.shadowBlur=8; c.shadowColor='rgba(231,76,60,0.5)';
      c.fillStyle='#E74C3C'; c.beginPath(); c.arc(ix,iy,r2,0,Math.PI*2); c.fill();
      c.shadowBlur=0;
      c.fillStyle='#fff'; c.font=`bold ${Math.max(7,w*0.014)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('H⁺',ix,iy);
    }
    // Draw OH- ions (blue)
    for(let i=0;i<ohC;i++){
      const ix=bkx+30+((i*61+S.t*0.45+30)%(bkw-40));
      const iy=bky+bkh*0.2+((i*41+S.t*0.6+20)%(bkh*0.6));
      const pulse=1+Math.sin(S.t*0.08+i*0.9+2)*0.12;
      const r2=9*pulse;
      c.shadowBlur=8; c.shadowColor='rgba(41,128,185,0.5)';
      c.fillStyle='#2980B9'; c.beginPath(); c.arc(ix,iy,r2,0,Math.PI*2); c.fill();
      c.shadowBlur=0;
      c.fillStyle='#fff'; c.font=`bold ${Math.max(7,w*0.014)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('OH⁻',ix,iy);
    }

    // Type label
    const typeCol=ph<7?'#C0392B':ph>7?'#2980B9':'#27AE60';
    const typeAr=ph<7?'حمضي 🍋':ph>7?'قلوي 🧼':'متعادل 💧';
    c.fillStyle='rgba(255,255,255,0.94)'; c.beginPath(); c.roundRect(w*0.2,h*0.88,w*0.6,h*0.09,10); c.fill();
    c.strokeStyle=typeCol+'66'; c.lineWidth=1.5; c.beginPath(); c.roundRect(w*0.2,h*0.88,w*0.6,h*0.09,10); c.stroke();
    c.fillStyle=typeCol; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`pH = ${ph} | ${typeAr}`, w/2, h*0.925);

    // Legend
    const legX=w*0.02, legY=h*0.82;
    [{col:'#E74C3C',lbl:'H⁺'},{col:'#2980B9',lbl:'OH⁻'}].forEach((lg,i)=>{
      c.fillStyle=lg.col; c.beginPath(); c.arc(legX+8,legY+i*22,8,0,Math.PI*2); c.fill();
      c.fillStyle='#333'; c.font=`${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='left'; c.textBaseline='middle';
      c.fillText(lg.lbl,legX+20,legY+i*22);
    });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-4 Tab2: العلاقة بين H⁺ وpH — منحنى تفاعلي ──
function simG9Ions2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, hover:{ph:null}, mouseX:-1 };
  const S = simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📈 العلاقة بين [H⁺] وpH</div>
      <table style="width:100%;border-collapse:collapse;font-size:11px;font-family:Tajawal">
        <tr style="background:rgba(26,143,168,0.1)"><td style="padding:4px;font-weight:700">pH</td><td style="padding:4px;font-weight:700;direction:ltr">[H⁺] mol/L</td><td style="padding:4px;font-weight:700">النوع</td></tr>
        ${[0,1,2,4,7,10,12,14].map(p=>`<tr style="border-bottom:1px solid rgba(0,0,0,0.05)"><td style="padding:3px;text-align:center">${p}</td><td style="padding:3px;text-align:center;direction:ltr">${(Math.pow(10,-p)).toExponential(0)}</td><td style="padding:3px;text-align:center;color:${p<7?'#C0392B':p>7?'#1565C0':'#27AE60'}">${p<7?'حمضي':p>7?'قلوي':'متعادل'}</td></tr>`).join('')}
      </table>
    </div>
    <div class="q-box">
      <strong>❓ لماذا العلاقة بين H⁺ وpH عكسية ولوغاريتمية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">pH = -log[H⁺]. كلما زاد تركيز H⁺ (حمض أقوى)، كان اللوغاريتم السالب أصغر (pH أقل). المقياس لوغاريتمي — pH=1 يعني 10× تركيز pH=2!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  cv.onmousemove=function(e){ const r=cv.getBoundingClientRect(); S.mouseX=(e.clientX-r.left)*cv.width/r.width; };
  cv.onmouseleave=function(){ S.mouseX=-1; };

  function draw(){
    if(currentSim!=='g9ions'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F8F5EF'); bg.addColorStop(1,'#EDE8E0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('العلاقة العكسية: كلما زاد pH قلّ تركيز H⁺', w/2, h*0.07);

    const ox=w*0.13, oy=h*0.88, aw=w*0.82, ah=h*0.74;

    // Grid lines
    c.strokeStyle='rgba(0,0,0,0.07)'; c.lineWidth=1; c.setLineDash([4,4]);
    [0,7,14].forEach(p=>{ const fx=ox+(p/14)*aw; c.beginPath(); c.moveTo(fx,oy-ah); c.lineTo(fx,oy); c.stroke(); });
    [0,-7,-14].forEach(logH=>{ const fy=oy-((logH+14)/14)*ah; c.beginPath(); c.moveTo(ox,fy); c.lineTo(ox+aw,fy); c.stroke(); });
    c.setLineDash([]);

    // Axes
    c.strokeStyle='#555'; c.lineWidth=2;
    c.beginPath(); c.moveTo(ox,oy-ah); c.lineTo(ox,oy); c.lineTo(ox+aw,oy); c.stroke();
    // Axis labels
    c.fillStyle='#333'; c.font=`bold ${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='center';
    c.fillText('pH', ox+aw/2, oy+h*0.07);
    c.save(); c.translate(ox-h*0.05,oy-ah/2); c.rotate(-Math.PI/2);
    c.fillText('[H⁺]',0,0); c.restore();

    // Tick labels
    c.fillStyle='#555'; c.font=`${Math.max(8,w*0.018)}px Tajawal`;
    [0,7,14].forEach(p=>{ c.textAlign='center'; c.textBaseline='top'; c.fillText(p,ox+(p/14)*aw,oy+5); });
    [0,-7,-14].forEach(logH=>{ const fy=oy-((logH+14)/14)*ah; c.textAlign='right'; c.textBaseline='middle'; c.fillText(`10^${logH}`,ox-5,fy); });

    // Colored zones
    const zones=[{x0:0,x1:7,col:'rgba(231,76,60,0.05)'},{x0:7,x1:7.1,col:'rgba(39,174,96,0.1)'},{x0:7,x1:14,col:'rgba(41,128,185,0.05)'}];
    zones.forEach(z=>{ c.fillStyle=z.col; c.fillRect(ox+z.x0/14*aw,oy-ah,((z.x1-z.x0)/14)*aw,ah); });

    // Curve
    c.strokeStyle='#1A8FA8'; c.lineWidth=2.5;
    c.beginPath();
    for(let ph=0;ph<=14;ph+=0.1){
      const fx=ox+(ph/14)*aw, fy=oy-((-ph+14)/14)*ah;
      if(ph===0) c.moveTo(fx,fy); else c.lineTo(fx,fy);
    }
    c.stroke();
    // Gradient fill under curve
    const cfill=c.createLinearGradient(0,oy-ah,0,oy);
    cfill.addColorStop(0,'rgba(26,143,168,0.15)'); cfill.addColorStop(1,'rgba(26,143,168,0)');
    c.fillStyle=cfill;
    c.beginPath(); c.moveTo(ox,oy);
    for(let ph=0;ph<=14;ph+=0.1){ c.lineTo(ox+(ph/14)*aw, oy-((-ph+14)/14)*ah); }
    c.lineTo(ox+aw,oy); c.closePath(); c.fill();

    // Interactive cursor line
    if(S.mouseX>ox&&S.mouseX<ox+aw){
      const curPh=((S.mouseX-ox)/aw)*14;
      const curFy=oy-((-curPh+14)/14)*ah;
      c.strokeStyle='rgba(212,144,26,0.6)'; c.lineWidth=1.5; c.setLineDash([5,5]);
      c.beginPath(); c.moveTo(S.mouseX,oy); c.lineTo(S.mouseX,curFy); c.stroke(); c.setLineDash([]);
      c.fillStyle='#D4901A'; c.beginPath(); c.arc(S.mouseX,curFy,7,0,Math.PI*2); c.fill();
      c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.arc(S.mouseX,curFy,7,0,Math.PI*2); c.stroke();
      // Tooltip
      const tpH=`pH = ${curPh.toFixed(1)}`; const tH=`[H⁺] = 10^${(-curPh).toFixed(0)}`;
      c.fillStyle='rgba(255,255,255,0.95)'; c.beginPath(); c.roundRect(S.mouseX+10,curFy-30,130,44,8); c.fill();
      c.strokeStyle='rgba(212,144,26,0.5)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(S.mouseX+10,curFy-30,130,44,8); c.stroke();
      c.fillStyle='#D4901A'; c.font=`bold ${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='right'; c.textBaseline='top';
      c.fillText(tpH, S.mouseX+135, curFy-26);
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.019)}px Tajawal`;
      c.fillText(tH, S.mouseX+135, curFy-10);
    }

    // Moving dot on curve
    const animPh=(S.t*0.04)%14;
    const animFx=ox+(animPh/14)*aw, animFy=oy-((-animPh+14)/14)*ah;
    c.fillStyle='#C0392B'; c.beginPath(); c.arc(animFx,animFy,6,0,Math.PI*2); c.fill();

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-5 Tab1: الأكاسيد الحمضية ──
function simG9Oxides1() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, selOx1:0 };
  const S = simState;

  const oxides=[
    { name:'ثاني أكسيد الكربون', formula:'CO₂', element:'كربون (لافلز)', product:'H₂CO₃ حمض الكربونيك', ph:5.5, icon:'💨', desc:'يذوب في ماء الأمطار فيكوّن المطر الحمضي' },
    { name:'ثاني أكسيد الكبريت', formula:'SO₂', element:'كبريت (لافلز)', product:'H₂SO₃ حمض الكبريتوز', ph:3.5, icon:'🏭', desc:'ينبعث من المصانع ويسبّب التلوث' },
    { name:'ثاني أكسيد النيتروجين', formula:'NO₂', element:'نيتروجين (لافلز)', product:'HNO₃ حمض النيتريك', ph:3.0, icon:'🚗', desc:'ينبعث من عوادم السيارات' },
    { name:'ثالث أكسيد الكبريت', formula:'SO₃', element:'كبريت (لافلز)', product:'H₂SO₄ حمض الكبريتيك', ph:1.5, icon:'⚠️', desc:'يكوّن حمض الكبريتيك القوي' },
    { name:'ثاني أكسيد السيليكون', formula:'SiO₂', element:'سيليكون (شبه فلز)', product:'H₂SiO₃ حمض السيليك', ph:5, icon:'🪨', desc:'الرمل والكوارتز — شبه ذائب' },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚗️ أكاسيد لافلزية حمضية</div>
      <div class="ctrl-btns-grid-1">
        ${oxides.map((o,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="ox1-btn-${i}" onclick="simState.selOx1=${i};document.querySelectorAll('[id^=ox1-btn-]').forEach((b,j)=>{b.classList.toggle('active',j===${i})})">${o.icon} ${o.formula} — ${o.name}</button>`).join('')}
      </div>
    </div>
    <div class="info-box">
      <b>الأكسيد الحمضي =</b> أكسيد لافلز + ماء → حمض
    </div>
    <div class="q-box">
      <strong>❓ كيف يُسبّب SO₂ المطرَ الحمضي؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">SO₂ المنبعث من المصانع يتحد مع بخار الماء مكوّناً H₂SO₃ وH₂SO₄. تذوب هذه الأحماض في الأمطار لتصبح حمضية (pH أقل من 5.6) وتُتلف النباتات والمباني.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9oxides'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ox=oxides[S.selOx1||0];

    // Background warm
    const bg=c.createLinearGradient(0,0,w,h); bg.addColorStop(0,'#FFF8EE'); bg.addColorStop(1,'#FFF0D8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Animated particles (gas molecules)
    for(let i=0;i<12;i++){
      const px2=(i/12)*w+(Math.sin(S.t*0.013+i*1.1)*25);
      const py2=h-((S.t*0.5+i*50)%h);
      c.fillStyle='rgba(255,140,0,0.15)';
      c.beginPath(); c.arc(px2,py2,6+i%3,0,Math.PI*2); c.fill();
    }

    // Title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText(ox.name, w/2, h*0.07);

    // Reaction boxes
    const boxes=[
      {label:ox.formula, sublabel:'الأكسيد الحمضي', col:'#FF8C00', bg:'#FFE0B2'},
      {label:'+', sublabel:'', col:'#555', bg:'transparent'},
      {label:'H₂O', sublabel:'الماء', col:'#0288D1', bg:'#B3E5FC'},
      {label:'→', sublabel:'', col:'#27AE60', bg:'transparent'},
      {label:ox.product.split(' ')[0], sublabel:'الحمض الناتج', col:'#C0392B', bg:'#FFCDD2'},
    ];
    const bW=w*0.165, bH=h*0.22, bY=h*0.17;
    const totalW=boxes.length*(bW+w*0.02)-w*0.02;
    const startX=(w-totalW)/2;

    boxes.forEach((box,i)=>{
      const bx=startX+i*(bW+w*0.02);
      if(box.bg==='transparent'){
        // operator
        if(box.sublabel==='') {
          const pulse=box.label==='→'?Math.sin(S.t*0.06)*3:0;
          c.fillStyle=box.col; c.font=`bold ${Math.max(20,w*0.045)}px serif`; c.textAlign='center'; c.textBaseline='middle';
          c.fillText(box.label, bx+bW/2, bY+bH/2+pulse);
        }
        return;
      }
      // Box
      c.fillStyle=box.bg; c.beginPath(); c.roundRect(bx,bY,bW,bH,10); c.fill();
      c.strokeStyle=box.col+'88'; c.lineWidth=1.5; c.beginPath(); c.roundRect(bx,bY,bW,bH,10); c.stroke();
      c.fillStyle=box.col; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(box.label, bx+bW/2, bY+bH*0.42);
      c.fillStyle='#888'; c.font=`${Math.max(9,w*0.018)}px Tajawal`;
      c.fillText(box.sublabel, bx+bW/2, bY+bH*0.76);
    });

    // pH result
    c.fillStyle='rgba(192,57,43,0.08)'; c.beginPath(); c.roundRect(w*0.1,h*0.45,w*0.8,h*0.1,10); c.fill();
    c.strokeStyle='rgba(192,57,43,0.2)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(w*0.1,h*0.45,w*0.8,h*0.1,10); c.stroke();
    c.fillStyle='#C0392B'; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`pH الناتج = ${ox.ph} → حمضي 🍋`, w/2, h*0.50);

    // pH bar
    const barX=w*0.06, barY=h*0.60, barW2=w*0.88, barH=16;
    const phGrad=c.createLinearGradient(barX,0,barX+barW2,0);
    phGrad.addColorStop(0,'#E74C3C'); phGrad.addColorStop(0.5,'#27AE60'); phGrad.addColorStop(1,'#1565C0');
    c.fillStyle=phGrad; c.beginPath(); c.roundRect(barX,barY,barW2,barH,8); c.fill();
    c.fillStyle='rgba(255,255,255,0.3)'; c.beginPath(); c.roundRect(barX,barY,barW2,barH/2,8); c.fill();
    const mX=barX+(ox.ph/14)*barW2;
    c.fillStyle='#fff'; c.beginPath(); c.arc(mX,barY+barH/2,10,0,Math.PI*2); c.fill();
    c.strokeStyle='#C0392B'; c.lineWidth=2; c.beginPath(); c.arc(mX,barY+barH/2,10,0,Math.PI*2); c.stroke();
    c.fillStyle='#C0392B'; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ox.ph,mX,barY+barH/2);
    [0,7,14].forEach(n=>{ c.fillStyle='#555'; c.font=`${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='top'; c.fillText(n,barX+(n/14)*barW2,barY+barH+4); });

    // Description
    c.fillStyle='rgba(255,255,255,0.9)'; c.beginPath(); c.roundRect(w*0.08,h*0.74,w*0.84,h*0.12,10); c.fill();
    c.fillStyle='#555'; c.font=`${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ox.desc, w/2, h*0.80);
    c.fillStyle='#888'; c.font=`${Math.max(10,w*0.021)}px Tajawal`;
    c.fillText(`العنصر: ${ox.element}`, w/2, h*0.845);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-5 Tab2: الأكاسيد القاعدية ──
function simG9Oxides2() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, selOx2:0 };
  const S = simState;

  const oxides=[
    { name:'أكسيد الصوديوم', formula:'Na₂O', product:'NaOH هيدروكسيد الصوديوم', ph:14, icon:'⚪', desc:'يتفاعل بشدة مع الماء' },
    { name:'أكسيد الكالسيوم (الجير)', formula:'CaO', product:'Ca(OH)₂ هيدروكسيد الكالسيوم', ph:12.4, icon:'🪨', desc:'يُستخدم في الزراعة لتعديل التربة' },
    { name:'أكسيد المغنيسيوم', formula:'MgO', product:'Mg(OH)₂ هيدروكسيد المغنيسيوم', ph:10.5, icon:'💊', desc:'يُستخدم في علاج حموضة المعدة' },
    { name:'أكسيد النحاس (II)', formula:'CuO', product:'Cu(OH)₂ هيدروكسيد النحاس', ph:9, icon:'🔵', desc:'لا يذوب في الماء بسهولة' },
    { name:'أكسيد الحديد (III)', formula:'Fe₂O₃', product:'Fe(OH)₃ هيدروكسيد الحديد', ph:8, icon:'🟤', desc:'الصدأ — يتكوّن عند تأكسد الحديد' },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧱 أكاسيد فلزية قاعدية</div>
      <div class="ctrl-btns-grid-1">
        ${oxides.map((o,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="ox2-btn-${i}" onclick="simState.selOx2=${i};document.querySelectorAll('[id^=ox2-btn-]').forEach((b,j)=>{b.classList.toggle('active',j===${i})})">${o.icon} ${o.formula} — ${o.name}</button>`).join('')}
      </div>
    </div>
    <div class="info-box" style="background:rgba(39,174,96,0.06);border-color:rgba(39,174,96,0.2)">
      <b>الأكسيد القاعدي =</b> أكسيد فلز + ماء → قاعدة/هيدروكسيد
    </div>
    <div class="q-box">
      <strong>❓ لماذا يُضاف الجير (CaO) للتربة الزراعية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">أكسيد الكالسيوم CaO قاعدي — عند إضافته للتربة الحمضية يتفاعل مع الأحماض ويرفع pH التربة نحو المتعادل، مما يُحسّن قدرة النباتات على امتصاص المغذيات.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9oxides'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ox=oxides[S.selOx2||0];

    const bg=c.createLinearGradient(0,0,w,h); bg.addColorStop(0,'#F0FFF4'); bg.addColorStop(1,'#E8F5EC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // OH⁻ ions floating
    for(let i=0;i<8;i++){
      const px=w*0.1+((i*71+S.t*0.4)%(w*0.8));
      const py=h*0.15+((i*53+S.t*0.6)%(h*0.55));
      c.fillStyle='rgba(39,174,96,0.15)';
      c.beginPath(); c.arc(px,py,8,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(39,174,96,0.5)'; c.font=`bold ${Math.max(6,w*0.013)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('OH⁻',px,py);
    }

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText(ox.name, w/2, h*0.07);

    // Reaction boxes - green theme
    const bW=w*0.165, bH=h*0.22, bY=h*0.14;
    const boxData=[
      {label:ox.formula, sub:'الأكسيد القاعدي', col:'#27AE60', bg:'#C8E6C9'},
      {label:'+', sub:'', col:'#555', bg:'transparent'},
      {label:'H₂O', sub:'الماء', col:'#0288D1', bg:'#B3E5FC'},
      {label:'→', sub:'', col:'#27AE60', bg:'transparent'},
      {label:ox.product.split(' ')[0], sub:'القاعدة', col:'#27AE60', bg:'#C8E6C9'},
    ];
    const totalW2=boxData.length*(bW+w*0.02)-w*0.02;
    const startX2=(w-totalW2)/2;
    boxData.forEach((box,i)=>{
      const bx=startX2+i*(bW+w*0.02);
      if(box.bg==='transparent'){
        const pulse=box.label==='→'?Math.sin(S.t*0.06)*3:0;
        c.fillStyle=box.col; c.font=`bold ${Math.max(20,w*0.045)}px serif`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(box.label, bx+bW/2, bY+bH/2+pulse);
        return;
      }
      c.fillStyle=box.bg; c.beginPath(); c.roundRect(bx,bY,bW,bH,10); c.fill();
      c.strokeStyle=box.col+'88'; c.lineWidth=1.5; c.beginPath(); c.roundRect(bx,bY,bW,bH,10); c.stroke();
      c.fillStyle=box.col; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(box.label, bx+bW/2, bY+bH*0.42);
      c.fillStyle='#888'; c.font=`${Math.max(9,w*0.018)}px Tajawal`;
      c.fillText(box.sub, bx+bW/2, bY+bH*0.76);
    });

    // pH result
    c.fillStyle='rgba(39,174,96,0.08)'; c.beginPath(); c.roundRect(w*0.1,h*0.42,w*0.8,h*0.1,10); c.fill();
    c.strokeStyle='rgba(39,174,96,0.2)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(w*0.1,h*0.42,w*0.8,h*0.1,10); c.stroke();
    c.fillStyle='#27AE60'; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`pH الناتج = ${ox.ph} → قلوي 🧼`, w/2, h*0.47);

    // pH bar
    const barX=w*0.06, barY=h*0.58, barW2=w*0.88, barH=16;
    const phGrad=c.createLinearGradient(barX,0,barX+barW2,0);
    phGrad.addColorStop(0,'#E74C3C'); phGrad.addColorStop(0.5,'#27AE60'); phGrad.addColorStop(1,'#1565C0');
    c.fillStyle=phGrad; c.beginPath(); c.roundRect(barX,barY,barW2,barH,8); c.fill();
    c.fillStyle='rgba(255,255,255,0.3)'; c.beginPath(); c.roundRect(barX,barY,barW2,barH/2,8); c.fill();
    const mX=barX+(ox.ph/14)*barW2;
    c.fillStyle='#fff'; c.beginPath(); c.arc(mX,barY+barH/2,10,0,Math.PI*2); c.fill();
    c.strokeStyle='#27AE60'; c.lineWidth=2; c.beginPath(); c.arc(mX,barY+barH/2,10,0,Math.PI*2); c.stroke();
    c.fillStyle='#27AE60'; c.font=`bold ${Math.max(8,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ox.ph,mX,barY+barH/2);

    c.fillStyle='rgba(255,255,255,0.9)'; c.beginPath(); c.roundRect(w*0.08,h*0.74,w*0.84,h*0.12,10); c.fill();
    c.fillStyle='#555'; c.font=`${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ox.desc, w/2, h*0.80);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ── 6-5 Tab3: الأكاسيد المتذبذبة ──
function simG9Oxides3() {
  cancelAnimationFrame(animFrame);
  simState = { t:0, ampho:0, testWith:'acid' };
  const S = simState;

  const amphotericOxides=[
    { name:'أكسيد الألومنيوم', formula:'Al₂O₃', withAcid:'AlCl₃ + H₂O', withBase:'NaAlO₂ + H₂O', icon:'⚪', use:'صناعة الألومنيوم' },
    { name:'أكسيد الزنك', formula:'ZnO', withAcid:'ZnCl₂ + H₂O', withBase:'Na₂ZnO₂ + H₂O', icon:'🔘', use:'مراهم الجلد' },
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔄 الأكاسيد المتذبذبة</div>
      <div class="ctrl-btns-grid-1">
        ${amphotericOxides.map((o,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="ampho-btn-${i}" onclick="simState.ampho=${i};document.querySelectorAll('[id^=ampho-btn-]').forEach((b,j)=>{b.classList.toggle('active',j===${i})})">${o.icon} ${o.formula} — ${o.name}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 اختبره مع</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn stop" onclick="simState.testWith='acid';document.querySelector('.ctrl-btn.action').classList.remove('active');this.classList.add('active')">🍋 حمض HCl</button>
        <button class="ctrl-btn action" onclick="simState.testWith='base';document.querySelector('.ctrl-btn.stop').classList.remove('active');this.classList.add('active')">🧼 قاعدة NaOH</button>
      </div>
    </div>
    <div class="info-box">
      <b>المتذبذب =</b> يتفاعل مع الحمض كقاعدة، ومع القاعدة كحمض!
    </div>
    <div class="q-box">
      <strong>❓ ما الفائدة العملية من الأكاسيد المتذبذبة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">Al₂O₃ يُستخدم في تكرير الألومنيوم وصناعة الكورندوم (أصلب المواد). ZnO في مراهم الجلد والدهانات. تذبذبها يجعلها تعمل في أوساط حمضية وقاعدية!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');

  function draw(){
    if(currentSim!=='g9oxides'){ cancelAnimationFrame(animFrame); return; }
    const c=cv.getContext('2d'), w=cv.width, h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ox=amphotericOxides[S.ampho||0];
    const isAcid=S.testWith==='acid';
    const reagent=isAcid?'HCl (حمض)':'NaOH (قاعدة)';
    const product=isAcid?ox.withAcid:ox.withBase;
    const productType=isAcid?'كقاعدة 🧼':'كحمض 🍋';
    const reacColor=isAcid?'#C0392B':'#27AE60';

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F3F0FF'); bg.addColorStop(1,'#EAE7F5');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText(`${ox.formula} (${ox.name}) — أكسيد متذبذب`, w/2, h*0.07);

    // Center oxide circle
    const cx2=w*0.5, cy2=h*0.38, r2=Math.min(w,h)*0.13;
    c.shadowBlur=20; c.shadowColor='#9C27B088';
    const radG=c.createRadialGradient(cx2-r2*0.3,cy2-r2*0.3,r2*0.1,cx2,cy2,r2);
    radG.addColorStop(0,'#CE93D8CC'); radG.addColorStop(1,'#9C27B077');
    c.fillStyle=radG; c.beginPath(); c.arc(cx2,cy2,r2,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle='#7B1FA2'; c.lineWidth=3; c.beginPath(); c.arc(cx2,cy2,r2,0,Math.PI*2); c.stroke();
    c.fillStyle='#fff'; c.font=`bold ${Math.max(14,w*0.03)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ox.formula, cx2, cy2-5);
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(9,w*0.018)}px Tajawal`;
    c.fillText('متذبذب', cx2, cy2+12);

    // Left circle (acid)
    const lx=w*0.14, ly=h*0.36, lr=Math.min(w,h)*0.10;
    const acidActive=isAcid&&Math.floor(S.t/25)%2===0;
    c.shadowBlur=isAcid?15:0; c.shadowColor='#C0392B88';
    c.fillStyle=acidActive?'#FFCDD2':'#FFE8E8';
    c.beginPath(); c.arc(lx,ly,lr,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle='#C0392B'; c.lineWidth=isAcid?2.5:1.5; c.beginPath(); c.arc(lx,ly,lr,0,Math.PI*2); c.stroke();
    c.fillStyle='#C0392B'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('HCl', lx, ly-6); c.fillText('حمض', lx, ly+10);

    // Right circle (base)
    const rx=w*0.86, ry=h*0.36;
    const baseActive=!isAcid&&Math.floor(S.t/25)%2===0;
    c.shadowBlur=!isAcid?15:0; c.shadowColor='#27AE6088';
    c.fillStyle=baseActive?'#C8E6C9':'#E8F5E9';
    c.beginPath(); c.arc(rx,ry,lr,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle='#27AE60'; c.lineWidth=!isAcid?2.5:1.5; c.beginPath(); c.arc(rx,ry,lr,0,Math.PI*2); c.stroke();
    c.fillStyle='#27AE60'; c.font=`bold ${Math.max(10,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('NaOH', rx, ry-6); c.fillText('قاعدة', rx, ry+10);

    // Arrow from active side to center
    c.strokeStyle=reacColor; c.lineWidth=2.5;
    const fromX=isAcid?lx+lr:rx-lr, fromY=isAcid?ly:ry;
    const toX=isAcid?cx2-r2:cx2+r2, toY=cy2;
    const midX=(fromX+toX)/2+(Math.sin(S.t*0.07)*8), midY=(fromY+toY)/2-20;
    c.beginPath(); c.moveTo(fromX,fromY); c.quadraticCurveTo(midX,midY,toX,toY); c.stroke();
    // Arrowhead
    const angle=Math.atan2(toY-midY,toX-midX);
    c.fillStyle=reacColor; c.beginPath();
    c.moveTo(toX,toY);
    c.lineTo(toX-12*Math.cos(angle-0.4),toY-12*Math.sin(angle-0.4));
    c.lineTo(toX-12*Math.cos(angle+0.4),toY-12*Math.sin(angle+0.4));
    c.closePath(); c.fill();

    // Reaction box
    const rbx=w*0.08, rby=h*0.60, rbw=w*0.84, rbh=h*0.14;
    c.fillStyle=isAcid?'rgba(231,76,60,0.08)':'rgba(39,174,96,0.08)';
    c.beginPath(); c.roundRect(rbx,rby,rbw,rbh,10); c.fill();
    c.strokeStyle=reacColor+'44'; c.lineWidth=1.5; c.beginPath(); c.roundRect(rbx,rby,rbw,rbh,10); c.stroke();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`${ox.formula} + ${reagent} → ${product}`, w/2, rby+rbh*0.38);
    c.fillStyle=reacColor; c.font=`${Math.max(10,w*0.022)}px Tajawal`;
    c.fillText(`يتصرّف الأكسيد ${productType} في هذه الحالة`, w/2, rby+rbh*0.72);

    // Key fact
    c.fillStyle='rgba(255,255,255,0.92)'; c.beginPath(); c.roundRect(w*0.06,h*0.79,w*0.88,h*0.12,10); c.fill();
    c.fillStyle='#7B1FA2'; c.font=`bold ${Math.max(11,w*0.023)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('المتذبذب: يتفاعل مع الأحماض والقواعد على حدٍّ سواء', w/2, h*0.83);
    c.fillStyle='#888'; c.font=`${Math.max(10,w*0.02)}px Tajawal`;
    c.fillText(`الاستخدام: ${ox.use}`, w/2, h*0.868);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}



// ══════════════════════════════════════════════════════════
// الصف التاسع — الوحدة السابعة: معادلات التفاعلات الكيميائية
// ══════════════════════════════════════════════════════════

// ─── 7-1 TAB 1: المعادلات اللفظية ───
function simG9WordEq1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selected:-1, step:0, feedback:''};
  const S=simState;

  const reactions=[
    {reactants:['ماغنيسيوم','أكسجين'], products:['أكسيد الماغنيسيوم'], icon:'🔥', eq:'Mg + O₂ → MgO'},
    {reactants:['هيدروجين','أكسجين'], products:['ماء'], icon:'💧', eq:'H₂ + O₂ → H₂O'},
    {reactants:['حمض الهيدروكلوريك','هيدروكسيد الصوديوم'], products:['كلوريد الصوديوم','ماء'], icon:'🧪', eq:'HCl + NaOH → NaCl + H₂O'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📝 اختر التفاعل</div>
      <div class="ctrl-btns-grid-1">
        ${reactions.map((r,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="rxn-btn-${i}" onclick="simState.selected=${i};simState.t=0;document.querySelectorAll('[id^=rxn-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${r.icon} التفاعل ${i+1}</button>`).join('')}
      </div>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>قاعدة:</b> المواد المتفاعلة (Reactants) ← قبل السهم<br>
      المواد الناتجة (Products) ← بعد السهم
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا يعني السهم في المعادلة اللفظية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">السهم يعني "تُنتِج" أو "تتحول إلى". يُشير من المتفاعلات إلى النواتج. بعض العلماء يكتبون → بدلاً من كلمة "تُنتِج".</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9wordeq'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ri=Math.max(0,S.selected||0);
    const rx=reactions[ri];
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#FFF8E1'); bg.addColorStop(1,'#FFF3CD');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(14,w*0.032)}px Tajawal`; c.textAlign='center';
    c.fillText('المعادلة اللفظية — كيف نصف التفاعل بالكلمات', w/2, h*0.07);

    const bw=Math.min(w*0.27,160), bh=Math.min(h*0.10,48), gap=Math.min(w*0.04,30);
    const totalR=rx.reactants.length;
    const totalP=rx.products.length;
    const arrowX=w*0.5;
    const startRx=arrowX - totalR*(bw+gap)/2 - bw/2 - gap/2;
    const startPx=arrowX + gap*1.5;
    const by=h*0.36;

    // Draw reactant boxes
    rx.reactants.forEach((name,i)=>{
      const bx=startRx + i*(bw+gap);
      const pulse=i===0?Math.sin(S.t*0.06)*3:0;
      c.shadowBlur=12+pulse; c.shadowColor='rgba(192,57,43,0.35)';
      c.fillStyle='#FFCDD2'; c.beginPath(); c.roundRect(bx,by-bh/2,bw,bh,10); c.fill();
      c.shadowBlur=0; c.strokeStyle='#C0392B'; c.lineWidth=2;
      c.beginPath(); c.roundRect(bx,by-bh/2,bw,bh,10); c.stroke();
      c.fillStyle='#C0392B'; c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(name, bx+bw/2, by);
      if(i<totalR-1){
        c.fillStyle='#7A8A98'; c.font=`bold ${Math.max(14,w*0.028)}px Tajawal`;
        c.fillText('+', bx+bw+gap/2, by);
      }
    });

    // Arrow
    const aw=Math.min(w*0.07,50);
    const bounce=Math.sin(S.t*0.05)*3;
    c.strokeStyle='#1E2D3D'; c.lineWidth=3;
    c.beginPath(); c.moveTo(arrowX-aw/2,by+bounce); c.lineTo(arrowX+aw/2,by+bounce); c.stroke();
    c.fillStyle='#1E2D3D'; c.beginPath();
    c.moveTo(arrowX+aw/2,by+bounce);
    c.lineTo(arrowX+aw/2-10,by+bounce-7);
    c.lineTo(arrowX+aw/2-10,by+bounce+7);
    c.closePath(); c.fill();
    c.fillStyle='#7A8A98'; c.font=`${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center';
    c.fillText('تُنتِج', arrowX, by-aw*0.45);

    // Draw product boxes
    rx.products.forEach((name,i)=>{
      const bx=startPx + i*(bw+gap);
      const pulse=Math.sin(S.t*0.06+2)*3;
      c.shadowBlur=12+pulse; c.shadowColor='rgba(39,174,96,0.35)';
      c.fillStyle='#C8E6C9'; c.beginPath(); c.roundRect(bx,by-bh/2,bw,bh,10); c.fill();
      c.shadowBlur=0; c.strokeStyle='#27AE60'; c.lineWidth=2;
      c.beginPath(); c.roundRect(bx,by-bh/2,bw,bh,10); c.stroke();
      c.fillStyle='#27AE60'; c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(name, bx+bw/2, by);
      if(i<totalP-1){
        c.fillStyle='#7A8A98'; c.font=`bold ${Math.max(14,w*0.028)}px Tajawal`;
        c.fillText('+', bx+bw+gap/2, by);
      }
    });

    // Labels
    c.textBaseline='alphabetic';
    c.fillStyle='rgba(192,57,43,0.7)'; c.font=`${Math.max(10,w*0.018)}px Tajawal`;
    c.textAlign='center';
    c.fillText('المواد المتفاعلة (Reactants)', startRx + totalR*(bw+gap)/2, by+bh/2+22);
    c.fillStyle='rgba(39,174,96,0.7)';
    c.fillText('المواد الناتجة (Products)', startPx + totalP*(bw+gap)/2, by+bh/2+22);

    // Full equation box
    const ebx=w*0.08, eby=h*0.62, ebw=w*0.84, ebh=h*0.12;
    c.fillStyle='rgba(26,143,168,0.08)'; c.beginPath(); c.roundRect(ebx,eby,ebw,ebh,12); c.fill();
    c.strokeStyle='rgba(26,143,168,0.25)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(ebx,eby,ebw,ebh,12); c.stroke();
    c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(11,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('المعادلة الرمزية: ' + rx.eq, w/2, eby+ebh/2);

    // Legend
    const ly2=h*0.82;
    c.fillStyle='#1E2D3D'; c.font=`${Math.max(10,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('💡 المعادلة اللفظية = وصف التفاعل بأسماء المواد بدون رموز كيميائية', w/2, ly2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 7-1 TAB 2: المواد المتفاعلة والناتجة ───
function simG9WordEq2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, chosen:null, score:0, answered:false};
  const S=simState;

  const quiz=[
    {eq:'كربون + أكسجين → ثاني أكسيد الكربون', reactants:['كربون','أكسجين'], products:['ثاني أكسيد الكربون'], q:'ما ناتج هذا التفاعل؟', opts:['كربون','أكسجين','ثاني أكسيد الكربون','مونوكسيد الكربون'], ans:2},
    {eq:'هيدروجين + نيتروجين → أمونيا', reactants:['هيدروجين','نيتروجين'], products:['أمونيا'], q:'ما المتفاعلات في هذه المعادلة؟', opts:['هيدروجين فقط','أمونيا','هيدروجين ونيتروجين','نيتروجين وأمونيا'], ans:2},
  ];
  const qi=Math.floor(S.t/400)%quiz.length;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎯 تحدِّ نفسك</div>
      <div class="info-box">اقرأ المعادلة اللفظية واختر الإجابة الصحيحة</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا يهمّنا تحديد المتفاعلات والنواتج؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">لأنها تحدد ما نحتاجه وما ننتجه في التفاعل. في الصناعة: نختار المتفاعلات ونُعظّم النواتج المطلوبة!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  const optColors=['#1A8FA8','#D4901A','#6B4E9A','#27AE60'];

  function draw(){
    if(currentSim!=='g9wordeq'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const q=quiz[Math.floor(S.t/600)%quiz.length];

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#E8F5E9'); bg.addColorStop(1,'#C8E6C9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Equation display
    const ebx=w*0.06, eby=h*0.06, ebw=w*0.88, ebh=h*0.13;
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(ebx,eby,ebw,ebh,12); c.fill();
    c.strokeStyle='rgba(26,143,168,0.3)'; c.lineWidth=2; c.beginPath(); c.roundRect(ebx,eby,ebw,ebh,12); c.stroke();
    c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('⚗️ ' + q.eq, w/2, eby+ebh/2);

    // Question
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.027)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('❓ ' + q.q, w/2, h*0.29);

    // Options
    const optW=Math.min(w*0.42,190), optH=Math.min(h*0.10,44), gx=Math.min(w*0.03,16), gy=Math.min(h*0.03,12);
    q.opts.forEach((opt,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const ox=w*0.05 + col*(optW+gx) + (w-2*optW-gx)*0.05;
      const oy=h*0.34 + row*(optH+gy);
      const isChosen=S.chosen===i;
      const isCorrect=i===q.ans;
      let bg2, stroke;
      if(S.answered){ bg2=isCorrect?'#C8E6C9':isChosen?'#FFCDD2':'rgba(255,255,255,0.7)'; stroke=isCorrect?'#27AE60':isChosen?'#C0392B':'#ccc';}
      else { bg2=isChosen?optColors[i]+'33':'rgba(255,255,255,0.8)'; stroke=isChosen?optColors[i]:'#ccc'; }
      c.fillStyle=bg2; c.beginPath(); c.roundRect(ox,oy,optW,optH,10); c.fill();
      c.strokeStyle=stroke; c.lineWidth=2; c.beginPath(); c.roundRect(ox,oy,optW,optH,10); c.stroke();
      c.fillStyle=isChosen&&!S.answered?optColors[i]:'#1E2D3D';
      c.font=`${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(opt, ox+optW/2, oy+optH/2);
    });

    // Feedback
    if(S.answered){
      const fb=S.chosen===q.ans?'✅ صحيح! '+q.eq:'❌ خطأ — الإجابة الصحيحة: '+q.opts[q.ans];
      c.fillStyle=S.chosen===q.ans?'#27AE60':'#C0392B';
      c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(fb, w/2, h*0.72);
    }

    animFrame=requestAnimationFrame(draw);
  }

  const cv2=document.getElementById('simCanvas');
  cv2.onclick=function(e){
    if(S.answered)return;
    const q=quiz[Math.floor(S.t/600)%quiz.length];
    const rect=cv2.getBoundingClientRect(), mx=(e.clientX-rect.left)*(cv2.width/rect.width), my=(e.clientY-rect.top)*(cv2.height/rect.height);
    const w=cv2.width,h=cv2.height;
    const optW=Math.min(w*0.42,190), optH=Math.min(h*0.10,44), gx=Math.min(w*0.03,16), gy=Math.min(h*0.03,12);
    q.opts.forEach((opt,i)=>{
      const col=i%2,row=Math.floor(i/2);
      const ox=w*0.05+col*(optW+gx)+(w-2*optW-gx)*0.05, oy=h*0.34+row*(optH+gy);
      if(mx>=ox&&mx<=ox+optW&&my>=oy&&my<=oy+optH){ S.chosen=i; S.answered=true; }
    });
  };
  draw();
}

// ─── 7-1 TAB 3: تجربة احتراق الماغنيسيوم ───
function simG9WordEq3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, burning:false, done:false, flame:0};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔥 تجربة: احتراق الماغنيسيوم</div>
      <button class="ctrl-btn" id="burn-btn" onclick="simState.burning=true;simState.done=false;simState.flame=0;this.disabled=true">🔥 أشعِل الشريط</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.burning=false;simState.done=false;simState.flame=0;document.getElementById('burn-btn').disabled=false">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>الملاحظة:</b> يحترق الماغنيسيوم بضوء أبيض ساطع<br>
      <b>الناتج:</b> مسحوق أبيض (أكسيد الماغنيسيوم)
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">عند احتراق الماغنيسيوم في الهواء، يتحد مع أكسجين الهواء لينتج أكسيد الماغنيسيوم. المعادلة: ماغنيسيوم + أكسجين → أكسيد الماغنيسيوم. هذا تفاعل اتحاد!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9wordeq'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#1a1a2e'); bg.addColorStop(1,'#16213e');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    if(S.burning){ S.flame=Math.min(S.flame+1,80); if(S.flame>=80) S.done=true; }

    const stripX=w*0.48, stripBottom=h*0.72, stripLen=h*0.22;

    // Mg strip
    c.strokeStyle='#C0C0C0'; c.lineWidth=6; c.lineCap='round';
    c.beginPath(); c.moveTo(stripX, stripBottom); c.lineTo(stripX, stripBottom-stripLen); c.stroke();
    c.strokeStyle='#E8E8E8'; c.lineWidth=3;
    c.beginPath(); c.moveTo(stripX, stripBottom); c.lineTo(stripX, stripBottom-stripLen); c.stroke();

    // Flame
    if(S.burning && S.flame>0){
      const flameH=S.flame*2.5;
      const fx=stripX, fy=stripBottom-stripLen;
      for(let i=0;i<20;i++){
        const fh=flameH*(0.5+Math.random()*0.5);
        const fw=Math.min(w*0.06,30)*(1-i/20);
        const alpha=Math.max(0,1-i/18);
        const hue=Math.random()<0.5?`rgba(255,255,${Math.floor(Math.random()*100)},${alpha})`:`rgba(255,${Math.floor(150+Math.random()*100)},0,${alpha})`;
        c.fillStyle=hue;
        c.beginPath();
        c.ellipse(fx+(Math.random()-0.5)*fw, fy-fh*0.5, fw*0.5, fh*0.5, 0, 0, Math.PI*2);
        c.fill();
      }
      // White bright center
      c.shadowBlur=30; c.shadowColor='#ffffff';
      c.fillStyle='rgba(255,255,255,0.9)';
      c.beginPath(); c.ellipse(fx, fy-flameH*0.2, Math.min(w*0.02,12), Math.min(h*0.04,20), 0, 0, Math.PI*2); c.fill();
      c.shadowBlur=0;

      // Flying ash particles
      for(let i=0;i<8;i++){
        const angle=-Math.PI*0.5 + (Math.random()-0.5)*1.5;
        const dist=(S.flame*3+Math.random()*30);
        const ax=fx+Math.cos(angle)*dist, ay=fy+Math.sin(angle)*dist;
        c.fillStyle=`rgba(255,255,255,${0.4+Math.random()*0.5})`;
        c.beginPath(); c.arc(ax,ay,Math.random()*3+1,0,Math.PI*2); c.fill();
      }
    }

    // White powder result
    if(S.done){
      for(let i=0;i<30;i++){
        const px=stripX+(Math.random()-0.5)*(w*0.2), py=h*0.85+Math.random()*(h*0.08);
        c.fillStyle=`rgba(240,240,240,${0.4+Math.random()*0.6})`;
        c.beginPath(); c.arc(px,py,Math.random()*4+2,0,Math.PI*2); c.fill();
      }
      c.fillStyle='#E8E8E8'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('MgO — أكسيد الماغنيسيوم (مسحوق أبيض)', w/2, h*0.94);
    }

    // Equation panel
    const eby=h*0.04;
    c.fillStyle='rgba(255,255,255,0.12)'; c.beginPath(); c.roundRect(w*0.05,eby,w*0.9,h*0.09,10); c.fill();
    c.fillStyle='#FFF'; c.font=`bold ${Math.max(11,w*0.023)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('ماغنيسيوم + أكسجين → أكسيد الماغنيسيوم', w/2, eby+h*0.045);

    // Stage labels
    c.fillStyle='rgba(255,255,255,0.7)'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    if(!S.burning) c.fillText('انقر "أشعل الشريط" لبدء التجربة 🔥', w/2, h*0.82);
    else if(!S.done) c.fillText('يحترق الماغنيسيوم بضوء أبيض ساطع...', w/2, h*0.82);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// ─── 7-2 TAB 1: حفظ الذرات (قانون بقاء المادة) ───
function simG9Balance1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, eqi:0};
  const S=simState;

  const examples=[
    {label:'احتراق الهيدروجين', reactants:[{name:'H₂',count:2,col:'#3498DB'},{name:'O₂',count:1,col:'#E74C3C'}], products:[{name:'H₂O',count:2,col:'#1ABC9C'}], atoms:{H:{r:4,p:4},O:{r:2,p:2}}},
    {label:'احتراق الماغنيسيوم', reactants:[{name:'Mg',count:2,col:'#9B59B6'},{name:'O₂',count:1,col:'#E74C3C'}], products:[{name:'MgO',count:2,col:'#F39C12'}], atoms:{Mg:{r:2,p:2},O:{r:2,p:2}}},
    {label:'تفاعل الزنك مع HCl', reactants:[{name:'Zn',count:1,col:'#7F8C8D'},{name:'HCl',count:2,col:'#E74C3C'}], products:[{name:'ZnCl₂',count:1,col:'#2ECC71'},{name:'H₂',count:1,col:'#3498DB'}], atoms:{Zn:{r:1,p:1},H:{r:2,p:2},Cl:{r:2,p:2}}},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚖️ اختر المعادلة</div>
      <div class="ctrl-btns-grid-1">
        ${examples.map((e,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="eq-btn-${i}" onclick="simState.eqi=${i};document.querySelectorAll('[id^=eq-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${e.label}</button>`).join('')}
      </div>
    </div>
    <div class="info-box" style="margin-top:8px"><b>قانون بقاء المادة:</b> عدد ذرات كل عنصر في المتفاعلات = عددها في النواتج</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج عن الكتلة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">كتلة المتفاعلات = كتلة النواتج دائماً! الذرات لا تُخلق ولا تُفنى في التفاعلات الكيميائية — تترتّب فقط بشكل مختلف.</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9balance'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const eq=examples[S.eqi||0];

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E8EAF6'); bg.addColorStop(1,'#C5CAE9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.028)}px Tajawal`; c.textAlign='center';
    c.fillText('⚖️ قانون بقاء المادة — الذرات محفوظة', w/2, h*0.07);

    // Draw balance scale
    const scx=w*0.5, scy=h*0.55, armLen=w*0.3;
    const bob=Math.sin(S.t*0.04)*3;
    c.strokeStyle='#5D4037'; c.lineWidth=5;
    c.beginPath(); c.moveTo(scx,scy-h*0.05); c.lineTo(scx,scy+h*0.12); c.stroke(); // pillar
    c.beginPath(); c.moveTo(scx-armLen,scy+bob); c.lineTo(scx+armLen,scy-bob); c.stroke(); // arm

    // Left pan (reactants)
    c.strokeStyle='#5D4037'; c.lineWidth=2;
    const lpx=scx-armLen, lpy=scy+bob;
    c.beginPath(); c.moveTo(lpx,lpy); c.lineTo(lpx,lpy+h*0.12); c.stroke();
    c.beginPath(); c.ellipse(lpx,lpy+h*0.12,w*0.12,h*0.02,0,0,Math.PI*2); c.stroke();
    c.fillStyle='rgba(198,40,40,0.15)'; c.beginPath(); c.ellipse(lpx,lpy+h*0.12,w*0.12,h*0.02,0,0,Math.PI*2); c.fill();
    // Label
    c.fillStyle='#C62828'; c.font=`bold ${Math.max(11,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    const rLabel=eq.reactants.map(r=>r.count>1?r.count+'×'+r.name:r.name).join(' + ');
    c.fillText(rLabel, lpx, lpy+h*0.17);
    c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#888';
    c.fillText('المتفاعلات', lpx, lpy+h*0.21);

    // Right pan (products)
    const rpx=scx+armLen, rpy=scy-bob;
    c.strokeStyle='#5D4037'; c.lineWidth=2;
    c.beginPath(); c.moveTo(rpx,rpy); c.lineTo(rpx,rpy+h*0.12); c.stroke();
    c.beginPath(); c.ellipse(rpx,rpy+h*0.12,w*0.12,h*0.02,0,0,Math.PI*2); c.stroke();
    c.fillStyle='rgba(27,136,71,0.15)'; c.beginPath(); c.ellipse(rpx,rpy+h*0.12,w*0.12,h*0.02,0,0,Math.PI*2); c.fill();
    c.fillStyle='#1B8847'; c.font=`bold ${Math.max(11,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    const pLabel=eq.products.map(p=>p.count>1?p.count+'×'+p.name:p.name).join(' + ');
    c.fillText(pLabel, rpx, rpy+h*0.17);
    c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#888';
    c.fillText('النواتج', rpx, rpy+h*0.21);

    // Atom count panel
    const apx=w*0.06, apy=h*0.77, apw=w*0.88, aph=h*0.16;
    c.fillStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.roundRect(apx,apy,apw,aph,10); c.fill();
    c.strokeStyle='rgba(93,64,55,0.2)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(apx,apy,apw,aph,10); c.stroke();
    c.fillStyle='#5D4037'; c.font=`bold ${Math.max(11,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
    c.fillText('عدد الذرات', w/2, apy+6);
    const elements=Object.entries(eq.atoms);
    const cellW=(apw-20)/elements.length;
    elements.forEach(([el,{r,p}],i)=>{
      const ex=apx+10+i*cellW+cellW*0.1, ey=apy+aph*0.35;
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(el+': متفاعلات='+r+' / نواتج='+p, ex+cellW*0.3, ey);
      c.fillStyle=r===p?'#27AE60':'#C0392B';
      c.font=`${Math.max(11,w*0.022)}px Tajawal`;
      c.fillText(r===p?'✅':'❌', ex+cellW*0.3, ey+aph*0.3);
    });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 7-2 TAB 2: خطوات الموازنة ───
function simG9Balance2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, step:0, eqi:0, coeffs:[1,1,1,1]};
  const S=simState;

  const equations=[
    {
      label:'H₂ + O₂ → H₂O',
      terms:[{f:'H₂',atoms:{H:2}},{f:'O₂',atoms:{O:2}},'→',{f:'H₂O',atoms:{H:2,O:1}}],
      balanced:[2,1,0,2],
      hint:'ابدأ بـ H: ضع 2 أمام H₂O، ثم O: 2 أمام H₂'
    },
    {
      label:'Mg + O₂ → MgO',
      terms:[{f:'Mg',atoms:{Mg:1}},{f:'O₂',atoms:{O:2}},'→',{f:'MgO',atoms:{Mg:1,O:1}}],
      balanced:[2,1,0,2],
      hint:'ضع 2 أمام Mg وأمام MgO لموازنة Mg، ثم O متوازن بالفعل'
    },
  ];

  const eq=equations[S.eqi||0];
  const coeff=[1,1,1,1];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚖️ وازن المعادلة</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn" onclick="simState.step=Math.max(0,simState.step-1)">⬅️ السابق</button>
        <button class="ctrl-btn action" onclick="simState.step=Math.min(3,simState.step+1)">التالي ➡️</button>
      </div>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.step=0">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>قاعدة الموازنة:</b><br>
      1️⃣ عدِّد ذرات كل جانب<br>
      2️⃣ غيِّر المعاملات فقط (لا الصِّيَغ!)<br>
      3️⃣ تحقق من التساوي
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا لا نغيّر الصيغة (مثلاً H₃ بدلاً من H₂)؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">لأن الصيغة تصف مركباً حقيقياً بطبيعته الكيميائية. H₂ هو الهيدروجين الجزيئي ولا يمكن تغيير طبيعة المادة في المعادلة!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  const steps=[
    {title:'الخطوة ١: اكتب المعادلة غير الموزونة', coeff:[1,1,1,1]},
    {title:'الخطوة ٢: عدِّد الذرات على كل جانب', coeff:[1,1,1,1]},
    {title:'الخطوة ٣: عدِّل المعاملات', coeff:[2,1,1,2]},
    {title:'✅ الخطوة ٤: تحقق من الموازنة', coeff:[2,1,1,2]},
  ];

  function draw(){
    if(currentSim!=='g9balance'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const st=steps[Math.min(S.step||0,3)];

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FFF3E0'); bg.addColorStop(1,'#FFE0B2');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText(st.title, w/2, h*0.08);

    // Draw equation terms
    const terms=['H₂','O₂','→','H₂O'];
    const coeffs=st.coeff;
    const termW=Math.min(w*0.18,90), termH=Math.min(h*0.12,52);
    const totalW=terms.length*termW + 3*Math.min(w*0.03,20);
    const startX=(w-totalW)/2;
    const ty=h*0.32;
    let cx2=startX;

    terms.forEach((term,i)=>{
      if(term==='→'){
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(18,w*0.04)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText('→', cx2+termW/2, ty+termH/2);
        cx2+=termW;
        return;
      }
      const cf=coeffs[i<2?i:i+1]||1;
      const col=i<2?'rgba(192,57,43,0.1)':'rgba(39,174,96,0.1)';
      const stk=i<2?'#C0392B':'#27AE60';

      c.fillStyle=col; c.beginPath(); c.roundRect(cx2,ty,termW,termH,10); c.fill();
      c.strokeStyle=stk; c.lineWidth=2; c.beginPath(); c.roundRect(cx2,ty,termW,termH,10); c.stroke();

      c.fillStyle='#1E2D3D'; c.textAlign='center'; c.textBaseline='middle';
      if(cf>1){
        c.font=`bold ${Math.max(14,w*0.032)}px Tajawal`;
        c.fillText(cf+'×'+term, cx2+termW/2, ty+termH/2);
      } else {
        c.font=`bold ${Math.max(14,w*0.032)}px Tajawal`;
        c.fillText(term, cx2+termW/2, ty+termH/2);
      }
      cx2+=termW+Math.min(w*0.015,10);
    });

    // Atom count display (step 2+)
    if((S.step||0)>=1){
      const items=[
        {el:'H',left:coeffs[0]*2, right:coeffs[3]*2},
        {el:'O',left:coeffs[1]*2, right:coeffs[3]*1},
      ];
      const tabX=w*0.06, tabY=h*0.52, tabW=w*0.88/items.length, tabH=h*0.13;
      items.forEach((it,i)=>{
        const tx=tabX+i*tabW;
        const balanced=it.left===it.right;
        const highlight=(S.step||0)>=2?balanced:'';
        c.fillStyle=highlight?'rgba(39,174,96,0.12)':'rgba(255,255,255,0.7)';
        c.beginPath(); c.roundRect(tx+4,tabY,tabW-8,tabH,8); c.fill();
        c.strokeStyle=highlight?'#27AE60':'#ccc'; c.lineWidth=1.5; c.beginPath(); c.roundRect(tx+4,tabY,tabW-8,tabH,8); c.stroke();
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
        c.fillText('ذرات '+it.el, tx+tabW/2, tabY+6);
        c.font=`${Math.max(10,w*0.019)}px Tajawal`;
        c.fillStyle='#C0392B'; c.fillText('يسار: '+it.left, tx+tabW/2, tabY+tabH*0.4);
        c.fillStyle='#27AE60'; c.fillText('يمين: '+it.right, tx+tabW/2, tabY+tabH*0.65);
        if((S.step||0)>=2){ c.fillStyle=balanced?'#27AE60':'#C0392B'; c.font=`bold ${Math.max(14,w*0.030)}px Tajawal`; c.fillText(balanced?'✅':'🔧', tx+tabW/2, tabY+tabH*0.82); }
      });
    }

    // Final message
    if((S.step||0)>=3){
      c.fillStyle='rgba(39,174,96,0.12)'; c.beginPath(); c.roundRect(w*0.08,h*0.72,w*0.84,h*0.12,12); c.fill();
      c.fillStyle='#27AE60'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('✅ المعادلة موزونة: 2H₂ + O₂ → 2H₂O', w/2, h*0.78);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 7-2 TAB 3: تجربة H₂ + O₂ ───
function simG9Balance3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, react:false, done:false, bubbles:[], drops:[]};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💧 إنتاج الماء من عناصره</div>
      <button class="ctrl-btn action" id="react-btn" onclick="simState.react=true;this.disabled=true">⚡ افجُر الخليط</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.react=false;simState.done=false;simState.bubbles=[];simState.drops=[];simState.t=0;document.getElementById('react-btn').disabled=false">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>المعادلة الموزونة:</b><br>
      2H₂ + O₂ → 2H₂O<br>
      2 جزيء هيدروجين + 1 جزيء أكسجين = 2 جزيء ماء
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">يتحد الهيدروجين والأكسجين بنسبة 2:1 لإنتاج الماء. المعاملات في المعادلة تمثل نسب الجزيئات. هذه النسبة ثابتة لا تتغيّر!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9balance'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E3F2FD'); bg.addColorStop(1,'#BBDEFB');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // H2 molecules (blue) - 2 of them
    const mols=[
      {x:w*0.2, y:h*0.4, label:'H₂', col:'#3498DB', r:Math.min(w,h)*0.06},
      {x:w*0.35, y:h*0.5, label:'H₂', col:'#3498DB', r:Math.min(w,h)*0.06},
      {x:w*0.5, y:h*0.4, label:'O₂', col:'#E74C3C', r:Math.min(w,h)*0.07},
    ];

    if(!S.react){
      mols.forEach(m=>{
        const bounce=Math.sin(S.t*0.04+m.x)*4;
        c.shadowBlur=15; c.shadowColor=m.col+'66';
        c.fillStyle=m.col+'33'; c.beginPath(); c.arc(m.x,m.y+bounce,m.r,0,Math.PI*2); c.fill();
        c.shadowBlur=0; c.strokeStyle=m.col; c.lineWidth=2.5; c.beginPath(); c.arc(m.x,m.y+bounce,m.r,0,Math.PI*2); c.stroke();
        c.fillStyle=m.col; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(m.label, m.x, m.y+bounce);
      });

      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('2H₂ + O₂ ← جزيئات المتفاعلة', w/2, h*0.72);
    } else {
      // Explosion then water drops
      if(S.t<50){
        const alpha=S.t/50;
        for(let i=0;i<20;i++){
          const angle=Math.random()*Math.PI*2, dist=S.t*3*Math.random();
          c.fillStyle=`rgba(255,${Math.floor(150+Math.random()*105)},0,${1-alpha})`;
          c.beginPath(); c.arc(w*0.35+Math.cos(angle)*dist, h*0.45+Math.sin(angle)*dist, 5+Math.random()*8, 0, Math.PI*2); c.fill();
        }
        c.shadowBlur=40; c.shadowColor='#fff'; c.fillStyle='rgba(255,255,255,0.9)';
        c.beginPath(); c.arc(w*0.35,h*0.45,30*alpha,0,Math.PI*2); c.fill(); c.shadowBlur=0;
      } else {
        S.done=true;
        // Two water drops
        [[w*0.3,h*0.45],[w*0.6,h*0.45]].forEach(([dx,dy],i)=>{
          const bounce=Math.sin(S.t*0.05+i)*4;
          c.shadowBlur=20; c.shadowColor='#1A8FA888';
          c.fillStyle='rgba(26,143,168,0.3)'; c.beginPath(); c.arc(dx,dy+bounce,Math.min(w,h)*0.09,0,Math.PI*2); c.fill();
          c.shadowBlur=0; c.strokeStyle='#1A8FA8'; c.lineWidth=2.5; c.beginPath(); c.arc(dx,dy+bounce,Math.min(w,h)*0.09,0,Math.PI*2); c.stroke();
          c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
          c.fillText('H₂O', dx, dy+bounce);
        });
        c.fillStyle='#27AE60'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
        c.fillText('✅ 2H₂ + O₂ → 2H₂O — ناتجان من الماء!', w/2, h*0.72);
      }
    }

    // Title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('تجربة احتراق الهيدروجين في الأكسجين', w/2, h*0.08);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// ─── 7-3 TAB 1: رموز الحالة الفيزيائية ───
function simG9StateSym1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, quiz:[], qi:0, chosen:-1, answered:false};
  const S=simState;

  const states=[
    {sym:'(s)', name:'صلب', ar:'Solid', col:'#8D6E63', icon:'🪨', ex:'CaCO₃(s) — الرخام صلب'},
    {sym:'(l)', name:'سائل', ar:'Liquid', col:'#1A8FA8', icon:'💧', ex:'H₂O(l) — الماء سائل'},
    {sym:'(g)', name:'غاز', ar:'Gas', col:'#7B1FA2', icon:'💨', ex:'CO₂(g) — غاز ثاني أكسيد الكربون'},
    {sym:'(aq)', name:'محلول مائي', ar:'Aqueous', col:'#27AE60', icon:'🧪', ex:'NaCl(aq) — ملح مذاب في الماء'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🏷️ رموز الحالة الفيزيائية</div>
      <div class="info-box">تُضاف هذه الرموز بعد الصيغة الكيميائية لتوضيح حالة المادة</div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا نُضيف رموز الحالة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">رموز الحالة تُكمل المعلومات — نفس المادة قد تكون في حالات مختلفة. مثلاً H₂O قد تكون ثلجاً (s) أو ماءً (l) أو بخاراً (g)، وهذا يؤثر في التفاعل!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9statesym'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F3E5F5'); bg.addColorStop(1,'#E1BEE7');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText('رموز الحالة الفيزيائية في المعادلات الكيميائية', w/2, h*0.07);

    const cardW=Math.min(w*0.43,190), cardH=Math.min(h*0.22,100);
    const gapX=(w-2*cardW)/3, gapY=Math.min(h*0.03,16);
    states.forEach((st,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const cx2=gapX + col*(cardW+gapX), cy2=h*0.14 + row*(cardH+gapY);
      const bounce=Math.sin(S.t*0.04+i*1.2)*3;

      c.shadowBlur=15; c.shadowColor=st.col+'44';
      c.fillStyle=st.col+'18'; c.beginPath(); c.roundRect(cx2,cy2+bounce,cardW,cardH,14); c.fill();
      c.shadowBlur=0; c.strokeStyle=st.col; c.lineWidth=2.5; c.beginPath(); c.roundRect(cx2,cy2+bounce,cardW,cardH,14); c.stroke();

      c.fillStyle=st.col; c.font=`bold ${Math.max(18,w*0.040)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
      c.fillText(st.sym, cx2+cardW/2, cy2+bounce+8);
      c.font=`bold ${Math.max(13,w*0.025)}px Tajawal`;
      c.fillText(st.name+' — '+st.icon, cx2+cardW/2, cy2+bounce+cardH*0.38);
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.015)}px Tajawal`;
      c.fillText(st.ex, cx2+cardW/2, cy2+bounce+cardH*0.68);
    });

    // Example equation
    const eby=h*0.67, ebh=h*0.12;
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(w*0.05,eby,w*0.9,ebh,10); c.fill();
    c.strokeStyle='rgba(107,78,154,0.3)'; c.lineWidth=1.5; c.beginPath(); c.roundRect(w*0.05,eby,w*0.9,ebh,10); c.stroke();
    c.fillStyle='#4A148C'; c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('2K(s) + 2H₂O(l) → 2KOH(aq) + H₂(g)', w/2, eby+ebh/2);

    // Animated pulse around aq symbol
    const pulse=0.5+0.5*Math.sin(S.t*0.07);
    c.shadowBlur=10*pulse; c.shadowColor='#27AE60';
    c.fillStyle='rgba(39,174,96,0.2)'; c.beginPath(); c.arc(w*0.68,eby+ebh/2,Math.min(w,h)*0.055*(0.9+0.1*pulse),0,Math.PI*2); c.fill();
    c.shadowBlur=0;

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 7-3 TAB 2: تفاعل البوتاسيوم مع الماء ───
function simG9StateSym2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, added:false, reacting:false, particles:[]};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💥 تفاعل K مع الماء</div>
      <button class="ctrl-btn action" id="k-btn" onclick="simState.added=true;setTimeout(()=>simState.reacting=true,1000);this.disabled=true">➕ أضِف قطعة بوتاسيوم</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.added=false;simState.reacting=false;simState.particles=[];simState.t=0;document.getElementById('k-btn').disabled=false">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>المعادلة مع رموز الحالة:</b><br>
      2K(s) + 2H₂O(l) →<br>
      2KOH(aq) + H₂(g)
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج عن رموز الحالة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">K صلب (s) ← يبدأ كقطعة صلبة. H₂O سائل (l) ← الماء في درجة الغرفة. KOH محلول مائي (aq) ← ينذوب في الماء. H₂ غاز (g) ← يتصاعد كفقاعات. رموز الحالة تُوضّح ما يحدث بالفعل!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9statesym'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;

    // Background
    c.fillStyle='#1a3a4a'; c.fillRect(0,0,w,h);

    // Beaker (water)
    const bx=w*0.2, by=h*0.2, bw=w*0.6, bh=h*0.65;
    c.fillStyle='rgba(26,143,168,0.25)'; c.fillRect(bx,by,bw,bh);
    c.strokeStyle='rgba(255,255,255,0.4)'; c.lineWidth=3;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();
    c.fillStyle='rgba(26,143,168,0.6)'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='left'; c.textBaseline='alphabetic';
    c.fillText('H₂O(l)', bx+8, by+bh-8);

    // K piece
    if(S.added){
      const kx=bx+bw/2, ky=by+(S.reacting?Math.min(bh*0.4,bh*0.4*(Math.min(S.t-50,40)/40)):bh*0.1);
      c.fillStyle='#B0BEC5'; c.beginPath(); c.roundRect(kx-15,ky-12,30,24,6); c.fill();
      c.strokeStyle='#78909C'; c.lineWidth=2; c.beginPath(); c.roundRect(kx-15,ky-12,30,24,6); c.stroke();
      c.fillStyle='#37474F'; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('K(s)', kx, ky);
    }

    // Reaction effects
    if(S.reacting && S.t>50){
      // Bubbles (H2 gas)
      if(Math.random()<0.3) S.particles.push({x:bx+bw*0.3+Math.random()*bw*0.4, y:by+bh*0.6, r:Math.random()*5+2, vy:-1.5-Math.random()*2});
      S.particles=S.particles.filter(p=>p.y>by);
      S.particles.forEach(p=>{ p.y+=p.vy; p.x+=Math.sin(p.y*0.1)*1.5; c.strokeStyle='rgba(255,255,255,0.6)'; c.lineWidth=1.5; c.beginPath(); c.arc(p.x,p.y,p.r,0,Math.PI*2); c.stroke(); });

      // Color change (KOH dissolving - purple tint)
      const alpha=Math.min((S.t-50)/100,0.3);
      c.fillStyle=`rgba(100,200,100,${alpha})`; c.fillRect(bx+2,by,bw-4,bh);

      // Flame on K surface
      if(S.t<150){
        for(let i=0;i<8;i++){
          const flx=bx+bw/2+(Math.random()-0.5)*30, fly=by+bh*0.3;
          c.fillStyle=`rgba(255,${Math.floor(100+Math.random()*155)},0,${0.5+Math.random()*0.4})`;
          c.beginPath(); c.ellipse(flx,fly,4+Math.random()*6,8+Math.random()*10,0,0,Math.PI*2); c.fill();
        }
      }

      // Labels
      c.fillStyle='rgba(255,255,255,0.9)'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('H₂(g) ↑ — فقاعات الهيدروجين', w*0.5, by-10);
      c.fillStyle='rgba(100,230,130,0.9)'; c.fillText('KOH(aq) — يذوب في الماء', w*0.5, by+bh+20);
    }

    // Equation
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(w*0.03,h*0.88,w*0.94,h*0.1,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('2K(s) + 2H₂O(l) → 2KOH(aq) + H₂(g)', w/2, h*0.93);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 7-3 TAB 3: المعادلات الأيونية ───
function simG9StateSym3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, step:0};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 المعادلات الأيونية الصافية</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn" onclick="simState.step=Math.max(0,simState.step-1)">⬅️ رجوع</button>
        <button class="ctrl-btn action" onclick="simState.step=Math.min(3,simState.step+1)">التالي ➡️</button>
      </div>
    </div>
    <div class="info-box" style="margin-top:8px">
      الأيونات المتفرجة (Spectator ions): تظهر على كلا الجانبين ولا تشارك في التفاعل — نحذفها!
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما فائدة المعادلة الأيونية الصافية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">تُظهر ما يحدث فعلاً على مستوى الأيونات. مثلاً: أي حمض + أي قاعدة قوية تعطي نفس المعادلة الأيونية H⁺ + OH⁻ → H₂O. هذا يُسهّل الفهم والتعميم!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  const stepsData=[
    {title:'المعادلة الكاملة الموزونة', eq:'HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)'},
    {title:'فصل الأيونات (المذابة في الماء)', eq:'[H⁺ + Cl⁻] + [Na⁺ + OH⁻] → [Na⁺ + Cl⁻] + H₂O'},
    {title:'تحديد الأيونات المتفرجة (تُشطب)', eq:'[H⁺ + ~~Cl⁻~~] + [~~Na⁺~~ + OH⁻] → [~~Na⁺~~ + ~~Cl⁻~~] + H₂O', crossed:['Na⁺','Cl⁻']},
    {title:'✅ المعادلة الأيونية الصافية', eq:'H⁺(aq) + OH⁻(aq) → H₂O(l)'},
  ];

  function draw(){
    if(currentSim!=='g9statesym'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const st=stepsData[Math.min(S.step||0,3)];

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E0F2F1'); bg.addColorStop(1,'#B2DFDB');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Step indicator
    [0,1,2,3].forEach(i=>{
      const sx=w*0.1+i*(w*0.8/3), sy=h*0.07;
      c.fillStyle=i<=(S.step||0)?'#1A8FA8':'rgba(0,0,0,0.15)';
      c.beginPath(); c.arc(sx,sy,Math.min(w,h)*0.028,0,Math.PI*2); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(i+1, sx, sy);
    });

    // Step title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('الخطوة '+(S.step+1)+': '+st.title, w/2, h*0.16);

    // Equation box
    const eby=h*0.22, ebh=h*0.14;
    const col=(S.step||0)===3?'rgba(39,174,96,0.15)':'rgba(255,255,255,0.8)';
    c.fillStyle=col; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,12); c.fill();
    c.strokeStyle=(S.step||0)===3?'#27AE60':'rgba(26,143,168,0.3)'; c.lineWidth=2; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,12); c.stroke();
    c.fillStyle=(S.step||0)===3?'#27AE60':'#1A8FA8'; c.font=`bold ${Math.max(11,w*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(st.eq.replace(/~~/g,''), w/2, eby+ebh/2);

    // Ion visualization
    if((S.step||0)>=1){
      const ions=[
        {label:'H⁺', col:'#E74C3C', x:w*0.13, spectator:false},
        {label:'Cl⁻', col:'#7F8C8D', x:w*0.26, spectator:true},
        {label:'Na⁺', col:'#7F8C8D', x:w*0.55, spectator:true},
        {label:'OH⁻', col:'#27AE60', x:w*0.68, spectator:false},
        {label:'→', col:'#1E2D3D', x:w*0.42, spectator:false, arrow:true},
        {label:'H₂O', col:'#1A8FA8', x:w*0.84, spectator:false, product:true},
      ];
      const iy=h*0.48, ir=Math.min(w,h)*0.07;
      ions.forEach(ion=>{
        if(ion.arrow){ c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(20,w*0.04)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle'; c.fillText('→',ion.x,iy); return; }
        const isSpectator=ion.spectator&&(S.step||0)>=2;
        const alpha=isSpectator?0.3:1;
        c.globalAlpha=alpha;
        c.shadowBlur=isSpectator?0:12; c.shadowColor=ion.col+'88';
        c.fillStyle=ion.col+'22'; c.beginPath(); c.arc(ion.x,iy,ir,0,Math.PI*2); c.fill();
        c.shadowBlur=0; c.strokeStyle=ion.col; c.lineWidth=isSpectator?1:2.5; c.beginPath(); c.arc(ion.x,iy,ir,0,Math.PI*2); c.stroke();
        c.fillStyle=ion.col; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(ion.label, ion.x, iy);
        c.globalAlpha=1;
        if(isSpectator){
          c.strokeStyle='rgba(150,0,0,0.6)'; c.lineWidth=2;
          c.beginPath(); c.moveTo(ion.x-ir*0.7,iy-ir*0.7); c.lineTo(ion.x+ir*0.7,iy+ir*0.7); c.stroke();
        }
      });
    }

    // Labels
    if((S.step||0)>=2){
      c.fillStyle='#C0392B'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('أيونات متفرجة — تُحذف', w*0.245, h*0.62);
      c.fillStyle='#1A8FA8'; c.fillText('تشارك في التفاعل', w*0.72, h*0.62);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ══════════════════════════════════════════════════════════
// الصف التاسع — الوحدة الثامنة: تكوين الأملاح
// ══════════════════════════════════════════════════════════

// ─── 8-1 TAB 1: حمض + قاعدة (تعادل) ───
function simG9SaltAcid1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, acid:0, base:0, drops:0, ph:7, neutralised:false, acidVol:50, baseVol:50};
  const S=simState;

  const pairs=[
    {acid:'HCl',base:'NaOH', salt:'NaCl', fullName:'كلوريد الصوديوم', acid_name:'حمض الهيدروكلوريك', base_name:'هيدروكسيد الصوديوم'},
    {acid:'H₂SO₄',base:'KOH', salt:'K₂SO₄', fullName:'كبريتات البوتاسيوم', acid_name:'حمض الكبريتيك', base_name:'هيدروكسيد البوتاسيوم'},
    {acid:'HNO₃',base:'NaOH', salt:'NaNO₃', fullName:'نترات الصوديوم', acid_name:'حمض النيتريك', base_name:'هيدروكسيد الصوديوم'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 اختر التفاعل</div>
      <div class="ctrl-btns-grid-1">
        ${pairs.map((p,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="pair-btn-${i}" onclick="simState.pairIdx=${i};simState.ph=7;simState.drops=0;simState.neutralised=false;document.querySelectorAll('[id^=pair-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${p.acid} + ${p.base}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 أضِف قطرات الحمض</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn stop" onclick="if(simState.ph>1){simState.ph=Math.max(1,simState.ph-1.5);simState.drops++}">+ قطرة حمض</button>
        <button class="ctrl-btn action" onclick="if(simState.ph<13){simState.ph=Math.min(13,simState.ph+1.5);simState.drops++}">+ قطرة قاعدة</button>
      </div>
      <button class="ctrl-btn" style="margin-top:6px" onclick="simState.ph=7;simState.drops=0;simState.neutralised=false">🔄 إعادة</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج عن تفاعل التعادل؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الحمض يُعادل القاعدة تماماً عند pH=7. الناتج دائماً ملح + ماء. الملح يعتمد على نوع الحمض والقاعدة: HCl + NaOH → NaCl + H₂O. هذه أهم طرق تحضير الأملاح!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9saltacid'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const pair=pairs[S.pairIdx||0];
    const ph=S.ph||7;
    if(Math.abs(ph-7)<0.5) S.neutralised=true;

    // pH color
    const phColors={0:'#8B0000',1:'#C0392B',2:'#E74C3C',3:'#E67E22',4:'#F39C12',5:'#F1C40F',6:'#ABEBC6',7:'#27AE60',8:'#1ABC9C',9:'#16A085',10:'#1A8FA8',11:'#2980B9',12:'#1F618D',13:'#154360'};
    const phFloor=Math.floor(ph);
    const solutionCol=phColors[Math.max(0,Math.min(13,phFloor))]||'#27AE60';

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FAFAFA'); bg.addColorStop(1,'#F0F0F0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Beaker
    const bx=w*0.22, by=h*0.12, bw=w*0.56, bh=h*0.55;
    c.fillStyle=solutionCol+'44'; c.fillRect(bx,by+bh*0.05,bw,bh*0.95);
    c.strokeStyle='#90A4AE'; c.lineWidth=4;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();

    // Solution particles
    for(let i=0;i<15;i++){
      const px=bx+10+Math.random()*(bw-20), py=by+bh*0.1+Math.random()*bh*0.85;
      const isH=ph<7, col2=isH?'#E74C3C88':'#27AE6088';
      c.fillStyle=col2; c.beginPath(); c.arc(px,py,3,0,Math.PI*2); c.fill();
    }

    // pH meter
    const pmx=bx+bw+Math.min(w*0.04,16), pmy=by, pmh=bh;
    c.fillStyle='#ECEFF1'; c.beginPath(); c.roundRect(pmx,pmy,Math.min(w*0.12,55),pmh,8); c.fill();
    c.strokeStyle='#90A4AE'; c.lineWidth=2; c.beginPath(); c.roundRect(pmx,pmy,Math.min(w*0.12,55),pmh,8); c.stroke();
    const needle=pmy + pmh*(1-ph/14);
    c.fillStyle=solutionCol; c.fillRect(pmx+4,needle,Math.min(w*0.12,55)-8,pmh-(needle-pmy));
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('pH', pmx+Math.min(w*0.06,27.5), pmy-15);
    c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`;
    c.fillText(ph.toFixed(1), pmx+Math.min(w*0.06,27.5), needle-12);

    // Status
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    const status=ph<6.5?'🍋 محلول حمضي':ph>7.5?'🧼 محلول قلوي':'⚖️ متعادل — pH = 7';
    c.fillText(status, w*0.35, by+bh+30);

    // Equation
    const eby=h*0.79, ebh=h*0.12;
    const ecol=S.neutralised?'rgba(39,174,96,0.15)':'rgba(255,255,255,0.8)';
    c.fillStyle=ecol; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.fillStyle=S.neutralised?'#27AE60':'#1E2D3D'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`${pair.acid} + ${pair.base} → ${pair.salt} + H₂O`, w/2, eby+ebh*0.4);
    if(S.neutralised){
      c.fillStyle='rgba(39,174,96,0.7)'; c.font=`${Math.max(9,w*0.016)}px Tajawal`;
      c.fillText(`✅ الملح الناتج: ${pair.fullName}`, w/2, eby+ebh*0.75);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-1 TAB 2: حمض + أكسيد فلزي ───
function simG9SaltAcid2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selected:0, reacting:false, progress:0};
  const S=simState;

  const oxides=[
    {oxide:'CuO', acid:'H₂SO₄', salt:'CuSO₄', water:'H₂O', name:'كبريتات النحاس(II)', color:'#1A8FA8', oxColor:'#8B4513', desc:'بلورات زرقاء'},
    {oxide:'MgO', acid:'HCl', salt:'MgCl₂', water:'H₂O', name:'كلوريد الماغنيسيوم', color:'#27AE60', oxColor:'#FFFFFF', desc:'محلول عديم اللون'},
    {oxide:'Na₂O', acid:'HCl', salt:'NaCl', water:'H₂O', name:'كلوريد الصوديوم', color:'#F39C12', oxColor:'#F5F5F5', desc:'ملح الطعام'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔥 حمض + أكسيد فلزي → ملح + ماء</div>
      <div class="ctrl-btns-grid-1">
        ${oxides.map((o,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="ox-btn-${i}" onclick="simState.selected=${i};simState.reacting=false;simState.progress=0;document.querySelectorAll('[id^=ox-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${o.oxide} + ${o.acid}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn action" onclick="simState.reacting=true">⚗️ ابدأ التفاعل</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.reacting=false;simState.progress=0">🔄 إعادة</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ما الفرق عن تفاعل الحمض مع القاعدة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">التفاعل مماثل — الناتج ملح + ماء. لكن الأكسيد الفلزي صلب لا سائل. لذا نُضيف فائضاً منه ونُرشّح الزائد. لا يوجد كاشف هنا لتحديد نقطة التعادل!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9saltacid'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.reacting && S.progress<100) S.progress+=0.5;
    const ox=oxides[S.selected||0];
    const prog=S.progress||0;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FFF8E1'); bg.addColorStop(1,'#FFE082');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('حمض + أكسيد فلزي → ملح + ماء', w/2, h*0.07);

    // Left beaker (acid)
    const lbx=w*0.04, lby=h*0.15, lbw=w*0.28, lbh=h*0.45;
    const acidAlpha=Math.max(0,1-prog/80);
    c.fillStyle=`rgba(231,76,60,${0.2*acidAlpha})`; c.fillRect(lbx,lby,lbw,lbh);
    c.strokeStyle='#90A4AE'; c.lineWidth=3;
    c.beginPath(); c.moveTo(lbx,lby); c.lineTo(lbx,lby+lbh); c.lineTo(lbx+lbw,lby+lbh); c.lineTo(lbx+lbw,lby); c.stroke();
    c.fillStyle='#C0392B'; c.font=`bold ${Math.max(11,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText(ox.acid, lbx+lbw/2, lby+lbh+18);
    c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#888';
    c.fillText('الحمض', lbx+lbw/2, lby+lbh+32);

    // Right beaker (oxide)
    const rbx=w*0.68, rby=h*0.15, rbw=w*0.28, rbh=h*0.45;
    const oxAlpha=Math.max(0,1-prog/80);
    c.fillStyle=`rgba(139,69,19,${0.15*oxAlpha})`; c.fillRect(rbx,rby,rbw,rbh);
    c.strokeStyle='#90A4AE'; c.lineWidth=3;
    c.beginPath(); c.moveTo(rbx,rby); c.lineTo(rbx,rby+rbh); c.lineTo(rbx+rbw,rby+rbh); c.lineTo(rbx+rbw,rby); c.stroke();
    // Oxide powder particles
    for(let i=0;i<12;i++){
      if(Math.random()<oxAlpha){
        c.fillStyle=ox.oxColor+'CC'; c.beginPath(); c.arc(rbx+10+Math.random()*(rbw-20), rby+rbh*0.4+Math.random()*rbh*0.5, 4+Math.random()*4,0,Math.PI*2); c.fill();
      }
    }
    c.fillStyle='#8D6E63'; c.font=`bold ${Math.max(11,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText(ox.oxide, rbx+rbw/2, rby+rbh+18);
    c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#888';
    c.fillText('أكسيد فلزي', rbx+rbw/2, rby+rbh+32);

    // Arrow
    if(S.reacting){
      c.strokeStyle=ox.color; c.lineWidth=3;
      const ax1=lbx+lbw+5, ax2=rbx-5, ay=lby+lbh/2;
      c.beginPath(); c.moveTo(ax1,ay); c.lineTo(ax2,ay); c.stroke();
      c.fillStyle=ox.color; c.beginPath(); c.moveTo(ax2,ay); c.lineTo(ax2-12,ay-7); c.lineTo(ax2-12,ay+7); c.closePath(); c.fill();
    }

    // Product beaker (center, appears when progress>50)
    if(prog>30){
      const pbx=w*0.34, pby=h*0.55, pbw=w*0.32, pbh=h*0.3;
      const alpha=Math.min((prog-30)/40,1);
      c.globalAlpha=alpha;
      c.fillStyle=ox.color+'33'; c.fillRect(pbx,pby,pbw,pbh);
      c.strokeStyle='#90A4AE'; c.lineWidth=3;
      c.beginPath(); c.moveTo(pbx,pby); c.lineTo(pbx,pby+pbh); c.lineTo(pbx+pbw,pby+pbh); c.lineTo(pbx+pbw,pby); c.stroke();
      c.fillStyle=ox.color; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(ox.salt, pbx+pbw/2, pby+pbh+18);
      c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#666';
      c.fillText(ox.name+' + H₂O', pbx+pbw/2, pby+pbh+34);
      c.globalAlpha=1;
    }

    // Equation
    const eby=h*0.87, ebh=h*0.1;
    c.fillStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`${ox.oxide}(s) + ${ox.acid}(aq) → ${ox.salt}(aq) + H₂O(l)`, w/2, eby+ebh/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-1 TAB 3: جدول الأملاح المتكوّنة ───
function simG9SaltAcid3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selAcid:0, selBase:0};
  const S=simState;

  const acids=['HCl', 'H₂SO₄', 'HNO₃'];
  const bases=['NaOH', 'KOH', 'MgO', 'CuO'];
  const saltTable=[
    ['NaCl','Na₂SO₄','NaNO₃'],
    ['KCl','K₂SO₄','KNO₃'],
    ['MgCl₂','MgSO₄','Mg(NO₃)₂'],
    ['CuCl₂','CuSO₄','Cu(NO₃)₂'],
  ];
  const saltNames=[
    ['كلوريد الصوديوم','كبريتات الصوديوم','نترات الصوديوم'],
    ['كلوريد البوتاسيوم','كبريتات البوتاسيوم','نترات البوتاسيوم'],
    ['كلوريد الماغنيسيوم','كبريتات الماغنيسيوم','نترات الماغنيسيوم'],
    ['كلوريد النحاس(II)','كبريتات النحاس(II)','نترات النحاس(II)'],
  ];
  const saltColors=['#27AE60','#1A8FA8','#D4901A','#6B4E9A'];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🏆 جدول الأملاح — اختر الحمض والقاعدة</div>
      <div class="ctrl-label" style="font-size:13px;margin-top:4px">الحمض:</div>
      <div class="ctrl-btns-grid">
        ${acids.map((a,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="acid-btn-${i}" onclick="simState.selAcid=${i};document.querySelectorAll('[id^=acid-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${a}</button>`).join('')}
      </div>
      <div class="ctrl-label" style="font-size:13px;margin-top:6px">القاعدة/الأكسيد:</div>
      <div class="ctrl-btns-grid-1">
        ${bases.map((b,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="base-btn-${i}" onclick="simState.selBase=${i};document.querySelectorAll('[id^=base-btn-]').forEach((b2,j)=>b2.classList.toggle('active',j===${i}))">${b}</button>`).join('')}
      </div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9saltacid'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const ai=S.selAcid||0, bi=S.selBase||0;
    const salt=saltTable[bi][ai];
    const saltName=saltNames[bi][ai];
    const saltCol=saltColors[bi];

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E8EAF6'); bg.addColorStop(1,'#C5CAE9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('🏆 جدول تكوين الأملاح', w/2, h*0.07);

    // Salt display
    const pulse=0.5+0.5*Math.sin(S.t*0.06);
    const sr=Math.min(w,h)*0.18*(0.95+0.05*pulse);
    const sx=w*0.5, sy=h*0.34;
    c.shadowBlur=25*pulse; c.shadowColor=saltCol+'88';
    c.fillStyle=saltCol+'22'; c.beginPath(); c.arc(sx,sy,sr,0,Math.PI*2); c.fill();
    c.shadowBlur=0; c.strokeStyle=saltCol; c.lineWidth=3; c.beginPath(); c.arc(sx,sy,sr,0,Math.PI*2); c.stroke();
    c.fillStyle=saltCol; c.font=`bold ${Math.max(18,w*0.045)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(salt, sx, sy-8);
    c.font=`${Math.max(10,w*0.018)}px Tajawal`; c.fillStyle='#555';
    c.fillText(saltName, sx, sy+sr*0.55);

    // Equation
    const eby=h*0.62, ebh=h*0.12;
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.strokeStyle=saltCol+'44'; c.lineWidth=2; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.stroke();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(11,w*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(`${acids[ai]} + ${bases[bi]} → ${salt} + H₂O`, w/2, eby+ebh/2);

    // Acid column label
    c.fillStyle='#C0392B'; c.font=`bold ${Math.max(12,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('الحمض: '+acids[ai], w*0.25, h*0.55);
    // Base column label
    c.fillStyle='#27AE60'; c.fillText('القاعدة: '+bases[bi], w*0.75, h*0.55);

    // Salt type note
    const typeNote=ai===0?'كلوريد ← من HCl':ai===1?'كبريتات ← من H₂SO₄':'نترات ← من HNO₃';
    c.fillStyle='rgba(107,78,154,0.7)'; c.font=`${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('💡 '+typeNote, w/2, h*0.79);
    c.fillText('القاعدة تُحدد شقّ الفلز في الملح 🔑', w/2, h*0.83);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-2 TAB 1: حمض + فلز نشيط ───
function simG9SaltMetal1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selMetal:0, reacting:false, bubbles:[], progress:0};
  const S=simState;

  const metals=[
    {metal:'Mg',acid:'H₂SO₄',salt:'MgSO₄',name:'كبريتات الماغنيسيوم',col:'#9B59B6',eq:'Mg(s) + H₂SO₄(aq) → MgSO₄(aq) + H₂(g)'},
    {metal:'Zn',acid:'HCl',salt:'ZnCl₂',name:'كلوريد الزنك',col:'#1A8FA8',eq:'Zn(s) + 2HCl(aq) → ZnCl₂(aq) + H₂(g)'},
    {metal:'Fe',acid:'H₂SO₄',salt:'FeSO₄',name:'كبريتات الحديد(II)',col:'#D4901A',eq:'Fe(s) + H₂SO₄(aq) → FeSO₄(aq) + H₂(g)'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💥 فلز + حمض → ملح + هيدروجين</div>
      <div class="ctrl-btns-grid-1">
        ${metals.map((m,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="met-btn-${i}" onclick="simState.selMetal=${i};simState.reacting=false;simState.progress=0;simState.bubbles=[];document.querySelectorAll('[id^=met-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${m.metal} + ${m.acid}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn action" onclick="simState.reacting=true">⚗️ أدخِل الفلز</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.reacting=false;simState.progress=0;simState.bubbles=[]">🔄 إعادة</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج عن الهيدروجين الناتج؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">يتصاعد غاز الهيدروجين كفقاعات يمكن اختباره بعود مشتعل (يُسمع صوت فرقعة). الفلز يحلّ محل الهيدروجين في الحمض ليكوّن الملح. الفلزات الأكثر نشاطاً تتفاعل أسرع!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9saltmetal'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.reacting && S.progress<100) S.progress+=0.4;
    const m=metals[S.selMetal||0];
    const prog=S.progress||0;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FFF3E0'); bg.addColorStop(1,'#FFE0B2');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Beaker with acid
    const bx=w*0.2, by=h*0.12, bw=w*0.6, bh=h*0.6;
    c.fillStyle=`rgba(231,76,60,${0.15+0.05*Math.sin(S.t*0.05)})`; c.fillRect(bx,by+bh*0.05,bw,bh*0.95);
    c.strokeStyle='#90A4AE'; c.lineWidth=4;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();
    c.fillStyle='rgba(231,76,60,0.5)'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='left'; c.textBaseline='alphabetic';
    c.fillText(m.acid+'(aq)', bx+8, by+bh-8);

    // Metal strip
    if(S.reacting){
      const metH=bh*(1-prog/110);
      const mx=bx+bw/2;
      c.fillStyle=m.col; c.beginPath(); c.roundRect(mx-12, by+bh*0.05, 24, metH, 4); c.fill();
      c.strokeStyle=m.col+'88'; c.lineWidth=2; c.beginPath(); c.roundRect(mx-12, by+bh*0.05, 24, metH, 4); c.stroke();
      c.fillStyle='#fff'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(m.metal, mx, by+bh*0.12);

      // H2 Bubbles
      if(Math.random()<0.35) S.bubbles.push({x:bx+bw*0.3+Math.random()*bw*0.4, y:by+bh*0.8, r:2+Math.random()*4, vy:-1.2-Math.random()*1.8});
      S.bubbles=S.bubbles.filter(b=>b.y>by-10);
      S.bubbles.forEach(b=>{ b.y+=b.vy; b.x+=Math.sin(b.y*0.08)*1.5; c.strokeStyle='rgba(52,152,219,0.7)'; c.lineWidth=1.5; c.beginPath(); c.arc(b.x,b.y,b.r,0,Math.PI*2); c.stroke(); });

      // H2 label
      c.fillStyle='#3498DB'; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('H₂(g) ↑', bx+bw/2, by-8);
    } else {
      // Show metal next to beaker
      const mx=bx-Math.min(w*0.10,50), my=by+bh*0.3;
      c.fillStyle=m.col+'33'; c.beginPath(); c.roundRect(mx,my,Math.min(w*0.09,42),bh*0.3,6); c.fill();
      c.strokeStyle=m.col; c.lineWidth=2.5; c.beginPath(); c.roundRect(mx,my,Math.min(w*0.09,42),bh*0.3,6); c.stroke();
      c.fillStyle=m.col; c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(m.metal, mx+Math.min(w*0.045,21), my+bh*0.15);
    }

    // Salt coloring of solution
    if(prog>40){
      const alpha=Math.min((prog-40)/50,0.35);
      c.fillStyle=m.col+Math.floor(alpha*255).toString(16).padStart(2,'0'); c.fillRect(bx+2,by+bh*0.05,bw-4,bh*0.95);
      c.fillStyle=m.col; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='right'; c.textBaseline='alphabetic';
      c.fillText(m.salt+'(aq)', bx+bw-8, by+bh-8);
    }

    // Equation
    const eby=h*0.78, ebh=h*0.11;
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(m.eq, w/2, eby+ebh/2);

    // Title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('فلز + حمض → ملح + هيدروجين ↑', w/2, h*0.08);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-2 TAB 2: حمض + كربونات ───
function simG9SaltMetal2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, reacting:false, bubbles:[], progress:0, selIdx:0};
  const S=simState;

  const carbonates=[
    {carb:'CaCO₃', acid:'HCl', salt:'CaCl₂', co2:'CO₂', eq:'CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)'},
    {carb:'Na₂CO₃', acid:'H₂SO₄', salt:'Na₂SO₄', co2:'CO₂', eq:'Na₂CO₃(aq) + H₂SO₄(aq) → Na₂SO₄(aq) + H₂O(l) + CO₂(g)'},
    {carb:'MgCO₃', acid:'HCl', salt:'MgCl₂', co2:'CO₂', eq:'MgCO₃(s) + 2HCl(aq) → MgCl₂(aq) + H₂O(l) + CO₂(g)'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌬️ كربونات + حمض → ملح + ماء + CO₂</div>
      <div class="ctrl-btns-grid-1">
        ${carbonates.map((ca,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="carb-btn-${i}" onclick="simState.selIdx=${i};simState.reacting=false;simState.progress=0;simState.bubbles=[];document.querySelectorAll('[id^=carb-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${ca.carb} + ${ca.acid}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn action" onclick="simState.reacting=true">⚗️ أضِف الحمض</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.reacting=false;simState.progress=0;simState.bubbles=[]">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">الكربونات + حمض → ثلاثة نواتج:<br>ملح + ماء + غاز CO₂ ↑<br>الفوران دليل على CO₂!</div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">تفاعل الكربونات ينتج 3 مواد! CO₂ يمكن اختباره بماء الجير (يُعكّره). هذا مختلف عن الفلز+حمض الذي ينتج H₂. الكربونات لا تُنتج هيدروجيناً!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9saltmetal'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.reacting && S.progress<100) S.progress+=0.45;
    const ca=carbonates[S.selIdx||0];
    const prog=S.progress||0;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E8F5E9'); bg.addColorStop(1,'#A5D6A7');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('كربونات + حمض → ملح + ماء + CO₂', w/2, h*0.07);

    // Beaker
    const bx=w*0.2, by=h*0.13, bw=w*0.6, bh=h*0.55;
    c.fillStyle=`rgba(231,76,60,0.15)`; c.fillRect(bx,by+bh*0.4,bw,bh*0.6);
    // Carbonate solid at bottom
    if(prog<80){
      for(let i=0;i<15;i++){
        c.fillStyle='rgba(180,180,180,0.8)'; c.beginPath(); c.arc(bx+15+Math.random()*(bw-30),by+bh*0.6+Math.random()*bh*0.3,4+Math.random()*6,0,Math.PI*2); c.fill();
      }
    }
    c.strokeStyle='#90A4AE'; c.lineWidth=4;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();

    if(S.reacting){
      // Foam / bubbles (CO2)
      if(Math.random()<0.45) S.bubbles.push({x:bx+bw*0.2+Math.random()*bw*0.6, y:by+bh*0.65+Math.random()*bh*0.2, r:3+Math.random()*6, vy:-2-Math.random()*2.5});
      S.bubbles=S.bubbles.filter(b=>b.y>by-10);
      S.bubbles.forEach(b=>{ b.y+=b.vy; b.x+=Math.sin(b.y*0.06)*2; c.strokeStyle='rgba(100,180,100,0.75)'; c.lineWidth=2; c.beginPath(); c.arc(b.x,b.y,b.r,0,Math.PI*2); c.stroke(); });

      // Foam cap
      for(let i=0;i<20;i++){
        const fx=bx+Math.random()*bw, fy=by+bh*0.38+Math.random()*bh*0.05;
        c.fillStyle='rgba(255,255,255,0.7)'; c.beginPath(); c.arc(fx,fy,3+Math.random()*5,0,Math.PI*2); c.fill();
      }
      c.fillStyle='rgba(100,180,100,0.8)'; c.font=`bold ${Math.max(11,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('CO₂(g) ↑ — يُعكّر ماء الجير', w/2, by-8);
    } else {
      c.fillStyle='#7A8A98'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(ca.carb+' — كربونات', w/2, by+bh-8);
    }

    // Equation
    const eby=h*0.76, ebh=h*0.12;
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(w*0.03,eby,w*0.94,ebh,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(ca.eq, w/2, eby+ebh/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-2 TAB 3: تفاعل CaCO₃ مع HCl بالتفصيل ───
function simG9SaltMetal3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, step:0};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">⚗️ تفاعل CaCO₃ + 2HCl بالتفصيل</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn" onclick="simState.step=Math.max(0,simState.step-1)">⬅️ رجوع</button>
        <button class="ctrl-btn action" onclick="simState.step=Math.min(4,simState.step+1)">التالي ➡️</button>
      </div>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.step=0">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>المعادلة الأيونية الصافية:</b><br>
      2H⁺(aq) + CaCO₃(s) →<br>
      Ca²⁺(aq) + H₂O(l) + CO₂(g)
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا تتفاعل الكربونات مع الأحماض؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">أيونات H⁺ تهاجم أيون CO₃²⁻ وتكسره إلى CO₂ وH₂O. CO₂ لا يذوب كثيراً في الماء فيتصاعد كغاز. الفوران الذي نراه هو هذا الغاز!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  const stepsTxt=[
    'الخطوة ١: المواد المتفاعلة — رخام CaCO₃ وحمض HCl',
    'الخطوة ٢: تأيُّن الحمض — HCl → H⁺ + Cl⁻',
    'الخطوة ٣: هجوم H⁺ على CaCO₃',
    'الخطوة ٤: تكوين النواتج — CaCl₂ + H₂O + CO₂',
    'الخطوة ٥: المعادلة الأيونية الصافية الموزونة',
  ];

  function draw(){
    if(currentSim!=='g9saltmetal'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const st=S.step||0;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FCE4EC'); bg.addColorStop(1,'#F8BBD0');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Step indicator dots
    [0,1,2,3,4].forEach(i=>{
      c.fillStyle=i<=st?'#C0392B':'rgba(0,0,0,0.15)';
      c.beginPath(); c.arc(w*0.1+i*w*0.2,h*0.07,Math.min(w,h)*0.022,0,Math.PI*2); c.fill();
    });

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText(stepsTxt[st], w/2, h*0.17);

    if(st===0){
      // Show solid marble + acid beaker
      c.fillStyle='#90A4AE88'; c.beginPath(); c.roundRect(w*0.1,h*0.25,w*0.3,h*0.4,10); c.fill();
      c.strokeStyle='#607D8B'; c.lineWidth=2; c.beginPath(); c.roundRect(w*0.1,h*0.25,w*0.3,h*0.4,10); c.stroke();
      c.fillStyle='#455A64'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('CaCO₃', w*0.25, h*0.45);
      c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#78909C'; c.fillText('رخام/حجر جيري (s)', w*0.25, h*0.55);

      c.fillStyle='rgba(231,76,60,0.2)'; c.beginPath(); c.roundRect(w*0.6,h*0.25,w*0.3,h*0.4,10); c.fill();
      c.strokeStyle='#C0392B'; c.lineWidth=2; c.beginPath(); c.roundRect(w*0.6,h*0.25,w*0.3,h*0.4,10); c.stroke();
      c.fillStyle='#C0392B'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('HCl', w*0.75, h*0.45);
      c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#E74C3C'; c.fillText('حمض (aq)', w*0.75, h*0.55);
    }

    if(st===1){
      // HCl splitting
      const ions=[{l:'H⁺',x:w*0.3,col:'#C0392B'},{l:'Cl⁻',x:w*0.7,col:'#7F8C8D'}];
      c.fillStyle='rgba(231,76,60,0.15)'; c.beginPath(); c.roundRect(w*0.1,h*0.28,w*0.8,h*0.15,12); c.fill();
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('HCl', w*0.5, h*0.355);
      const sep=Math.sin(S.t*0.05)*5+20;
      ions.forEach(ion=>{
        c.fillStyle=ion.col+'33'; c.beginPath(); c.arc(ion.x+(ion.l==='H⁺'?-sep:sep),h*0.55,Math.min(w,h)*0.09,0,Math.PI*2); c.fill();
        c.strokeStyle=ion.col; c.lineWidth=2; c.beginPath(); c.arc(ion.x+(ion.l==='H⁺'?-sep:sep),h*0.55,Math.min(w,h)*0.09,0,Math.PI*2); c.stroke();
        c.fillStyle=ion.col; c.font=`bold ${Math.max(14,w*0.028)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(ion.l, ion.x+(ion.l==='H⁺'?-sep:sep), h*0.55);
      });
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(16,w*0.030)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('→', w*0.5, h*0.55);
    }

    if(st===2){
      // H+ attacking CaCO3
      const angle=S.t*0.06;
      const cx2=w*0.6, cy2=h*0.48, cr=Math.min(w,h)*0.12;
      c.fillStyle='#90A4AE33'; c.beginPath(); c.arc(cx2,cy2,cr,0,Math.PI*2); c.fill();
      c.strokeStyle='#607D8B'; c.lineWidth=3; c.beginPath(); c.arc(cx2,cy2,cr,0,Math.PI*2); c.stroke();
      c.fillStyle='#455A64'; c.font=`bold ${Math.max(12,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('CaCO₃', cx2, cy2);
      // H+ orbiting
      const hx=cx2+Math.cos(angle)*(cr+25), hy=cy2+Math.sin(angle)*(cr+25);
      const hx2=cx2+Math.cos(angle+Math.PI)*(cr+25), hy2=cy2+Math.sin(angle+Math.PI)*(cr+25);
      [[hx,hy],[hx2,hy2]].forEach(([px,py])=>{
        c.fillStyle='#FFCDD2'; c.beginPath(); c.arc(px,py,Math.min(w,h)*0.05,0,Math.PI*2); c.fill();
        c.strokeStyle='#C0392B'; c.lineWidth=2; c.beginPath(); c.arc(px,py,Math.min(w,h)*0.05,0,Math.PI*2); c.stroke();
        c.fillStyle='#C0392B'; c.font=`bold ${Math.max(12,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText('H⁺', px, py);
      });
    }

    if(st===3){
      const products=[{f:'CaCl₂',n:'ملح',col:'#27AE60',x:w*0.2},{f:'H₂O',n:'ماء',col:'#1A8FA8',x:w*0.5},{f:'CO₂↑',n:'غاز',col:'#8E44AD',x:w*0.8}];
      products.forEach(p=>{
        const bounce=Math.sin(S.t*0.06+p.x)*5;
        c.shadowBlur=15; c.shadowColor=p.col+'66';
        c.fillStyle=p.col+'22'; c.beginPath(); c.arc(p.x,h*0.45+bounce,Math.min(w,h)*0.1,0,Math.PI*2); c.fill();
        c.shadowBlur=0; c.strokeStyle=p.col; c.lineWidth=2.5; c.beginPath(); c.arc(p.x,h*0.45+bounce,Math.min(w,h)*0.1,0,Math.PI*2); c.stroke();
        c.fillStyle=p.col; c.font=`bold ${Math.max(12,w*0.022)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(p.f, p.x, h*0.45+bounce-5);
        c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#666';
        c.fillText(p.n, p.x, h*0.45+bounce+Math.min(w,h)*0.10+8);
      });
    }

    if(st===4){
      const ebx=w*0.04, eby=h*0.26, ebw=w*0.92;
      const eqs=['CaCO₃(s) + 2HCl(aq) → CaCl₂(aq) + H₂O(l) + CO₂(g)','2H⁺(aq) + CaCO₃(s) → Ca²⁺(aq) + H₂O(l) + CO₂(g)'];
      const labels=['المعادلة الرمزية الكاملة:','المعادلة الأيونية الصافية:'];
      eqs.forEach((eq,i)=>{
        const ebh=h*0.10;
        c.fillStyle=i===1?'rgba(39,174,96,0.15)':'rgba(255,255,255,0.8)'; c.beginPath(); c.roundRect(ebx,eby+i*(ebh+h*0.03),ebw,ebh,10); c.fill();
        c.fillStyle='#7A8A98'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
        c.fillText(labels[i], w/2, eby+i*(ebh+h*0.03)+4);
        c.fillStyle=i===1?'#27AE60':'#1E2D3D'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textBaseline='middle';
        c.fillText(eq, w/2, eby+i*(ebh+h*0.03)+ebh*0.65);
      });
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-3 TAB 1: الطريقة أ: فلز + حمض ───
function simG9SaltMake1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, step:0};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔬 خطوات تحضير الملح الذائب</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn" onclick="simState.step=Math.max(0,simState.step-1)">⬅️ رجوع</button>
        <button class="ctrl-btn action" onclick="simState.step=Math.min(4,simState.step+1)">التالي ➡️</button>
      </div>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.step=0">🔄 من البداية</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>لتحضير MgSO₄:</b><br>
      Mg (فائض) + H₂SO₄ → MgSO₄ + H₂↑
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا نُضيف الفلز بالفائض؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">لضمان استهلاك كل الحمض كلياً حتى لا يبقى حمض حرّ في المحلول. الفائض من الفلز نُزيله بالترشيح. إذا ترك الحمض يُفسد نقاوة الملح!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  const steps=[
    {title:'الخطوة ١: أضِف فائضاً من المعدن إلى الحمض', icon:'⚗️'},
    {title:'الخطوة ٢: قلِّب حتى يتوقف الفوران', icon:'🌀'},
    {title:'الخطوة ٣: رشِّح المحلول لإزالة الفائض', icon:'🔽'},
    {title:'الخطوة ٤: سخِّن لتبخير الماء', icon:'🔥'},
    {title:'الخطوة ٥: برِّد للحصول على البلورات ✅', icon:'❄️'},
  ];
  const colors=['#C0392B','#E67E22','#1A8FA8','#E74C3C','#3498DB'];

  function draw(){
    if(currentSim!=='g9saltmake'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const st=S.step||0;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F1F8E9'); bg.addColorStop(1,'#DCEDC8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Step tracker
    steps.forEach((s,i)=>{
      const sx=w*0.08+i*w*0.18, sy=h*0.08;
      c.fillStyle=i<st?'#27AE60':i===st?colors[st]:'rgba(0,0,0,0.12)';
      c.beginPath(); c.arc(sx,sy,Math.min(w,h)*0.028,0,Math.PI*2); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(s.icon, sx, sy);
    });

    // Step title
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText(steps[st].title, w/2, h*0.18);

    const bx=w*0.2, by=h*0.22, bw=w*0.6, bh=h*0.5;

    if(st===0){
      // Acid in beaker
      c.fillStyle='rgba(231,76,60,0.2)'; c.fillRect(bx,by+bh*0.3,bw,bh*0.7);
      c.strokeStyle='#90A4AE'; c.lineWidth=3; c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();
      c.fillStyle='rgba(231,76,60,0.5)'; c.font=`${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('H₂SO₄(aq)', w/2, by+bh-8);
      // Metal being added
      const bounce=Math.abs(Math.sin(S.t*0.04))*bh*0.1;
      c.fillStyle='#9B59B6'; c.beginPath(); c.roundRect(w*0.46,by-bounce,bw*0.08,bh*0.15,4); c.fill();
      c.fillStyle='white'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('Mg', w*0.5, by-bounce+bh*0.075);
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('↓ فائض من المعدن', w*0.5, by+bh+24);
    }

    if(st===1){
      // Stirring with bubbles
      c.fillStyle='rgba(155,89,182,0.2)'; c.fillRect(bx,by+bh*0.3,bw,bh*0.7);
      c.strokeStyle='#90A4AE'; c.lineWidth=3; c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();
      for(let i=0;i<15;i++){
        const bpx=bx+10+Math.random()*(bw-20), bpy=by+bh*0.35+Math.random()*bh*0.55;
        c.strokeStyle='rgba(52,152,219,0.6)'; c.lineWidth=1.5; c.beginPath(); c.arc(bpx,bpy,3+Math.random()*4,0,Math.PI*2); c.stroke();
      }
      // Stirring rod animation
      const ang=S.t*0.1;
      const rx=w*0.5+Math.cos(ang)*bw*0.15, ry=by+bh*0.4+Math.sin(ang)*bh*0.08;
      c.strokeStyle='#8E44AD'; c.lineWidth=5; c.lineCap='round';
      c.beginPath(); c.moveTo(w*0.5,by); c.lineTo(rx,ry); c.stroke();
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('تقليب مستمر — H₂↑ تتصاعد حتى يتوقف الفوران', w/2, by+bh+24);
    }

    if(st===2){
      // Filter funnel
      c.strokeStyle='#90A4AE'; c.lineWidth=2;
      c.beginPath(); c.moveTo(w*0.3,by); c.lineTo(w*0.5,by+bh*0.35); c.lineTo(w*0.7,by); c.stroke();
      c.beginPath(); c.arc(w*0.5,by,bw*0.37,0,Math.PI,true); c.stroke();
      // Filter paper
      c.fillStyle='rgba(255,255,255,0.6)'; c.beginPath(); c.moveTo(w*0.3,by); c.lineTo(w*0.5,by+bh*0.35); c.lineTo(w*0.7,by); c.closePath(); c.fill();
      // Solid residue on filter
      c.fillStyle='#9B59B6'; c.beginPath(); c.arc(w*0.5,by+bh*0.12,bw*0.06,0,Math.PI*2); c.fill();
      c.fillStyle='white'; c.font=`${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('Mg↑', w*0.5, by+bh*0.12);
      // Filtrate dripping
      const dropY=by+bh*0.35+Math.abs(Math.sin(S.t*0.04))*(bh*0.3);
      c.fillStyle='rgba(26,143,168,0.6)'; c.beginPath(); c.arc(w*0.5,dropY,6,0,Math.PI*2); c.fill();
      c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('MgSO₄(aq) — محلول الملح', w*0.5, by+bh+24);
    }

    if(st===3){
      // Evaporation
      c.fillStyle='rgba(26,143,168,0.3)'; c.fillRect(bx,by+bh*0.7,bw,bh*0.3);
      c.strokeStyle='#90A4AE'; c.lineWidth=3; c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();
      // Steam
      for(let i=0;i<8;i++){
        const sx2=bx+bw*0.2+i*(bw*0.08), sy2=by+bh*0.6-Math.abs(Math.sin(S.t*0.05+i))*bh*0.3;
        c.fillStyle=`rgba(255,255,255,${0.3+0.4*Math.random()})`;
        c.beginPath(); c.arc(sx2,sy2,5+Math.random()*8,0,Math.PI*2); c.fill();
      }
      // Heat source
      c.fillStyle='#E74C3C'; c.font=`${Math.max(20,w*0.04)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('🔥', w*0.5, by+bh+20);
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`;
      c.fillText('التسخين لتبخير الماء — يزيد تركيز المحلول', w*0.5, by+bh+38);
    }

    if(st===4){
      // Crystal formation
      c.fillStyle='rgba(52,152,219,0.15)'; c.fillRect(bx,by+bh*0.75,bw,bh*0.25);
      c.strokeStyle='#90A4AE'; c.lineWidth=3; c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();
      // Crystals (hexagons)
      const crystals=[[w*0.3,by+bh*0.82],[w*0.45,by+bh*0.79],[w*0.6,by+bh*0.83],[w*0.38,by+bh*0.87],[w*0.55,by+bh*0.86]];
      crystals.forEach(([cx2,cy2])=>{
        const cr=Math.min(w,h)*0.04*(0.9+0.1*Math.sin(S.t*0.04));
        c.fillStyle='rgba(52,152,219,0.4)'; c.strokeStyle='#3498DB'; c.lineWidth=2;
        c.beginPath();
        for(let i=0;i<6;i++){ const a=i*Math.PI/3; c.lineTo(cx2+cr*Math.cos(a),cy2+cr*Math.sin(a)); }
        c.closePath(); c.fill(); c.stroke();
      });
      c.fillStyle='#27AE60'; c.font=`bold ${Math.max(12,w*0.025)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('✅ بلورات MgSO₄ النقية!', w*0.5, by+bh+24);
      c.fillStyle='#3498DB'; c.font=`${Math.max(9,w*0.016)}px Tajawal`;
      c.fillText('❄️ التبريد يُرسّب البلورات من المحلول', w*0.5, by+bh+40);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-3 TAB 2: التبخير والتبلور ───
function simG9SaltMake2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, temp:25, heating:false, crystals:[], phase:'liquid'};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">💎 التبخير والتبلور</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn stop" id="heat-btn" onclick="simState.heating=true;this.disabled=true;document.getElementById('cool-btn').disabled=false">🔥 سخِّن</button>
        <button class="ctrl-btn action" id="cool-btn" disabled onclick="simState.heating=false;document.getElementById('heat-btn').disabled=false">❄️ برِّد</button>
      </div>
      <button class="ctrl-btn" style="margin-top:6px" onclick="simState.temp=25;simState.heating=false;simState.crystals=[];simState.phase='liquid';document.getElementById('heat-btn').disabled=false;document.getElementById('cool-btn').disabled=true">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      📈 عند التسخين: تتبخر المياه ويزيد التركيز<br>
      ❄️ عند التبريد: تنبثق البلورات من المحلول
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">الذوبانية تتناقص عند التبريد، لذا يترسّب الملح الزائد على هيئة بلورات. البلورات نقية لأن الشوائب لا تترسّب معها — هذه طريقة التنقية بالتبلور!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9saltmake'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.heating && S.temp<100) S.temp=Math.min(100, S.temp+0.3);
    if(!S.heating && S.temp>20) S.temp=Math.max(20, S.temp-0.2);
    if(S.temp>85 && S.crystals.length===0) S.phase='evap';
    if(S.temp<50 && S.phase==='evap') S.phase='crystal';
    if(S.phase==='crystal' && Math.random()<0.08 && S.crystals.length<20)
      S.crystals.push({x:w*0.22+Math.random()*(w*0.56), y:h*0.65+Math.random()*h*0.18, size:3+Math.random()*10});

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E3F2FD'); bg.addColorStop(1,'#BBDEFB');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Temperature gauge
    const gaugeX=w*0.85, gaugeY=h*0.1, gaugeH=h*0.6;
    c.fillStyle='rgba(255,255,255,0.7)'; c.beginPath(); c.roundRect(gaugeX-18,gaugeY,36,gaugeH,18); c.fill();
    c.strokeStyle='#90A4AE'; c.lineWidth=2; c.beginPath(); c.roundRect(gaugeX-18,gaugeY,36,gaugeH,18); c.stroke();
    const fillH=gaugeH*(S.temp/100);
    const tempCol=S.temp>70?'#C0392B':S.temp>40?'#E67E22':'#3498DB';
    c.fillStyle=tempCol; c.beginPath(); c.roundRect(gaugeX-16,gaugeY+gaugeH-fillH+2,32,fillH-4,14); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.019)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText(Math.round(S.temp)+'°C', gaugeX, gaugeY+gaugeH+18);
    c.fillText('🌡️', gaugeX, gaugeY-12);

    // Beaker
    const bx=w*0.12, by=h*0.18, bw=w*0.66, bh=h*0.56;
    const waterLevel=bh*(1-Math.max(0,(S.temp-30)/80)*0.6);
    c.fillStyle=S.temp>70?'rgba(231,76,60,0.2)':'rgba(26,143,168,0.25)';
    c.fillRect(bx,by+bh-waterLevel,bw,waterLevel);
    // Steam
    if(S.temp>70){
      for(let i=0;i<6;i++){
        const sx=bx+bw*0.15+i*(bw*0.12), sy=by+bh*0.2-Math.abs(Math.sin(S.t*0.04+i))*h*0.15;
        c.fillStyle=`rgba(255,255,255,${0.2+0.3*Math.random()})`;
        c.beginPath(); c.arc(sx,sy,6+Math.random()*8,0,Math.PI*2); c.fill();
      }
    }
    c.strokeStyle='#90A4AE'; c.lineWidth=4;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();

    // Crystals
    S.crystals.forEach(cr=>{
      const pulse=0.9+0.1*Math.sin(S.t*0.05);
      c.fillStyle='rgba(52,152,219,0.4)'; c.strokeStyle='#2980B9'; c.lineWidth=1.5;
      c.beginPath();
      for(let i=0;i<6;i++){ const a=i*Math.PI/3; c.lineTo(cr.x+cr.size*pulse*Math.cos(a),cr.y+cr.size*pulse*Math.sin(a)); }
      c.closePath(); c.fill(); c.stroke();
    });

    // Status text
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    const status=S.phase==='crystal'?'💎 تتكوّن البلورات!':S.temp>70?'🔥 يتبخر الماء...':S.temp>40?'♨️ يتركز المحلول':'💧 محلول الملح';
    c.fillText(status, w*0.45, by+bh+28);
    c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#7A8A98';
    if(S.crystals.length>0) c.fillText('عدد البلورات: '+S.crystals.length, w*0.45, by+bh+44);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-3 TAB 3: تحضير CuSO₄ مخبرياً ───
function simG9SaltMake3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, stage:0, progress:0};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧫 تحضير كبريتات النحاس CuSO₄</div>
      <div class="ctrl-btns-grid">
        <button class="ctrl-btn" onclick="simState.stage=Math.max(0,simState.stage-1);simState.progress=0">⬅️ رجوع</button>
        <button class="ctrl-btn action" onclick="simState.stage=Math.min(3,simState.stage+1);simState.progress=0">التالي ➡️</button>
      </div>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>التفاعل:</b><br>
      CuO(s) + H₂SO₄(aq) →<br>
      CuSO₄(aq) + H₂O(l)<br>
      <b>اللون:</b> أزرق مميز 💙
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ لماذا CuSO₄ أزرق اللون؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">أيونات Cu²⁺ تمتص الضوء الأحمر والأصفر وتعكس الأزرق. عند التجفيف (CuSO₄ اللامائي) يصبح أبيض — يُستخدم لاختبار وجود الماء: يصبح أزرق عند تبلله!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  const stages=[
    {title:'أضِف أكسيد النحاس(II) الأسود إلى H₂SO₄'},
    {title:'سخِّن مع التقليب حتى يذوب الأكسيد'},
    {title:'رشِّح المحلول الأزرق لإزالة الفائض'},
    {title:'✅ بخِّر وبرِّد → بلورات CuSO₄ الزرقاء'},
  ];

  function draw(){
    if(currentSim!=='g9saltmake'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    S.progress=Math.min(S.progress+0.5,100);
    const st=S.stage||0;
    const prog=S.progress/100;

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E0F7FA'); bg.addColorStop(1,'#B2EBF2');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Stage dots
    [0,1,2,3].forEach(i=>{ c.fillStyle=i<=st?'#1A8FA8':'rgba(0,0,0,0.12)'; c.beginPath(); c.arc(w*0.15+i*w*0.22,h*0.07,Math.min(w,h)*0.025,0,Math.PI*2); c.fill(); });
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText(stages[st].title, w/2, h*0.17);

    const bx=w*0.2, by=h*0.22, bw=w*0.6, bh=h*0.5;
    const blueAlpha=st>=1?Math.min(prog*0.6,0.5):0;

    // Liquid in beaker
    c.fillStyle=`rgba(231,76,60,${Math.max(0,0.15-blueAlpha)})`; c.fillRect(bx,by+bh*0.2,bw,bh*0.8);
    c.fillStyle=`rgba(26,143,168,${blueAlpha})`; c.fillRect(bx,by+bh*0.2,bw,bh*0.8);

    // CuO particles (stage 0)
    if(st===0){
      for(let i=0;i<20;i++){
        c.fillStyle='rgba(60,30,10,0.8)'; c.beginPath(); c.arc(bx+15+Math.random()*(bw-30),by+bh*0.25+Math.random()*bh*0.6,3+Math.random()*4,0,Math.PI*2); c.fill();
      }
    }

    // Steam (stage 1)
    if(st===1){
      for(let i=0;i<5;i++){
        const sx=bx+bw*0.2+i*(bw*0.15), sy=by+bh*0.1-Math.abs(Math.sin(S.t*0.04+i))*h*0.12;
        c.fillStyle=`rgba(255,255,255,${0.25+Math.random()*0.3})`; c.beginPath(); c.arc(sx,sy,5+Math.random()*7,0,Math.PI*2); c.fill();
      }
      c.fillStyle='#E74C3C'; c.font=`${Math.max(16,w*0.04)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('🔥', w/2, by+bh+28);
    }

    // Beaker outline
    c.strokeStyle='#90A4AE'; c.lineWidth=4;
    c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();

    // CuSO4 Crystals (stage 3)
    if(st===3){
      const crystN=Math.floor(S.t/30)+5;
      for(let i=0;i<Math.min(crystN,18);i++){
        const cx2=bx+bw*0.1+((i*73)%(bw*0.8)), cy2=by+bh*0.4+((i*37)%(bh*0.45));
        const cr=4+Math.sin(i)*4;
        c.fillStyle='rgba(26,143,168,0.7)'; c.strokeStyle='#0097A7'; c.lineWidth=2;
        c.beginPath();
        for(let j=0;j<6;j++){ const a=j*Math.PI/3; c.lineTo(cx2+cr*Math.cos(a),cy2+cr*Math.sin(a)); }
        c.closePath(); c.fill(); c.stroke();
      }
      c.fillStyle='#0097A7'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('💙 بلورات CuSO₄ · 5H₂O الزرقاء!', w/2, by+bh+28);
    }

    // Salt label
    if(st>=1 && st<3){
      c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('CuSO₄(aq) — محلول أزرق اللون', w/2, by+bh+28);
    }

    // Equation
    const eby=h*0.79, ebh=h*0.1;
    c.fillStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('CuO(s) + H₂SO₄(aq) → CuSO₄(aq) + H₂O(l)', w/2, eby+ebh/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-4 TAB 1: المعايرة (Titration) ───
function simG9SaltTitra1(){
  cancelAnimationFrame(animFrame);
  simState={t:0, vol:0, dropping:false, ph:1.5, done:false, drops:[]};
  const S=simState;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🌡️ المعايرة — قطرة بقطرة</div>
      <button class="ctrl-btn action" id="drop-btn" onclick="simState.dropping=true;this.textContent='⏸ وقف';this.onclick=function(){simState.dropping=false;this.textContent='▶ استمرار';this.onclick=function(){simState.dropping=true;this.textContent='⏸ وقف';}}">▶ أضِف القاعدة</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.vol=0;simState.ph=1.5;simState.done=false;simState.drops=[];simState.dropping=false;document.getElementById('drop-btn').textContent='▶ أضِف القاعدة'">🔄 إعادة</button>
    </div>
    <div class="info-box" style="margin-top:8px">
      <b>الإعداد:</b> HCl في المخروطية<br>
      <b>كاشف:</b> بضع قطرات فينولفتالين (عديم اللون في الحمض)<br>
      <b>السحاحة:</b> NaOH (القاعدة)
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج عن نقطة النهاية؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">عند تغيّر لون الكاشف من عديم اللون إلى وردي فاتح دائم (قطرة واحدة زائدة)، وصلنا لنقطة النهاية. الملح الناتج: NaCl. نقيس الحجم ونحسب التركيز!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9salttitra'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.dropping && !S.done){
      S.vol=Math.min(S.vol+0.15, 25);
      S.ph=Math.min(1.5+S.vol*0.45, 13);
      if(S.vol>=24.5) S.done=true;
      if(Math.random()<0.4) S.drops.push({x:w*0.5, y:h*0.12, vy:3, t:0});
    }
    S.drops=S.drops.filter(d=>d.y<h*0.6);
    S.drops.forEach(d=>{ d.y+=d.vy; d.t++; });

    const nearEnd=S.ph>6.5 && S.ph<8;
    const past=S.ph>=7;
    const solutionCol=past?'rgba(255,20,147,0.25)':'rgba(231,76,60,0.15)';

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#FFF3E0'); bg.addColorStop(1,'#FFCCBC');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // Burette (top)
    const bux=w*0.44, buy=h*0.02, buw=w*0.12, buh=h*0.42;
    c.fillStyle='rgba(26,143,168,0.3)'; c.fillRect(bux,buy,buw,buh*(1-S.vol/25));
    c.strokeStyle='#90A4AE'; c.lineWidth=2;
    c.beginPath(); c.moveTo(bux,buy); c.lineTo(bux,buy+buh); c.moveTo(bux+buw,buy); c.lineTo(bux+buw,buy+buh); c.stroke();
    // Volume markings
    for(let v=0;v<=25;v+=5){
      const my=buy+buh*(v/25);
      c.strokeStyle='rgba(0,0,0,0.3)'; c.lineWidth=1;
      c.beginPath(); c.moveTo(bux-5,my); c.lineTo(bux,my); c.stroke();
      c.fillStyle='#555'; c.font=`${Math.max(8,w*0.013)}px Tajawal`; c.textAlign='right'; c.textBaseline='middle';
      c.fillText(v, bux-6, my);
    }
    c.fillStyle='#1A8FA8'; c.font=`bold ${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('NaOH', bux+buw/2, buy+buh+12);
    c.fillStyle='#E74C3C'; c.font=`bold ${Math.max(9,w*0.016)}px Tajawal`;
    c.fillText(S.vol.toFixed(1)+' mL', bux+buw/2, buy+buh+26);

    // Drops falling
    S.drops.forEach(d=>{
      c.fillStyle='rgba(26,143,168,0.8)'; c.beginPath(); c.ellipse(d.x,d.y,4,6,0,0,Math.PI*2); c.fill();
    });

    // Conical flask
    const fx=w*0.28, fy=h*0.52, fw=w*0.44, fh=h*0.35;
    c.fillStyle=solutionCol;
    c.beginPath(); c.moveTo(fx+fw*0.3,fy); c.lineTo(fx,fy+fh); c.lineTo(fx+fw,fy+fh); c.lineTo(fx+fw*0.7,fy); c.closePath(); c.fill();
    c.strokeStyle='#90A4AE'; c.lineWidth=3;
    c.beginPath(); c.moveTo(fx+fw*0.3,fy); c.lineTo(fx,fy+fh); c.lineTo(fx+fw,fy+fh); c.lineTo(fx+fw*0.7,fy); c.stroke();
    c.beginPath(); c.roundRect(fx+fw*0.3,fy-h*0.06,fw*0.4,h*0.07,4); c.stroke();

    // pH indicator
    const phCol=S.ph<7?'rgba(231,76,60,0.8)':'rgba(255,20,147,0.8)';
    c.fillStyle=phCol; c.font=`bold ${Math.max(12,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('pH = '+S.ph.toFixed(1), fx+fw/2, fy+fh*0.55);

    // Endpoint
    if(S.done){
      c.shadowBlur=20; c.shadowColor='#FF69B4';
      c.fillStyle='rgba(255,20,147,0.15)'; c.beginPath(); c.moveTo(fx+fw*0.3,fy); c.lineTo(fx,fy+fh); c.lineTo(fx+fw,fy+fh); c.lineTo(fx+fw*0.7,fy); c.closePath(); c.fill();
      c.shadowBlur=0;
      c.fillStyle='#C2185B'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText('✅ نقطة النهاية! اللون وردي!', w/2, fy+fh+28);
      c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.fillStyle='#888';
      c.fillText('الملح الناتج: NaCl — كلوريد الصوديوم', w/2, fy+fh+44);
    }

    // Equation
    const eby=h*0.90, ebh=h*0.08;
    c.fillStyle='rgba(255,255,255,0.8)'; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(9,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('HCl(aq) + NaOH(aq) → NaCl(aq) + H₂O(l)', w/2, eby+ebh/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-4 TAB 2: الترسيب (Precipitation) ───
function simG9SaltTitra2(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selPpt:0, dropped:false, particles:[]};
  const S=simState;

  const ppts=[
    {a:'CuSO₄',b:'NaOH',ppt:'Cu(OH)₂',aq:'Na₂SO₄',col:'#1A8FA8',name:'هيدروكسيد النحاس(II)'},
    {a:'BaCl₂',b:'MgSO₄',ppt:'BaSO₄',aq:'MgCl₂',col:'#FAFAFA',name:'كبريتات الباريوم'},
    {a:'AgNO₃',b:'NaCl',ppt:'AgCl',aq:'NaNO₃',col:'#FFFFEE',name:'كلوريد الفضة'},
  ];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧊 الترسيب — تكوين راسب</div>
      <div class="ctrl-btns-grid-1">
        ${ppts.map((p,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="ppt-btn-${i}" onclick="simState.selPpt=${i};simState.dropped=false;simState.particles=[];document.querySelectorAll('[id^=ppt-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${p.a}+${p.b}</button>`).join('')}
      </div>
    </div>
    <div class="ctrl-section">
      <button class="ctrl-btn action" onclick="simState.dropped=true">➕ امزِج المحلولَين</button>
      <button class="ctrl-btn stop" style="margin-top:6px" onclick="simState.dropped=false;simState.particles=[]">🔄 إعادة</button>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ ماذا تستنتج عن الأملاح غير الذائبة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">بعض الأملاح غير قابلة للذوبان — تترسب فوراً عند المزج. الراسب ملح غير ذائب نجمعه بالترشيح. يُستخدم هذا لتحضير أملاح لا يمكن تحضيرها بالطرق الأخرى!</div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9salttitra'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const p=ppts[S.selPpt||0];
    if(S.dropped && Math.random()<0.15 && S.particles.length<50)
      S.particles.push({x:w*0.3+Math.random()*w*0.4, y:h*0.4+Math.random()*h*0.1, vy:1.5+Math.random()*2, settled:false});
    S.particles.forEach(pp=>{ if(!pp.settled){ pp.y+=pp.vy; if(pp.y>h*0.7) pp.settled=true; } });

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#F3E5F5'); bg.addColorStop(1,'#E1BEE7');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('الترسيب — تكوين ملح غير ذائب', w/2, h*0.07);

    if(!S.dropped){
      // Two separate beakers
      const beakers=[{x:w*0.08,label:p.a,col:'rgba(52,152,219,0.2)'},{x:w*0.56,label:p.b,col:'rgba(39,174,96,0.2)'}];
      beakers.forEach(bk=>{
        const bkx=bk.x, bky=h*0.2, bkw=w*0.32, bkh=h*0.5;
        c.fillStyle=bk.col; c.fillRect(bkx,bky,bkw,bkh);
        c.strokeStyle='#90A4AE'; c.lineWidth=3;
        c.beginPath(); c.moveTo(bkx,bky); c.lineTo(bkx,bky+bkh); c.lineTo(bkx+bkw,bky+bkh); c.lineTo(bkx+bkw,bky); c.stroke();
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(12,w*0.024)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
        c.fillText(bk.label, bkx+bkw/2, bky+bkh+20);
      });
      c.fillStyle='#6B4E9A'; c.font=`bold ${Math.max(16,w*0.032)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('+', w/2, h*0.45);
    } else {
      // Mixed beaker
      const bx=w*0.15, by=h*0.15, bw=w*0.7, bh=h*0.6;
      c.fillStyle='rgba(200,200,200,0.2)'; c.fillRect(bx,by,bw,bh);
      c.strokeStyle='#90A4AE'; c.lineWidth=4;
      c.beginPath(); c.moveTo(bx,by); c.lineTo(bx,by+bh); c.lineTo(bx+bw,by+bh); c.lineTo(bx+bw,by); c.stroke();

      // Settled precipitate layer
      const settled=S.particles.filter(p=>p.settled);
      if(settled.length>0){
        const layerH=Math.min(settled.length*2,60);
        c.fillStyle=p.col+'CC'; c.fillRect(bx+2,by+bh-layerH,bw-4,layerH);
        c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(10,w*0.020)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
        c.fillText(p.ppt+'↓ — '+p.name+' (راسب)', bx+bw/2, by+bh-layerH/2);
      }

      // Falling particles
      S.particles.filter(pp=>!pp.settled).forEach(pp=>{
        c.fillStyle=p.col+'AA'; c.beginPath(); c.arc(pp.x,pp.y,4,0,Math.PI*2); c.fill();
      });

      // Aqueous label
      c.fillStyle='#27AE60'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(p.aq+'(aq) يبقى في المحلول', bx+bw/2, by+20);
    }

    // Equation
    const eby=h*0.82, ebh=h*0.10;
    c.fillStyle='rgba(255,255,255,0.85)'; c.beginPath(); c.roundRect(w*0.04,eby,w*0.92,ebh,10); c.fill();
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(9,w*0.017)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(p.a+'(aq) + '+p.b+'(aq) → '+p.ppt+'(s)↓ + '+p.aq+'(aq)', w/2, eby+ebh/2);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─── 8-4 TAB 3: اختيار طريقة التحضير المناسبة ───
function simG9SaltTitra3(){
  cancelAnimationFrame(animFrame);
  simState={t:0, selSalt:0, answered:false, chosen:-1};
  const S=simState;

  const salts=[
    {name:'NaCl',full:'كلوريد الصوديوم',soluble:true, method:'معايرة (HCl + NaOH)',why:'كلاهما ذائب → نحتاج كاشفاً للتعادل'},
    {name:'MgSO₄',full:'كبريتات الماغنيسيوم',soluble:true, method:'Mg + H₂SO₄ (فائض+ترشيح)',why:'Mg فلز نشيط → حمض + فلز بالفائض'},
    {name:'Cu(OH)₂',full:'هيدروكسيد النحاس',soluble:false, method:'ترسيب (CuSO₄ + NaOH)',why:'غير ذائب → نُرسّبه من محلولين'},
    {name:'BaSO₄',full:'كبريتات الباريوم',soluble:false, method:'ترسيب (BaCl₂ + MgSO₄)',why:'غير ذائب جداً → ترسيب مباشر'},
  ];
  const methods=['معايرة','فلز + حمض (فائض)','أكسيد + حمض','ترسيب'];
  const methodColors=['#1A8FA8','#9B59B6','#E67E22','#27AE60'];

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎯 اختر طريقة تحضير الملح المناسبة</div>
      <div class="ctrl-btns-grid-1">
        ${salts.map((s,i)=>`<button class="ctrl-btn${i===0?' active':''}" id="salt-btn-${i}" onclick="simState.selSalt=${i};simState.answered=false;simState.chosen=-1;document.querySelectorAll('[id^=salt-btn-]').forEach((b,j)=>b.classList.toggle('active',j===${i}))">${s.name} (${s.soluble?'ذائب':'غير ذائب'})</button>`).join('')}
      </div>
    </div>
    <div class="q-box" style="margin-top:8px">
      <strong>❓ القاعدة العامة لاختيار الطريقة؟</strong>
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡</button>
      <div class="q-ans-panel">
        ✅ ذائب + كلاهما أيون → معايرة<br>
        ✅ ذائب + فلز نشيط → فائض + ترشيح<br>
        ✅ ذائب + أكسيد/كربونات → فائض + ترشيح + تبخير<br>
        ✅ غير ذائب → ترسيب مباشر
      </div>
    </div>`);

  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9salttitra'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    const salt=salts[S.selSalt||0];
    const correct=methods.indexOf(salt.method.split(' ')[0]);

    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#E8F5E9'); bg.addColorStop(1,'#C8E6C9');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.max(13,w*0.026)}px Tajawal`; c.textAlign='center';
    c.fillText('كيف نُحضِّر '+salt.name+' ('+salt.full+')?', w/2, h*0.08);

    // Solubility badge
    const sCol=salt.soluble?'#27AE60':'#C0392B';
    c.fillStyle=sCol+'22'; c.beginPath(); c.roundRect(w*0.36,h*0.12,w*0.28,h*0.07,20); c.fill();
    c.fillStyle=sCol; c.font=`bold ${Math.max(11,w*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(salt.soluble?'💧 ذائب في الماء':'🚫 غير ذائب', w*0.5, h*0.155);

    // Method buttons
    const optW=Math.min(w*0.43,190), optH=Math.min(h*0.10,44), gx=Math.min(w*0.04,16), gy=Math.min(h*0.03,12);
    methods.forEach((meth,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const ox=w*0.05+col*(optW+gx)+(w-2*optW-gx)*0.05;
      const oy=h*0.26+row*(optH+gy);
      const isChosen=S.chosen===i;
      const corrIdx=['معايرة','فلز','أكسيد','ترسيب'].findIndex(k=>salt.method.includes(k));
      const isCorrect=S.answered && i===corrIdx;
      const isWrong=S.answered && isChosen && i!==corrIdx;

      c.fillStyle=isCorrect?'rgba(39,174,96,0.2)':isWrong?'rgba(192,57,43,0.15)':isChosen?methodColors[i]+'22':'rgba(255,255,255,0.75)';
      c.beginPath(); c.roundRect(ox,oy,optW,optH,10); c.fill();
      c.strokeStyle=isCorrect?'#27AE60':isWrong?'#C0392B':isChosen?methodColors[i]:'#ccc';
      c.lineWidth=2; c.beginPath(); c.roundRect(ox,oy,optW,optH,10); c.stroke();
      c.fillStyle=isChosen?methodColors[i]:'#1E2D3D';
      c.font=`${Math.max(10,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(meth, ox+optW/2, oy+optH/2);
    });

    // Feedback
    if(S.answered){
      const fbx=w*0.05, fby=h*0.59, fbw=w*0.9, fbh=h*0.14;
      c.fillStyle='rgba(39,174,96,0.12)'; c.beginPath(); c.roundRect(fbx,fby,fbw,fbh,12); c.fill();
      c.fillStyle='#27AE60'; c.font=`bold ${Math.max(11,w*0.021)}px Tajawal`; c.textAlign='center'; c.textBaseline='top';
      c.fillText('✅ الطريقة الصحيحة: '+salt.method, w/2, fby+8);
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`;
      c.fillText('السبب: '+salt.why, w/2, fby+fbh*0.55);
    }

    // Hint
    c.fillStyle='#6B4E9A'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('💡 اضغط على الطريقة التي تختارها', w/2, h*0.56);

    animFrame=requestAnimationFrame(draw);
  }

  document.getElementById('simCanvas').onclick=function(e){
    if(S.answered) return;
    const rect=this.getBoundingClientRect(), mx=(e.clientX-rect.left)*(this.width/rect.width), my=(e.clientY-rect.top)*(this.height/rect.height);
    const w=this.width, h=this.height;
    const optW=Math.min(w*0.43,190), optH=Math.min(h*0.10,44), gx=Math.min(w*0.04,16), gy=Math.min(h*0.03,12);
    methods.forEach((m,i)=>{
      const col=i%2, row=Math.floor(i/2);
      const ox=w*0.05+col*(optW+gx)+(w-2*optW-gx)*0.05, oy=h*0.26+row*(optH+gy);
      if(mx>=ox&&mx<=ox+optW&&my>=oy&&my<=oy+optH){ S.chosen=i; S.answered=true; }
    });
  };
  draw();
}

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
  function draw(){
    if(currentSim!=='g9watergas'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.testing && S.progress<100) S.progress+=0.9;
    const gas=gases[S.gas||0];
    const prog=S.progress/100;
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,gas.bgCol); bg.addColorStop(1,'#FFFFFF');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    _lbl(c,`اختبار ${gas.name} بعود الثقاب`,w/2,h*0.07,gas.col,Math.max(13,w*0.025));
    // Test tube
    const tx=w*0.33, ty=h*0.13, tw=w*0.34, th=h*0.48;
    c.fillStyle=gas.col+'18'; c.beginPath(); c.roundRect(tx,ty,tw,th,8); c.fill();
    c.strokeStyle='#90A4AE'; c.lineWidth=3;
    c.beginPath(); c.moveTo(tx,ty); c.lineTo(tx,ty+th); c.arc(tx+tw/2,ty+th,tw/2,Math.PI,0); c.lineTo(tx+tw,ty); c.stroke();
    for(let i=0;i<10;i++){
      const px=tx+8+((i*53+S.t*0.3)%(tw-16));
      const py=ty+8+((i*71+S.t*0.4)%(th*0.8));
      c.fillStyle=gas.col+'88'; c.beginPath(); c.arc(px,py,3,0,Math.PI*2); c.fill();
    }
    _lbl(c,gas.name,tx+tw/2,ty+th+tw/2+20,gas.col,Math.max(11,w*0.021));
    // Stick coming down
    const stickX=w*0.74, stickTop=ty-h*0.06+prog*th*0.7;
    c.strokeStyle='#8D6E63'; c.lineWidth=5;
    c.beginPath(); c.moveTo(stickX,stickTop-20); c.lineTo(stickX,stickTop+h*0.10); c.stroke();
    if(S.gas===0 && prog>0.1 && prog<0.8){
      const gl=c.createRadialGradient(stickX,stickTop-22,0,stickX,stickTop-22,12);
      gl.addColorStop(0,'#FFF'); gl.addColorStop(0.4,'#FFA000'); gl.addColorStop(1,'transparent');
      c.fillStyle=gl; c.beginPath(); c.arc(stickX,stickTop-22,12,0,Math.PI*2); c.fill();
    }
    // Result
    if(S.progress>55){
      const ry=h*0.73, rh=h*0.18;
      if(S.gas===1 && prog>0.7){
        for(let sp=0;sp<12;sp++){
          const angle=sp*(Math.PI*2/12);
          const r2=h*0.06*(prog-0.5)*2;
          c.fillStyle=gas.col+'AA'; c.beginPath();
          c.arc(stickX+Math.cos(angle)*r2,stickTop-22+Math.sin(angle)*r2,3,0,Math.PI*2); c.fill();
        }
      }
      c.fillStyle=gas.col+'18'; c.beginPath(); c.roundRect(w*0.04,ry,w*0.92,rh,10); c.fill();
      _lbl(c,gas.result,w/2,ry+rh*0.35,gas.col,Math.max(12,w*0.023));
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(gas.resultSub,w/2,ry+rh*0.78);
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
    {name:'الكلور Cl₂', col:'#8D6E63', bgCol:'#FFF3E0', smell:'رائحة خانقة', test:'ورقة تبّاع الشمس الرطبة', result:'تتحوّل إلى الأبيض (مُبيَّضة)', resultIcon:'⬜', eq:'Cl₂ + H₂O → HCl + HOCl (حمضي + مُبيِّض)'},
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
      <div class="q-ans-panel">كلاهما برائحة نفاذة لكن: الأمونيا تُحوِّل ورقة تبّاع الشمس الحمراء إلى الأزرق (قلوية). الكلور يُبيِّض ورقة تبّاع الشمس الرطبة. CO₂ بلا رائحة ويُعكِّر ماء الجير فقط.</div>
    </div>`);
  const cv=document.getElementById('simCanvas');
  function draw(){
    if(currentSim!=='g9watergas'){cancelAnimationFrame(animFrame);return;}
    const c=cv.getContext('2d'),w=cv.width,h=cv.height;
    c.clearRect(0,0,w,h); S.t++;
    if(S.testing && S.progress<100) S.progress+=0.7;
    const gas=gases[S.gas||0];
    const prog=S.progress/100;
    const bg=c.createLinearGradient(0,0,0,h); bg.addColorStop(0,gas.bgCol); bg.addColorStop(1,'#fff');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    _lbl(c,gas.name,w/2,h*0.07,gas.col,Math.max(14,w*0.026));
    c.fillStyle='#777'; c.font=`${Math.max(10,w*0.018)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
    c.fillText('الرائحة: '+gas.smell,w/2,h*0.12);
    // Source flask
    const fx=w*0.06, fy=h*0.17, fw=w*0.25, fh=h*0.38;
    c.fillStyle=gas.col+'18'; c.beginPath(); c.ellipse(fx+fw/2,fy+fh*0.72,fw*0.42,fh*0.28,0,0,Math.PI*2); c.fill();
    c.fillStyle=gas.col+'28'; c.fillRect(fx+fw*0.28,fy,fw*0.44,fh*0.52);
    c.strokeStyle='#90A4AE'; c.lineWidth=2; c.strokeRect(fx+fw*0.28,fy,fw*0.44,fh*0.52);
    _lbl(c,gas.name,fx+fw/2,fy+fh+14,gas.col,Math.max(9,w*0.016));
    // Gas flow
    if(S.testing){
      for(let i=0;i<8;i++){
        const age=(S.t*0.02+i*0.125)%1;
        const gx=fx+fw*0.5+age*w*0.52;
        const gy2=fy+fh*0.28+Math.sin(age*8+i)*7;
        c.fillStyle=gas.col+(Math.round((1-age)*110).toString(16).padStart(2,'0'));
        c.beginPath(); c.arc(gx,gy2,3,0,Math.PI*2); c.fill();
      }
    }
    // Test indicator / beaker
    const tx2=w*0.62, ty2=h*0.17;
    if(S.gas===1){
      // CO₂ lime water beaker
      const bw3=w*0.30, bh3=h*0.38;
      const turb=prog*0.75;
      c.fillStyle=`rgba(200,200,200,${turb*0.7})`; c.fillRect(tx2,ty2+bh3*0.05,bw3,bh3*0.95);
      c.strokeStyle='#90A4AE'; c.lineWidth=3;
      c.beginPath(); c.moveTo(tx2,ty2); c.lineTo(tx2,ty2+bh3); c.lineTo(tx2+bw3,ty2+bh3); c.lineTo(tx2+bw3,ty2); c.stroke();
      _lbl(c,'ماء الجير',tx2+bw3/2,ty2+bh3+18,'#6B4E9A',Math.max(10,w*0.018));
      if(prog>0.4){
        c.fillStyle='rgba(210,210,210,0.9)'; c.fillRect(tx2,ty2+bh3*0.55,bw3,bh3*0.4);
        _lbl(c,'⚪ عكر',tx2+bw3/2,ty2+bh3*0.78,'#888',Math.max(10,w*0.018));
      }
    } else {
      // NH₃ / Cl₂ litmus strip
      const pw=w*0.15, ph=h*0.32;
      const r1=192, g1=57, b1=43;
      let r2,g2,b2;
      if(S.gas===0){r2=26;g2=143;b2=168;}else{r2=240;g2=240;b2=240;}
      const mixR=Math.round(r1*(1-prog)+r2*prog);
      const mixG=Math.round(g1*(1-prog)+g2*prog);
      const mixB=Math.round(b1*(1-prog)+b2*prog);
      c.fillStyle=`rgb(${mixR},${mixG},${mixB})`;
      c.fillRect(tx2+w*0.08,ty2+h*0.02,pw,ph);
      c.strokeStyle='#ccc'; c.lineWidth=1; c.strokeRect(tx2+w*0.08,ty2+h*0.02,pw,ph);
      _lbl(c,'ورقة تبّاع الشمس',tx2+w*0.08+pw/2,ty2+h*0.02+ph+18,'#555',Math.max(9,w*0.015));
    }
    if(S.progress>55){
      const ry=h*0.66, rh=h*0.21;
      c.fillStyle=gas.col+'12'; c.beginPath(); c.roundRect(w*0.04,ry,w*0.92,rh,10); c.fill();
      _lbl(c,'✅ '+gas.result,w/2,ry+rh*0.32,gas.col,Math.max(11,w*0.020));
      c.fillStyle='#555'; c.font=`${Math.max(9,w*0.016)}px Tajawal`; c.textAlign='center'; c.textBaseline='alphabetic';
      c.fillText(gas.eq,w/2,ry+rh*0.72);
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
    const mx=(e.clientX-rect.left)*(this.width/rect.width);
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
