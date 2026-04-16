function simConductors1() {
  cancelAnimationFrame(animFrame);
  var MATS = [
    {id:'cu',label:'نحاس',   icon:'🔩',c:true, col:'#B87333'},
    {id:'fe',label:'حديد',   icon:'🔧',c:true, col:'#888'},
    {id:'al',label:'ألمنيوم',icon:'🪙',c:true, col:'#AAA'},
    {id:'gr',label:'جرافيت', icon:'✏️',c:true, col:'#555'},
    {id:'pl',label:'بلاستيك',icon:'📏',c:false,col:'#E67E22'},
    {id:'wd',label:'خشب',    icon:'🪵',c:false,col:'#8B4513'},
    {id:'rb',label:'مطاط',   icon:'🩹',c:false,col:'#E74C3C'},
    {id:'gl',label:'زجاج',   icon:'🥃',c:false,col:'#85C1E9'},
  ];
  var state = { t:0, drag:null, ox:0, oy:0, placed:null, tested:{}, flow:[] };
  simState = state;

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 اسحب مادة إلى الدائرة</div>
      <div id="cRes" style="padding:10px;border-radius:10px;font-size:14px;text-align:center;
        background:rgba(0,0,0,0.04);min-height:44px;display:flex;align-items:center;justify-content:center">
        اسحب أي مادة إلى المنفذ 🔌
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📋 جدول نتائجك</div>
      <div id="cTable" style="font-size:12px"></div>
    </div>
    <div class="info-box" style="font-size:13px">
      💡 <strong>موصِّلة</strong> = مصباح يضيء ✅<br>
      <strong>عازلة</strong> = مصباح منطفئ ❌<br><br>
      📖 ص٣٤: المعادن كلها موصِّلة.
    </div>`);

  function updTable(){
    var el=document.getElementById('cTable'); if(!el)return;
    var html=Object.keys(state.tested).map(id=>{
      var m=MATS.find(x=>x.id===id);
      return '<div style="display:flex;justify-content:space-between;padding:4px 6px;border-bottom:1px solid rgba(0,0,0,0.05)"><span>'+m.icon+' '+m.label+'</span><span style="font-weight:700;color:'+(state.tested[id]?'#27AE60':'#E74C3C')+'">'+(state.tested[id]?'✅':'❌')+'</span></div>';
    }).join('');
    el.innerHTML=html||'<div style="color:#AAA;text-align:center;padding:8px">لا توجد نتائج بعد</div>';
  }

  var cv=document.getElementById('simCanvas');
  function gp(e){var r=cv.getBoundingClientRect(),sc=cv.width/r.width,s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};}

  // تخطيط الدائرة
  function L(){ var w=elW(),h=elH(),cx=w*.5,cy=h*.34,rx=w*.3,ry=h*.23;
    var iw=Math.max(72, Math.min(Math.floor((w - w*.08) / 4) - 10, 110));
    var ih=Math.round(iw*.7);
    return{w,h,cx,cy,rx,ry,
      bx:cx-rx,by:cy,           // بطارية
      lx:cx+rx,ly:cy,           // مصباح
      sx:cx,sy:cy+ry,           // slot (فتحة المادة)
      ty:h*.70,                 // صينية المواد (مرفوعة أكثر)
      iw:iw,ih:ih};             // حجم بطاقة مادة (أكبر)
  }

  // ضع المواد في الصينية
  function initItems(){
    var l=L(), cols=4, gap=10;
    var totalW = cols*l.iw + (cols-1)*gap;
    var startX = (l.w - totalW)/2 + l.iw/2;
    MATS.forEach(function(m,i){
      var col=i%cols, row=Math.floor(i/cols);
      m.hx = startX + col*(l.iw+gap);
      m.hy = l.ty + 10 + row*(l.ih+8) + l.ih/2;
      m.x  = m.hx; m.y = m.hy;
      m.placed = false;
    });
  }
  initItems();

  function onDown(e){
    var p=gp(e); e.preventDefault();
    var l=L();
    // بحث من الأمام للخلف
    for(var i=MATS.length-1;i>=0;i--){
      var m=MATS[i];
      if(Math.abs(p.x-m.x)<l.iw/2&&Math.abs(p.y-m.y)<l.ih/2){
        state.drag=m; state.ox=p.x-m.x; state.oy=p.y-m.y;
        if(m.placed){ m.placed=false; state.placed=null; }
        break;
      }
    }
  }
  function onMove(e){
    if(!state.drag)return; e.preventDefault();
    var p=gp(e); state.drag.x=p.x-state.ox; state.drag.y=p.y-state.oy;
  }
  function onUp(e){
    if(!state.drag)return; e.preventDefault();
    var m=state.drag, l=L();
    // هل قريب من الـ slot؟
    if(Math.abs(m.x-l.sx)<55&&Math.abs(m.y-l.sy)<28){
      m.x=l.sx; m.y=l.sy; m.placed=true;
      state.placed=m;
      state.tested[m.id]=m.c;
      state.flow=[];
      if(m.c){ try{U9Sound.win();}catch(ex){} for(var i=0;i<12;i++) state.flow.push({t:Math.random(),s:Math.random()*.6+.7}); }
      else { try{U9Sound.ping(220,.3,.2);}catch(ex){} }
      var res=document.getElementById('cRes');
      if(res){ res.style.background=m.c?'rgba(39,174,96,.1)':'rgba(192,57,43,.06)'; res.style.color=m.c?'#1E8449':'#C0392B'; res.innerHTML='<strong>'+m.icon+' '+m.label+'</strong><br>'+(m.c?'✅ موصِّلة — المصباح يضيء!':'❌ عازلة — المصباح لا يضيء'); }
      updTable();
    } else {
      // أعدها لموضعها الأصلي
      m.x=m.hx; m.y=m.hy; m.placed=false;
    }
    state.drag=null;
  }

  cv.addEventListener('mousedown',onDown); cv.addEventListener('mousemove',onMove); cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',onDown,{passive:false}); cv.addEventListener('touchmove',onMove,{passive:false}); cv.addEventListener('touchend',onUp,{passive:false});

  function draw(){
    var c=elCtx(), l=L(), w=l.w, h=l.h;
    c.clearRect(0,0,w,h);
    c.fillStyle=isDarkMode()?'#141C28':'#EEF4FA'; c.fillRect(0,0,w,h);
    state.t+=.04;
    var on=!!(state.placed&&state.placed.c);

    // ── أسلاك الدائرة ──
    var wc=on?'#27AE60':'#999', lw=on?3:2;
    c.strokeStyle=wc; c.lineWidth=lw; c.setLineDash([]);
    // أعلى: bat → bulb
    c.beginPath(); c.moveTo(l.bx,l.by-14); c.lineTo(l.bx,l.cy-l.ry); c.lineTo(l.lx,l.cy-l.ry); c.lineTo(l.lx,l.ly-22); c.stroke();
    // أسفل يمين: bulb → slot يمين
    c.beginPath(); c.moveTo(l.lx,l.ly+22); c.lineTo(l.lx,l.cy+l.ry); c.lineTo(l.sx+44,l.sy); c.stroke();
    // أسفل يسار: slot يسار → bat
    c.beginPath(); c.moveTo(l.sx-44,l.sy); c.lineTo(l.bx,l.cy+l.ry); c.lineTo(l.bx,l.by+14); c.stroke();

    // ── تدفق الإلكترونات ──
    if(on){
      state.flow.forEach(function(f){
        f.t=(f.t+.008*f.s)%1;
        // مسار: أعلى يسار → أعلى يمين → أسفل يمين → slot → أسفل يسار → بطارية
        var segs=[
          {ax:l.bx,ay:l.cy-l.ry,bx:l.lx,by:l.cy-l.ry,len:(l.lx-l.bx)},
          {ax:l.lx,ay:l.cy-l.ry,bx:l.lx,by:l.cy+l.ry,len:2*l.ry},
          {ax:l.lx,ay:l.cy+l.ry,bx:l.sx,by:l.sy,len:Math.hypot(l.lx-l.sx,l.cy+l.ry-l.sy)},
          {ax:l.sx,ay:l.sy,bx:l.bx,by:l.cy+l.ry,len:Math.hypot(l.sx-l.bx,l.sy-(l.cy+l.ry))},
          {ax:l.bx,ay:l.cy+l.ry,bx:l.bx,by:l.cy-l.ry,len:2*l.ry},
        ];
        var total=segs.reduce(function(s,seg){return s+seg.len;},0);
        var dist=f.t*total, cum=0, ex=l.bx, ey=l.cy-l.ry;
        for(var si=0;si<segs.length;si++){
          var seg=segs[si];
          if(dist<=cum+seg.len){ var r2=(dist-cum)/seg.len; ex=seg.ax+(seg.bx-seg.ax)*r2; ey=seg.ay+(seg.by-seg.ay)*r2; break; }
          cum+=seg.len;
        }
        c.fillStyle='rgba(0,200,255,'+(0.7-f.t*.4)+')'; c.beginPath(); c.arc(ex,ey,4,0,Math.PI*2); c.fill();
      });
    }

    // ── البطارية ──
    c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(l.bx-26,l.by-14,52,28,6); c.fill();
    c.fillStyle='#F39C12'; for(var ci=0;ci<3;ci++) c.fillRect(l.bx-16+ci*12,l.by-8,7,16);
    c.fillStyle='white'; c.font='bold 10px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('1.5V',l.bx,l.by);
    c.fillStyle='#E74C3C'; c.font='bold 13px Arial'; c.fillText('+',l.bx+22,l.by-12);

    // ── المصباح ──
    if(on){ c.shadowBlur=20+Math.sin(state.t*4)*6; c.shadowColor='rgba(255,220,0,.7)'; }
    c.fillStyle=on?('rgba(255,230,80,'+(0.55+.15*Math.sin(state.t*4))+')'):('rgba(200,200,200,.5)');
    c.beginPath(); c.arc(l.lx,l.ly,22,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle=on?'rgba(255,180,0,.6)':'#BBB'; c.lineWidth=2;
    c.beginPath(); c.arc(l.lx,l.ly,22,0,Math.PI*2); c.stroke();
    // خيط التنغستن
    c.strokeStyle=on?'rgba(255,200,0,.9)':'rgba(150,150,150,.5)'; c.lineWidth=1.5;
    c.beginPath(); c.moveTo(l.lx-6,l.ly+14); c.lineTo(l.lx-3,l.ly+4); c.lineTo(l.lx,l.ly+10); c.lineTo(l.lx+3,l.ly+4); c.lineTo(l.lx+6,l.ly+14); c.stroke();
    c.fillStyle='#555'; c.beginPath(); c.roundRect(l.lx-10,l.ly+18,20,12,3); c.fill();
    c.font='11px Tajawal'; c.fillStyle=isDarkMode()?'#aaa':'#666'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(on?'يضيء ✅':'منطفئ ❌',l.lx,l.ly+32);

    // ── slot (فتحة المادة) ──
    var hasPlaced=!!(state.placed&&state.placed.placed);
    c.fillStyle=hasPlaced?(state.placed.c?'rgba(39,174,96,.12)':'rgba(192,57,43,.08)'):('rgba(255,200,0,.15)');
    c.strokeStyle=hasPlaced?(state.placed.c?'#27AE60':'#E74C3C'):'#F39C12';
    c.lineWidth=2.5; c.setLineDash([5,4]);
    c.beginPath(); c.roundRect(l.sx-44,l.sy-18,88,36,8); c.fill(); c.stroke();
    c.setLineDash([]);
    if(!hasPlaced){
      c.font='13px Tajawal'; c.fillStyle='#F39C12'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('🔌 ضع المادة هنا',l.sx,l.sy);
    }

    // ── صينية المواد ──
    c.fillStyle=isDarkMode()?'rgba(26,36,50,.6)':'rgba(255,255,255,.7)';
    c.beginPath(); c.roundRect(0,l.ty-6,w,h-l.ty+6,0); c.fill();
    c.font='bold 12px Tajawal'; c.fillStyle=isDarkMode()?'#7A9AB5':'#888'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('اسحب مادة إلى الدائرة ↑',w/2,l.ty-4);

    // ── بطاقات المواد ──
    MATS.forEach(function(m){
      if(m.placed)return; // رُسمت بالـ slot
      var isDrag=(state.drag&&state.drag.id===m.id);
      var hw=l.iw/2, hh=l.ih/2;
      c.shadowBlur=isDrag?18:6; c.shadowColor='rgba(26,143,168,.3)';
      c.fillStyle=isDarkMode()?'rgba(30,42,56,.97)':'rgba(255,255,255,.97)';
      c.strokeStyle=isDrag?'#1A8FA8':'rgba(0,0,0,.12)';
      c.lineWidth=isDrag?2.5:1.8;
      c.beginPath(); c.roundRect(m.x-hw,m.y-hh,l.iw,l.ih,12); c.fill(); c.stroke();
      c.shadowBlur=0;
      // أيقونة كبيرة فوق
      c.font=Math.round(l.iw*.34)+'px serif'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(m.icon, m.x, m.y - l.ih*.13);
      // اسم تحت
      c.font='bold '+Math.round(l.iw*.175)+'px Tajawal';
      c.fillStyle=isDarkMode()?'#ddd':'#444';
      c.textBaseline='bottom';
      c.fillText(m.label, m.x, m.y+hh-4);
    });

    // ── المادة في الـ slot ──
    if(state.placed&&state.placed.placed){
      var m=state.placed;
      c.fillStyle=m.c?'rgba(39,174,96,.12)':'rgba(192,57,43,.06)';
      c.strokeStyle=m.c?'#27AE60':'#E74C3C'; c.lineWidth=2; c.setLineDash([]);
      c.beginPath(); c.roundRect(m.x-44,m.y-18,88,36,8); c.fill(); c.stroke();
      c.font='18px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(m.icon,m.x-14,m.y);
      c.font='12px Tajawal'; c.fillStyle=isDarkMode()?'#ccc':'#333'; c.fillText(m.label,m.x+8,m.y);
    }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─────────────────────────────────────────────────────
// 5-1 TAB 2: صنّف المواد (Drag & Drop)
// ─────────────────────────────────────────────────────
function simConductors2() {
  cancelAnimationFrame(animFrame);
  var localItems = [
    {id:'cu',label:'نحاس',   icon:'🔩',c:true},
    {id:'fe',label:'حديد',   icon:'🔧',c:true},
    {id:'al',label:'ألمنيوم',icon:'🪙',c:true},
    {id:'gr',label:'جرافيت', icon:'✏️',c:true},
    {id:'pl',label:'بلاستيك',icon:'📏',c:false},
    {id:'wd',label:'خشب',    icon:'🪵',c:false},
    {id:'rb',label:'مطاط',   icon:'🩹',c:false},
    {id:'gl',label:'زجاج',   icon:'🥃',c:false},
  ];
  // خلط عشوائي لترتيب المواد
  for(var si=localItems.length-1;si>0;si--){ var sj=Math.floor(Math.random()*(si+1)); var tmp=localItems[si]; localItems[si]=localItems[sj]; localItems[sj]=tmp; }
  localItems.forEach(function(it){ it.x=0;it.y=0;it.placed=null; });
  simState={t:0,drag:null,score:0};

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🎮 صنّف المواد</div>
      <div style="font-size:13px;color:#777;line-height:1.7">اسحب كل مادة إلى العمود الصحيح في الجدول</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🏆 تقدّمك</div>
      <div id="sc2" style="text-align:center;font-size:26px;font-weight:800;color:#1A8FA8">0 / 8</div>
      <div id="sc2msg" style="text-align:center;font-size:12px;color:#888;margin-top:2px">اسحب المواد من الأسفل</div>
    </div>
    <button onclick="elReset2()" style="width:100%;padding:9px;border-radius:10px;border:1.5px solid rgba(0,0,0,.1);background:rgba(192,57,43,.07);color:#C0392B;font-family:Tajawal;font-size:14px;cursor:pointer;margin-top:4px">🔄 إعادة التصنيف</button>
    <div class="info-box" style="font-size:13px;margin-top:8px">
      ✅ <strong>موصِّلة</strong> = معادن (نحاس، حديد، ألمنيوم، جرافيت)<br>
      ❌ <strong>عازلة</strong> = بلاستيك / خشب / مطاط / زجاج
    </div>`);

  var cv=document.getElementById('simCanvas');
  function gp(e){var r=cv.getBoundingClientRect(),sc=cv.width/r.width,s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};}

  function L(){
    var w=elW(),h=elH();
    var colY=h*.05, colH=h*.60;   // جدول أقصر لإعطاء مساحة للصينية
    var gap=w*.04;
    var cColX=gap, cColW=w*.44-gap;
    var eColX=w*.50, eColW=w*.46;
    var trayY=h*.68;               // صينية مرفوعة أكثر
    var iw=Math.floor((w - w*.06) / 4) - 10;
    iw=Math.max(80, Math.min(iw, 110));
    var ih=Math.round(iw*.78);
    return{w,h, cColX,cColW,eColX,eColW, colY,colH, trayY,iw,ih};
  }
  function resetPos(){
    var l=L(), cols=4;
    var gap=10;
    var totalW = cols*l.iw + (cols-1)*gap;
    var startX = (l.w - totalW)/2 + l.iw/2;
    localItems.forEach(function(it,i){
      it.placed=null;
      var col=i%cols, row=Math.floor(i/cols);
      it.hx = startX + col*(l.iw+gap);
      it.hy = l.trayY + 12 + row*(l.ih+8) + l.ih/2;
      it.x=it.hx; it.y=it.hy;
    });
    simState.score=0;
    var el=document.getElementById('sc2'); if(el) el.textContent='0 / 8';
    var em=document.getElementById('sc2msg'); if(em) em.textContent='اسحب المواد من الأسفل';
  }
  resetPos();
  window.elReset2=resetPos;

  function placedCount(){return localItems.filter(function(i){return i.placed!==null;}).length;}

  cv.addEventListener('mousedown',down); cv.addEventListener('mousemove',move); cv.addEventListener('mouseup',up);
  cv.addEventListener('touchstart',down,{passive:false}); cv.addEventListener('touchmove',move,{passive:false}); cv.addEventListener('touchend',up,{passive:false});

  var dragIt=null,ox=0,oy=0;
  function down(e){
    var p=gp(e); e.preventDefault();
    var l=L();
    for(var i=localItems.length-1;i>=0;i--){
      var it=localItems[i];
      if(Math.abs(p.x-it.x)<l.iw/2&&Math.abs(p.y-it.y)<l.ih/2){ dragIt=it; ox=p.x-it.x; oy=p.y-it.y; if(it.placed!==null){it.placed=null;} break; }
    }
  }
  function move(e){ if(!dragIt)return; e.preventDefault(); var p=gp(e); dragIt.x=p.x-ox; dragIt.y=p.y-oy; }
  function up(e){
    if(!dragIt)return; e.preventDefault();
    var l=L(), it=dragIt;
    var inCond=it.x>l.cColX&&it.x<l.cColX+l.cColW&&it.y>l.colY&&it.y<l.colY+l.colH;
    var inIns =it.x>l.eColX&&it.x<l.eColX+l.eColW&&it.y>l.colY&&it.y<l.colY+l.colH;
    if(inCond&&it.c){ it.placed='c'; try{U9Sound.win();}catch(ex){} }
    else if(inIns&&!it.c){ it.placed='e'; try{U9Sound.win();}catch(ex){} }
    else if((inCond&&!it.c)||(inIns&&it.c)){ try{U9Sound.ping(220,.3,.2);}catch(ex){} it.x=it.hx; it.y=it.hy; }
    else { it.x=it.hx; it.y=it.hy; }
    dragIt=null;
    var n=placedCount();
    var sc=document.getElementById('sc2'); if(sc) sc.textContent=n+' / 8';
    var em=document.getElementById('sc2msg');
    if(n===8){ if(em) em.textContent='🎉 أحسنت! صنّفت جميع المواد!'; setTimeout(function(){buddySay('🎉 رائع! صنّفت كل المواد بشكل صحيح!',5000);},200); }
    else if(em) em.textContent='اسحب المواد من الأسفل';
  }

  function draw(){
    var c=elCtx(), l=L();
    c.clearRect(0,0,l.w,l.h);
    c.fillStyle=isDarkMode()?'#141C28':'#EEF4FA'; c.fillRect(0,0,l.w,l.h);
    simState.t+=.02;

    // ── رأس الجدول ──
    var hdrH=l.colH*.12;
    // رأس موصِّلة
    c.fillStyle='rgba(39,174,96,.18)';
    c.beginPath(); c.roundRect(l.cColX,l.colY,l.cColW,hdrH,8); c.fill();
    c.font='bold 15px Tajawal'; c.fillStyle='#1E8449'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('✅ موصِّلة',l.cColX+l.cColW/2,l.colY+hdrH/2);

    // رأس عازلة
    c.fillStyle='rgba(192,57,43,.18)';
    c.beginPath(); c.roundRect(l.eColX,l.colY,l.eColW,hdrH,8); c.fill();
    c.fillStyle='#C0392B';
    c.fillText('❌ عازلة',l.eColX+l.eColW/2,l.colY+hdrH/2);

    // جسم عمود موصِّلة
    c.fillStyle='rgba(39,174,96,.05)'; c.strokeStyle='rgba(39,174,96,.35)'; c.lineWidth=2;
    c.beginPath(); c.roundRect(l.cColX,l.colY+hdrH,l.cColW,l.colH-hdrH,8); c.fill(); c.stroke();

    // جسم عمود عازلة
    c.fillStyle='rgba(192,57,43,.05)'; c.strokeStyle='rgba(192,57,43,.35)'; c.lineWidth=2;
    c.beginPath(); c.roundRect(l.eColX,l.colY+hdrH,l.eColW,l.colH-hdrH,8); c.fill(); c.stroke();

    // حاجز الفصل بين العمودين (خط متقطع)
    c.strokeStyle='rgba(0,0,0,.1)'; c.lineWidth=1.5; c.setLineDash([5,5]);
    c.beginPath(); c.moveTo(l.w*.49,l.colY); c.lineTo(l.w*.49,l.colY+l.colH); c.stroke();
    c.setLineDash([]);

    // المواد المُصنَّفة داخل الأعمدة
    var iw2=l.cColW*.88, ih2=l.ih;
    var ciArr=[],eiArr=[];
    localItems.forEach(function(it){ if(it.placed==='c') ciArr.push(it); else if(it.placed==='e') eiArr.push(it); });
    var rowH=ih2+10;
    function drawPlacedItem(it,col,idx){
      var ix=col.x+col.w/2;
      var startY=l.colY+hdrH+14;
      var iy=startY+idx*rowH+ih2/2;
      c.fillStyle=isDarkMode()?'rgba(30,42,56,.92)':'rgba(255,255,255,.92)';
      c.strokeStyle=it.c?'rgba(39,174,96,.55)':'rgba(192,57,43,.55)'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(ix-iw2/2,iy-ih2/2,iw2,ih2,10); c.fill(); c.stroke();
      c.font='22px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText(it.icon,ix-iw2*.2,iy);
      c.font='bold 13px Tajawal'; c.fillStyle=isDarkMode()?'#ddd':'#333'; c.fillText(it.label,ix+iw2*.1,iy);
    }
    ciArr.forEach(function(it,i){ drawPlacedItem(it,{x:l.cColX,w:l.cColW},i); });
    eiArr.forEach(function(it,i){ drawPlacedItem(it,{x:l.eColX,w:l.eColW},i); });

    // تلميح "أفلت هنا" إن كانت الأعمدة فارغة
    function drawHint(col){
      c.font='13px Tajawal'; c.fillStyle='rgba(0,0,0,.2)'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText('أفلت هنا',col.x+col.w/2,l.colY+l.colH*.55);
    }
    if(ciArr.length===0) drawHint({x:l.cColX,w:l.cColW});
    if(eiArr.length===0) drawHint({x:l.eColX,w:l.eColW});

    // ── صينية المواد (الأسفل) ──
    c.fillStyle=isDarkMode()?'rgba(20,28,40,.75)':'rgba(230,238,248,.9)';
    c.beginPath(); c.roundRect(0,l.trayY-6,l.w,l.h-l.trayY+6,0); c.fill();
    c.strokeStyle='rgba(0,0,0,.06)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(0,l.trayY-6); c.lineTo(l.w,l.trayY-6); c.stroke();

    // عنوان الصينية
    c.font='bold 12px Tajawal'; c.fillStyle=isDarkMode()?'#aaa':'#777'; c.textAlign='right'; c.textBaseline='top';
    c.fillText('المواد المتبقية ↓',l.w-8,l.trayY-3);

    // المواد غير المُصنَّفة
    localItems.forEach(function(it){
      if(it.placed!==null)return;
      var isDrag=(dragIt&&dragIt.id===it.id);
      var iw3=l.iw, ih3=l.ih;
      c.shadowBlur=isDrag?22:6; c.shadowColor=isDrag?'rgba(26,143,168,.5)':'rgba(0,0,0,.12)';
      c.fillStyle=isDarkMode()?'rgba(30,42,56,.97)':'rgba(255,255,255,.97)';
      c.strokeStyle=isDrag?'#1A8FA8':'rgba(0,0,0,.13)'; c.lineWidth=isDrag?2.5:1.8;
      c.beginPath(); c.roundRect(it.x-iw3/2,it.y-ih3/2,iw3,ih3,12); c.fill(); c.stroke();
      c.shadowBlur=0;
      // أيقونة كبيرة في الوسط العلوي
      c.font=Math.round(iw3*.36)+'px serif'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(it.icon, it.x, it.y - ih3*.13);
      // اسم تحت
      c.font='bold '+Math.round(iw3*.185)+'px Tajawal';
      c.fillStyle=isDarkMode()?'#ddd':'#333';
      c.textBaseline='bottom';
      c.fillText(it.label, it.x, it.y+ih3/2-4);
    });

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}


// ─────────────────────────────────────────────────────
// 5-2: الماء والكهرباء (نشاط واحد موحَّد — نقي ثم ملح)
// ─────────────────────────────────────────────────────
function simWaterConductor1() {
  cancelAnimationFrame(animFrame);
  simState={t:0,salt:0,spoons:0,dragging:false,spoonX:0,spoonY:0,bubbles:[]};

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧂 أضف ملحاً للماء</div>
      <div style="font-size:13px;color:#777;margin-bottom:8px">اسحب الملعقة إلى الكأس!</div>
      <div id="spoonBtn" style="display:inline-flex;align-items:center;gap:8px;padding:10px 16px;
        border-radius:12px;background:rgba(243,156,18,.1);border:2px solid rgba(243,156,18,.4);
        cursor:grab;font-family:Tajawal;font-size:15px;font-weight:700;user-select:none">
        🥄 ملعقة ملح
      </div>
      <div style="margin-top:8px;font-size:13px;color:#888">
        ملاعق مضافة: <span id="spoonCount" style="font-weight:800;color:#F39C12">0</span>
      </div>
      <button onclick="elWReset()" style="margin-top:8px;width:100%;padding:8px;border-radius:8px;
        border:1.5px solid rgba(192,57,43,.2);background:rgba(192,57,43,.06);color:#C0392B;
        font-family:Tajawal;font-size:13px;cursor:pointer">🔄 إعادة التجربة</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ قراءة الأميتر</div>
      <div id="amRead" style="text-align:center;font-size:24px;font-weight:800;color:#E74C3C;direction:ltr">0.00 A</div>
      <div id="amLabel" style="text-align:center;font-size:12px;color:#888">لا يوجد تيار</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">💡 المصباح</div>
      <div id="bStatus" style="text-align:center;font-size:20px">❌ منطفئ</div>
    </div>
    <div class="info-box" style="font-size:13px">
      📖 ص٣٦: الماء النقي لا يوصِّل لأنه لا يحتوي على أيونات. الأملاح المذابة تُنتج أيونات تحمل الشحنة.
    </div>`);

  window.elWReset=function(){
    simState.salt=0; simState.spoons=0;
    document.getElementById('spoonCount').textContent='0';
    document.getElementById('amRead').textContent='0.00 A'; document.getElementById('amRead').style.color='#E74C3C';
    document.getElementById('amLabel').textContent='لا يوجد تيار';
    document.getElementById('bStatus').textContent='❌ منطفئ';
    simState.bubbles=[];
  };

  var cv=document.getElementById('simCanvas');
  function gp(e){var r=cv.getBoundingClientRect(),sc=cv.width/r.width,s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};}

  // موضع الملعقة (ترسم على الكانفاس)
  function L(){ var w=elW(),h=elH(); return{w,h,
    gx:w*.5,gy:h*.5,gw:w*.2,gh:h*.28, // الكأس
    spoonHomeX:w*.2,spoonHomeY:h*.72,  // موضع الملعقة — يسار بعيداً عن buddy
  };}
  var localSpoon={x:0,y:0,dragging:false,ox:0,oy:0};
  function initSpoon(){ var l=L(); localSpoon.x=l.spoonHomeX; localSpoon.y=l.spoonHomeY; }
  initSpoon();

  cv.addEventListener('mousedown',function(e){ var p=gp(e); if(Math.abs(p.x-localSpoon.x)<46&&Math.abs(p.y-localSpoon.y)<40){ localSpoon.dragging=true; localSpoon.ox=p.x-localSpoon.x; localSpoon.oy=p.y-localSpoon.y; } });
  cv.addEventListener('mousemove',function(e){ if(!localSpoon.dragging)return; var p=gp(e); localSpoon.x=p.x-localSpoon.ox; localSpoon.y=p.y-localSpoon.oy; });
  cv.addEventListener('mouseup',function(e){ if(!localSpoon.dragging)return; checkDrop(); localSpoon.dragging=false; });
  cv.addEventListener('touchstart',function(e){ var p=gp(e); e.preventDefault(); if(Math.abs(p.x-localSpoon.x)<46&&Math.abs(p.y-localSpoon.y)<40){ localSpoon.dragging=true; localSpoon.ox=p.x-localSpoon.x; localSpoon.oy=p.y-localSpoon.y; }},{passive:false});
  cv.addEventListener('touchmove',function(e){ if(!localSpoon.dragging)return; e.preventDefault(); var p=gp(e); localSpoon.x=p.x-localSpoon.ox; localSpoon.y=p.y-localSpoon.oy; },{passive:false});
  cv.addEventListener('touchend',function(e){ if(!localSpoon.dragging)return; e.preventDefault(); checkDrop(); localSpoon.dragging=false; },{passive:false});

  function checkDrop(){
    var l=L();
    // هل الملعقة داخل الكأس؟
    if(Math.abs(localSpoon.x-l.gx)<l.gw&&localSpoon.y>l.gy-l.gh*.8&&localSpoon.y<l.gy+8){
      simState.spoons=Math.min(simState.spoons+1,5);
      simState.salt=simState.spoons/5;
      try{U9Sound.ping(400+simState.spoons*80,.1,.15);}catch(ex){}
      // فقاعات
      for(var i=0;i<6;i++) simState.bubbles.push({x:(Math.random()-.5)*l.gw*1.2,y:0,vy:-Math.random()*1.5-1,r:Math.random()*4+2,life:1});
      // تحديث القراءات
      var curr=(simState.salt*.85).toFixed(2);
      document.getElementById('spoonCount').textContent=simState.spoons;
      document.getElementById('amRead').textContent=curr+' A';
      document.getElementById('amRead').style.color=simState.salt>0?'#27AE60':'#E74C3C';
      document.getElementById('amLabel').textContent=simState.salt>0?'✅ يوجد تيار كهربائي':'لا يوجد تيار';
      document.getElementById('bStatus').textContent=simState.salt>0?'✅ يضيء!':'❌ منطفئ';
    }
    // أعد الملعقة لموضعها
    var l2=L(); localSpoon.x=l2.spoonHomeX; localSpoon.y=l2.spoonHomeY;
  }

  function draw(){
    var c=elCtx(), l=L(), w=l.w, h=l.h;
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#EEF6FF'; c.fillRect(0,0,w,h);
    simState.t+=.04;
    var s=simState.salt, on=s>0;

    // ── الكأس ──
    var gx=l.gx,gy=l.gy,gw=l.gw,gh=l.gh;
    // الماء
    c.fillStyle='rgba(41,182,246,'+(0.15+s*.2)+')';
    c.beginPath(); c.moveTo(gx-gw*.9,gy-gh*.75); c.lineTo(gx-gw,gy); c.lineTo(gx+gw,gy); c.lineTo(gx+gw*.9,gy-gh*.75); c.closePath(); c.fill();
    // موجات
    for(var wi=0;wi<3;wi++){
      var wy=gy-gh*.75+wi*h*.04+Math.sin(simState.t+wi)*3;
      c.strokeStyle='rgba(41,182,246,'+(0.2+s*.3)+')'; c.lineWidth=1; c.setLineDash([3,3]);
      c.beginPath(); c.moveTo(gx-gw*.8,wy); c.lineTo(gx+gw*.8,wy); c.stroke(); c.setLineDash([]);
    }
    // جزيئات الملح
    for(var si=0;si<simState.spoons*8;si++){
      var sx=gx+(Math.sin(si*137+simState.t*.3))*gw*.7;
      var sy=gy-gh*.2-Math.abs(Math.cos(si*73))*gh*.4;
      c.fillStyle='rgba(255,200,100,'+(0.4+Math.sin(simState.t+si)*.2)+')';
      c.beginPath(); c.arc(sx,sy,2.5,0,Math.PI*2); c.fill();
    }
    // فقاعات
    simState.bubbles=simState.bubbles.filter(function(b){return b.life>0;});
    simState.bubbles.forEach(function(b){ b.y+=b.vy; b.life-=.02;
      c.strokeStyle='rgba(255,255,255,'+(b.life*.5)+')'; c.lineWidth=1;
      c.beginPath(); c.arc(gx+b.x,gy-gh*.4+b.y,b.r,0,Math.PI*2); c.stroke();
    });
    // حواف الكأس
    c.strokeStyle=isDarkMode()?'rgba(255,255,255,.25)':'rgba(0,0,0,.2)'; c.lineWidth=2.5;
    c.beginPath(); c.moveTo(gx-gw*.9,gy-gh*.75); c.lineTo(gx-gw,gy); c.lineTo(gx+gw,gy); c.lineTo(gx+gw*.9,gy-gh*.75); c.stroke();
    c.beginPath(); c.moveTo(gx-gw*.9,gy-gh*.75); c.lineTo(gx+gw*.9,gy-gh*.75); c.stroke();
    // تسمية
    c.font='bold 14px Tajawal'; c.fillStyle=isDarkMode()?'#7EC8E3':'#1565C0'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(s>0?'ماء مالح 🧂':'ماء مقطَّر 💧',gx,gy-gh*.38);

    // ── أقطاب الألمنيوم ──
    [-1,1].forEach(function(side){
      c.fillStyle='#C0C0C0'; c.strokeStyle='#888'; c.lineWidth=2;
      c.beginPath(); c.rect(gx+side*gw*.55-4,gy-gh*.73,8,gh*.5); c.fill(); c.stroke();
      // فقاعات عند القطب إذا يوصّل
      if(on){ for(var bi=0;bi<3;bi++){
        var boff=Math.sin(simState.t*3+bi*2)*6;
        c.strokeStyle='rgba(255,255,255,'+(0.5-bi*.15)+')'; c.lineWidth=1;
        c.beginPath(); c.arc(gx+side*gw*.55,gy-gh*.4-bi*h*.03+boff,3+bi,0,Math.PI*2); c.stroke();
      }}
    });

    // ── أسلاك ──
    var wc=on?'#27AE60':'#999', lw=on?3:2;
    c.strokeStyle=wc; c.lineWidth=lw;
    c.beginPath(); c.moveTo(gx-gw*.55,gy-gh*.73); c.lineTo(gx-gw*.55,gy-gh-h*.06); c.lineTo(w*.15,gy-gh-h*.06); c.stroke();
    c.beginPath(); c.moveTo(gx+gw*.55,gy-gh*.73); c.lineTo(gx+gw*.55,gy-gh-h*.06); c.lineTo(w*.85,gy-gh-h*.06); c.stroke();
    // تدفق
    if(on){ for(var fi=0;fi<simState.spoons*2;fi++){
      var ft=((simState.t*s+fi/simState.spoons*.5))%1;
      var fx=w*.15+(gx-gw*.55-w*.15)*ft;
      c.fillStyle='rgba(0,220,255,'+(0.7-ft*.4)+')'; c.beginPath(); c.arc(fx,gy-gh-h*.06,3,0,Math.PI*2); c.fill();
    }}

    // ── بطارية ──
    c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(w*.04,gy-gh-h*.1,58,32,6); c.fill();
    c.fillStyle='#F39C12'; c.fillRect(w*.04+8,gy-gh-h*.1+6,42,20);
    c.fillStyle='white'; c.font='bold 9px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('1.5V',w*.04+29,gy-gh-h*.1+16);

    // ── مصباح ──
    if(on){ c.shadowBlur=18+Math.sin(simState.t*4)*5; c.shadowColor='rgba(255,220,0,.7)'; }
    c.fillStyle=on?('rgba(255,230,80,'+(0.55+.15*Math.sin(simState.t*4))+')'):('rgba(200,200,200,.5)');
    c.beginPath(); c.arc(w*.88,gy-gh-h*.06,18,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle=on?'rgba(255,180,0,.6)':'#BBB'; c.lineWidth=1.5;
    c.beginPath(); c.arc(w*.88,gy-gh-h*.06,18,0,Math.PI*2); c.stroke();
    c.fillStyle='#555'; c.beginPath(); c.roundRect(w*.88-8,gy-gh-h*.06+14,16,10,3); c.fill();
    c.font='10px Tajawal'; c.fillStyle=isDarkMode()?'#aaa':'#666'; c.textAlign='center';
    c.fillText(on?'يضيء':'منطفئ',w*.88,gy-gh-h*.06+30);

    // ── الملعقة (قابلة للسحب) — كبيرة وواضحة ──
    if(!localSpoon.dragging){
      c.fillStyle=isDarkMode()?'rgba(243,156,18,.18)':'rgba(243,156,18,.15)';
      c.strokeStyle='rgba(243,156,18,.7)'; c.lineWidth=2.5; c.setLineDash([5,3]);
      c.beginPath(); c.roundRect(localSpoon.x-46,localSpoon.y-34,92,68,14); c.fill(); c.stroke();
      c.setLineDash([]);
      var arOff=Math.sin(simState.t*3)*6;
      c.fillStyle='rgba(243,156,18,.9)'; c.font='bold 18px Arial'; c.textAlign='left'; c.textBaseline='middle';
      c.fillText('→',localSpoon.x+34+arOff,localSpoon.y);
      c.font='bold 12px Tajawal'; c.fillStyle=isDarkMode()?'#F39C12':'#B7770D'; c.textAlign='center'; c.textBaseline='top';
      c.fillText('اسحب نحو الكأس!',localSpoon.x,localSpoon.y+24);
    }
    c.save();
    c.translate(localSpoon.x,localSpoon.y);
    c.font='38px serif'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('🥄',0,0);
    c.restore();

    // ── خلاصة (مرفوعة لتجنّب التداخل مع زر ماذا نستنتج) ──
    var msg=on?('✅ الماء المالح يوصِّل! | '+(s*.85).toFixed(2)+' A'):'💧 الماء النقي لا يوصِّل';
    c.fillStyle=isDarkMode()?'rgba(20,28,40,.9)':'rgba(255,255,255,.9)';
    c.beginPath(); c.roundRect(w*.04,h*.8,w*.92,h*.1,12); c.fill();
    c.strokeStyle=on?'rgba(39,174,96,.3)':'rgba(231,76,60,.2)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(w*.04,h*.8,w*.92,h*.1,12); c.stroke();
    c.fillStyle=on?'#1E8449':'#C0392B'; c.font='bold 14px Tajawal'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(msg,w/2,h*.855);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// 5-2 TAB 2 — نفس النشاط (حُذف النسخة المنفصلة)
function simWaterConductor2() { simWaterConductor1(); }

// ─────────────────────────────────────────────────────
// 5-3 TAB 1: أميتر تفاعلي — اضغط على المعدن وشوف التيار
// ─────────────────────────────────────────────────────
function simMetalConductor1() {
  cancelAnimationFrame(animFrame);
  var metals=[
    {id:'au',label:'ذهب',    icon:'💰',col:'#C8900A',I:0.98,R:0.022,q:'الأعلى قيمةً 👑'},
    {id:'ag',label:'فضة',    icon:'🪙',col:'#C0C0C0',I:0.87,R:0.016,q:'الأفضل موصلاً 🥇'},
    {id:'cu',label:'نحاس',   icon:'🔩',col:'#B87333',I:0.82,R:0.017,q:'ممتاز 🥈'},
    {id:'al',label:'ألمنيوم',icon:'🔘',col:'#AAA',   I:0.75,R:0.028,q:'جيد 🥉'},
    {id:'fe',label:'حديد',   icon:'🔧',col:'#777',   I:0.48,R:0.1,  q:'متوسط'},
    {id:'gr',label:'جرافيت', icon:'✏️',col:'#555',   I:0.23,R:1.4,  q:'ضعيف'},
  ];
  simState={t:0,sel:null,needle:0,target:0,flow:[]};
  var localMetals=metals; // closure safe

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔩 اضغط على أي مادة</div>
      ${metals.map(function(m){ return '<button id="mb_'+m.id+'" onclick="elSelMet(\''+m.id+'\')" style="width:100%;padding:9px 12px;border-radius:10px;border:2px solid rgba(0,0,0,.1);background:white;font-family:Tajawal;font-size:14px;cursor:pointer;display:flex;align-items:center;gap:10px;margin-bottom:5px;transition:all .2s"><span style="font-size:20px">'+m.icon+'</span><span style="flex:1;text-align:right">'+m.label+'</span><span style="font-size:11px;color:#888">'+m.R+' Ω·mm²/m</span></button>'; }).join('')}
    </div>
    <div class="ctrl-section" id="mInfo" style="display:none">
      <div class="ctrl-label">📊 النتيجة</div>
      <div id="mRes" style="text-align:center;padding:8px;border-radius:8px"></div>
    </div>
    <div class="q-box" style="font-size:13px">
      <strong>❓</strong> لماذا نستخدم النحاس للأسلاك لا الذهب؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
      <div class="q-ans-panel">الذهب موصِّل ممتاز لكنه نادر وغالي جداً! النحاس أرخص بكثير وموصليته جيدة جداً. الذهب يُستخدم فقط في الدوائر الدقيقة الإلكترونية.</div>
    </div>`);

  window.elSelMet=function(id){
    var m=localMetals.find(function(x){return x.id===id;});
    simState.sel=m; simState.target=m.I;
    simState.flow=[];
    for(var i=0;i<Math.round(m.I*10);i++) simState.flow.push({t:Math.random(),s:Math.random()*.5+.8});
    try{U9Sound.ping(300+m.I*200,.15,.2);}catch(ex){}
    localMetals.forEach(function(mt){ var b=document.getElementById('mb_'+mt.id); if(b){b.style.borderColor=mt.id===id?'#1A8FA8':'rgba(0,0,0,.1)';b.style.background=mt.id===id?'rgba(26,143,168,.08)':'white';}});
    var info=document.getElementById('mInfo'); if(info) info.style.display='block';
    var res=document.getElementById('mRes'); if(res){ res.style.background='rgba(26,143,168,.07)'; res.innerHTML='<div style="font-size:22px;font-weight:800;color:#1A8FA8">'+m.I.toFixed(2)+' A</div><div style="font-size:12px;color:#888">'+m.icon+' '+m.label+' — '+m.q+'</div>'; }
  };

  var cv=document.getElementById('simCanvas');
  function draw(){
    var c=elCtx(),w=elW(),h=elH();
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=.04;
    simState.needle+=(simState.target-simState.needle)*.08;
    var m=simState.sel;

    // ── أميتر دائري ──
    var ax=w*.5,ay=h*.38,ar=Math.min(w,h)*.22;
    c.fillStyle=isDarkMode()?'#1E2A38':'white'; c.shadowBlur=12; c.shadowColor='rgba(0,0,0,.2)';
    c.beginPath(); c.arc(ax,ay,ar,0,Math.PI*2); c.fill(); c.shadowBlur=0;
    c.strokeStyle='rgba(0,0,0,.2)'; c.lineWidth=3; c.beginPath(); c.arc(ax,ay,ar,0,Math.PI*2); c.stroke();
    // تدريجات
    for(var i=0;i<=10;i++){
      var ang=-Math.PI+i/10*Math.PI;
      var x1=ax+Math.cos(ang)*(ar-6),y1=ay+Math.sin(ang)*(ar-6);
      var x2=ax+Math.cos(ang)*(ar-20),y2=ay+Math.sin(ang)*(ar-20);
      c.strokeStyle=isDarkMode()?'rgba(255,255,255,.5)':'rgba(0,0,0,.35)'; c.lineWidth=i%5===0?2.5:1;
      c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
      if(i%5===0){ c.font='bold 11px Arial'; c.fillStyle=isDarkMode()?'#ccc':'#555'; c.textAlign='center'; c.textBaseline='middle'; c.fillText((i/10).toFixed(1),ax+Math.cos(ang)*(ar-30),ay+Math.sin(ang)*(ar-30)); }
    }
    // مناطق ملونة
    [[0,.3,'rgba(231,76,60,.12)'],[.3,.6,'rgba(243,156,18,.12)'],[.6,1,'rgba(39,174,96,.12)']].forEach(function(z){
      c.fillStyle=z[2]; c.beginPath(); c.moveTo(ax,ay); c.arc(ax,ay,ar-8,-Math.PI+z[0]*Math.PI,-Math.PI+z[1]*Math.PI); c.closePath(); c.fill();
    });
    // إبرة
    var na=-Math.PI+simState.needle*Math.PI;
    c.strokeStyle='#E74C3C'; c.lineWidth=3; c.lineCap='round';
    c.beginPath(); c.moveTo(ax,ay); c.lineTo(ax+Math.cos(na)*(ar-12),ay+Math.sin(na)*(ar-12)); c.stroke();
    c.fillStyle='#E74C3C'; c.beginPath(); c.arc(ax,ay,5,0,Math.PI*2); c.fill();
    // A
    c.font='bold 18px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('A',ax,ay+ar*.4);
    // قراءة رقمية
    c.font='bold 20px Arial'; c.fillStyle='#1A8FA8'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(simState.needle.toFixed(2)+' A',ax,ay+ar+6);
    // تسمية "جهاز الأميتر" تحت القراءة
    c.font='12px Tajawal'; c.fillStyle=isDarkMode()?'#7A9AB5':'#888'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('جهاز الأميتر (Ammeter)',ax,ay+ar+28);

    // ── المعدن المختبر (شريط أفقي) ──
    var mx=w*.5,my=h*.78,mw=w*.6,mh=h*.055;
    // تأثير ذهبي خاص
    if(m && m.id==='au'){
      var goldG=c.createLinearGradient(mx-mw/2,my-mh/2,mx+mw/2,my+mh/2);
      goldG.addColorStop(0,'#C8900A'); goldG.addColorStop(0.3,'#F0C840'); goldG.addColorStop(0.6,'#C8900A'); goldG.addColorStop(1,'#F0C840');
      c.fillStyle=goldG;
    } else {
      c.fillStyle=m?(m.col+'33'):'rgba(200,200,200,.15)';
    }
    c.strokeStyle=m?m.col:'rgba(150,150,150,.4)'; c.lineWidth=2;
    c.beginPath(); c.roundRect(mx-mw/2,my-mh/2,mw,mh,6); c.fill(); c.stroke();
    // لمعة
    if(m){ c.fillStyle='rgba(255,255,255,.25)'; c.beginPath(); c.roundRect(mx-mw/2+4,my-mh/2+2,mw-8,mh*.3,3); c.fill(); }
    c.font='14px Tajawal'; c.fillStyle=isDarkMode()?'#ddd':'#333'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(m?m.icon+' '+m.label:'← اضغط على مادة من القائمة',mx,my);

    // ── أسلاك ──
    var wc=simState.needle>.05?'#27AE60':'#AAA', lw=simState.needle>.05?2.5:1.5;
    c.strokeStyle=wc; c.lineWidth=lw;
    c.beginPath(); c.moveTo(ax-ar,ay); c.lineTo(ax-ar,my); c.lineTo(mx-mw/2,my); c.stroke();
    c.beginPath(); c.moveTo(ax+ar,ay); c.lineTo(ax+ar,my); c.lineTo(mx+mw/2,my); c.stroke();
    c.beginPath(); c.moveTo(ax-ar,ay); c.lineTo(ax-ar,h*.08); c.lineTo(ax+ar,h*.08); c.lineTo(ax+ar,ay); c.stroke();
    // بطارية
    c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(ax-ar-28,h*.04,56,28,5); c.fill();
    c.fillStyle='#F39C12'; c.fillRect(ax-ar-20,h*.04+5,40,18);
    c.fillStyle='white'; c.font='bold 9px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('1.5V',ax-ar,h*.04+14);

    // ── إلكترونات ──
    if(simState.needle>.02){ simState.flow.forEach(function(f){
      f.t=(f.t+.006*f.s*simState.needle*2)%1;
      var na2=-Math.PI+f.t*Math.PI;
      // لون ذهبي للإلكترونات عند الذهب
      var eCol=m&&m.id==='au'?'rgba(240,200,50,':'rgba(0,200,255,';
      c.fillStyle=eCol+(0.6-f.t*.3)+')';
      c.beginPath(); c.arc(ax+Math.cos(na2)*(ar*.6),ay+Math.sin(na2)*(ar*.6),3,0,Math.PI*2); c.fill();
    }); }

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// 5-3 TAB 2 — مخطط بياني مقارن
function simMetalConductor2() {
  cancelAnimationFrame(animFrame);
  var metals=[
    {label:'ذهب',    icon:'💰',col:'#C8900A',I:0.98},
    {label:'فضة',    icon:'🪙',col:'#A0A0C0',I:0.87},
    {label:'نحاس',   icon:'🔩',col:'#B87333',I:0.82},
    {label:'ألمنيوم',icon:'🔘',col:'#999',   I:0.75},
    {label:'حديد',   icon:'🔧',col:'#666',   I:0.48},
    {label:'جرافيت', icon:'✏️',col:'#444',   I:0.23},
  ];
  simState={t:0,prog:metals.map(function(){return 0;}),running:false};

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">📊 مقارنة الموصلية</div>
      <button onclick="simState.running=true;try{U9Sound.ping();}catch(e){}" style="width:100%;padding:11px;border-radius:10px;background:linear-gradient(135deg,#27AE60,#1E8449);color:white;border:none;font-family:Tajawal;font-size:15px;font-weight:700;cursor:pointer">▶ ابدأ المقارنة</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🏆 الترتيب (الأفضل أولاً)</div>
      ${metals.map(function(m,i){ return '<div style="display:flex;align-items:center;gap:8px;padding:4px 0;border-bottom:1px solid rgba(0,0,0,.05)"><span style="font-weight:800;color:#1A8FA8;min-width:18px">'+(i+1)+'</span><span>'+m.icon+'</span><span style="font-size:13px">'+m.label+'</span><span style="margin-right:auto;font-size:12px;font-weight:700;color:'+m.col+'">'+m.I.toFixed(2)+' A</span></div>'; }).join('')}
    </div>
    <div class="q-box" style="font-size:13px">
      <strong>❓</strong> لماذا نستخدم النحاس لا الذهب في الأسلاك رغم أن الذهب أعلى موصلية؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
      <div class="q-ans-panel">الذهب نادر وغالٍ جداً! النحاس موصليته قريبة من الذهب لكنه أرخص بآلاف المرات. الذهب يُستخدم فقط في الإلكترونيات الدقيقة جداً.</div>
    </div>`);

  var cv=document.getElementById('simCanvas');
  function draw(){
    var c=elCtx(),w=elW(),h=elH();
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=.02;
    var cx=w*.1,cy=h*.08,cw=w*.8,ch=h*.72;
    c.fillStyle=isDarkMode()?'rgba(30,42,56,.5)':'rgba(255,255,255,.7)';
    c.beginPath(); c.roundRect(cx-8,cy-8,cw+16,ch+16,10); c.fill();
    c.font='bold 14px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('شدة التيار في المعادن المختلفة (A)',w/2,6);
    // شبكة
    for(var gi=0;gi<=4;gi++){
      var gy2=cy+ch-gi/4*ch;
      c.strokeStyle='rgba(0,0,0,.06)'; c.lineWidth=1; c.beginPath(); c.moveTo(cx,gy2); c.lineTo(cx+cw,gy2); c.stroke();
      c.font='11px Arial'; c.fillStyle='#999'; c.textAlign='right'; c.textBaseline='middle'; c.fillText((gi/4).toFixed(1),cx-4,gy2);
    }
    c.strokeStyle='rgba(0,0,0,.2)'; c.lineWidth=2; c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx,cy+ch); c.lineTo(cx+cw,cy+ch); c.stroke();
    var bw=cw/metals.length-12;
    metals.forEach(function(m,i){
      if(simState.running) simState.prog[i]=Math.min(m.I,simState.prog[i]+.014);
      var bx=cx+i*(cw/metals.length)+6, bh=simState.prog[i]*ch;
      var rr=parseInt(m.col.slice(1,3)||'88',16), gg=parseInt(m.col.slice(3,5)||'88',16), bb=parseInt(m.col.slice(5,7)||'88',16);
      var bg=c.createLinearGradient(bx,cy+ch-bh,bx,cy+ch);
      bg.addColorStop(0,'rgba('+rr+','+gg+','+bb+',.9)'); bg.addColorStop(1,'rgba('+(rr*.6|0)+','+(gg*.6|0)+','+(bb*.6|0)+',.9)');
      c.fillStyle='rgba('+rr+','+gg+','+bb+',.12)'; c.beginPath(); c.roundRect(bx+2,cy+ch-bh+2,bw,bh,4); c.fill();
      c.fillStyle=bg; c.beginPath(); c.roundRect(bx,cy+ch-bh,bw,bh,i===0?[6,6,0,0]:4); c.fill();
      if(simState.prog[i]>.05){ c.font='bold 12px Arial'; c.fillStyle=m.col; c.textAlign='center'; c.textBaseline='bottom'; c.fillText(simState.prog[i].toFixed(2),bx+bw/2,cy+ch-bh-3); }
      c.font='17px serif'; c.textAlign='center'; c.textBaseline='top'; c.fillText(m.icon,bx+bw/2,cy+ch+4);
      c.font='10px Tajawal'; c.fillStyle=isDarkMode()?'#ccc':'#555'; c.fillText(m.label,bx+bw/2,cy+ch+22);
    });
    if(simState.prog[0]>.6){ c.font='16px serif'; c.textAlign='center'; c.fillText('👑',cx+0*(cw/metals.length)+6+bw/2,cy+ch-simState.prog[0]*ch-24); }
    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ─────────────────────────────────────────────────────
// 5-5 TAB 1: ابنِ دائرتك بنفسك! — سحب وإفلات المكونات
// ─────────────────────────────────────────────────────
function simCircuitBuilder1() {
  cancelAnimationFrame(animFrame);

  var COMPS = [
    {id:'bat', label:'بطارية ١', type:'bat',  inCircuit:false, x:0,y:0,hx:0,hy:0},
    {id:'bat2',label:'بطارية ٢', type:'bat',  inCircuit:false, x:0,y:0,hx:0,hy:0},
    {id:'sw',  label:'مفتاح',    type:'sw',   inCircuit:false, x:0,y:0,hx:0,hy:0},
    {id:'b1',  label:'مصباح ١',  type:'bulb', inCircuit:false, x:0,y:0,hx:0,hy:0},
    {id:'b2',  label:'مصباح ٢',  type:'bulb', inCircuit:false, x:0,y:0,hx:0,hy:0},
    {id:'b3',  label:'مصباح ٣',  type:'bulb', inCircuit:false, x:0,y:0,hx:0,hy:0},
  ];

  simState={t:0,flow:[],swOn:false};
  var placed={};
  var localComps=COMPS;

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔌 كيف تبني الدائرة؟</div>
      <div style="font-size:13px;color:var(--text-secondary);line-height:2.1">
        <span style="display:block">١. اسحب 🔋 <strong>بطارية</strong> ← الجانب الأيسر</span>
        <span style="display:block">٢. اسحب ⚡ <strong>مفتاحاً</strong> ← الجانب العلوي</span>
        <span style="display:block">٣. اسحب 💡 <strong>مصباحاً</strong> ← الجانب الأيمن</span>
        <span style="display:block">٤. اضغط زر المفتاح لإغلاق الدائرة</span>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ المفتاح</div>
      <button id="swBtn" onclick="elTogSw()" style="width:100%;padding:13px;border-radius:12px;border:2.5px solid rgba(192,57,43,.35);background:rgba(192,57,43,.08);color:#C0392B;font-family:Tajawal;font-size:15px;font-weight:800;cursor:pointer;transition:all .25s">❌ مفتوح — اضغط لإغلاقه</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📊 قراءات الدائرة</div>
      <div id="cbReads" style="font-size:13px;color:var(--text-secondary);line-height:1.9">ضع المكونات أولاً</div>
    </div>
    <button onclick="elCBReset()" style="width:100%;padding:9px;border-radius:10px;border:1.5px solid rgba(0,0,0,.1);background:rgba(0,0,0,.04);font-family:Tajawal;font-size:13px;cursor:pointer;margin-top:2px">🔄 إعادة البناء</button>
    <div class="info-box" style="font-size:13px;margin-top:8px">📖 ص٤٢: الدائرة المغلقة = مسار كامل → بطارية + مفتاح مغلق + مصباح.</div>`);

  window.elTogSw=function(){
    simState.swOn=!simState.swOn;
    var b=document.getElementById('swBtn');
    if(b){ b.style.background=simState.swOn?'rgba(39,174,96,.12)':'rgba(192,57,43,.08)'; b.style.color=simState.swOn?'#1E8449':'#C0392B'; b.style.borderColor=simState.swOn?'rgba(39,174,96,.45)':'rgba(192,57,43,.35)'; b.textContent=simState.swOn?'✅ مغلق — اضغط لفتحه':'❌ مفتوح — اضغط لإغلاقه'; }
    try{U9Sound.ping(simState.swOn?640:300,.15,.15);}catch(ex){}
    updateReads();
  };
  window.elCBReset=function(){
    placed={};
    localComps.forEach(function(c){ c.inCircuit=false; });
    simState.swOn=false; simState.flow=[];
    var b=document.getElementById('swBtn'); if(b){b.style.background='rgba(192,57,43,.08)';b.style.color='#C0392B';b.style.borderColor='rgba(192,57,43,.35)';b.textContent='❌ مفتوح — اضغط لإغلاقه';}
    var r=document.getElementById('cbReads'); if(r) r.innerHTML='ضع المكونات أولاً';
    initTray();
  };

  function calcCircuit(){
    var V=(placed['S_bat']?1.5:0)+(placed['S_bat2']?1.5:0);
    var bulbs=['S_b1','S_b2','S_b3'].filter(function(k){return!!placed[k];}).length;
    if(!V||!simState.swOn) return {on:false,I:0,br:0,bulbs:bulbs,V:V};
    var R=0.3+Math.max(bulbs,1)*3.2;
    var I=V/R;
    return {on:I>.01,I:I,br:Math.min(1,I/.5),bulbs:bulbs,V:V};
  }
  function updateReads(){
    var st=calcCircuit();
    var el=document.getElementById('cbReads'); if(!el)return;
    if(!placed['S_bat']&&!placed['S_bat2']){ el.innerHTML='🔋 أضف بطارية أولاً'; return; }
    if(!simState.swOn){ el.innerHTML='⚡ أغلق المفتاح لإتمام الدائرة'; return; }
    if(!st.on){ el.innerHTML='💡 أضف مصباحاً لإكمال الدائرة'; return; }
    el.innerHTML=
      '<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid rgba(0,0,0,.06)"><span>⚡ التيار</span><strong style="color:#1A8FA8">'+st.I.toFixed(2)+' A</strong></div>'+
      '<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid rgba(0,0,0,.06)"><span>🔋 الجهد</span><strong style="color:#D4901A">'+st.V.toFixed(1)+' V</strong></div>'+
      '<div style="display:flex;justify-content:space-between;padding:2px 0;border-bottom:1px solid rgba(0,0,0,.06)"><span>💡 مصابيح</span><strong>'+st.bulbs+'</strong></div>'+
      '<div style="display:flex;justify-content:space-between;padding:2px 0"><span>☀️ سطوع</span><strong style="color:#27AE60">'+Math.round(st.br*100)+'%</strong></div>';
    if(st.on){ simState.flow=[]; for(var fi=0;fi<10;fi++) simState.flow.push({t:Math.random(),s:Math.random()*.5+.8}); }
    else simState.flow=[];
  }

  var cv=document.getElementById('simCanvas');
  function gp(e){ var r=cv.getBoundingClientRect(),sc=cv.width/r.width,s=e.touches?e.touches[0]:e; return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc}; }

  // ── التخطيط: مستطيل كبير، slots على 3 أضلاع ──
  function L(){
    var w=elW(), h=elH();
    var x1=w*.09, x2=w*.89, y1=h*.07, y2=h*.65;
    var mx=(x1+x2)/2, my=(y1+y2)/2;
    var trayY=h*.72, iw=64, ih=46;
    return {w,h,x1,x2,y1,y2,mx,my,trayY,iw,ih,
      slots:[
        {id:'S_bat',  x:x1, y:my-h*.08, type:'bat',  label:'🔋 بطارية'},
        {id:'S_bat2', x:x1, y:my+h*.08, type:'bat',  label:'🔋 بطارية ٢'},
        {id:'S_sw',   x:mx, y:y1,        type:'sw',   label:'⚡ مفتاح'},
        {id:'S_b1',   x:x2, y:my-h*.1,  type:'bulb', label:'💡 مصباح ١'},
        {id:'S_b2',   x:x2, y:my,        type:'bulb', label:'💡 مصباح ٢'},
        {id:'S_b3',   x:x2, y:my+h*.1,  type:'bulb', label:'💡 مصباح ٣'},
      ]
    };
  }

  function initTray(){
    var l=L(), iw2=l.iw+12;
    localComps.forEach(function(comp,i){
      if(!comp.inCircuit){
        comp.hx = l.w*.04 + i*iw2 + l.iw/2;
        comp.hy = l.trayY + l.ih/2 + 10;
        comp.x=comp.hx; comp.y=comp.hy;
      }
    });
  }
  initTray();

  cv.addEventListener('mousedown',startD); cv.addEventListener('mousemove',moveD); cv.addEventListener('mouseup',endD);
  cv.addEventListener('touchstart',startD,{passive:false}); cv.addEventListener('touchmove',moveD,{passive:false}); cv.addEventListener('touchend',endD,{passive:false});

  var dragC=null,ox=0,oy=0;
  function startD(e){
    var p=gp(e); e.preventDefault();
    for(var i=localComps.length-1;i>=0;i--){
      var comp=localComps[i];
      if(Math.abs(p.x-comp.x)<42&&Math.abs(p.y-comp.y)<34){
        dragC=comp; ox=p.x-comp.x; oy=p.y-comp.y;
        if(comp.inCircuit){ Object.keys(placed).forEach(function(k){ if(placed[k]&&placed[k].id===comp.id){ delete placed[k]; comp.inCircuit=false; updateReads(); }}); }
        break;
      }
    }
  }
  function moveD(e){ if(!dragC)return; e.preventDefault(); var p=gp(e); dragC.x=p.x-ox; dragC.y=p.y-oy; }
  function endD(e){
    if(!dragC)return; e.preventDefault();
    var l=L(), comp=dragC, dropped=false;
    l.slots.forEach(function(slot){
      if(dropped)return;
      if(Math.abs(comp.x-slot.x)<54&&Math.abs(comp.y-slot.y)<42&&slot.type===comp.type&&!placed[slot.id]){
        placed[slot.id]=comp; comp.x=slot.x; comp.y=slot.y; comp.inCircuit=true;
        dropped=true; try{U9Sound.ping(560,.12,.15);}catch(ex){}
        updateReads();
      } else if(Math.abs(comp.x-slot.x)<54&&Math.abs(comp.y-slot.y)<42){ try{U9Sound.ping(220,.3,.2);}catch(ex){} }
    });
    if(!dropped&&!comp.inCircuit){ comp.x=comp.hx; comp.y=comp.hy; }
    dragC=null;
  }

  function draw(){
    var c=elCtx(), l=L(), w=l.w, h=l.h;
    c.clearRect(0,0,w,h);
    c.fillStyle=isDarkMode()?'#141C28':'#EEF2F8'; c.fillRect(0,0,w,h);
    simState.t+=.04;
    var st=calcCircuit(), on=st.on;
    var wc=on?'#27AE60':'#B0BEC5', lw=on?4:2.5;

    // توهج الأسلاك
    if(on){ c.strokeStyle='rgba(39,174,96,.15)'; c.lineWidth=14; c.setLineDash([]);
      c.beginPath(); c.moveTo(l.x1,l.y1); c.lineTo(l.x2,l.y1); c.moveTo(l.x2,l.y1); c.lineTo(l.x2,l.y2);
      c.moveTo(l.x2,l.y2); c.lineTo(l.x1,l.y2); c.moveTo(l.x1,l.y2); c.lineTo(l.x1,l.y1); c.stroke();
    }
    // الأسلاك
    c.strokeStyle=wc; c.lineWidth=lw; c.setLineDash([]);
    c.beginPath();
    c.moveTo(l.x1,l.y1); c.lineTo(l.x2,l.y1);
    c.moveTo(l.x2,l.y1); c.lineTo(l.x2,l.y2);
    c.moveTo(l.x2,l.y2); c.lineTo(l.x1,l.y2);
    c.moveTo(l.x1,l.y2); c.lineTo(l.x1,l.y1);
    c.stroke();
    // نقاط الزوايا
    [[l.x1,l.y1],[l.x2,l.y1],[l.x2,l.y2],[l.x1,l.y2]].forEach(function(p){
      c.fillStyle=on?'#27AE60':'#AABBC8'; c.beginPath(); c.arc(p[0],p[1],5,0,Math.PI*2); c.fill();
    });

    // إلكترونات
    if(on&&simState.flow.length){
      var perim=2*((l.x2-l.x1)+(l.y2-l.y1));
      simState.flow.forEach(function(f){
        f.t=(f.t+.004*f.s*st.I*3)%1;
        var dist=f.t*perim, s1=l.x2-l.x1, s2=l.y2-l.y1, ex,ey;
        if(dist<s1){ex=l.x1+dist;ey=l.y1;}
        else if(dist<s1+s2){ex=l.x2;ey=l.y1+(dist-s1);}
        else if(dist<2*s1+s2){ex=l.x2-(dist-s1-s2);ey=l.y2;}
        else{ex=l.x1;ey=l.y2-(dist-2*s1-s2);}
        c.fillStyle='rgba(0,210,255,'+(0.8-f.t*.3)+')';
        c.beginPath(); c.arc(ex,ey,5,0,Math.PI*2); c.fill();
      });
    }

    // slots
    l.slots.forEach(function(slot){
      if(placed[slot.id]) return;
      c.fillStyle='rgba(255,210,0,.1)'; c.strokeStyle='rgba(255,180,0,.55)'; c.lineWidth=2; c.setLineDash([7,4]);
      c.beginPath(); c.roundRect(slot.x-42,slot.y-22,84,44,10); c.fill(); c.stroke();
      c.setLineDash([]);
      c.font='bold 12px Tajawal'; c.fillStyle='rgba(180,130,0,.9)'; c.textAlign='center'; c.textBaseline='middle';
      c.fillText(slot.label,slot.x,slot.y);
    });

    // المكونات في الدائرة
    localComps.forEach(function(comp){ if(comp.inCircuit) drawComp(c,comp,on,st.br); });

    // صينية
    c.fillStyle=isDarkMode()?'rgba(14,22,34,.88)':'rgba(222,230,242,.92)';
    c.beginPath(); c.roundRect(0,l.trayY-2,w,h-l.trayY+2,0); c.fill();
    c.strokeStyle='rgba(0,0,0,.07)'; c.lineWidth=1;
    c.beginPath(); c.moveTo(0,l.trayY-2); c.lineTo(w,l.trayY-2); c.stroke();
    c.font='bold 11px Tajawal'; c.fillStyle=isDarkMode()?'#7A9AB5':'#8899BB'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('— اسحب مكوناً إلى الدائرة —',w/2,l.trayY+2);

    // المكونات في الصينية
    localComps.forEach(function(comp){ if(!comp.inCircuit) drawComp(c,comp,false,0); });

    // شريط الحالة فوق الصينية
    var msg='', mc='#888';
    if(!placed['S_bat']&&!placed['S_bat2']){ msg='▶ اسحب بطارية إلى الجانب الأيسر 🔋'; }
    else if(!placed['S_b1']&&!placed['S_b2']&&!placed['S_b3']){ msg='💡 اسحب مصباحاً إلى الجانب الأيمن'; }
    else if(!simState.swOn){ msg='⚡ اضغط زر المفتاح أعلاه لإغلاق الدائرة'; }
    else if(on){ msg='✅ الدائرة تعمل! '+st.I.toFixed(2)+' A  |  سطوع '+Math.round(st.br*100)+'%'; mc='#1E8449'; }
    else msg='تحقق من المكونات وأعد المحاولة';
    var sbY=l.trayY-40;
    c.fillStyle=isDarkMode()?'rgba(14,22,34,.92)':'rgba(255,255,255,.94)';
    c.beginPath(); c.roundRect(w*.03,sbY,w*.94,32,9); c.fill();
    c.strokeStyle=on?'rgba(39,174,96,.3)':'rgba(0,0,0,.07)'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(w*.03,sbY,w*.94,32,9); c.stroke();
    c.fillStyle=mc; c.font='bold 12px Tajawal'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText(msg,w/2,sbY+16);

    animFrame=requestAnimationFrame(draw);
  }

  function drawComp(c,comp,on,br){
    var isDrag=(dragC&&dragC.id===comp.id);
    c.shadowBlur=isDrag?20:4; c.shadowColor=isDrag?'rgba(26,143,168,.5)':'rgba(0,0,0,.15)';
    if(comp.type==='bat'){
      c.fillStyle=isDarkMode()?'#1E2A38':'#fff';
      c.strokeStyle=isDrag?'#1A8FA8':'rgba(0,0,0,.14)'; c.lineWidth=isDrag?2.5:2;
      c.beginPath(); c.roundRect(comp.x-32,comp.y-17,64,34,8); c.fill(); c.stroke();
      c.fillStyle='#1A2535'; c.beginPath(); c.roundRect(comp.x-28,comp.y-13,56,26,5); c.fill();
      [{x:-15,col:'#F39C12'},{x:-2,col:'#E67E22'},{x:11,col:'#E74C3C'}].forEach(function(cl){
        c.fillStyle=cl.col; c.fillRect(comp.x+cl.x,comp.y-9,10,18);
      });
      c.fillStyle='white'; c.font='bold 9px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('1.5V',comp.x,comp.y);
      c.font='bold 11px Arial'; c.fillStyle='#F39C12'; c.fillText('+',comp.x+24,comp.y-15);
      c.fillStyle='#888'; c.font='bold 13px Arial'; c.fillText('−',comp.x-24,comp.y-15);
    } else if(comp.type==='sw'){
      c.fillStyle=isDarkMode()?'#1E2A38':'#fff';
      c.strokeStyle=isDrag?'#1A8FA8':(simState.swOn&&comp.inCircuit?'rgba(39,174,96,.55)':'rgba(0,0,0,.14)'); c.lineWidth=isDrag?2.5:2;
      c.beginPath(); c.roundRect(comp.x-30,comp.y-16,60,32,8); c.fill(); c.stroke();
      c.shadowBlur=0;
      c.fillStyle=simState.swOn&&comp.inCircuit?'#27AE60':'#999';
      c.beginPath(); c.arc(comp.x-13,comp.y,4,0,Math.PI*2); c.fill();
      c.beginPath(); c.arc(comp.x+13,comp.y,4,0,Math.PI*2); c.fill();
      c.strokeStyle=simState.swOn&&comp.inCircuit?'#27AE60':'#E74C3C'; c.lineWidth=2.5;
      if(simState.swOn&&comp.inCircuit){ c.beginPath(); c.moveTo(comp.x-13,comp.y); c.lineTo(comp.x+13,comp.y); c.stroke(); }
      else { c.beginPath(); c.moveTo(comp.x-13,comp.y); c.lineTo(comp.x+11,comp.y-10); c.stroke(); }
    } else if(comp.type==='bulb'){
      var lbr=on&&comp.inCircuit?br:0;
      if(lbr>.05){ c.shadowBlur=26*lbr+Math.sin(simState.t*4)*5*lbr; c.shadowColor='rgba(255,220,0,'+(lbr*.8)+')'; }
      c.fillStyle=lbr>.05?('rgba(255,'+(210+lbr*45|0)+','+(40-lbr*20|0)+','+(0.4+lbr*.6)+')'):(isDarkMode()?'rgba(55,65,85,.6)':'rgba(208,213,222,.7)');
      c.beginPath(); c.arc(comp.x,comp.y,24,0,Math.PI*2); c.fill();
      c.shadowBlur=0;
      c.strokeStyle=lbr>.05?'rgba(255,185,0,.7)':'rgba(145,155,170,.5)'; c.lineWidth=2.5;
      c.beginPath(); c.arc(comp.x,comp.y,24,0,Math.PI*2); c.stroke();
      c.strokeStyle=lbr>.05?'rgba(255,200,0,.9)':'rgba(140,150,165,.5)'; c.lineWidth=1.8;
      c.beginPath(); c.moveTo(comp.x-6,comp.y+14); c.lineTo(comp.x-2,comp.y+3); c.lineTo(comp.x,comp.y+9); c.lineTo(comp.x+2,comp.y+3); c.lineTo(comp.x+6,comp.y+14); c.stroke();
      c.fillStyle=isDarkMode()?'#3A4A5A':'#555'; c.beginPath(); c.roundRect(comp.x-11,comp.y+19,22,12,3); c.fill();
    }
    c.shadowBlur=0;
    c.font='bold 11px Tajawal'; c.fillStyle=isDarkMode()?'#B0C8E0':'#445566'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(comp.label, comp.x, comp.type==='bulb'?comp.y+34:comp.y+20);
  }
  draw();
}

// 5-5 TAB 2: رموز الدائرة الكهربائية
function simCircuitBuilder2() {
  cancelAnimationFrame(animFrame);
  var symbols=[
    {name:'خلية كهربائية',draw:'cell',  desc:'مصدر الطاقة — جهد 1.5V'},
    {name:'بطارية',       draw:'bat',   desc:'خليتان أو أكثر — جهد 3V'},
    {name:'مصباح',        draw:'bulb',  desc:'يحوّل الكهرباء إلى ضوء'},
    {name:'مفتاح مفتوح',  draw:'swO',   desc:'يقطع مسار الكهرباء'},
    {name:'مفتاح مغلق',   draw:'swC',   desc:'يكمل مسار الكهرباء'},
    {name:'أميتر',        draw:'amm',   desc:'يقيس شدة التيار (A)'},
    {name:'جرس كهربائي',  draw:'bell',  desc:'يحوّل الكهرباء إلى صوت'},
    {name:'سلك التوصيل',  draw:'wire',  desc:'يوصّل مكونات الدائرة'},
  ];
  simState={t:0,showIdx:0};

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">📐 مكتبة رموز الدوائر</div>
      <div style="display:flex;flex-direction:column;gap:4px">
        ${symbols.map(function(s,i){ return '<button onclick="simState.showIdx='+i+';try{U9Sound.ping();}catch(e){}" id="sy'+i+'" style="padding:7px 10px;border-radius:8px;border:1.5px solid rgba(0,0,0,.1);background:white;font-family:Tajawal;font-size:13px;cursor:pointer;text-align:right;display:flex;align-items:center;gap:8px;transition:all .2s"><span style="color:#1A8FA8;font-weight:700;min-width:18px">'+(i+1)+'</span>'+s.name+'</button>'; }).join('')}
      </div>
    </div>`);

  var cv=document.getElementById('simCanvas');
  function drawSym(c,type,cx,cy,sc){
    sc=sc||1;
    c.strokeStyle=isDarkMode()?'#D8E4F0':'#2C3A4A'; c.lineWidth=2.5*sc; c.fillStyle=isDarkMode()?'#D8E4F0':'#2C3A4A';
    if(type==='cell'){ c.beginPath(); c.moveTo(cx-30*sc,cy); c.lineTo(cx-6*sc,cy); c.stroke(); c.lineWidth=4*sc; c.beginPath(); c.moveTo(cx-6*sc,cy-12*sc); c.lineTo(cx-6*sc,cy+12*sc); c.stroke(); c.lineWidth=1.5*sc; c.beginPath(); c.moveTo(cx+6*sc,cy-6*sc); c.lineTo(cx+6*sc,cy+6*sc); c.stroke(); c.lineWidth=2.5*sc; c.beginPath(); c.moveTo(cx+6*sc,cy); c.lineTo(cx+30*sc,cy); c.stroke(); c.font='bold '+(11*sc)+'px Arial'; c.textAlign='center'; c.fillText('+',cx+14*sc,cy-14*sc); c.fillText('−',cx-14*sc,cy-14*sc); }
    else if(type==='bat'){ [-10,0,10].forEach(function(off){ c.lineWidth=off===0?1.5*sc:3.5*sc; c.beginPath(); c.moveTo(cx+off*sc,cy-10*sc); c.lineTo(cx+off*sc,cy+10*sc); c.stroke(); }); c.lineWidth=2.5*sc; c.beginPath(); c.moveTo(cx-22*sc,cy); c.lineTo(cx-10*sc,cy); c.stroke(); c.beginPath(); c.moveTo(cx+10*sc,cy); c.lineTo(cx+22*sc,cy); c.stroke(); }
    else if(type==='bulb'){ c.beginPath(); c.arc(cx,cy,18*sc,0,Math.PI*2); c.stroke(); c.beginPath(); c.moveTo(cx-10*sc,cy+10*sc); c.lineTo(cx+10*sc,cy-10*sc); c.moveTo(cx+10*sc,cy+10*sc); c.lineTo(cx-10*sc,cy-10*sc); c.stroke(); c.beginPath(); c.moveTo(cx,cy+18*sc); c.lineTo(cx-12*sc,cy+28*sc); c.lineTo(cx+12*sc,cy+28*sc); c.closePath(); c.stroke(); }
    else if(type==='swO'){ c.beginPath(); c.moveTo(cx-22*sc,cy); c.lineTo(cx-8*sc,cy); c.stroke(); c.beginPath(); c.moveTo(cx-8*sc,cy); c.lineTo(cx+8*sc,cy-14*sc); c.stroke(); c.beginPath(); c.moveTo(cx+8*sc,cy); c.lineTo(cx+22*sc,cy); c.stroke(); c.beginPath(); c.arc(cx-8*sc,cy,3*sc,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(cx+8*sc,cy,3*sc,0,Math.PI*2); c.fill(); }
    else if(type==='swC'){ c.beginPath(); c.moveTo(cx-22*sc,cy); c.lineTo(cx+22*sc,cy); c.stroke(); c.beginPath(); c.arc(cx-8*sc,cy,3*sc,0,Math.PI*2); c.fill(); c.beginPath(); c.arc(cx+8*sc,cy,3*sc,0,Math.PI*2); c.fill(); }
    else if(type==='amm'){ c.beginPath(); c.arc(cx,cy,18*sc,0,Math.PI*2); c.stroke(); c.font='bold '+(15*sc)+'px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('A',cx,cy); c.lineWidth=2.5*sc; c.beginPath(); c.moveTo(cx-30*sc,cy); c.lineTo(cx-18*sc,cy); c.stroke(); c.beginPath(); c.moveTo(cx+18*sc,cy); c.lineTo(cx+30*sc,cy); c.stroke(); }
    else if(type==='bell'){ c.beginPath(); c.arc(cx,cy-8*sc,16*sc,Math.PI,0); c.lineTo(cx+16*sc,cy+8*sc); c.lineTo(cx-16*sc,cy+8*sc); c.closePath(); c.stroke(); c.beginPath(); c.moveTo(cx-6*sc,cy+10*sc); c.lineTo(cx+6*sc,cy+10*sc); c.stroke(); c.beginPath(); c.arc(cx,cy+13*sc,3*sc,0,Math.PI*2); c.stroke(); }
    else if(type==='wire'){ c.beginPath(); c.moveTo(cx-32*sc,cy); c.lineTo(cx+32*sc,cy); c.stroke(); }
  }

  function draw(){
    var c=elCtx(),w=elW(),h=elH();
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#F0F4F8'; c.fillRect(0,0,w,h);
    simState.t+=.02;
    var idx=simState.showIdx||0, sym=symbols[idx];

    // تسليط الضوء على الزر المختار
    symbols.forEach(function(_,i){
      var b=document.getElementById('sy'+i);
      if(b){b.style.borderColor=i===idx?'#1A8FA8':'rgba(0,0,0,.1)';b.style.background=i===idx?'rgba(26,143,168,.08)':'white';b.style.fontWeight=i===idx?'700':'400';}
    });

    // اسم الرمز
    c.font='bold 20px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(sym.name,w/2,h*.04);

    // الرمز الكبير
    drawSym(c,sym.draw,w/2,h*.35,2.8);

    // الوصف
    c.font='15px Tajawal'; c.fillStyle=isDarkMode()?'#8AA8C0':'#5A6A7A'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(sym.desc,w/2,h*.58);

    // دائرة مثال
    c.fillStyle=isDarkMode()?'rgba(30,42,56,.6)':'rgba(255,255,255,.6)';
    c.beginPath(); c.roundRect(w*.04,h*.66,w*.92,h*.3,12); c.fill();
    c.font='12px Tajawal'; c.fillStyle=isDarkMode()?'#7A9AB5':'#888'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('مثال: دائرة كاملة بالرموز',w/2,h*.68);
    var dcx=w/2,dcy=h*.82,dr=Math.min(w,h)*.09;
    c.strokeStyle=isDarkMode()?'rgba(255,255,255,.3)':'rgba(0,0,0,.15)'; c.lineWidth=1.5; c.setLineDash([]);
    c.beginPath(); c.rect(dcx-dr*1.8,dcy-dr*.6,dr*3.6,dr*1.2); c.stroke();
    drawSym(c,'cell',dcx-dr*1.4,dcy,.6);
    drawSym(c,'swC', dcx,dcy-dr*.6,.55);
    drawSym(c,'bulb',dcx+dr*1.2,dcy,.5);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// 5-6 TAB 1: تغيير المصابيح — تفاعلي بالسحب
function simCircuitChange1() {
  cancelAnimationFrame(animFrame);
  simState={t:0,bulbs:1,cells:2,swOn:true};

  function stats(){
    var V=simState.cells*1.5, R=simState.bulbs*3.5+.3, I=simState.swOn?V/R:0;
    return{V,R,I,br:Math.min(1,I/.45)};
  }

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">💡 عدد المصابيح</div>
      <div style="display:flex;align-items:center;gap:12px;justify-content:center;margin:8px 0">
        <button onclick="if(simState.bulbs>1)simState.bulbs--;" style="width:36px;height:36px;border-radius:50%;border:none;background:#E74C3C;color:white;font-size:20px;cursor:pointer;font-family:Arial">−</button>
        <span id="bNum" style="font-size:24px;font-weight:800;color:#1A8FA8;min-width:30px;text-align:center">1</span>
        <button onclick="if(simState.bulbs<4)simState.bulbs++;" style="width:36px;height:36px;border-radius:50%;border:none;background:#27AE60;color:white;font-size:20px;cursor:pointer;font-family:Arial">+</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 عدد الخلايا</div>
      <div style="display:flex;align-items:center;gap:12px;justify-content:center;margin:8px 0">
        <button onclick="if(simState.cells>1)simState.cells--;" style="width:36px;height:36px;border-radius:50%;border:none;background:#E74C3C;color:white;font-size:20px;cursor:pointer;font-family:Arial">−</button>
        <span id="cNum" style="font-size:24px;font-weight:800;color:#1A8FA8;min-width:30px;text-align:center">2</span>
        <button onclick="if(simState.cells<4)simState.cells++;" style="width:36px;height:36px;border-radius:50%;border:none;background:#27AE60;color:white;font-size:20px;cursor:pointer;font-family:Arial">+</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ المفتاح</div>
      <div class="toggle-row">
        <span class="toggle-name" id="sw6L">مغلق ✅</span>
        <div class="toggle on" id="sw6T" onclick="simState.swOn=!simState.swOn;document.getElementById('sw6T').classList.toggle('on',simState.swOn);document.getElementById('sw6L').textContent=simState.swOn?'مغلق ✅':'مفتوح ❌';"></div>
      </div>
    </div>
    <div class="info-box" style="font-size:13px">
      📖 ص٤٤: إضافة مصباح = مقاومة أكبر = تيار أقل = سطوع أقل.
    </div>
    <div class="q-box" style="font-size:13px">
      <strong>❓</strong> إذا أضفت مصباحاً رابعاً، ماذا يحدث للسطوع؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
      <div class="q-ans-panel">يقلّ السطوع! لأن المقاومة الكلية تزيد، فيقل التيار المار في الدائرة.</div>
    </div>`);

  var cv=document.getElementById('simCanvas');
  function draw(){
    var c=elCtx(),w=elW(),h=elH();
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#ECEFF4'; c.fillRect(0,0,w,h);
    simState.t+=.04;
    var s=stats(), nb=simState.bulbs, on=s.I>.01;
    document.getElementById('bNum').textContent=nb;
    document.getElementById('cNum').textContent=simState.cells;

    // أسلاك الدائرة
    var py=h*.18, px=w*.08, pw=w*.84, ph=h*.5;
    c.strokeStyle=on?'#27AE60':'#999'; c.lineWidth=on?3:2;
    c.beginPath(); c.moveTo(px,py); c.lineTo(px+pw,py); c.moveTo(px+pw,py); c.lineTo(px+pw,py+ph); c.moveTo(px+pw,py+ph); c.lineTo(px,py+ph); c.moveTo(px,py+ph); c.lineTo(px,py); c.stroke();

    // بطاريات
    for(var ci=0;ci<simState.cells;ci++){
      var by=py+ph*.25+ci*(ph*.14);
      c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(px-30,by-11,60,22,4); c.fill();
      c.fillStyle='#F39C12'; c.fillRect(px-22,by-7,44,14);
      c.fillStyle='white'; c.font='bold 8px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('1.5V',px,by);
    }

    // مفتاح (أعلى يمين)
    var swx=px+pw*.72,swy=py;
    c.fillStyle=isDarkMode()?'#2A3A50':'#DDD'; c.beginPath(); c.roundRect(swx-18,swy-10,36,20,6); c.fill();
    c.strokeStyle='#555'; c.lineWidth=2;
    c.beginPath(); if(simState.swOn){c.moveTo(swx-10,swy);c.lineTo(swx+10,swy);}else{c.moveTo(swx-10,swy+2);c.lineTo(swx+10,swy-6);} c.stroke();

    // مصابيح (أسفل)
    var sp=pw/(nb+1);
    for(var bi=0;bi<nb;bi++){
      var lx=px+sp*(bi+1), ly=py+ph, lbr=on?s.br:0;
      if(lbr>.05){c.shadowBlur=14*lbr+Math.sin(simState.t*4+bi)*4*lbr; c.shadowColor='rgba(255,220,0,.7)';}
      c.fillStyle=lbr>.05?('rgba(255,230,80,'+(0.4+lbr*.5)+')'):'rgba(200,200,200,.5)';
      c.beginPath(); c.arc(lx,ly,15,0,Math.PI*2); c.fill();
      c.shadowBlur=0;
      c.strokeStyle=lbr>.05?'rgba(255,180,0,.6)':'#BBB'; c.lineWidth=1.5;
      c.beginPath(); c.arc(lx,ly,15,0,Math.PI*2); c.stroke();
      c.fillStyle='#555'; c.beginPath(); c.roundRect(lx-7,ly+11,14,8,3); c.fill();
    }

    // معلومات
    c.fillStyle=isDarkMode()?'rgba(20,28,40,.85)':'rgba(255,255,255,.85)';
    c.beginPath(); c.roundRect(w*.05,h*.72,w*.9,h*.24,12); c.fill();
    c.font='bold 14px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('جهد: '+s.V.toFixed(1)+'V  |  تيار: '+s.I.toFixed(2)+'A  |  سطوع: '+Math.round(s.br*100)+'%',w/2,h*.74);

    // شريط السطوع
    var by2=h*.82,bh=h*.07;
    c.fillStyle='rgba(0,0,0,.06)'; c.beginPath(); c.roundRect(w*.1,by2,w*.8,bh,bh/2); c.fill();
    var bf=on?s.br:0;
    if(bf>.02){
      var bg=c.createLinearGradient(w*.1,by2,w*.1+w*.8*bf,by2);
      bg.addColorStop(0,'rgba(255,180,0,.8)'); bg.addColorStop(1,'rgba(255,240,0,.9)');
      c.fillStyle=bg; c.beginPath(); c.roundRect(w*.1,by2,w*.8*bf,bh,bh/2); c.fill();
    }
    c.font='bold 11px Tajawal'; c.fillStyle=bf>.15?'rgba(0,0,0,.5)':'#AAA'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('السطوع',w*.5,by2+bh/2);
    c.font='12px Tajawal'; c.fillStyle=isDarkMode()?'#8AA8C0':'#777'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(nb>2?'↓ زيادة المصابيح تُضعف السطوع (مقاومة أكبر)':'↑ تقليل المصابيح يزيد السطوع',w/2,h*.91);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// 5-6 TAB 2: تغيير الخلايا
function simCircuitChange2() {
  cancelAnimationFrame(animFrame);
  simState={t:0,cells:1};
  function getTableRows(n){
    var rows='<tr style="background:rgba(26,143,168,.12)"><th style="padding:5px 4px;font-size:12px">الخلايا</th><th style="padding:5px 4px;font-size:12px">الجهد</th><th style="padding:5px 4px;font-size:12px">التيار</th><th style="padding:5px 4px;font-size:12px">السطوع</th></tr>';
    for(var i=1;i<=Math.max(n,3);i++){
      var V2=i*1.5,I2=V2/3.6,br2=Math.min(1,I2/.42);
      var isActive=(i===n);
      rows+='<tr style="background:'+(isActive?'rgba(26,143,168,.12)':(i%2===0?'rgba(0,0,0,.03)':''))+'">'+
        '<td style="padding:4px;text-align:center;font-weight:'+(isActive?'800':'400')+';color:'+(isActive?'#1A8FA8':'inherit')+'">'+i+(isActive?' ◀':'')+'</td>'+
        '<td style="text-align:center;font-size:12px;font-weight:'+(isActive?'800':'400')+'">'+V2.toFixed(1)+'V</td>'+
        '<td style="text-align:center;font-size:12px;font-weight:'+(isActive?'800':'400')+';color:'+(isActive?'#1A8FA8':'inherit')+'">'+I2.toFixed(2)+'A</td>'+
        '<td style="text-align:center;font-size:12px;font-weight:'+(isActive?'800':'400')+'">'+Math.round(br2*100)+'%</td>'+
      '</tr>';
    }
    return rows;
  }
  window.updateC2Table=function(){ var tbl=document.getElementById('c2Tbl'); if(tbl) tbl.innerHTML=getTableRows(simState.cells); };

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔋 عدد الخلايا</div>
      <div style="display:flex;align-items:center;gap:14px;justify-content:center;margin:10px 0">
        <button onclick="if(simState.cells>1){simState.cells--;updateC2Table();}" style="width:40px;height:40px;border-radius:50%;border:none;background:#E74C3C;color:white;font-size:22px;cursor:pointer;font-weight:700">−</button>
        <span id="c2n" style="font-size:28px;font-weight:800;color:#1A8FA8;min-width:36px;text-align:center">1</span>
        <button onclick="if(simState.cells<6){simState.cells++;updateC2Table();}" style="width:40px;height:40px;border-radius:50%;border:none;background:#27AE60;color:white;font-size:22px;cursor:pointer;font-weight:700">+</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📊 جدول التأثير</div>
      <table style="width:100%;border-collapse:collapse;font-size:12px" id="c2Tbl">
        ${getTableRows(1)}
      </table>
    </div>
    <div class="info-box" style="font-size:13px">📖 ص٤٦: زيادة الخلايا → جهد أكبر → تيار أكبر → سطوع أكبر.</div>`);

  var cv=document.getElementById('simCanvas');
  var _lastCells=-1;
  function draw(){
    var c=elCtx(),w=elW(),h=elH();
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#ECEFF4'; c.fillRect(0,0,w,h);
    simState.t+=.04;
    var n=simState.cells, V=n*1.5, I=V/3.6, br=Math.min(1,I/.42);
    document.getElementById('c2n').textContent=n;
    if(n!==_lastCells){ _lastCells=n; if(window.updateC2Table) window.updateC2Table(); }

    // بطاريات متراصّة
    var sx=w*.2,sy=h*.1;
    for(var ci=0;ci<n;ci++){
      var cb=sy+ci*22;
      c.fillStyle='hsl('+(30+ci*10)+',75%,'+(38+ci*3)+'%)'; c.beginPath(); c.roundRect(sx-30,cb,60,18,3); c.fill();
      c.fillStyle='rgba(255,240,100,.6)'; c.fillRect(sx-22,cb+3,44,12);
      c.fillStyle='white'; c.font='7px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('1.5V',sx,cb+9);
    }
    c.font='11px Tajawal'; c.fillStyle=isDarkMode()?'#aaa':'#777'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(V.toFixed(1)+'V',sx,sy+n*22+4);

    // مصباح
    var lx=w*.72, ly=h*.38, lsz=25+br*12;
    if(br>.1){ c.shadowBlur=25*br+Math.sin(simState.t*4)*6*br; c.shadowColor='rgba(255,220,0,'+(br*.8)+')'; }
    c.fillStyle='rgba(255,'+(200+br*55|0)+','+(60-br*30|0)+','+(0.3+br*.7)+')';
    c.beginPath(); c.arc(lx,ly,lsz,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle=br>.05?'rgba(255,180,0,'+(br*.7)+')':'#BBB'; c.lineWidth=2;
    c.beginPath(); c.arc(lx,ly,lsz,0,Math.PI*2); c.stroke();
    c.fillStyle='#555'; c.beginPath(); c.roundRect(lx-12,ly+lsz,24,12,3); c.fill();
    c.font='bold 13px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(Math.round(br*100)+'%',lx,ly+lsz+14);

    // أسهم الطاقة
    if(br>.1){ for(var ai=0;ai<Math.floor(n*2);ai++){
      var at=((simState.t*2+ai*.35))%1;
      var ax=sx+42+(lx-lsz-sx-50)*at;
      c.fillStyle='rgba(255,'+(180+ai*10|0)+',0,'+(0.7-at*.4)+')';
      c.font='12px Arial'; c.textAlign='center'; c.fillText('→',ax,h*.3);
    }}

    // أسلاك
    c.strokeStyle=br>.05?'#27AE60':'#999'; c.lineWidth=2;
    c.beginPath(); c.moveTo(sx+30,sy+4); c.lineTo(lx,sy+4); c.lineTo(lx,ly-lsz); c.stroke();
    c.beginPath(); c.moveTo(sx,sy+n*22+2); c.lineTo(sx,h*.62); c.lineTo(lx,h*.62); c.lineTo(lx,ly+lsz+12); c.stroke();

    // خلاصة
    c.fillStyle=isDarkMode()?'rgba(20,28,40,.85)':'rgba(255,255,255,.85)';
    c.beginPath(); c.roundRect(w*.04,h*.72,w*.92,h*.24,12); c.fill();
    c.font='bold 14px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(n+' خلية → '+V.toFixed(1)+'V → '+I.toFixed(2)+'A → سطوع '+Math.round(br*100)+'%',w/2,h*.74);
    c.font='13px Tajawal'; c.fillStyle=isDarkMode()?'#8AA8C0':'#666';
    c.fillText(n>=3?'↑ زيادة الخلايا = جهد أكبر = سطوع أكبر':'أضف المزيد من الخلايا وراقب التغيير!',w/2,h*.87);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// 5-8 TAB 1: طول السلك (شريط قابل للسحب)
function simWireLength1() {
  cancelAnimationFrame(animFrame);
  simState={t:0,len:10,dragging:false,handleX:0};
  var measurements=[];

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">📏 اسحب نهاية السلك لتغيير طوله</div>
      <div style="font-size:13px;color:#777;text-align:center">أو استخدم الأزرار:</div>
      <div style="display:flex;align-items:center;gap:10px;justify-content:center;margin:8px 0">
        <button onclick="simState.len=Math.max(5,simState.len-5);" style="width:36px;height:36px;border-radius:50%;border:none;background:#E74C3C;color:white;font-size:18px;cursor:pointer">−</button>
        <span id="lenV" style="font-size:20px;font-weight:800;color:#1A8FA8;min-width:60px;text-align:center">10 cm</span>
        <button onclick="simState.len=Math.min(50,simState.len+5);" style="width:36px;height:36px;border-radius:50%;border:none;background:#27AE60;color:white;font-size:18px;cursor:pointer">+</button>
      </div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">⚡ قراءة الأميتر</div>
      <div id="lenAm" style="text-align:center;font-size:22px;font-weight:800;color:#1A8FA8">— A</div>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">📋 سجّل قياساتك</div>
      <button onclick="elRecordLen()" style="width:100%;padding:8px;border-radius:8px;background:rgba(26,143,168,.1);border:1.5px solid rgba(26,143,168,.3);color:#1A8FA8;font-family:Tajawal;font-size:13px;cursor:pointer">✏️ سجّل القياس الحالي</button>
      <div id="lenRecs" style="font-size:11px;margin-top:6px"></div>
    </div>
    <div class="info-box" style="font-size:13px">📖 ص٤٨: السلك الطويل له مقاومة أكبر → تيار أقل.</div>`);

  window.elRecordLen=function(){
    var R=0.5+simState.len*.04, I=1.5/R;
    measurements.push({len:simState.len,I:I.toFixed(3)});
    measurements.sort(function(a,b){return a.len-b.len;});
    var el=document.getElementById('lenRecs'); if(!el)return;
    var html='<table style="width:100%;border-collapse:collapse"><tr style="background:rgba(26,143,168,.1)"><th style="padding:3px;font-size:10px">الطول</th><th style="padding:3px;font-size:10px">التيار</th></tr>';
    measurements.forEach(function(m){ html+='<tr><td style="padding:3px;text-align:center">'+m.len+' cm</td><td style="padding:3px;text-align:center;color:#1A8FA8;font-weight:700">'+m.I+' A</td></tr>'; });
    html+='</table>'; el.innerHTML=html;
    try{U9Sound.ping(300+simState.len*4,.1,.1);}catch(ex){}
  };

  var cv=document.getElementById('simCanvas');
  function gp(e){var r=cv.getBoundingClientRect(),sc=cv.width/r.width,s=e.touches?e.touches[0]:e;return{x:(s.clientX-r.left)*sc,y:(s.clientY-r.top)*sc};}
  function L(){var w=elW(),h=elH(); return{w,h,wx:w*.1,wex:w*.9,wy:h*.48,maxW:w*.8};}

  cv.addEventListener('mousedown',function(e){ var p=gp(e), l=L(), ex=l.wx+l.maxW*(simState.len/50); if(Math.abs(p.x-ex)<20&&Math.abs(p.y-l.wy)<20) simState.dragging=true; });
  cv.addEventListener('mousemove',function(e){ if(!simState.dragging)return; var p=gp(e),l=L(); var newLen=Math.round((p.x-l.wx)/l.maxW*50/5)*5; simState.len=Math.max(5,Math.min(50,newLen)); });
  cv.addEventListener('mouseup',function(){simState.dragging=false;});
  cv.addEventListener('touchstart',function(e){ e.preventDefault(); var p=gp(e),l=L(),ex=l.wx+l.maxW*(simState.len/50); if(Math.abs(p.x-ex)<24&&Math.abs(p.y-l.wy)<24) simState.dragging=true; },{passive:false});
  cv.addEventListener('touchmove',function(e){ if(!simState.dragging)return; e.preventDefault(); var p=gp(e),l=L(); var newLen=Math.round((p.x-l.wx)/l.maxW*50/5)*5; simState.len=Math.max(5,Math.min(50,newLen)); },{passive:false});
  cv.addEventListener('touchend',function(){simState.dragging=false;});

  function draw(){
    var c=elCtx(), l=L(), w=l.w, h=l.h;
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=.04;
    var len=simState.len, R=0.5+len*.04, I=1.5/R, ratio=len/50;
    document.getElementById('lenV').textContent=len+' cm';
    document.getElementById('lenAm').textContent=I.toFixed(3)+' A';

    // ── السلك الأفقي ──
    var wx=l.wx, wy=l.wy, maxW=l.maxW;
    var wireEnd=wx+maxW*ratio;
    // مسار كامل (رمادي)
    c.strokeStyle='rgba(0,0,0,.08)'; c.lineWidth=9; c.lineCap='round';
    c.beginPath(); c.moveTo(wx,wy); c.lineTo(wx+maxW,wy); c.stroke();
    // السلك الفعلي
    c.strokeStyle='#B87333'; c.lineWidth=9;
    c.beginPath(); c.moveTo(wx,wy); c.lineTo(wireEnd,wy); c.stroke();
    // لمعة
    c.strokeStyle='rgba(255,255,255,.3)'; c.lineWidth=3;
    c.beginPath(); c.moveTo(wx,wy-2); c.lineTo(wireEnd,wy-2); c.stroke();
    // مقبض السحب
    c.shadowBlur=simState.dragging?12:4; c.shadowColor='rgba(26,143,168,.4)';
    c.fillStyle=simState.dragging?'#1A8FA8':'#E74C3C';
    c.beginPath(); c.arc(wireEnd,wy,10,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.fillStyle='white'; c.font='bold 12px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('↔',wireEnd,wy);
    // مشابك
    [wx,wireEnd].forEach(function(mx){ c.fillStyle='#E74C3C'; c.beginPath(); c.roundRect(mx-5,wy-14,10,28,3); c.fill(); });

    // تسمية
    c.strokeStyle='rgba(0,0,0,.3)'; c.lineWidth=1; c.setLineDash([4,4]);
    c.beginPath(); c.moveTo(wx,wy+18); c.lineTo(wireEnd,wy+18); c.stroke(); c.setLineDash([]);
    c.fillStyle=isDarkMode()?'#aaa':'#555'; c.font='bold 13px Tajawal'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(len+' cm',(wx+wireEnd)/2,wy+20);

    // ── إلكترونات ──
    for(var ei=0;ei<Math.round(I*8);ei++){
      var et=((simState.t*I*1.5+ei/10))%1;
      c.fillStyle='rgba(0,200,255,'+(0.8-et*.4)+')'; c.beginPath(); c.arc(wx+maxW*ratio*et,wy,3.5,0,Math.PI*2); c.fill();
    }

    // ── حلقة الدائرة (بطارية + أميتر) ──
    c.strokeStyle=I>.4?'#27AE60':'#E67E22'; c.lineWidth=2;
    c.beginPath(); c.moveTo(wx,wy); c.lineTo(wx,h*.2); c.lineTo(w*.38,h*.2); c.stroke();
    c.beginPath(); c.moveTo(wireEnd,wy); c.lineTo(wireEnd,h*.2); c.lineTo(w*.62,h*.2); c.stroke();
    c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(w*.27,h*.1,56,28,5); c.fill();
    c.fillStyle='#F39C12'; c.fillRect(w*.27+8,h*.1+5,40,18);
    c.fillStyle='white'; c.font='bold 9px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('1.5V',w*.27+28,h*.1+14);
    c.fillStyle=isDarkMode()?'#1E2A38':'white'; c.strokeStyle='rgba(0,0,0,.2)'; c.lineWidth=1.5;
    c.beginPath(); c.arc(w*.72,h*.19,14,0,Math.PI*2); c.fill(); c.stroke();
    c.fillStyle='#E74C3C'; c.font='bold 11px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('A',w*.72,h*.19);

    // ── خلاصة ──
    c.fillStyle=isDarkMode()?'rgba(20,28,40,.85)':'rgba(255,255,255,.85)';
    c.beginPath(); c.roundRect(w*.04,h*.6,w*.92,h*.36,12); c.fill();
    c.font='bold 14px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(len+' cm → مقاومة '+R.toFixed(2)+' Ω → تيار '+I.toFixed(3)+' A',w/2,h*.62);
    var bY=h*.72,bH=h*.07;
    c.fillStyle='rgba(0,0,0,.06)'; c.beginPath(); c.roundRect(w*.1,bY,w*.8,bH,bH/2); c.fill();
    var bf=I/1.5;
    var bg=c.createLinearGradient(w*.1,bY,w*.1+w*.8*bf,bY);
    bg.addColorStop(0,'rgba(39,174,96,.8)'); bg.addColorStop(1,'rgba(26,143,168,.8)');
    c.fillStyle=bg; c.beginPath(); c.roundRect(w*.1,bY,w*.8*bf,bH,bH/2); c.fill();
    if(bf>.15){ c.font='bold 11px Tajawal'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('التيار',w*.5,bY+bH/2); }
    c.font='13px Tajawal'; c.fillStyle=isDarkMode()?'#8AA8C0':'#666'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(len>25?'السلك الطويل: مقاومة أكبر → تيار أقل ↓':'السلك القصير: مقاومة أقل → تيار أكبر ↑',w/2,h*.81);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// 5-8 TAB 2: سُمك السلك
function simWireLength2() {
  cancelAnimationFrame(animFrame);
  var wires=[
    {label:'رفيع جداً (0.5mm)',  th:.5, R:2.8, col:'#E74C3C'},
    {label:'رفيع (1mm)',         th:1,  R:1.4, col:'#E67E22'},
    {label:'متوسط (2mm)',        th:2,  R:.8,  col:'#F1C40F'},
    {label:'سميك (3mm)',         th:3,  R:.5,  col:'#27AE60'},
    {label:'سميك جداً (4mm)',    th:4,  R:.35, col:'#1A8FA8'},
  ];
  simState={t:0,sel:1};
  var localWires=wires;

  elCtrl(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔗 اختر سُمك السلك</div>
      ${wires.map(function(ww,i){ return '<button id="wb'+i+'" onclick="simState.sel='+i+';try{U9Sound.ping();}catch(e){}" style="width:100%;padding:9px 10px;border-radius:10px;border:2px solid rgba(0,0,0,.1);background:white;font-family:Tajawal;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:8px;margin-bottom:5px;transition:all .2s"><span style="display:inline-block;height:'+(ww.th*4+4)+'px;width:32px;background:'+ww.col+';border-radius:3px"></span><span style="flex:1;text-align:right">'+ww.label+'</span><span style="font-size:11px;color:#888">'+ww.R+' Ω</span></button>'; }).join('')}
    </div>
    <div class="info-box" style="font-size:13px">
      📖 ص٤٨: السلك السميك = مقاومة أقل = تيار أكبر.<br>
      (مثل الخرطوم السميك: ماء أكثر!)
    </div>
    <div class="q-box" style="font-size:13px">
      <strong>❓</strong> لماذا كابلات تمديد الكهرباء سميكة؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 الإجابة</button>
      <div class="q-ans-panel">السلك السميك يحمل تياراً أكبر دون أن يسخن أو يحترق، وهذا يمنع الحرائق الكهربائية.</div>
    </div>`);

  var cv=document.getElementById('simCanvas');
  function draw(){
    var c=elCtx(),w=elW(),h=elH();
    c.clearRect(0,0,w,h); c.fillStyle=isDarkMode()?'#141C28':'#F5F8FA'; c.fillRect(0,0,w,h);
    simState.t+=.04;
    var ww=localWires[simState.sel], I=1.5/ww.R;
    // تحديث الأزرار
    localWires.forEach(function(_,i){ var b=document.getElementById('wb'+i); if(b){b.style.borderColor=i===simState.sel?'#1A8FA8':'rgba(0,0,0,.1)';b.style.background=i===simState.sel?'rgba(26,143,168,.08)':'white';}});

    // ── السلك الرئيسي ──
    var wx=w*.1,wy=h*.48,ww2=w*.8;
    c.strokeStyle=ww.col; c.lineWidth=ww.th*7; c.lineCap='round';
    c.beginPath(); c.moveTo(wx,wy); c.lineTo(wx+ww2,wy); c.stroke();
    c.strokeStyle='rgba(255,255,255,.3)'; c.lineWidth=ww.th*2.5;
    c.beginPath(); c.moveTo(wx,wy-ww.th*2); c.lineTo(wx+ww2,wy-ww.th*2); c.stroke();
    c.fillStyle=isDarkMode()?'#aaa':'#555'; c.font='12px Tajawal'; c.textAlign='center'; c.textBaseline='top';
    c.fillText('سُمك: '+ww.th+'mm',w/2,wy+ww.th*4+6);

    // مشابك
    [wx,wx+ww2].forEach(function(mx){ c.fillStyle='#E74C3C'; c.beginPath(); c.roundRect(mx-5,wy-16,10,32,3); c.fill(); });

    // إلكترونات
    var ne=Math.round(I*14);
    for(var ei=0;ei<ne;ei++){
      var et=((simState.t*I*1.2+ei/ne))%1;
      c.fillStyle='rgba(0,210,255,'+(0.8-et*.4)+')'; c.beginPath(); c.arc(wx+ww2*et,wy,3.5,0,Math.PI*2); c.fill();
    }

    // دائرة
    c.strokeStyle=I>.5?'#27AE60':'#E67E22'; c.lineWidth=2;
    c.beginPath(); c.moveTo(wx,wy); c.lineTo(wx,h*.18); c.lineTo(w*.35,h*.18); c.stroke();
    c.beginPath(); c.moveTo(wx+ww2,wy); c.lineTo(wx+ww2,h*.18); c.lineTo(w*.65,h*.18); c.stroke();
    c.fillStyle='#2C3E50'; c.beginPath(); c.roundRect(w*.24,h*.09,56,28,5); c.fill();
    c.fillStyle='#F39C12'; c.fillRect(w*.24+8,h*.09+5,40,18);
    c.fillStyle='white'; c.font='bold 9px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('1.5V',w*.24+28,h*.09+14);
    c.fillStyle=isDarkMode()?'#1E2A38':'white'; c.strokeStyle='rgba(0,0,0,.2)'; c.lineWidth=1.5;
    c.beginPath(); c.arc(w*.73,h*.18,14,0,Math.PI*2); c.fill(); c.stroke();
    c.fillStyle='#E74C3C'; c.font='bold 11px Arial'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('A',w*.73,h*.18);

    // خلاصة
    c.fillStyle=isDarkMode()?'rgba(20,28,40,.85)':'rgba(255,255,255,.85)';
    c.beginPath(); c.roundRect(w*.04,h*.62,w*.92,h*.34,12); c.fill();
    c.font='bold 14px Tajawal'; c.fillStyle=isDarkMode()?'#E8F2FA':'#1E2D3D'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(ww.label+' → '+ww.R+'Ω → '+I.toFixed(3)+' A',w/2,h*.64);
    var bY=h*.73,bH=h*.07;
    c.fillStyle='rgba(0,0,0,.06)'; c.beginPath(); c.roundRect(w*.1,bY,w*.8,bH,bH/2); c.fill();
    var bf=Math.min(1,I/1.5);
    c.fillStyle=ww.col+'BB'; c.beginPath(); c.roundRect(w*.1,bY,w*.8*bf,bH,bH/2); c.fill();
    if(bf>.15){ c.font='bold 11px Tajawal'; c.fillStyle='white'; c.textAlign='center'; c.textBaseline='middle'; c.fillText('التيار',w*.5,bY+bH/2); }
    c.font='13px Tajawal'; c.fillStyle=isDarkMode()?'#8AA8C0':'#666'; c.textAlign='center'; c.textBaseline='top';
    c.fillText(ww.th>=3?'السلك السميك: مقاومة أقل → تيار أكبر ↑':'السلك الرفيع: مقاومة أكبر → تيار أقل ↓',w/2,h*.82);

    animFrame=requestAnimationFrame(draw);
  }
  draw();
}

// ===== HELPERS =====
function ctx() { return document.getElementById('simCanvas').getContext('2d'); }
function W() { return document.getElementById('simCanvas').width; }
function H() { return document.getElementById('simCanvas').height; }
function controls(html) { document.getElementById('simControlsPanel').innerHTML = html; }
function dataDisplay(show, rows=[]) {
  const el = document.getElementById('dataDisplay');
  el.style.display = show ? 'block' : 'none';
  el.innerHTML = rows.map(r => `<div class="data-row"><span class="data-key">${r[0]}</span><span class="data-val">${r[1]}</span></div>`).join('');
}
function sl(id, fn) {
  const el = document.getElementById(id);
  if (el) { el.addEventListener('input', fn); fn.call(el); }
}
function tog(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', () => { el.classList.toggle('on'); fn(el.classList.contains('on')); });
}
function btn(id, fn) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', fn);
}
function lerp(a, b, t) { return a + (b-a)*t; }
function randBetween(a, b) { return a + Math.random()*(b-a); }


// ===== 7-1: ADAPTATION - TAB 1: FENNEC FOX (الثعلب الرملي) =====
