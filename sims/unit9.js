//  UNIT 7  —  بيّن · محاكيات بأسلوب PhET
// ══════════════════════════════════════════════════════════════════

// ─── مساعدات مشتركة ──────────────────────────────────────────────
function P(id){return document.getElementById(id);}
function pCtrl(html){document.getElementById('simControlsPanel').innerHTML=html;}
function pArrow(c,x1,y1,x2,y2,col,lw){
  lw=lw||2;const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);if(len<2)return;
  const ux=dx/len,uy=dy/len,hs=lw*3.5;
  c.beginPath();c.moveTo(x1,y1);c.lineTo(x2-ux*hs,y2-uy*hs);
  c.strokeStyle=col;c.lineWidth=lw;c.stroke();
  c.beginPath();c.moveTo(x2,y2);c.lineTo(x2-ux*hs-uy*hs,y2-uy*hs+ux*hs);
  c.lineTo(x2-ux*hs+uy*hs,y2-uy*hs-ux*hs);c.closePath();c.fillStyle=col;c.fill();
}
function pBox(c,x,y,w,h,fill,stroke,r){
  r=r||6;c.beginPath();c.roundRect(x,y,w,h,r);
  if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}
}
function pTxt(c,t,x,y,col,sz,bold,align){
  c.fillStyle=col||'#333';c.font=(bold?'bold ':'')+((sz||12)+'px Tajawal');
  c.textAlign=align||'center';c.fillText(t,x,y);
}
function pGrad(c,x,y,w,h,c1,c2,vert){
  const g=vert?c.createLinearGradient(x,y,x,y+h):c.createLinearGradient(x,y,x+w,y);
  g.addColorStop(0,c1);g.addColorStop(1,c2);return g;
}
function pSlider(id,min,max,val,step,label,unit,cb){
  return `<div class="ctrl-row">
    <div class="ctrl-name">${label} <span class="ctrl-val" id="${id}V">${val}${unit}</span></div>
    <input type="range" min="${min}" max="${max}" value="${val}" step="${step||1}"
      oninput="document.getElementById('${id}V').textContent=this.value+'${unit}';(${cb})(+this.value)">
  </div>`;
}
function pReadout(label,id,col){
  return `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid #F0F0F0">
    <span style="font-size:15px;color:#666">${label}</span>
    <span style="font-size:15px;font-weight:bold;color:${col||'#1A8FA8'}" id="${id}">—</span></div>`;
}




// ╔══════════════════════════════════════════════════════════════╗
// ║   UNIT 9 - القُوى والحركة  (Enhanced v5 - Drag + Big Fonts)║
// ╚══════════════════════════════════════════════════════════════╝

// ── مساعدات رسم مشتركة ─────────────────────────────────────
const U9 = {
  arrow(c,x1,y1,x2,y2,col,lw=3,label='',labelSide=1){
    const dx=x2-x1,dy=y2-y1,len=Math.sqrt(dx*dx+dy*dy);
    if(len<4)return;
    const ux=dx/len,uy=dy/len,hs=Math.max(lw*5.5,18);
    c.save();c.strokeStyle=col;c.fillStyle=col;c.lineWidth=lw;c.lineCap='round';
    // ظل ناعم للسهم
    c.shadowColor=col+'AA';c.shadowBlur=6;
    c.beginPath();c.moveTo(x1,y1);c.lineTo(x2-ux*hs,y2-uy*hs);c.stroke();
    c.beginPath();c.moveTo(x2,y2);
    c.lineTo(x2-ux*hs-uy*hs*0.6,y2-uy*hs+ux*hs*0.6);
    c.lineTo(x2-ux*hs+uy*hs*0.6,y2-uy*hs-ux*hs*0.6);
    c.closePath();c.fill();
    c.shadowBlur=0;
    if(label){
      // ══ تسمية السهم — خلفية بيضاء صلبة، خط سميك، حجم 16px ══
      const OFFSET = Math.max(lw*8, 30);
      const mx = (x1+x2)/2;
      const my = (y1+y2)/2;
      const px = mx - uy*OFFSET*labelSide;
      const py = my + ux*OFFSET*labelSide;
      c.font = 'bold 16px Tajawal';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      const tw = c.measureText(label).width;
      const bpad = 10, bh = 26;
      // ظل للتسمية
      c.shadowColor = 'rgba(0,0,0,0.15)';
      c.shadowBlur = 5;
      c.fillStyle = 'rgba(255,255,255,1)';
      c.strokeStyle = col;
      c.lineWidth = 2.5;
      c.beginPath();
      c.roundRect(px-tw/2-bpad, py-bh/2, tw+bpad*2, bh, 8);
      c.fill(); c.stroke();
      c.shadowBlur = 0;
      c.fillStyle = col;
      c.fillText(label, px, py);
    }
    c.restore();
  },
  rect(c,x,y,w,h,fill,stroke,r=8,lw=1.5){
    c.save();c.beginPath();c.roundRect(x,y,w,h,r);
    if(fill){c.fillStyle=fill;c.fill();}
    if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}
    c.restore();
  },
  txt(c,t,x,y,col='#333',size=16,bold=false,align='center'){
    c.save();c.font=(bold?'bold ':'')+size+'px Tajawal';
    c.fillStyle=col;c.textAlign=align;c.textBaseline='middle';c.fillText(t,x,y);c.restore();
  },
  grid(c,w,h,col='#D0DDE8',step=50){
    c.save();c.strokeStyle=col;c.lineWidth=0.8;
    for(let x=step;x<w;x+=step){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}
    for(let y=step;y<h;y+=step){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
    c.restore();
  },
  badge(c,label,val,unit,x,y,col='#2980B9',w=140){
    const g=c.createLinearGradient(x,y,x,y+52);
    g.addColorStop(0,col+'22');g.addColorStop(1,col+'0A');
    U9.rect(c,x,y,w,52,null,col,10,2);
    c.save();c.beginPath();c.roundRect(x,y,w,52,10);c.fillStyle=g;c.fill();c.restore();
    U9.txt(c,label,x+w/2,y+16,'#555',15,false);
    U9.txt(c,val,x+w/2,y+33,col,19,true);
    if(unit)U9.txt(c,unit,x+w/2,y+46,'#888',14);
  },
  gauge(c,cx,cy,r,val,max,col,label){
    const a0=Math.PI*0.75,a1=Math.PI*2.25;
    const frac=Math.min(Math.abs(val)/max,1);
    c.save();
    c.beginPath();c.arc(cx,cy,r,a0,a1);c.strokeStyle='#E0E8F0';c.lineWidth=11;c.stroke();
    if(frac>0){
      const fillCol=frac<0.5?'#27AE60':frac<0.8?'#F39C12':'#E74C3C';
      c.beginPath();c.arc(cx,cy,r,a0,a0+(a1-a0)*frac);
      c.strokeStyle=fillCol;c.lineWidth=11;c.stroke();
    }
    const na=a0+(a1-a0)*frac;
    c.strokeStyle='#2C3A4A';c.lineWidth=3;
    c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(na)*(r-10),cy+Math.sin(na)*(r-10));c.stroke();
    c.fillStyle='#2C3A4A';c.beginPath();c.arc(cx,cy,5,0,Math.PI*2);c.fill();
    U9.txt(c,Math.abs(val).toFixed(1),cx,cy+18,col,16,true);
    if(label)U9.txt(c,label,cx,cy+r+18,'#555',15);
    c.restore();
  },
  ground(c,y,w,type){
    type=type||'normal';
    const conf={
      normal:{top:'#8B6914',fill:'#A0752A'},
      smooth:{top:'#29B6F6',fill:'#81D4FA'},
      rough:{top:'#7B3A10',fill:'#A0522D'},
      ice:{top:'#90CAF9',fill:'#DDEEFF'},
      grass:{top:'#388E3C',fill:'#66BB6A'},
    };
    const cl=conf[type]||conf.normal;
    c.fillStyle=cl.fill;c.fillRect(0,y,w,30);
    c.fillStyle=cl.top;c.fillRect(0,y,w,5);
    if(type==='rough'){
      c.strokeStyle='rgba(80,30,0,0.5)';c.lineWidth=2;
      for(let tx=0;tx<w;tx+=12){c.beginPath();c.moveTo(tx,y);c.lineTo(tx+6,y-7);c.stroke();}
    }
    if(type==='ice'){
      c.strokeStyle='rgba(255,255,255,0.8)';c.lineWidth=1.5;
      for(let tx=5;tx<w;tx+=25){c.beginPath();c.moveTo(tx,y+3);c.lineTo(tx+14,y+3);c.stroke();}
    }
    if(type==='grass'){
      c.strokeStyle='#2E7D32';c.lineWidth=1.5;
      for(let tx=4;tx<w;tx+=10){
        c.beginPath();c.moveTo(tx,y);c.quadraticCurveTo(tx-3,y-6,tx,y-10);c.stroke();
      }
    }
  },
  person(c,x,y,scale=1,dir=1,pulling=false){
    // dir=1 يعني يواجه اليسار (يسحب يساراً), dir=-1 يواجه اليمين
    c.save();c.translate(x,y);c.scale(dir*scale,scale);

    // ── ساقان ──
    c.strokeStyle='#546E7A';c.lineWidth=3.5*scale;c.lineCap='round';
    // ساق يسرى
    c.beginPath();c.moveTo(-3,-6);c.lineTo(-6,10);c.stroke();
    // ساق يمنى
    c.beginPath();c.moveTo(3,-6);c.lineTo(7,10);c.stroke();
    // قدمان
    c.strokeStyle='#37474F';c.lineWidth=3*scale;
    c.beginPath();c.moveTo(-6,10);c.lineTo(-10,12);c.stroke();
    c.beginPath();c.moveTo(7,10);c.lineTo(11,12);c.stroke();

    // ── جسم (قميص) ──
    c.fillStyle='#1565C0';c.strokeStyle='#0D47A1';c.lineWidth=1.5;
    c.beginPath();c.roundRect(-9,-38,18,32,4);c.fill();c.stroke();

    // ── ذراع خلفي (أبعد عن الجهة) ──
    c.strokeStyle='#FFCBA4';c.lineWidth=4.5*scale;c.lineCap='round';
    if(pulling){
      // يسحب: ذراع ممدود للأمام (جهة الحبل)
      c.beginPath();c.moveTo(-8,-28);c.quadraticCurveTo(-18,-22,-20,-14);c.stroke();
      // يد خلفية أمامية
      c.beginPath();c.moveTo(8,-28);c.quadraticCurveTo(18,-22,20,-14);c.stroke();
    } else {
      // وقوف عادي
      c.beginPath();c.moveTo(-8,-28);c.quadraticCurveTo(-14,-18,-12,-8);c.stroke();
      c.beginPath();c.moveTo(8,-28);c.quadraticCurveTo(14,-18,12,-8);c.stroke();
    }

    // ── رأس ──
    // رقبة
    c.fillStyle='#FFCBA4';c.strokeStyle='#FFAA80';c.lineWidth=1;
    c.beginPath();c.roundRect(-4,-44,8,8,2);c.fill();
    // وجه
    c.fillStyle='#FFCBA4';c.strokeStyle='#FFAA80';c.lineWidth=1.5;
    c.beginPath();c.arc(0,-52,12,0,Math.PI*2);c.fill();c.stroke();
    // عيون
    c.fillStyle='#37474F';
    c.beginPath();c.arc(-4,-53,1.8,0,Math.PI*2);c.fill();
    c.beginPath();c.arc(4,-53,1.8,0,Math.PI*2);c.fill();
    // ابتسامة صغيرة
    c.strokeStyle='#37474F';c.lineWidth=1.2;
    c.beginPath();c.arc(0,-50,3.5,0.2,Math.PI-0.2);c.stroke();

    // ── شعر ──
    c.fillStyle='#4A2C0A';
    c.beginPath();c.arc(0,-57,8,Math.PI,0);c.fill();
    c.beginPath();c.ellipse(0,-57,9,5,0,Math.PI+0.3,Math.PI*2-0.3);c.fill();

    c.restore();
  },
  particles:{},
  addParticles(id,x,y,col,n=8){
    if(!U9.particles[id])U9.particles[id]=[];
    for(let i=0;i<n;i++){
      U9.particles[id].push({
        x,y,vx:(Math.random()-0.5)*6,vy:-(Math.random()*5+2),
        life:1,col,r:2.5+Math.random()*2.5
      });
    }
  },
  drawParticles(c,id){
    if(!U9.particles[id])return;
    U9.particles[id]=U9.particles[id].filter(p=>{
      p.x+=p.vx;p.y+=p.vy;p.vy+=0.25;p.life-=0.022;
      if(p.life<=0)return false;
      c.save();c.globalAlpha=p.life;
      c.fillStyle=p.col;c.beginPath();c.arc(p.x,p.y,p.r*p.life,0,Math.PI*2);c.fill();
      c.restore();return true;
    });
  },
  // ── دالة مساعدة للحصول على موقع الماوس/اللمس على Canvas ──
  getPos(cv,e){
    const r=cv.getBoundingClientRect();
    const scaleX=cv.width/r.width,scaleY=cv.height/r.height;
    if(e.touches){
      return{x:(e.touches[0].clientX-r.left)*scaleX,y:(e.touches[0].clientY-r.top)*scaleY};
    }
    return{x:(e.clientX-r.left)*scaleX,y:(e.clientY-r.top)*scaleY};
  }
};

// ── دالة رسم لوحة بيانات موحدة وواضحة ──
// rows = [{l:'اسم', v:'قيمة', col:'#color'}, ...]
// dark=true لخلفية داكنة (على خلفيات فاتحة dark=false)
function drawDataPanel(c, x, y, w, title, rows, dark=true){
  const rowH = 32;
  const titleH = 36;
  const padding = 8;
  const h = titleH + rows.length * rowH + padding;
  const bg = dark ? 'rgba(20,30,48,0.92)' : 'rgba(255,255,255,0.95)';
  const border = dark ? 'rgba(255,255,255,0.2)' : '#BDC3C7';
  const titleCol = dark ? 'white' : '#2C3A4A';

  // الخلفية الرئيسية
  U9.rect(c, x, y, w, h, bg, border, 12, 2);

  // العنوان
  c.save();
  c.fillStyle = dark ? 'rgba(255,255,255,0.12)' : '#F0F4F8';
  c.beginPath(); c.roundRect(x, y, w, titleH-4, [12,12,0,0]); c.fill();
  c.restore();
  U9.txt(c, title, x+w/2, y+titleH/2, titleCol, 16, true);

  // الصفوف
  rows.forEach(({l, v, col}, i) => {
    const ry = y + titleH + i * rowH;
    // خلفية متناوبة خفيفة
    if(i % 2 === 0){
      c.save();
      c.fillStyle = col + (dark ? '18' : '22');
      c.beginPath(); c.roundRect(x+4, ry+2, w-8, rowH-4, 6); c.fill();
      c.restore();
    }
    const midY = ry + rowH/2;
    // اسم المتغير - يسار
    U9.txt(c, l, x + 14, midY, dark ? 'rgba(255,255,255,0.75)' : '#666', 14, false, 'left');
    // القيمة - يمين بلون مميز
    U9.txt(c, v, x + w - 14, midY, col, 15, true, 'right');
  });
}

// ══════════════════════════════════════════════════════════════
// 9-1 Tab 1 - مختبر القوى التفاعلي مع السحب
// ══════════════════════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════
// نظام الأصوات - Web Audio API
// ══════════════════════════════════════════════════════════════
const U9Sound = {
  ctx: null,
  _enabled: true,
  _lastScratch: 0,
  init(){
    try{
      if(!this.ctx){
        const AC = window.AudioContext || window.webkitAudioContext;
        if(!AC){ this._enabled=false; return false; }
        this.ctx = new AC();
      }
      if(this.ctx.state==='suspended') this.ctx.resume();
      return true;
    } catch(e){ this._enabled=false; return false; }
  },
  // ارتطام عند السقوط أو الاصطدام - يتناسب مع الكتلة
  thud(vol=0.5, freq=80){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      const dist=ctx.createWaveShaper();
      // distortion لصوت أثقل
      const curve=new Float32Array(256);
      for(let i=0;i<256;i++) curve[i]=Math.tanh((i-128)/32)*0.8;
      dist.curve=curve;
      osc.connect(dist);dist.connect(gain);gain.connect(ctx.destination);
      osc.type='sine';
      osc.frequency.setValueAtTime(freq,ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(15,ctx.currentTime+0.25);
      gain.gain.setValueAtTime(vol,ctx.currentTime);
      gain.gain.setValueAtTime(vol*0.8,ctx.currentTime+0.05);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);
      osc.start();osc.stop(ctx.currentTime+0.4);
    }catch(e){}
  },
  // صوت انزلاق / احتكاك (throttled)
  scratch(vol=0.3){
    try{
      const now=Date.now();
      if(now-this._lastScratch<80)return; // throttle
      this._lastScratch=now;
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.12),ctx.sampleRate);
      const data=buf.getChannelData(0);
      for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*0.5;
      const src=ctx.createBufferSource(),gain=ctx.createGain(),filter=ctx.createBiquadFilter();
      filter.type='bandpass';filter.frequency.value=600;filter.Q.value=1.2;
      src.buffer=buf;src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
      gain.gain.setValueAtTime(vol,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.12);
      src.start();src.stop(ctx.currentTime+0.12);
    }catch(e){}
  },
  // صوت نغمة نظيفة
  ping(freq=440, dur=0.5, vol=0.3){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='sine';osc.frequency.value=freq;
      gain.gain.setValueAtTime(vol,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur);
      osc.start();osc.stop(ctx.currentTime+dur);
    }catch(e){}
  },
  // صوت نبيه / تنبيه توازن
  balance(){
    try{
      if(!this._enabled||!this.init())return;
      this.ping(523,0.15,0.2);
      setTimeout(()=>this.ping(659,0.15,0.2),120);
    }catch(e){}
  },
  // صوت سقوط متسارع (ينخفض تدريجياً)
  falling(progress=0){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='sawtooth';
      const startF=300-progress*200;
      osc.frequency.setValueAtTime(Math.max(startF,80),ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(Math.max(startF*0.7,40),ctx.currentTime+0.08);
      gain.gain.setValueAtTime(0.04,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.08);
      osc.start();osc.stop(ctx.currentTime+0.08);
    }catch(e){}
  },
  // ريح / هواء (مقاومة الهواء)
  wind(vol=0.2){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.2),ctx.sampleRate);
      const data=buf.getChannelData(0);
      for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1);
      const src=ctx.createBufferSource(),gain=ctx.createGain();
      const filter=ctx.createBiquadFilter();
      filter.type='lowpass';filter.frequency.value=400;
      src.buffer=buf;src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0,ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol,ctx.currentTime+0.05);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);
      src.start();src.stop(ctx.currentTime+0.2);
    }catch(e){}
  },
  // زنبرك / ارتداد
  spring(stretch=0){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='triangle';
      const freq=800-stretch*2;
      osc.frequency.setValueAtTime(Math.max(freq,200),ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+0.2);
      gain.gain.setValueAtTime(0.15,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);
      osc.start();osc.stop(ctx.currentTime+0.2);
    }catch(e){}
  },
  // فوز / ميدالية
  win(){
    try{
      if(!this._enabled)return;
      const notes=[523,659,784,1047,1319];
      notes.forEach((f,i)=>setTimeout(()=>this.ping(f,0.4,0.35),i*110));
    }catch(e){}
  },
  // فقاعة / سائل يُسكب
  bubble(vol=0.25){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      [0,60,130].forEach(delay=>{
        setTimeout(()=>{
          const osc=ctx.createOscillator(),gain=ctx.createGain();
          osc.connect(gain);gain.connect(ctx.destination);
          osc.type='sine';
          const f=400+Math.random()*300;
          osc.frequency.setValueAtTime(f,ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(f*1.6,ctx.currentTime+0.07);
          gain.gain.setValueAtTime(vol,ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.09);
          osc.start();osc.stop(ctx.currentTime+0.09);
        },delay);
      });
    }catch(e){}
  },
  // قطرة سائل
  drop(vol=0.3){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='sine';
      osc.frequency.setValueAtTime(1200,ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400,ctx.currentTime+0.12);
      gain.gain.setValueAtTime(vol,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.14);
      osc.start();osc.stop(ctx.currentTime+0.14);
    }catch(e){}
  },
  // تشيير / فيزبات كيميائية
  sizzle(vol=0.2){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const buf=ctx.createBuffer(1,Math.floor(ctx.sampleRate*0.3),ctx.sampleRate);
      const data=buf.getChannelData(0);
      for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*Math.exp(-i/(data.length*0.4));
      const src=ctx.createBufferSource(),gain=ctx.createGain();
      const filter=ctx.createBiquadFilter();
      filter.type='highpass';filter.frequency.value=2000;
      src.buffer=buf;src.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
      gain.gain.setValueAtTime(vol,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);
      src.start();src.stop(ctx.currentTime+0.3);
    }catch(e){}
  },
  // نقرة بسيطة للأزرار
  click(vol=0.12){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='square';
      osc.frequency.setValueAtTime(800,ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400,ctx.currentTime+0.04);
      gain.gain.setValueAtTime(vol,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.04);
      osc.start();osc.stop(ctx.currentTime+0.04);
    }catch(e){}
  },
  // إجابة صحيحة
  correct(){
    try{
      if(!this._enabled)return;
      this.ping(660,0.25,0.28);
      setTimeout(()=>this.ping(880,0.2,0.22),120);
    }catch(e){}
  },
  // إجابة خاطئة
  wrong(){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='sawtooth';
      osc.frequency.setValueAtTime(220,ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100,ctx.currentTime+0.3);
      gain.gain.setValueAtTime(0.25,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.3);
      osc.start();osc.stop(ctx.currentTime+0.3);
    }catch(e){}
  },
  // ارتفاع مستوى / انتقال
  levelup(){
    try{
      if(!this._enabled)return;
      [330,440,550,660].forEach((f,i)=>setTimeout(()=>this.ping(f,0.25,0.25),i*80));
    }catch(e){}
  },
  // سحر / اكتشاف
  magic(vol=0.25){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      [0,80,160,240].forEach((delay,i)=>{
        setTimeout(()=>{
          const osc=ctx.createOscillator(),gain=ctx.createGain();
          osc.connect(gain);gain.connect(ctx.destination);
          osc.type='sine';
          const freqs=[1047,1319,1568,2093];
          osc.frequency.setValueAtTime(freqs[i],ctx.currentTime);
          gain.gain.setValueAtTime(vol,ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.25);
          osc.start();osc.stop(ctx.currentTime+0.25);
        },delay);
      });
    }catch(e){}
  },
  // صوت تحريك slider
  slide(vol=0.08){
    try{
      if(!this._enabled||!this.init())return;
      const ctx=this.ctx;
      const now=ctx.currentTime;
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='triangle';osc.frequency.value=600;
      gain.gain.setValueAtTime(vol,now);
      gain.gain.exponentialRampToValueAtTime(0.001,now+0.06);
      osc.start();osc.stop(now+0.06);
    }catch(e){}
  }
};

function simForces1(){
  if((currentSim!=='forces'&&currentSim!=='g6forces1'&&currentSim!=='g6forces2')||currentTab!==0)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9F1=Object.assign({
    forceL:0,forceR:0,mass:5,
    surfaceType:'normal',
    objX:null,objV:0,objA:0,
    showForces:true,showValues:true,
    paused:false,t:0,trail:[],
    dragging:false,dragOffX:0,
    maxVelocity:0,distance:0,
    dragForce:0, dragActive:false, dragDir:0
  },simState.u9F1||{});

  const SURF={
    normal:{label:'خشب 🪵',fr:0.35,col:'#A0752A'},
    smooth:{label:'زجاج 🪟',fr:0.06,col:'#29B6F6'},
    rough:{label:'خشن 🧱',fr:0.65,col:'#E67E22'},
    ice:{label:'جليد 🧊',fr:0.02,col:'#90CAF9'},
    grass:{label:'عشب 🌿',fr:0.45,col:'#4CAF50'},
  };

  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">📦 كتلة الجسم</div>
  <div class="ctrl-row">
    <div class="ctrl-name">الكتلة: <span class="ctrl-val" id="massV">${S.mass} kg</span></div>
    <input type="range" min="1" max="50" value="${S.mass}"
      oninput="simState.u9F1.mass=+this.value;document.getElementById('massV').textContent=this.value+' kg'">
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">⬅️ قوة اليسار (N)</div>
  <div class="ctrl-row">
    <div class="ctrl-name"><span class="ctrl-val" id="fLV" style="color:#3498DB;font-size:16px;font-weight:bold">${S.forceL} N</span></div>
    <input type="range" min="0" max="200" value="${S.forceL}"
      oninput="simState.u9F1.forceL=+this.value;document.getElementById('fLV').textContent=this.value+' N'">
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">➡️ قوة اليمين (N)</div>
  <div class="ctrl-row">
    <div class="ctrl-name"><span class="ctrl-val" id="fRV" style="color:#E74C3C;font-size:16px;font-weight:bold">${S.forceR} N</span></div>
    <input type="range" min="0" max="200" value="${S.forceR}"
      oninput="simState.u9F1.forceR=+this.value;document.getElementById('fRV').textContent=this.value+' N'">
  </div>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🏔️ نوع السطح</div>
  ${Object.entries(SURF).map(([k,v])=>`
    <button class="ctrl-btn${S.surfaceType===k?' active':''}"
      style="${S.surfaceType===k?'background:'+v.col+';color:#fff;border-color:'+v.col+';font-size:14px':''}"
      onclick="simState.u9F1.surfaceType='${k}';simState.u9F1.objX=null;simState.u9F1.objV=0;simState.u9F1.trail=[];simForces1()">
      ${v.label}</button>
  `).join('')}
</div>
<div class="ctrl-section">
  <div class="ctrl-label" style="font-size:13px">💡 اسحب الصندوق مباشرة على الشاشة!</div>
</div>
<div class="ctrl-section">
  <button class="ctrl-btn play" onclick="simState.u9F1.paused=!simState.u9F1.paused;this.textContent=simState.u9F1.paused?'▶ تشغيل':'⏸ إيقاف'">${S.paused?'▶ تشغيل':'⏸ إيقاف'}</button>
  <button class="ctrl-btn reset" onclick="Object.assign(simState.u9F1,{objX:null,objV:0,trail:[],forceL:0,forceR:0,maxVelocity:0,distance:0,dragActive:false});document.querySelectorAll('#simControlsPanel input[type=range]').forEach(r=>r.value=0);document.getElementById('fLV').textContent='0 N';document.getElementById('fRV').textContent='0 N';simForces1()">↺ إعادة</button>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (ص٤٦-٤٨):</strong><br>
  ١- اكتب جملة لكلٍّ من: دفع، سحب، شد، تدوير.<br>
  ٢- ارسم قدمك تركل كرة وأضف سهم القوّة.

    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- مثال: دفعت الباب / سحبت الكرسي / شددت الحبل / دوّرت المقبض.<br>٢- ارسم قدمك مع سهم يشير في اتجاه حركة الكرة.</div>
  </div>`;

  // ── السحب بالماوس ──
  function getObjBounds(){
    const w=cv.width,h=cv.height;
    const gY=h*0.40;  // الجسم عند 40% — مساحة كافية تحته للوزن
    const ox=S.objX||w/2;
    const bW=75+S.mass*1.8,bH=52+S.mass*1.0;  // أكبر وأوضح
    return{ox,bW,bH,gY,x1:ox-bW/2,y1:gY-bH,x2:ox+bW/2,y2:gY};
  }
  function onDown(e){
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const b=getObjBounds();
    if(pos.x>=b.x1&&pos.x<=b.x2&&pos.y>=b.y1&&pos.y<=b.y2){
      S.dragging=true;S.paused=false;
      S.dragOffX=pos.x-b.ox;
      S.objV=0;
      cv.style.cursor='grabbing';
    }
  }
  function onMove(e){
    if(!S.dragging)return;
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const b=getObjBounds();
    const newX=pos.x-S.dragOffX;
    const oldX=S.objX||cv.width/2;
    S.dragDir=newX>oldX?1:-1;
    S.dragForce=Math.abs(newX-oldX)*3;
    S.objX=Math.max(b.bW/2+10,Math.min(cv.width-b.bW/2-10,newX));
    S.objV=(newX-oldX)*0.5;
  }
  function onUp(){
    S.dragging=false;cv.style.cursor='grab';
  }
  cv.addEventListener('mousedown',onDown);
  cv.addEventListener('mousemove',onMove);
  cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',onDown,{passive:false});
  cv.addEventListener('touchmove',onMove,{passive:false});
  cv.addEventListener('touchend',onUp);
  cv.style.cursor='grab';

  function draw(){
    if((currentSim!=='forces'&&currentSim!=='g6forces1'&&currentSim!=='g6forces2')||currentTab!==0){
      cv.removeEventListener('mousedown',onDown);
      cv.removeEventListener('mousemove',onMove);
      cv.removeEventListener('mouseup',onUp);
      cv.removeEventListener('touchstart',onDown);
      cv.removeEventListener('touchmove',onMove);
      cv.removeEventListener('touchend',onUp);
      cv.style.cursor='default';
      return;
    }
    const w=cv.width,h=cv.height;
    const surf=SURF[S.surfaceType];
    const gY=h*0.40;  // الجسم عند 40% — مساحة كافية تحته للوزن
    const friction=surf.fr*S.mass*10;
    const netF=S.forceR-S.forceL;
    const kineticFr=S.objV!==0?Math.sign(S.objV)*friction:
      Math.abs(netF)>friction?Math.sign(netF)*friction:netF;
    const accel=S.dragging?0:(netF-kineticFr)/S.mass;
    const balanced=Math.abs(netF)<=friction&&S.objV===0&&!S.dragging;

    if(!S.paused&&!S.dragging){
      S.t++;
      S.objA=accel;
      S.objV+=accel*0.016;
      S.objV*=0.999;
      if(S.objX===null)S.objX=w/2;
      S.objX+=S.objV*1.5;
      S.distance+=Math.abs(S.objV*1.5);
      if(Math.abs(S.objV)>S.maxVelocity)S.maxVelocity=Math.abs(S.objV);
      if(S.objX<80){S.objX=80;if(Math.abs(S.objV)>2){U9Sound.thud(0.4);U9.addParticles('f1L',80,gY,'#3498DB',8);}S.objV=0;}
      if(S.objX>w-80){S.objX=w-80;if(Math.abs(S.objV)>2){U9Sound.thud(0.4);U9.addParticles('f1R',w-80,gY,'#E74C3C',8);}S.objV=0;}
      if(S.t%2===0)S.trail.push({x:S.objX,v:Math.abs(S.objV)});
      if(S.trail.length>80)S.trail.shift();
    }

    // خلفية
    c.clearRect(0,0,w,h);
    const sky=c.createLinearGradient(0,0,0,gY);
    sky.addColorStop(0,'#E3F2FD');sky.addColorStop(1,'#F0F8FF');
    c.fillStyle=sky;c.fillRect(0,0,w,gY);
    U9.grid(c,w,h,'#C8DCF0',50);
    c.fillStyle='#F0EDE8';c.fillRect(0,gY,w,h-gY);
    U9.ground(c,gY,w,S.surfaceType);

    // جدران
    c.fillStyle='rgba(44,58,74,0.18)';
    c.fillRect(0,0,10,gY);c.fillRect(w-10,0,10,gY);
    c.strokeStyle='#2C3A4A44';c.lineWidth=2.5;
    c.beginPath();c.moveTo(10,0);c.lineTo(10,gY+5);c.stroke();
    c.beginPath();c.moveTo(w-10,0);c.lineTo(w-10,gY+5);c.stroke();

    const ox=S.objX||w/2;
    const bW=75+S.mass*1.8,bH=52+S.mass*1.0;  // أكبر وأوضح

    // مسار الحركة
    S.trail.forEach((pt,i)=>{
      const alpha=(i/S.trail.length)*0.25;
      c.fillStyle=`rgba(41,128,185,${alpha})`;
      c.beginPath();c.arc(pt.x,gY-bH/2,4*(pt.v/(S.maxVelocity||1))+1,0,Math.PI*2);c.fill();
    });

    // أشخاص — أبعد من الجسم لمنع التداخل مع الأسهم
    const personOffset = Math.max(bW*0.5 + 140, 180);
    if(S.forceL>0) U9.person(c, ox-personOffset, gY, 1.0, 1);
    if(S.forceR>0) U9.person(c, ox+personOffset, gY, 1.0, -1);

    // ①  الجسم أولاً
    const boxG=c.createLinearGradient(ox-bW/2,gY-bH,ox+bW/2,gY);
    boxG.addColorStop(0,'#F5CBA7');boxG.addColorStop(1,'#D4AC0D');
    c.save();
    if(S.dragging){c.shadowColor='rgba(231,76,60,0.5)';c.shadowBlur=20;}
    else if(Math.abs(S.objV)>0.5){c.shadowColor='rgba(41,128,185,0.4)';c.shadowBlur=14;}
    U9.rect(c,ox-bW/2,gY-bH,bW,bH,null,null,8);
    c.fillStyle=boxG;c.fill();
    c.strokeStyle=S.dragging?'#E74C3C':'#B7950B';c.lineWidth=S.dragging?3:2.5;c.stroke();
    c.restore();
    // emoji + كتلة داخل الجسم
    c.font='32px serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('📦', ox, gY-bH*0.55);
    U9.txt(c, S.mass+' kg', ox, gY-bH*0.18, '#5D4037', 14, true);

    // ═══════════════════════════════════════════════════════════════
    // نظام السهام — مواضع ثابتة منفصلة بالكامل، لا تداخل مطلقاً
    // المحاور العمودية:  wX = ox-bW*0.5  /  nX = ox+bW*0.5  (خارج الجسم)
    // المحاور الأفقية:   rY = ثلث الجسم من الأعلى / frY = ثلث الجسم من الأسفل
    // ═══════════════════════════════════════════════════════════════
    const wWeight = S.mass*10;

    if(S.showForces){
      // ══════════════════════════════════════════════════════
      // مواضع السهام الستة — محسوبة بدقة من gY و bH
      // ══════════════════════════════════════════════════════
      const midBox   = gY - bH * 0.5;     // منتصف الجسم
      const topBox   = gY - bH;           // أعلى الجسم
      const spaceUp  = topBox - 24;       // المساحة المتاحة فوق الجسم
      const spaceDown= gY - midBox - 10;  // المساحة من المنتصف للأرض

      // طول السهم العمودي — يتأقلم مع المساحة
      const vLenUp   = Math.min(Math.max(wWeight*0.55, 65), spaceUp*0.68, 95);
      const vLenDown = Math.min(spaceDown - 2, vLenUp, 65);

      // ══ 1. التلامس ↑ — فوق الجسم، على يسار المحور ══
      U9.arrow(c,
        ox - bW*0.26, topBox - 10,
        ox - bW*0.26, Math.max(topBox - 10 - vLenUp, 22),
        '#1B5E20', 6,
        S.showValues ? 'N='+wWeight+' N' : 'تلامس', -1);

      // ══ 2. الوزن ↓ — يُرسم في نهاية draw() فوق كل الطبقات ══

      // ══ 3. قوة اليمين → (أحمر) — من الحافة اليمنى، ارتفاع 68% ══
      if(S.forceR>0){
        const rLen = Math.max(S.forceR * 1.0, 80);
        U9.arrow(c,
          ox + bW/2 + 10, gY - bH*0.68,
          ox + bW/2 + 10 + rLen, gY - bH*0.68,
          '#B71C1C', 7,
          S.showValues ? 'F='+S.forceR+' N' : '', 1);
      }

      // ══ 4. قوة اليسار ← (أزرق) — من الحافة اليسرى، نفس ارتفاع اليمين ══
      if(S.forceL>0){
        const lLen = Math.max(S.forceL * 1.0, 80);
        U9.arrow(c,
          ox - bW/2 - 10, gY - bH*0.68,
          ox - bW/2 - 10 - lLen, gY - bH*0.68,
          '#1565C0', 7,
          S.showValues ? 'F='+S.forceL+' N' : '', 1);
      }

      // ══ 5. الاحتكاك (برتقالي) — ارتفاع 30%، فرق 38% عن السهمين الأحمر/الأزرق ══
      if(!balanced && (Math.abs(netF)>0.5 || Math.abs(S.objV)>0.1)){
        const frDir = -Math.sign(netF||S.objV);
        const frLen = Math.max(Math.min(friction * 1.0, 115), 70);
        const frX   = ox + frDir*(bW/2 + 10);
        U9.arrow(c,
          frX, gY - bH*0.28,
          frX + frDir*frLen, gY - bH*0.28,
          '#E65100', 6,
          S.showValues ? 'احتكاك='+friction.toFixed(0)+' N' : 'احتكاك',
          frDir > 0 ? 1 : -1);
      }

      // ══ 6. سحب يدوي (وردي) — 36px فوق السهمين الأفقيين ══
      if(S.dragging && S.dragForce>5)
        U9.arrow(c, ox, gY - bH*0.68 - 36,
          ox + S.dragDir*Math.min(S.dragForce*0.65, 110), gY - bH*0.68 - 36,
          '#AD1457', 5.5, 'سحب', 1);
    }

    // تسمية الكتلة داخل الجسم — لا تتداخل مع الأسهم الخارجية
    if(S.dragging) U9.txt(c,'↔',ox,gY-bH/2,'rgba(231,76,60,0.6)',18,true);

    // لوحة بيانات
    const st=S.dragging?'✋ يُسحب':balanced?'⚖️ متوازن':Math.abs(accel)>0.2?'⚡ يتسارع':'🏃 يتحرك';
    const stCol=balanced?'#27AE60':'#E74C3C';
    const panelRows=[
      {l:'قوة صافية',v:(netF-kineticFr).toFixed(1)+' N',col:'#E74C3C'},
      {l:'تسارع',v:accel.toFixed(2)+' m/s²',col:'#8E44AD'},
      {l:'السرعة',v:Math.abs(S.objV).toFixed(2)+' m/s',col:'#2980B9'},
      {l:'احتكاك',v:friction.toFixed(1)+' N',col:'#E67E22'},
      {l:'الحالة',v:st,col:stCol},
    ];
    drawDataPanel(c,10,10,250,'📊 القياس',panelRows,false);

    // مقياس التسارع
    U9.gauge(c,w-70,80,48,accel,15,'#8E44AD','التسارع');

    // شريط السرعة — يبدأ بعد سهم الوزن (gY+10+85+15=gY+110)
    const vmax=20,vfrac=Math.min(Math.abs(S.objV)/vmax,1);
    const vW=220,vX=(w-vW)/2,vY=gY+110;
    U9.rect(c,vX,vY,vW,16,'#E8EDF0','#BDC3C7',5,1.5);
    if(vfrac>0){
      const vcol=vfrac<0.5?'#27AE60':vfrac<0.8?'#F39C12':'#E74C3C';
      U9.rect(c,vX,vY,vW*vfrac,14,vcol,null,5);
    }
    U9.txt(c,'السرعة: '+Math.abs(S.objV).toFixed(2)+' m/s',w/2,vY+28,'#444',16,true);

    U9.drawParticles(c,'f1L');U9.drawParticles(c,'f1R');

    // ══ سهم الوزن ↓ — تحت الجسم مباشرة في المنطقة المفتوحة ══
    if(S.showForces){
      const _ox2 = S.objX||w/2;
      const _bW2 = 75+S.mass*1.8;
      const _wLen = Math.min(Math.max(S.mass*10*0.5, 65), 85);
      U9.arrow(c,
        _ox2 + _bW2*0.26, gY + 10,
        _ox2 + _bW2*0.26, gY + 10 + _wLen,
        '#6A1B9A', 6,
        S.showValues ? 'W='+(S.mass*10)+' N' : 'الوزن', 1);
    }
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  if(S.objX===null)S.objX=cv.width/2;
  draw();
}

// ══════════════════════════════════════════════════════════════
// 9-1 Tab 2 - رسم الأجسام الحرة (FBD) — سحب مباشر للسهام
// ══════════════════════════════════════════════════════════════
function simForces2(){
  if((currentSim!=='forces'&&currentSim!=='g6forces1'&&currentSim!=='g6forces2')||(currentTab!==1&&!(currentSim==='g6forces2'&&currentTab===0)))return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9F2=Object.assign({
    scene:'free',
    showNet:true,showComponents:false,t:0,
    // قوى حرة قابلة للسحب: [mag, angleRad, locked]
    freeForces:[
      {mag:80,  angle:Math.PI*1.5, col:'#E74C3C', label:'وزن W',   locked:false},
      {mag:80,  angle:Math.PI*0.5, col:'#27AE60', label:'تلامس N', locked:false},
      {mag:60,  angle:0,            col:'#3498DB', label:'دفع Fa',  locked:false},
      {mag:40,  angle:Math.PI,      col:'#E67E22', label:'احتكاك', locked:false},
    ],
    angle:30,
    draggingIdx:-1,
  },simState.u9F2||{});

  const SCENES={
    free:    {label:'وضع حر',         icon:'✏️', preset:null},
    static:  {label:'جسم ساكن',        icon:'📦', preset:()=>[
      {mag:70,angle:Math.PI*1.5,col:'#E74C3C',label:'وزن W',locked:false},
      {mag:70,angle:Math.PI*0.5,col:'#27AE60',label:'تلامس N',locked:false},
    ]},
    moving:  {label:'يتحرك بثبات',     icon:'🏃', preset:()=>[
      {mag:60,angle:Math.PI*1.5,col:'#E74C3C',label:'وزن W',locked:false},
      {mag:60,angle:Math.PI*0.5,col:'#27AE60',label:'تلامس N',locked:false},
      {mag:70,angle:0,col:'#3498DB',label:'دفع Fa',locked:false},
      {mag:70,angle:Math.PI,col:'#E67E22',label:'احتكاك',locked:false},
    ]},
    slope:   {label:'على منحدر',       icon:'⛰️', preset:()=>{
      const th=S.angle*Math.PI/180,W=80;
      return[
        {mag:W,angle:Math.PI*1.5,col:'#E74C3C',label:'وزن W',locked:false},
        {mag:W*Math.cos(th),angle:Math.PI*0.5-th,col:'#27AE60',label:'تلامس N',locked:false},
        {mag:W*Math.sin(th),angle:Math.PI+th,col:'#E67E22',label:'احتكاك',locked:false},
      ];
    }},
    parachute:{label:'مظلة هوائية',    icon:'🪂', preset:()=>[
      {mag:75,angle:Math.PI*1.5,col:'#E74C3C',label:'وزن W',locked:false},
      {mag:75,angle:Math.PI*0.5,col:'#3498DB',label:'مقاومة D',locked:false},
    ]},
  };

  function applyPreset(key){
    const p=SCENES[key].preset;
    if(p) S.freeForces=p();
    S.scene=key;
    buildControls();
  }

  function buildControls(){
    const net=calcNet();
    const balanced=net.mag<5;
    document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🎬 وضع</div>
  ${Object.entries(SCENES).map(([k,v])=>`
    <button class="ctrl-btn${S.scene===k?' active':''}" style="${S.scene===k?'background:#1A8FA8;color:#fff':''};font-size:12px"
      onclick="window._f2preset('${k}')">${v.icon} ${v.label}</button>
  `).join('')}
</div>
${S.scene==='slope'?`
<div class="ctrl-section">
  <div class="ctrl-label">⛰️ زاوية المنحدر: <span class="ctrl-val" id="angV">${S.angle}°</span></div>
  <input type="range" min="5" max="75" value="${S.angle}"
    oninput="simState.u9F2.angle=+this.value;document.getElementById('angV').textContent=this.value+'°';window._f2preset('slope')">
</div>`:''}
<div class="ctrl-section">
  <div class="ctrl-label">➕ أضف قوة</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:5px">
    <button class="ctrl-btn" style="font-size:12px" onclick="simState.u9F2.freeForces.push({mag:50,angle:0,col:'#9B59B6',label:'قوة '+(simState.u9F2.freeForces.length+1),locked:false})">＋ أفقية →</button>
    <button class="ctrl-btn" style="font-size:12px" onclick="simState.u9F2.freeForces.push({mag:50,angle:Math.PI*0.5,col:'#1ABC9C',label:'قوة '+(simState.u9F2.freeForces.length+1),locked:false})">＋ عمودية ↑</button>
    <button class="ctrl-btn" style="font-size:12px;color:#E74C3C" onclick="if(simState.u9F2.freeForces.length>0)simState.u9F2.freeForces.pop()">✕ حذف آخر</button>
    <button class="ctrl-btn reset" style="font-size:12px" onclick="simState.u9F2.freeForces=[];window._rebuildF2()">↺ مسح</button>
  </div>
</div>
<div class="ctrl-section">
  <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer;margin-bottom:4px">
    <input type="checkbox" ${S.showNet?'checked':''} onchange="simState.u9F2.showNet=this.checked"> عرض المحصلة
  </label>
  <label style="display:flex;align-items:center;gap:6px;font-size:13px;cursor:pointer">
    <input type="checkbox" ${S.showComponents?'checked':''} onchange="simState.u9F2.showComponents=this.checked"> المركبات x,y
  </label>
</div>
<div class="info-box" style="font-size:12px;line-height:1.8">
  <strong>القوى: ${S.freeForces.length}</strong><br>
  Σx = <strong>${net.x.toFixed(1)}</strong> N<br>
  Σy = <strong>${net.y.toFixed(1)}</strong> N<br>
  |F| = <strong style="color:${balanced?'#27AE60':'#E74C3C'}">${net.mag.toFixed(1)}</strong> N<br>
  <span style="color:${balanced?'#27AE60':'#E74C3C'};font-weight:bold">${balanced?'⚖️ متوازنة':'⚡ غير متوازنة'}</span>
</div>
<div style="font-size:10px;color:#AAA;text-align:center;margin-top:4px">💡 اسحب رأس السهم لتغيير القوة</div>`;
  }

  window._f2preset=(k)=>{applyPreset(k);};
  window._rebuildF2=()=>{buildControls();};
  buildControls();

  function calcNet(){
    let nx=0,ny=0;
    S.freeForces.forEach(f=>{nx+=f.mag*Math.cos(f.angle);ny+=f.mag*Math.sin(f.angle);});
    return{x:nx,y:ny,mag:Math.sqrt(nx*nx+ny*ny)};
  }

  // سحب رؤوس السهام
  const OBJ_R=36, SCALE=2.2, HIT=18;
  const getOX=()=>cv.width/2, getOY=()=>cv.height*0.5;

  function onDown(e){
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const ox=getOX(),oy=getOY();
    let hit=-1,minD=HIT*HIT;
    S.freeForces.forEach((f,i)=>{
      const tx=ox+Math.cos(f.angle)*f.mag*SCALE;
      const ty=oy+Math.sin(f.angle)*f.mag*SCALE;
      const d=(pos.x-tx)**2+(pos.y-ty)**2;
      if(d<minD){minD=d;hit=i;}
    });
    S.draggingIdx=hit;
    if(hit>=0) cv.style.cursor='grabbing';
  }
  function onMove(e){
    if(S.draggingIdx<0)return;
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const ox=getOX(),oy=getOY();
    const dx=pos.x-ox, dy=pos.y-oy;
    const dist=Math.sqrt(dx*dx+dy*dy);
    const f=S.freeForces[S.draggingIdx];
    f.mag=Math.max(5,Math.min(180,dist/SCALE));
    f.angle=Math.atan2(dy,dx);
    // تحديث لوحة البيانات لحظياً
    const net=calcNet();
    const el=document.querySelector('.info-box');
    if(el){
      const b=net.mag<5;
      el.innerHTML=`<strong>القوى: ${S.freeForces.length}</strong><br>Σx = <strong>${net.x.toFixed(1)}</strong> N<br>Σy = <strong>${net.y.toFixed(1)}</strong> N<br>|F| = <strong style="color:${b?'#27AE60':'#E74C3C'}">${net.mag.toFixed(1)}</strong> N<br><span style="color:${b?'#27AE60':'#E74C3C'};font-weight:bold">${b?'⚖️ متوازنة':'⚡ غير متوازنة'}</span>`;
    }
  }
  function onUp(){S.draggingIdx=-1;cv.style.cursor='default';}
  function onCanvasHover(e){
    if(S.draggingIdx>=0)return;
    const pos=U9.getPos(cv,e);
    const ox=getOX(),oy=getOY();
    let overArrow=false;
    S.freeForces.forEach(f=>{
      const tx=ox+Math.cos(f.angle)*f.mag*SCALE;
      const ty=oy+Math.sin(f.angle)*f.mag*SCALE;
      if((pos.x-tx)**2+(pos.y-ty)**2<HIT*HIT*1.5)overArrow=true;
    });
    cv.style.cursor=overArrow?'grab':'default';
  }
  cv.addEventListener('mousedown',onDown);
  cv.addEventListener('mousemove',onMove);
  cv.addEventListener('mousemove',onCanvasHover);
  cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',onDown,{passive:false});
  cv.addEventListener('touchmove',onMove,{passive:false});
  cv.addEventListener('touchend',onUp);

  function draw(){
    if((currentSim!=='forces'&&currentSim!=='g6forces1'&&currentSim!=='g6forces2')||(currentTab!==1&&!(currentSim==='g6forces2'&&currentTab===0))){
      cv.removeEventListener('mousedown',onDown);
      cv.removeEventListener('mousemove',onMove);
      cv.removeEventListener('mousemove',onCanvasHover);
      cv.removeEventListener('mouseup',onUp);
      cv.removeEventListener('touchstart',onDown);
      cv.removeEventListener('touchmove',onMove);
      cv.removeEventListener('touchend',onUp);
      return;
    }
    S.t+=0.02;
    const w=cv.width,h=cv.height;
    const ox=getOX(),oy=getOY();

    c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F4F8');bg.addColorStop(1,'#E8EEF5');
    c.fillStyle=bg;c.fillRect(0,0,w,h);
    U9.grid(c,w,h,'#D4DCE8',45);

    const net=calcNet();
    const balanced=net.mag<5;

    // سطح تحت الجسم
    if(S.scene!=='parachute'){
      c.fillStyle='#C8B89044';c.fillRect(ox-100,oy+OBJ_R,200,10);
      c.fillStyle='#A0752A';c.fillRect(ox-100,oy+OBJ_R,200,3);
    }
    // منحدر
    if(S.scene==='slope'){
      const th=S.angle*Math.PI/180,sl=220;
      c.save();c.translate(ox-sl/2,oy+OBJ_R+5);c.rotate(-th);
      c.fillStyle='#8B6914';c.fillRect(0,-3,sl,20);c.restore();
    }

    // سهام القوى
    S.freeForces.forEach((f,i)=>{
      const tx=ox+Math.cos(f.angle)*f.mag*SCALE;
      const ty=oy+Math.sin(f.angle)*f.mag*SCALE;
      const isDragging=S.draggingIdx===i;
      const lw=isDragging?5:3.5;

      // السهم بدون تسمية في U9.arrow — نرسم التسمية يدوياً
      U9.arrow(c,ox,oy,tx,ty,f.col,lw,'',1);

      // تسمية ذكية — موضعها يعتمد على اتجاه السهم
      const labelText=f.label+' '+f.mag.toFixed(0)+'N';
      c.font='bold 12px Tajawal';
      const tw=c.measureText(labelText).width;
      const ang=f.angle;
      const arrowLen=f.mag*SCALE;

      // نقطة على السهم بنسبة 60%
      const midX=ox+Math.cos(ang)*arrowLen*0.60;
      const midY=oy+Math.sin(ang)*arrowLen*0.60;

      // حدد الاتجاه: أفقي أم عمودي؟
      const isHoriz=Math.abs(Math.cos(ang))>Math.abs(Math.sin(ang));
      let lx,ly;
      if(isHoriz){
        // سهم أفقي → ضع التسمية فوق أو تحت
        lx=midX;
        ly=midY+(Math.sin(ang)>=0?48:-48);
      } else {
        // سهم عمودي → ضع التسمية يسار أو يمين
        lx=midX+(Math.cos(ang)>=0?-tw/2-52:tw/2+52);
        ly=midY;
      }

      c.save();
      c.fillStyle='rgba(255,255,255,0.97)';
      c.strokeStyle=f.col; c.lineWidth=1.5;
      c.beginPath();c.roundRect(lx-tw/2-7,ly-11,tw+14,22,6);
      c.fill();c.stroke();
      c.fillStyle=f.col;c.textAlign='center';c.textBaseline='middle';
      c.fillText(labelText,lx,ly);
      c.restore();

      // مركبات
      if(S.showComponents&&!isDragging&&f.mag>10){
        c.save();c.setLineDash([5,4]);
        const fx=f.mag*Math.cos(f.angle)*SCALE, fy=f.mag*Math.sin(f.angle)*SCALE;
        if(Math.abs(fx)>5)U9.arrow(c,ox,oy,ox+fx,oy,f.col+'88',1.5,'',1);
        if(Math.abs(fy)>5)U9.arrow(c,ox+fx,oy,ox+fx,oy+fy,f.col+'88',1.5,'',1);
        c.restore();
      }
      // دائرة التحكم عند رأس السهم — PhET style
      const pulse=isDragging?1:1+Math.sin(S.t*3+i)*0.08;
      const r2=(isDragging?13:10)*pulse;
      c.save();
      c.shadowColor=f.col;c.shadowBlur=isDragging?16:6;
      c.beginPath();c.arc(tx,ty,r2,0,Math.PI*2);
      c.fillStyle=isDragging?f.col:'rgba(255,255,255,0.95)';
      c.fill();
      c.strokeStyle=f.col;c.lineWidth=2.5;c.stroke();
      c.shadowBlur=0;
      if(!isDragging){
        c.font='bold 11px Arial';c.textAlign='center';c.textBaseline='middle';c.fillStyle=f.col;
        c.fillText('⊕',tx,ty);
      }
      c.restore();
    });

    // محصلة
    if(S.showNet&&net.mag>5){
      const na=Math.atan2(net.y,net.x);
      const nl=Math.min(net.mag*SCALE*0.55,120);
      c.save();c.setLineDash([9,5]);
      U9.arrow(c,ox,oy,ox+Math.cos(na)*nl,oy+Math.sin(na)*nl,'#E91E63',5,'محصلة '+net.mag.toFixed(0)+'N',1);
      c.restore();
    }

    // الجسم في المنتصف
    const pulse2=balanced?1+Math.sin(S.t*3)*0.02:1;
    const sz=OBJ_R*pulse2;
    const boxG=c.createLinearGradient(ox-sz,oy-sz,ox+sz,oy+sz);
    boxG.addColorStop(0,'#AED6F1');boxG.addColorStop(1,'#5DADE2');
    c.save();
    c.shadowColor=balanced?'rgba(39,174,96,0.4)':'rgba(0,0,0,0.15)';
    c.shadowBlur=balanced?20:8;
    U9.rect(c,ox-sz,oy-sz,sz*2,sz*2,null,null,10);
    c.fillStyle=boxG;c.fill();
    c.strokeStyle=balanced?'#27AE60':'#2980B9';
    c.lineWidth=balanced?3.5:2.5;c.stroke();
    c.restore();
    U9.txt(c,SCENES[S.scene].icon,ox,oy+2,null,30);

    // شارة الحالة
    const badgeCol=balanced?'#27AE60':'#E74C3C';
    U9.rect(c,w/2-95,5,190,26,badgeCol+'18',badgeCol,8,2);
    U9.txt(c,balanced?'⚖️ قوى متوازنة — الجسم ساكن أو بسرعة ثابتة':'⚡ محصلة '+net.mag.toFixed(0)+'N — يتسارع',w/2,22,badgeCol,10,true);

    // لوحة القياسات
    U9.rect(c,w-150,5,142,66,'rgba(255,255,255,0.92)','#BDC3C7',8,1.5);
    U9.txt(c,'Σx = '+net.x.toFixed(1)+' N',w-78,22,'#2980B9',11,true);
    U9.txt(c,'Σy = '+net.y.toFixed(1)+' N',w-78,38,'#8E44AD',11,true);
    U9.txt(c,'|F| = '+net.mag.toFixed(1)+' N',w-78,54,'#E91E63',11,true);

    // تلميح
    U9.txt(c,'💡 اسحب الدوائر ⊕ لتغيير القوى مباشرة',w/2,h-12,'#999',9);

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 9-1 Tab 3 - محصلة القوى (PhET-style)
// ══════════════════════════════════════════════════════════════
function simNetForce(){
  if((currentSim!=='forces'&&currentSim!=='g6forces1'&&currentSim!=='g6forces2')||currentTab!==2)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  function W(){return cv.width;}
  function H(){return cv.height;}

  // ── الثوابت ──
  const CART_MASS = 10;
  const PUSHER_TYPES = [
    {id:'big',   label:'كبير',  N:50, emoji:'🟥', col:'#E74C3C', w:26, h:56},
    {id:'small', label:'صغير',  N:25, emoji:'🟦', col:'#2980B9', w:22, h:44},
  ];

  // ── الحالة ──
  if(!simState.netForce) simState.netForce = {
    // الدافعون: [{type, side:'left'|'right', x, y, dragging}]
    pushers: [],
    cartX: 0.5,   // نسبة من العرض
    cartV: 0,
    running: false,
    won: null,    // null | 'left' | 'right' | 'tie'
    confetti: [],
    t: 0,
    drag: null,   // الشخص المسحوب حالياً
    shelf: {      // رف الاختيار
      items: [
        {type:'big',  side:'left',  x:0, y:0},
        {type:'small',side:'left',  x:0, y:0},
        {type:'big',  side:'right', x:0, y:0},
        {type:'small',side:'right', x:0, y:0},
      ]
    }
  };
  const S = simState.netForce;

  // ── حساب القوى ──
  function totalLeft()  { return S.pushers.filter(p=>p.side==='left' ).reduce((a,p)=>a+PUSHER_TYPES.find(t=>t.id===p.type).N,0); }
  function totalRight() { return S.pushers.filter(p=>p.side==='right').reduce((a,p)=>a+PUSHER_TYPES.find(t=>t.id===p.type).N,0); }
  // اليسار يدفع لليمين (+) ، اليمين يدفع لليسار (-)
  function netF()       { return totalLeft() - totalRight(); }

  // ── مناطق ثابتة ──
  function groundY(){ return H()*0.72; }
  function cartCX() { return S.cartX * W(); }
  function cartW()  { return 72; }
  function cartH()  { return 46; }

  // موضع التعليق لشخص (بجانب الكارت)
  function pusherDefaultX(side, idx){
    const gap = 52;
    if(side==='left')  return cartCX() - cartW()/2 - 30 - idx*gap;
    else               return cartCX() + cartW()/2 + 30 + idx*gap;
  }

  // ── لوحة التحكم ──
  controls(`
    <div class="ctrl-label" style="text-align:center;font-size:15px">🏆 محصلة القوى</div>
    <div class="info-box" style="font-size:13px;line-height:1.8;text-align:center">
      اسحب الأشخاص من الرف<br>وضعهم بجانب الصندوق
    </div>
    <div id="nfForceBar" style="margin:10px 0;padding:10px;background:rgba(26,143,168,0.07);
      border-radius:10px;text-align:center;font-size:14px;font-weight:700">
      ← 0N &nbsp;|&nbsp; محصلة: 0N &nbsp;|&nbsp; 0N →
    </div>
    <button id="nfGoBtn" onclick="window._nfGo()" style="width:100%;padding:14px;
      border-radius:12px;background:linear-gradient(135deg,#F39C12,#E67E22);
      color:white;border:none;font-family:Tajawal;font-size:18px;
      font-weight:800;cursor:pointer;box-shadow:0 4px 16px rgba(243,156,18,0.4);
      margin-bottom:8px">
      🚀 GO!
    </button>
    <button onclick="window._nfReset()" style="width:100%;padding:9px;
      border-radius:10px;background:rgba(0,0,0,0.05);border:1.5px solid rgba(0,0,0,0.1);
      font-family:Tajawal;font-size:14px;cursor:pointer">
      ↺ إعادة
    </button>
    <div class="q-box" style="margin-top:10px">
      <strong>❓ ص٤٦:</strong> متى يكون الجسم في توازن؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">عندما تتساوى القوى من الجانبين — المحصلة = صفر، فيبقى الجسم ساكناً.</div>
    </div>
  `);

  window._nfGo = function(){
    if(S.pushers.length===0) return;
    S.running=true; S.won=null; S.cartV=0; S.confetti=[];
    try{U9Sound.ping(660,0.25,0.2);}catch(e){}
  };
  window._nfReset = function(){
    simState.netForce=null;
    simNetForce();
  };

  function updateBar(){
    const el=document.getElementById('nfForceBar');
    if(!el) return;
    const tL=totalLeft(), tR=totalRight(), net=netF();
    const netCol = Math.abs(net)<1 ? '#27AE60' : '#E74C3C';
    el.innerHTML=`<span style="color:#2980B9">⬅ ${tL}N</span> &nbsp;|&nbsp;
      <span style="color:${netCol};font-size:15px">محصلة: ${net>0?'+':''}${net}N</span>
      &nbsp;|&nbsp; <span style="color:#E74C3C">${tR}N ➡</span>`;
  }

  // ── رسم شخص دافع (Stick figure) ──
  function drawPerson(cx, y, type, side, alpha, highlight){
    const pt = PUSHER_TYPES.find(t=>t.id===type);
    c.globalAlpha = alpha||1;
    c.save(); c.translate(cx, y);
    if(side==='right') c.scale(-1,1); // يواجه اليسار

    const col = pt.col;
    const h   = pt.h;
    const legAnim = S.running ? Math.sin(S.t*0.18)*8 : 0;

    // ظل
    c.fillStyle='rgba(0,0,0,0.1)';
    c.beginPath(); c.ellipse(0,4,pt.w*0.7,5,0,0,Math.PI*2); c.fill();

    // ساقان
    c.strokeStyle=col; c.lineWidth=4; c.lineCap='round';
    c.beginPath(); c.moveTo(-5,-h*0.28); c.lineTo(-8+legAnim,0); c.stroke();
    c.beginPath(); c.moveTo(5,-h*0.28); c.lineTo(8-legAnim,0); c.stroke();

    // جسم
    c.strokeStyle=col; c.lineWidth=5;
    c.beginPath(); c.moveTo(0,-h*0.28); c.lineTo(0,-h*0.78); c.stroke();

    // ذراعان — ذراع الدفع يمتد للأمام
    c.lineWidth=4;
    c.beginPath(); c.moveTo(0,-h*0.65); c.lineTo(pt.w*0.8,-h*0.6); c.stroke(); // ذراع دفع
    c.beginPath(); c.moveTo(0,-h*0.65); c.lineTo(-8,-h*0.5); c.stroke(); // ذراع خلفي

    // رأس
    c.beginPath(); c.arc(0,-h*0.88,10,0,Math.PI*2);
    c.fillStyle=col; c.fill();
    c.strokeStyle='rgba(0,0,0,0.15)'; c.lineWidth=1.5; c.stroke();

    // وجه
    c.fillStyle='white'; c.font='11px serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('😤',0,-h*0.88);

    // قيمة القوة — نرسمها بدون عكس
    c.restore(); // نخرج من save الذي فيه scale
    c.save();
    c.fillStyle=col; c.font=`bold ${type==='big'?12:11}px Tajawal`;
    c.textAlign='center'; c.textBaseline='bottom';
    c.fillText(pt.N+'N', cx, y - pt.h - 6);
    c.restore();
    // نعيد save للخروج النظيف
    c.save();

    // هالة عند التحديد
    if(highlight){
      c.strokeStyle='rgba(255,200,0,0.8)'; c.lineWidth=2.5; c.setLineDash([4,3]);
      c.beginPath(); c.arc(0,-h*0.5,pt.w+8,0,Math.PI*2); c.stroke();
      c.setLineDash([]);
    }

    c.restore();
    c.globalAlpha=1;
  }

  // ── رسم الصندوق (عربة) ──
  function drawCart(cx, y){
    const bW=cartW(), bH=cartH();
    // ظل
    c.fillStyle='rgba(0,0,0,0.12)';
    c.beginPath(); c.ellipse(cx+3,y+4,bW*0.55,7,0,0,Math.PI*2); c.fill();
    // جسم
    c.shadowColor='rgba(0,0,0,0.2)'; c.shadowBlur=10;
    const cg=c.createLinearGradient(cx-bW/2,0,cx+bW/2,0);
    cg.addColorStop(0,'#F39C12'); cg.addColorStop(0.5,'#F5B041'); cg.addColorStop(1,'#D68910');
    c.fillStyle=cg;
    c.beginPath(); c.roundRect(cx-bW/2,y-bH,bW,bH,[8,8,4,4]); c.fill();
    c.shadowBlur=0;
    c.strokeStyle='#B7770D'; c.lineWidth=2;
    c.beginPath(); c.roundRect(cx-bW/2,y-bH,bW,bH,[8,8,4,4]); c.stroke();
    // أيقونة
    c.font='20px serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('📦',cx,y-bH/2);
    // عجلات
    [-22,22].forEach(ox=>{
      c.beginPath(); c.arc(cx+ox,y+3,9,0,Math.PI*2);
      c.fillStyle='#2C3E50'; c.fill();
      c.beginPath(); c.arc(cx+ox,y+3,4.5,0,Math.PI*2);
      c.fillStyle='#BDC3C7'; c.fill();
    });
  }

  // ── رسم الرف (عناصر قابلة للسحب) ──
  function drawShelf(){
    const sw = W()*0.16, sh = H()*0.72;
    // عنوان
    c.font='bold 12px Tajawal'; c.fillStyle='#546E7A'; c.textAlign='center';
    c.fillText('اسحب ↓', W()*0.08, sh*0.08);
    c.fillText('اسحب ↓', W()*0.92, sh*0.08);

    // رسم كل عنصر في الرف
    S.shelf.items.forEach((item,i)=>{
      const isLeft = item.side==='left';
      const pt = PUSHER_TYPES.find(t=>t.id===item.type);
      const sx = isLeft ? W()*0.08 : W()*0.92;
      const sy = H()*0.25 + (i%2)*H()*0.22;
      item.shelfX = sx; item.shelfY = sy;

      // خلفية
      c.fillStyle=`${pt.col}18`;
      c.beginPath(); c.roundRect(sx-22,sy-pt.h-18,44,pt.h+28,[8]); c.fill();
      c.strokeStyle=`${pt.col}44`; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(sx-22,sy-pt.h-18,44,pt.h+28,[8]); c.stroke();

      drawPerson(sx, sy, item.type, item.side, 1, false);
    });
  }

  // ── كونفيتي + تصفيق ──
  function celebrate(){
    S.confetti=[];
    for(let i=0;i<70;i++){
      S.confetti.push({
        x:Math.random()*W(), y:-20-Math.random()*80,
        vx:(Math.random()-0.5)*5, vy:2+Math.random()*4,
        col:['#E74C3C','#3498DB','#F1C40F','#2ECC71','#9B59B6','#E67E22'][i%6],
        r:4+Math.random()*5, rot:Math.random()*Math.PI*2, rv:(Math.random()-0.5)*0.2,
      });
    }
    // صوت تصفيق
    try{
      const ac=new(window.AudioContext||window.webkitAudioContext)();
      for(let i=0;i<8;i++) setTimeout(()=>{
        const buf=ac.createBuffer(1,ac.sampleRate*0.07,ac.sampleRate);
        const d=buf.getChannelData(0);
        for(let j=0;j<d.length;j++) d[j]=(Math.random()*2-1)*Math.exp(-j/(d.length*0.25));
        const s2=ac.createBufferSource(), g=ac.createGain();
        s2.buffer=buf; g.gain.value=0.28;
        s2.connect(g); g.connect(ac.destination); s2.start();
      }, i*110);
    }catch(e){}
  }

  // ── الرسم الرئيسي ──
  function draw(){
    if((currentSim!=='forces'&&currentSim!=='g6forces1'&&currentSim!=='g6forces2')||currentTab!==2)return;
    S.t++;
    const w=W(), h=H();
    c.clearRect(0,0,w,h);

    // خلفية
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#EBF5FB'); bg.addColorStop(1,'#D6EAF8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // سقف / حائط
    c.fillStyle='rgba(52,73,94,0.06)';
    c.fillRect(0,0,w,h*0.07);

    // أرضية
    const gy=groundY();
    c.fillStyle='#8D6E63';
    c.fillRect(0,gy,w,6);
    // خطوط الأرضية
    c.fillStyle='rgba(101,67,33,0.12)';
    c.fillRect(0,gy+6,w,h-gy-6);
    ctx2=c; ctx2.strokeStyle='rgba(141,110,99,0.2)'; ctx2.lineWidth=1;
    for(let x=-40;x<w+40;x+=36){
      const shift=(S.cartX*w*0.3)%36;
      ctx2.beginPath(); ctx2.moveTo(x+shift,gy+6); ctx2.lineTo(x+shift+18,h); ctx2.stroke();
    }

    // ── فيزياء ──
    const net=netF();
    if(S.running && !S.won){
      const acc=net/CART_MASS * 0.016;
      S.cartV=(S.cartV+acc)*0.992;
      S.cartX+=S.cartV/w;
      S.cartX=Math.max(0.1,Math.min(0.9,S.cartX));
      // تحديث مواضع الدافعين مع الكارت
      S.pushers.forEach((p,i)=>{
        const idx=S.pushers.filter(pp=>pp.side===p.side).indexOf(p);
        p.x=pusherDefaultX(p.side,idx);
        p.y=gy;
      });
      if(S.cartX<=0.10){ S.won='right'; S.running=false; celebrate(); }
      else if(S.cartX>=0.90){ S.won='left'; S.running=false; celebrate(); }
      else if(Math.abs(net)<0.5 && Math.abs(S.cartV)<0.0005 && S.pushers.length>0){
        S.won='tie'; S.running=false;
      }
    }

    // ── رسم الرف ──
    drawShelf();

    // ── سهم المحصلة (فوق الكارت) ──
    if(Math.abs(net)>1){
      const arLen=Math.min(Math.abs(net)*1.5, 110);
      const dir=net>0?1:-1;
      const arY=gy-cartH()-22;
      const cx2=cartCX();
      c.strokeStyle='#8E44AD'; c.lineWidth=4; c.lineCap='round';
      c.beginPath(); c.moveTo(cx2,arY); c.lineTo(cx2+dir*arLen,arY); c.stroke();
      c.fillStyle='#8E44AD';
      c.beginPath();
      c.moveTo(cx2+dir*(arLen+12),arY);
      c.lineTo(cx2+dir*arLen,arY-7);
      c.lineTo(cx2+dir*arLen,arY+7);
      c.closePath(); c.fill();
      c.font='bold 12px Tajawal'; c.fillStyle='#6C3483';
      c.textAlign='center'; c.textBaseline='bottom';
      c.fillText('محصلة = '+Math.abs(net)+'N',cx2+dir*arLen/2,arY-3);
    }

    // ── رسم الدافعين الموضوعين ──
    S.pushers.forEach((p,i)=>{
      if(S.drag && S.drag.pusher===p) return; // لا ترسم المسحوب
      const isDragged = false;
      c.save();
      // سهم قوة (خط من الشخص للكارت)
      const pt2=PUSHER_TYPES.find(t=>t.id===p.type);
      if(!S.drag){
        c.strokeStyle=pt2.col+'99'; c.lineWidth=2; c.setLineDash([5,4]);
        c.beginPath(); c.moveTo(p.x,p.y-pt2.h*0.5);
        if(p.side==='left') c.lineTo(cartCX()-cartW()/2-4, p.y-pt2.h*0.5);
        else                c.lineTo(cartCX()+cartW()/2+4, p.y-pt2.h*0.5);
        c.stroke(); c.setLineDash([]);
        // رأس السهم
        const arDir=p.side==='left'?1:-1;
        const arX=p.side==='left'?cartCX()-cartW()/2-4:cartCX()+cartW()/2+4;
        c.fillStyle=pt2.col;
        c.beginPath();
        c.moveTo(arX,p.y-pt2.h*0.5);
        c.lineTo(arX-arDir*10,p.y-pt2.h*0.5-6);
        c.lineTo(arX-arDir*10,p.y-pt2.h*0.5+6);
        c.closePath(); c.fill();
      }
      c.restore();
      drawPerson(p.x, p.y, p.type, p.side, 1, false);
    });

    // ── رسم الكارت ──
    drawCart(cartCX(), gy);

    // ── رسم الشخص المسحوب ──
    if(S.drag){
      const p=S.drag;
      // هل هو قريب من جانب الكارت؟
      const nearLeft  = p.x < cartCX()-cartW()/2+60 && p.x > cartCX()-cartW()/2-120;
      const nearRight = p.x > cartCX()+cartW()/2-60 && p.x < cartCX()+cartW()/2+120;
      const nearGround= p.y > groundY()*0.6;
      const snapSide  = nearLeft?'left': nearRight?'right':null;
      if(snapSide && nearGround){
        // دائرة خضراء: "أفلت هنا"
        const sx2=snapSide==='left'?cartCX()-cartW()/2-30:cartCX()+cartW()/2+30;
        c.strokeStyle='rgba(39,174,96,0.7)'; c.lineWidth=2; c.setLineDash([5,3]);
        c.beginPath(); c.arc(sx2, groundY(), 30, 0, Math.PI*2); c.stroke();
        c.setLineDash([]);
        c.fillStyle='rgba(39,174,96,0.1)';
        c.beginPath(); c.arc(sx2, groundY(), 30, 0, Math.PI*2); c.fill();
      }
      drawPerson(p.x, p.y, p.type, p.fromSide||p.side, 0.8, true);
    }

    // ── نتيجة ──
    if(S.won){
      const msg = S.won==='tie'   ? '⚖️ القوى متوازنة — الجسم ثابت!' :
                  S.won==='right' ? '🏆 فاز الفريق الأيمن! القوة الأكبر →' :
                                    '🏆 فاز الفريق الأيسر! ← القوة الأكبر';
      const bgC = S.won==='tie' ? 'rgba(39,174,96,0.92)' : 'rgba(243,156,18,0.92)';
      c.fillStyle=bgC;
      c.beginPath(); c.roundRect(w/2-170,h*0.15,340,52,[12]); c.fill();
      c.fillStyle='white'; c.font='bold 19px Tajawal';
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(msg,w/2,h*0.15+26);
    }

    // ── كونفيتي ──
    S.confetti=S.confetti.filter(p=>{
      p.x+=p.vx; p.y+=p.vy; p.vy+=0.1; p.rot+=p.rv;
      c.save(); c.translate(p.x,p.y); c.rotate(p.rot);
      c.fillStyle=p.col; c.globalAlpha=Math.max(0,1-p.y/h);
      c.fillRect(-p.r/2,-p.r/2,p.r,p.r);
      c.restore(); c.globalAlpha=1;
      return p.y<h+20;
    });

    // ── شريط المقارنة (أعلى) ──
    {
      const tL=totalLeft(),tR=totalRight(),total=Math.max(tL+tR,1);
      const bW=Math.min(w*0.5,220), bH=12, bX=w/2-bW/2, bY=h*0.04;
      c.fillStyle='rgba(0,0,0,0.07)'; c.beginPath(); c.roundRect(bX,bY,bW,bH,[6]); c.fill();
      const lW=(tL/total)*bW;
      if(lW>0){ c.fillStyle='#2980B9'; c.beginPath(); c.roundRect(bX,bY,lW,bH,[6,0,0,6]); c.fill(); }
      if(bW-lW>0){ c.fillStyle='#E74C3C'; c.beginPath(); c.roundRect(bX+lW,bY,bW-lW,bH,[0,6,6,0]); c.fill(); }
      // خط المنتصف
      c.strokeStyle='white'; c.lineWidth=2;
      c.beginPath(); c.moveTo(bX+bW/2,bY-3); c.lineTo(bX+bW/2,bY+bH+3); c.stroke();
      c.font='11px Tajawal'; c.fillStyle='#555'; c.textAlign='center';
      if(tL>0) c.fillText(tL+'N',bX+lW/2,bY+bH+11);
      if(tR>0) c.fillText(tR+'N',bX+lW+(bW-lW)/2,bY+bH+11);
    }

    // تعليمة إذا لا يوجد أشخاص
    if(S.pushers.length===0 && !S.drag){
      c.font='14px Tajawal'; c.fillStyle='rgba(84,110,122,0.65)'; c.textAlign='center';
      c.fillText('← اسحب الأشخاص من الجانبين وضعهم بجانب الصندوق →',w/2,h*0.5);
    }

    updateBar();
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }

  // ── أحداث السحب ──
  function getPos(e){
    const r=cv.getBoundingClientRect();
    const t=(e.touches&&e.touches[0])||e;
    return {x:(t.clientX-r.left)*cv.width/r.width,
            y:(t.clientY-r.top)*cv.height/r.height};
  }

  function onDown(e){
    e.preventDefault&&e.preventDefault();
    const p=getPos(e);

    // هل ضغط على شخص موجود على الأرضية؟
    for(let i=S.pushers.length-1;i>=0;i--){
      const pu=S.pushers[i];
      const pt2=PUSHER_TYPES.find(t=>t.id===pu.type);
      if(Math.hypot(p.x-pu.x,p.y-pu.y)<pt2.w+18){
        S.drag={pusher:pu, ox:p.x-pu.x, oy:p.y-pu.y,
                x:pu.x, y:pu.y, type:pu.type, side:pu.side, fromSide:pu.side, isFromFloor:true};
        S.pushers.splice(i,1);
        try{U9Sound.ping(440,0.1,0.08);}catch(ex){}
        return;
      }
    }

    // هل ضغط على عنصر الرف؟
    for(const item of S.shelf.items){
      if(Math.hypot(p.x-item.shelfX,p.y-item.shelfY)<30){
        const newPusher={type:item.type, side:item.side, x:item.shelfX, y:item.shelfY};
        S.drag={pusher:newPusher, ox:p.x-item.shelfX, oy:p.y-item.shelfY,
                x:item.shelfX, y:item.shelfY, type:item.type, side:item.side, fromSide:item.side, isFromFloor:false};
        try{U9Sound.ping(523,0.12,0.1);}catch(ex){}
        return;
      }
    }
  }

  function onMove(e){
    e.preventDefault&&e.preventDefault();
    if(!S.drag) return;
    const p=getPos(e);
    S.drag.x = p.x - S.drag.ox;
    S.drag.y = p.y - S.drag.oy;
    S.drag.pusher.x = S.drag.x;
    S.drag.pusher.y = S.drag.y;
  }

  function onUp(e){
    if(!S.drag) return;
    const p=S.drag;
    const pt2=PUSHER_TYPES.find(t=>t.id===p.type);
    const gy2=groundY();

    // هل قريب من جانب الكارت وعلى مستوى الأرضية؟
    const nearLeft  = p.x < cartCX()-cartW()/2+60 && p.x > cartCX()-cartW()/2-140;
    const nearRight = p.x > cartCX()+cartW()/2-60 && p.x < cartCX()+cartW()/2+140;
    const nearGround= p.y > gy2*0.55;

    let placed=false;
    if(nearGround){
      if(nearLeft || nearRight){
        const side = nearLeft ? 'left' : 'right';
        // لا أكثر من 4 دافعين لكل جهة
        if(S.pushers.filter(pp=>pp.side===side).length < 4){
          const idx=S.pushers.filter(pp=>pp.side===side).length;
          const newP={type:p.type, side, x:pusherDefaultX(side,idx), y:gy2};
          S.pushers.push(newP);
          placed=true;
          S.won=null; S.running=false; S.cartX=0.5; S.cartV=0;
          try{U9Sound.ping(660,0.2,0.15);}catch(ex){}
        }
      }
    }

    if(!placed){
      // إرجاع للرف — صوت
      try{U9Sound.ping(330,0.1,0.08);}catch(ex){}
    }

    S.drag=null;
    updateBar();
  }

  cv.addEventListener('mousedown',  onDown, false);
  cv.addEventListener('mousemove',  onMove, false);
  cv.addEventListener('mouseup',    onUp,   false);
  cv.addEventListener('touchstart', onDown, {passive:false});
  cv.addEventListener('touchmove',  onMove, {passive:false});
  cv.addEventListener('touchend',   onUp,   false);

  draw();
}



// ══════════════════════════════════════════════════════════════
// 9-2 Tab 1 - الميزان الزنبركي التفاعلي (PhET-style)
// ══════════════════════════════════════════════════════════════
function simForcemeter1(){
  if(currentSim!=='forcemeter'||currentTab!==0)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  // ── الكتل المتاحة ──
  const MASSES=[
    {kg:0.1, col:'#3498DB', label:'100g'},
    {kg:0.25,col:'#27AE60', label:'250g'},
    {kg:0.5, col:'#E67E22', label:'500g'},
    {kg:1,   col:'#E74C3C', label:'1 kg'},
    {kg:2,   col:'#9B59B6', label:'2 kg'},
    {kg:5,   col:'#1ABC9C', label:'5 kg'},
  ];

  const G=10; // m/s²

  if(!simState.u9FM1) simState.u9FM1={
    // الكتلة المعلقة حالياً (null = لا شيء)
    hung: null,       // { kg, col, label }
    stretch: 0,       // امتداد الزنبرك الحالي (px)
    vel: 0,           // سرعة الاهتزاز
    // السحب
    dragging: null,   // { source:'shelf'|'hung', idx, mx, my }
    dragObj: null,    // { kg, col, label, x, y }
    // حالة
    t: 0,
  };
  const S=simState.u9FM1;

  // ── لوحة التحكم ──
  controls(`
    <div class="ctrl-label">🔬 الميزان الزنبركي</div>
    <div class="info-box" style="font-size:13px;line-height:1.8">
      اسحب أيّ كتلة من الرف وعلّقها بالخطاف<br>
      <span style="color:#1A8FA8">↕ اسحب للتعليق · ↔ اسحب للإزالة</span>
    </div>
    <div id="fm1Reading" style="margin-top:10px;padding:12px;border-radius:10px;
      background:rgba(231,76,60,0.08);border:2px solid rgba(231,76,60,0.25);
      text-align:center;font-size:22px;font-weight:800;color:#C0392B;
      font-family:monospace">
      0.0 N
    </div>
    <div id="fm1Info" style="margin-top:8px;font-size:13px;color:#555;
      text-align:center;min-height:36px;line-height:1.7"></div>
    <div style="margin-top:8px;padding:8px;background:rgba(26,143,168,0.07);
      border-radius:8px;font-size:12px;color:#1A6A8A;text-align:center">
      W = m × g = m × 10
    </div>
    <div class="q-box" style="margin-top:10px">
      <strong>❓ ص٤٩:</strong> ما وزن جسم كتلته 2 kg؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">W = 2 × 10 = 20 نيوتن</div>
    </div>
  `);

  // ── دوال مساعدة ──
  function W(){return cv.width;}
  function H(){return cv.height;}

  // موضع الخطاف (نقطة التعليق)
  function hookX(){return W()*0.52;}
  function hookY(){return H()*0.12;}
  // طول الزنبرك الطبيعي
  function naturalLen(){return H()*0.28;}
  // أقصى امتداد
  function maxStretch(){return H()*0.35;}
  // موضع نهاية الزنبرك (حيث تعلق الكتلة)
  function springEndY(){return hookY()+naturalLen()+S.stretch;}

  // حجم الكتلة (نصف القطر)
  function massR(kg){return Math.max(18, Math.min(46, 14+kg*8));}

  // موضع الرف (يمين)
  function shelfX(){return W()*0.82;}
  function shelfY(i){return H()*0.22 + i*(H()*0.12);}

  // تحديث لوحة التحكم
  function updateReadout(){
    const rd=document.getElementById('fm1Reading');
    const inf=document.getElementById('fm1Info');
    if(!rd) return;
    if(S.hung){
      const w=+(S.hung.kg*G).toFixed(2);
      rd.textContent=w.toFixed(1)+' N';
      rd.style.color='#C0392B';
      if(inf) inf.innerHTML=`<strong style="color:#E67E22">${S.hung.label}</strong> × 10 = <strong style="color:#C0392B">${w} N</strong>`;
    } else {
      rd.textContent='0.0 N';
      rd.style.color='#95A5A6';
      if(inf) inf.textContent='علّق كتلة لقياس وزنها';
    }
  }

  // ── رسم الميزان الزنبركي ──
  function drawMeter(c,w,h){
    const hx=hookX(), hy=hookY();
    const mW=50, mH=H()*0.20;
    const mTop=10, mX=hx;

    // قضيب التعليق
    c.fillStyle='#546E7A';
    c.beginPath(); c.roundRect(mX-3,0,6,mTop+2,[0,0,2,2]); c.fill();
    // قضيب أفقي (حامل)
    c.fillStyle='#546E7A';
    c.beginPath(); c.roundRect(mX-mW*0.8,mTop-3,mW*1.6,6,[3]); c.fill();

    // جسم الميزان
    const bg2=c.createLinearGradient(mX-mW/2,0,mX+mW/2,0);
    bg2.addColorStop(0,'#B0BEC5');
    bg2.addColorStop(0.25,'#FAFAFA');
    bg2.addColorStop(0.75,'#ECEFF1');
    bg2.addColorStop(1,'#90A4AE');
    c.shadowColor='rgba(0,0,0,0.2)'; c.shadowBlur=12; c.shadowOffsetX=3;
    c.fillStyle=bg2;
    c.beginPath(); c.roundRect(mX-mW/2,mTop,mW,mH,[6,6,12,12]); c.fill();
    c.shadowBlur=0; c.shadowOffsetX=0;
    c.strokeStyle='#78909C'; c.lineWidth=1.5;
    c.beginPath(); c.roundRect(mX-mW/2,mTop,mW,mH,[6,6,12,12]); c.stroke();

    // شريط أحمر أعلى
    c.fillStyle='#E53935';
    c.beginPath(); c.roundRect(mX-mW/2,mTop,mW,12,[6,6,0,0]); c.fill();

    // شاشة رقمية
    const dispY=mTop+16, dispH=26;
    c.fillStyle='#0D1117';
    c.beginPath(); c.roundRect(mX-mW/2+5,dispY,mW-10,dispH,[4]); c.fill();
    c.strokeStyle='#2ECC71'; c.lineWidth=1;
    c.beginPath(); c.roundRect(mX-mW/2+5,dispY,mW-10,dispH,[4]); c.stroke();
    const dispVal=S.hung ? S.hung.kg*G : 0;
    c.fillStyle='#2ECC71';
    c.font='bold 13px monospace';
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText((Math.max(0,dispVal)).toFixed(1)+' N', mX, dispY+dispH/2);

    // تدريج جانبي
    const scX=mX+mW/2+5, scTop=mTop+12, scBot=mTop+mH-8, scH=scBot-scTop, scW=48;
    c.fillStyle='rgba(255,255,255,0.9)';
    c.beginPath(); c.roundRect(scX,scTop,scW,scH,[4]); c.fill();
    c.strokeStyle='#CFD8DC'; c.lineWidth=1;
    c.beginPath(); c.roundRect(scX,scTop,scW,scH,[4]); c.stroke();
    const maxN=50, steps=5;
    for(let i=0;i<=steps;i++){
      const ty=scTop+i*(scH/steps);
      const val=maxN-i*(maxN/steps);
      c.fillStyle='#455A64';
      c.fillRect(scX+3,ty-1,10,2);
      c.font='bold 10px Tajawal';
      c.textAlign='left'; c.textBaseline='middle'; c.fillStyle='#1A252F';
      c.fillText(val+'N', scX+16, ty);
    }
    // خطوط فرعية
    for(let i=1;i<steps*2;i++){
      if(i%2===0) continue;
      const ty=scTop+i*(scH/(steps*2));
      c.fillStyle='#90A4AE';
      c.fillRect(scX+3,ty-0.5,6,1);
    }
    // مؤشر
    if(S.hung){
      const frac=Math.min(S.hung.kg*G/maxN,1);
      const indY=scTop+frac*scH;
      c.fillStyle='#E53935';
      c.fillRect(scX,indY-2,scW,4);
      c.beginPath(); c.moveTo(scX,indY); c.lineTo(scX-8,indY-5); c.lineTo(scX-8,indY+5); c.closePath(); c.fill();
      c.font='bold 10px monospace'; c.fillStyle='#C0392B';
      c.textAlign='left'; c.textBaseline= frac<0.5?'top':'bottom';
      c.fillText((S.hung.kg*G).toFixed(1)+'N', scX+14, frac<0.5?indY+3:indY-3);
    }

    // خطاف
    const hookEndY=mTop+mH;
    c.strokeStyle='#37474F'; c.lineWidth=3; c.lineCap='round';
    c.beginPath(); c.moveTo(mX,hookEndY); c.lineTo(mX,hookEndY+12); c.stroke();
    c.beginPath(); c.arc(mX,hookEndY+17,5,-Math.PI/2,Math.PI/2); c.stroke();

    return {hookEndY: hookEndY+17+5};
  }

  // ── رسم الزنبرك ──
  function drawSpring(c,x,fromY,toY,col){
    const coils=12;
    const coilW=12;
    c.strokeStyle=col||'#455A64'; c.lineWidth=2.5; c.lineCap='round';
    c.beginPath();
    for(let i=0;i<=coils*4;i++){
      const t=i/(coils*4);
      const cy=fromY+t*(toY-fromY);
      const cx=x+(i%4<2?1:-1)*coilW*(i%2===0?0:1);
      i===0?c.moveTo(cx,cy):c.lineTo(cx,cy);
    }
    c.stroke();
    // لمعة
    c.strokeStyle='rgba(255,255,255,0.35)'; c.lineWidth=1.2;
    c.beginPath();
    for(let i=0;i<=coils*4;i++){
      const t=i/(coils*4);
      const cy=fromY+t*(toY-fromY);
      const cx=x+(i%4<2?1:-1)*coilW*(i%2===0?0:1)-2;
      i===0?c.moveTo(cx,cy):c.lineTo(cx,cy);
    }
    c.stroke();
  }

  // ── رسم كتلة ──
  function drawMassObj(c,x,y,m,alpha){
    const r=massR(m.kg);
    c.globalAlpha=alpha||1;
    // ظل
    c.fillStyle='rgba(0,0,0,0.15)';
    c.beginPath(); c.ellipse(x+4,y+r+4,r*0.65,r*0.2,0,0,Math.PI*2); c.fill();
    // جسم
    const g2=c.createRadialGradient(x-r*0.3,y-r*0.3,2,x,y,r);
    g2.addColorStop(0,lightenColor(m.col));
    g2.addColorStop(0.6,m.col);
    g2.addColorStop(1,darkenColor(m.col));
    c.shadowColor='rgba(0,0,0,0.3)'; c.shadowBlur=10;
    c.fillStyle=g2;
    c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();
    c.shadowBlur=0;
    c.strokeStyle=darkenColor(m.col); c.lineWidth=2;
    c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.stroke();
    // نص
    c.fillStyle='white';
    c.font=`bold ${Math.max(10,Math.min(15,r*0.55))}px Tajawal,Arial`;
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText(m.label,x,y);
    c.globalAlpha=1;
  }

  // ── رسم الرف ──
  function drawShelf(c){
    const sx=shelfX();
    // خلفية الرف
    c.fillStyle='rgba(84,110,122,0.08)';
    c.beginPath(); c.roundRect(sx-40,H()*0.16,80,H()*0.62+20,[8]); c.fill();
    c.strokeStyle='rgba(84,110,122,0.2)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(sx-40,H()*0.16,80,H()*0.62+20,[8]); c.stroke();
    // عنوان الرف
    c.font='bold 12px Tajawal'; c.fillStyle='#546E7A'; c.textAlign='center';
    c.fillText('الكتل', sx, H()*0.14);

    MASSES.forEach((m,i)=>{
      // لا ترسم الكتلة إذا كانت على الخطاف حالياً
      if(S.hung && S.hung===m) return;
      // لا ترسمها إذا كانت تُسحب
      if(S.dragObj && S.dragObj===m) return;
      const sy=shelfY(i);
      // رف صغير
      c.fillStyle='rgba(120,144,156,0.3)';
      c.fillRect(sx-35,sy+massR(m.kg)+4,70,4);
      drawMassObj(c,sx,sy,m,1);
    });
  }

  function lightenColor(hex){
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return `rgb(${Math.min(255,r+60)},${Math.min(255,g+60)},${Math.min(255,b+60)})`;
  }
  function darkenColor(hex){
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return `rgb(${Math.max(0,r-50)},${Math.max(0,g-50)},${Math.max(0,b-50)})`;
  }

  // ── الرسم الرئيسي ──
  function draw(){
    if(currentSim!=='forcemeter'||currentTab!==0)return;
    S.t++;
    const w=W(), h=H();
    c.clearRect(0,0,w,h);

    // خلفية
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F0F7FF'); bg.addColorStop(1,'#E8F4F8');
    c.fillStyle=bg; c.fillRect(0,0,w,h);

    // سقف
    c.fillStyle='#78909C';
    c.fillRect(0,0,w,8);

    // رسم الميزان
    const {hookEndY}=drawMeter(c,w,h);

    // فيزياء الزنبرك
    const targetStretch = S.hung ? Math.min(S.hung.kg*G*3.5, maxStretch()) : 0;
    S.vel=(S.vel+(targetStretch-S.stretch)*0.14)*0.78;
    S.stretch+=S.vel;

    // الزنبرك من نهاية الميزان لنقطة تعليق الكتلة
    const sx=hookX(), sy=hookEndY;
    const springEnd = sy + naturalLen() + S.stretch;

    if(S.hung){
      drawSpring(c, sx, sy, springEnd, '#546E7A');
      // خيط توصيل
      c.strokeStyle='#546E7A'; c.lineWidth=2;
      c.beginPath(); c.moveTo(sx,sy); c.lineTo(sx,sy+8); c.stroke();

      // الكتلة
      const mr=massR(S.hung.kg);
      drawMassObj(c, sx, springEnd+mr, S.hung, 1);

      // سهم الوزن تحت الكتلة
      const wN=+(S.hung.kg*G).toFixed(1);
      const arLen=Math.max(25, Math.min(70, wN*2.2));
      const arBase=springEnd+mr*2+8;
      c.strokeStyle='#E53935'; c.lineWidth=3; c.lineCap='round';
      c.beginPath(); c.moveTo(sx,arBase); c.lineTo(sx,arBase+arLen); c.stroke();
      c.fillStyle='#E53935';
      c.beginPath(); c.moveTo(sx,arBase+arLen+10); c.lineTo(sx-7,arBase+arLen); c.lineTo(sx+7,arBase+arLen); c.closePath(); c.fill();
      c.font='bold 13px Tajawal'; c.fillStyle='#C0392B';
      c.textAlign='left'; c.textBaseline='middle';
      c.fillText('W = '+wN+' N', sx+12, arBase+arLen/2);
    } else {
      // زنبرك مسترخ
      drawSpring(c, sx, sy, sy+naturalLen()*0.8, '#90A4AE');
      // نقطة الخطاف السفلى
      c.strokeStyle='#546E7A'; c.lineWidth=2;
      c.beginPath(); c.arc(sx, sy+naturalLen()*0.8+5, 5,-Math.PI/2,Math.PI/2); c.stroke();
      // تعليمة
      c.font='14px Tajawal'; c.fillStyle='rgba(84,110,122,0.7)';
      c.textAlign='center'; c.textBaseline='top';
      c.fillText('← علّق كتلة هنا', sx+14, sy+naturalLen()*0.8+18);
    }

    // رسم الرف
    drawShelf(c);

    // مؤشر التعليق عند السحب
    if(S.dragObj){
      const centerX = W()*0.52;
      const dist = Math.abs(S.dragX - centerX);
      const inZone = dist < W()*0.25 && S.dragY > H()*0.05 && S.dragY < H()*0.88;
      c.strokeStyle = inZone ? 'rgba(39,174,96,0.7)' : 'rgba(26,143,168,0.35)';
      c.lineWidth=2; c.setLineDash([5,4]);
      c.beginPath(); c.arc(W()*0.52, H()*0.38, 40, 0, Math.PI*2); c.stroke();
      c.setLineDash([]);
      if(inZone){
        c.fillStyle='rgba(39,174,96,0.12)';
        c.beginPath(); c.arc(W()*0.52, H()*0.38, 40, 0, Math.PI*2); c.fill();
        c.font='12px Tajawal'; c.fillStyle='#27AE60'; c.textAlign='center';
        c.fillText('أفلت للتعليق ✓', W()*0.52, H()*0.38+56);
      }
    }

    // رسم الكتلة أثناء السحب
    if(S.dragObj){
      drawMassObj(c, S.dragX, S.dragY, S.dragObj, 0.85);
      // خط توجيه للخطاف
      if(S.dragY < springEnd-20){
        c.strokeStyle='rgba(26,143,168,0.4)'; c.lineWidth=1.5; c.setLineDash([5,4]);
        c.beginPath(); c.moveTo(S.dragX,S.dragY); c.lineTo(sx,sy); c.stroke();
        c.setLineDash([]);
      }
    }

    updateReadout();
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }

  // ── أحداث السحب ──
  function getPos(e){
    const r=cv.getBoundingClientRect();
    const t=(e.touches&&e.touches[0])||e;
    return {x:(t.clientX-r.left)*cv.width/r.width, y:(t.clientY-r.top)*cv.height/r.height};
  }

  function onDown(e){
    e.preventDefault&&e.preventDefault();
    const p=getPos(e);
    // هل ضغط على كتلة في الرف؟
    for(let i=0;i<MASSES.length;i++){
      const m=MASSES[i];
      if(S.hung===m) continue;
      if(S.dragObj===m) continue;
      const sx2=shelfX(), sy2=shelfY(i), r2=massR(m.kg);
      if(Math.hypot(p.x-sx2,p.y-sy2)<r2+14){
        S.dragObj=m; S.dragX=p.x; S.dragY=p.y;
        S.dragSource='shelf';
        return;
      }
    }
    // هل ضغط على الكتلة المعلقة؟
    if(S.hung){
      const hx2=hookX();
      const springEnd2=hookY()+naturalLen()+S.stretch;
      const massY=springEnd2+massR(S.hung.kg);
      if(Math.hypot(p.x-hx2,p.y-massY)<massR(S.hung.kg)+14){
        S.dragObj=S.hung; S.dragX=p.x; S.dragY=p.y;
        S.dragSource='hung';
        S.hung=null; S.stretch=0; S.vel=0;
      }
    }
  }

  function onMove(e){
    e.preventDefault&&e.preventDefault();
    if(!S.dragObj) return;
    const p=getPos(e);
    S.dragX=p.x; S.dragY=p.y;
  }

  function onUp(e){
    if(!S.dragObj) return;
    const centerX = cv.width * 0.52;
    const dist = Math.abs(S.dragX - centerX);
    const inHookZone = dist < cv.width * 0.25 && S.dragY > cv.height * 0.05 && S.dragY < cv.height * 0.88;

    if(inHookZone){
      // تعليق على الخطاف
      S.hung = S.dragObj;
      S.stretch = 0; S.vel = 0;
      try{U9Sound.ping(660,0.2,0.15);}catch(e2){}
      updateReadout();
    } else {
      // خارج المنطقة = إزالة (ترجع للرف)
      if(S.dragSource === 'hung'){
        // كانت معلقة → الميزان يرجع للصفر
        updateReadout();
      }
      try{U9Sound.ping(330,0.1,0.1);}catch(e2){}
    }
    S.dragObj = null;
  }

  cv.addEventListener('mousedown',  onDown, false);
  cv.addEventListener('mousemove',  onMove, false);
  cv.addEventListener('mouseup',    onUp,   false);
  cv.addEventListener('touchstart', onDown, {passive:false});
  cv.addEventListener('touchmove',  onMove, {passive:false});
  cv.addEventListener('touchend',   onUp,   false);

  draw();
}



// ══════════════════════════════════════════════════════════════
// 9-2 Tab 2 - تحدي قياس القوى
// ══════════════════════════════════════════════════════════════
function simForcemeter2(){
  if(currentSim!=='forcemeter'||currentTab!==1)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9FM2=Object.assign({
    challengeIdx:0,
    userForce:0,pressing:false,
    attempts:[],accuracy:0,
    pressTime:0,score:0
  },simState.u9FM2||{});

  const CHALLENGES=[
    {name:'باب الفصل 🚪',target:8,hint:'ادفع الباب بلطف'},
    {name:'حقيبة مدرسية 🎒',target:25,hint:'ارفع حقيبتك'},
    {name:'صندوق كتب 📦',target:50,hint:'احمل صندوقاً'},
    {name:'سيارة لعبة 🚗',target:90,hint:'ادفع سيارة'},
    {name:'صخرة 🪨',target:120,hint:'تحريك صخرة'},
  ];
  const ch=CHALLENGES[S.challengeIdx];

  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🎯 التحدي</div>
  ${CHALLENGES.map((ch2,i)=>`
    <button class="ctrl-btn${S.challengeIdx===i?' active':''}" style="${S.challengeIdx===i?'background:#E74C3C;color:#fff':''};font-size:13px"
      onclick="simState.u9FM2.challengeIdx=${i};simState.u9FM2.userForce=0;simState.u9FM2.pressing=false;simForcemeter2()">
      ${ch2.name} (${ch2.target}N)</button>
  `).join('')}
</div>
<div class="ctrl-section">
  <div style="font-size:14px;color:#555;margin-bottom:8px">اضغط مع الاستمرار لتطبيق القوة</div>
  <button class="ctrl-btn play" id="pressBtn"
    onmousedown="simState.u9FM2.pressing=true;simState.u9FM2.pressTime=Date.now()"
    ontouchstart="simState.u9FM2.pressing=true;simState.u9FM2.pressTime=Date.now()"
    onmouseup="window._stopPress()" ontouchend="window._stopPress()"
    style="font-size:16px;padding:16px">👇 اضغط هنا</button>
</div>
<div class="ctrl-section">
  <div class="ctrl-label">📊 نتائجك</div>
  <div style="font-size:14px;color:#1A8FA8">المحاولات: ${S.attempts.length}</div>
  <div style="font-size:14px;color:#27AE60">النقاط: ${S.score}</div>
</div>`;

  window._stopPress=()=>{
    if(S.pressing){
      const result=S.userForce;
      const err=Math.abs(result-ch.target)/ch.target*100;
      S.attempts.push({f:result,err:err.toFixed(0),target:ch.target});
      if(S.attempts.length>12)S.attempts.shift();
      if(err<15)S.score+=3;
      else if(err<30)S.score+=1;
      S.pressing=false;S.userForce=0;
      document.getElementById('simControlsPanel').innerHTML&&simForcemeter2();
    }
  };

  function draw(){
    if(currentSim!=='forcemeter'||currentTab!==1)return;
    const w=cv.width,h=cv.height;

    if(S.pressing){
      const held=(Date.now()-S.pressTime)/1000;
      S.userForce=Math.min(ch.target*1.5,held*ch.target*0.8+Math.sin(held*3)*5);
    }

    c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#FFF9F0');bg.addColorStop(1,'#FFF');
    c.fillStyle=bg;c.fillRect(0,0,w,h);

    // عنوان التحدي
    U9.txt(c,ch.name,w/2,38,'#2C3A4A',24,true);
    U9.txt(c,ch.hint,w/2,62,'#888',17,false);
    U9.txt(c,'الهدف: '+ch.target+' N',w/2,84,'#E74C3C',18,true);

    // مقياس
    const mX=w*0.08,mY=h*0.15,mW=w*0.84,mH=36;
    U9.rect(c,mX,mY,mW,mH,'#EEF2F5','#BDC3C7',8,2);
    // تعبئة
    const frac=Math.min(S.userForce/(ch.target*1.5),1);
    if(frac>0){
      const col=frac<0.7?'#27AE60':frac<0.95?'#F39C12':'#E74C3C';
      const g2=c.createLinearGradient(mX,0,mX+mW,0);
      g2.addColorStop(0,col+'CC');g2.addColorStop(1,col);
      U9.rect(c,mX,mY,mW*frac,mH,null,null,8);
      c.fillStyle=g2;c.fill();
    }
    // خط الهدف
    const targetX=mX+mW*(ch.target/(ch.target*1.5));
    c.strokeStyle='#E74C3C';c.lineWidth=3;c.setLineDash([6,4]);
    c.beginPath();c.moveTo(targetX,mY-8);c.lineTo(targetX,mY+mH+8);c.stroke();
    c.setLineDash([]);
    U9.txt(c,'🎯',targetX,mY-20,'#E74C3C',18,true);
    // قراءة
    U9.txt(c,S.userForce.toFixed(1)+' N',w/2,mY+mH+26,'#1A8FA8',20,true);

    // الجسم المطبق عليه القوة
    const objX=w/2,objY=h*0.45;
    const icons=['🚪','🎒','📦','🚗','🪨'];
    U9.txt(c,icons[S.challengeIdx],objX,objY,null,62);
    if(S.pressing&&S.userForce>5){
      U9.arrow(c,objX-80,objY,objX-80+S.userForce*0.8,objY,'#3498DB',5,S.userForce.toFixed(0)+' N',1);
    }

    // رسم بياني للمحاولات
    if(S.attempts.length>0){
      const gX=mX,gY2=h*0.6,gW=mW,gH=h*0.32;
      U9.rect(c,gX,gY2,gW,gH,'rgba(255,255,255,0.8)','#DDD',10,1.5);
      U9.txt(c,'سجل المحاولات',gX+gW/2,gY2+18,'#555',16,true);
      const barW=(gW-20)/(Math.max(S.attempts.length,12)+1);
      S.attempts.forEach((a,i)=>{
        const bx=gX+10+i*(barW+2);
        const bh=Math.min(a.f/ch.target*(gH-50),gH-50);
        const col=a.err<15?'#27AE60':a.err<30?'#F39C12':'#E74C3C';
        U9.rect(c,bx,gY2+gH-10-bh,barW,bh,col,null,3);
        U9.txt(c,a.f.toFixed(0),bx+barW/2,gY2+gH-14,col,13,true);
      });
      // خط الهدف
      const ty=gY2+gH-10-(ch.target/ch.target*(gH-50));
      c.strokeStyle='#E74C3C';c.lineWidth=2;c.setLineDash([5,3]);
      c.beginPath();c.moveTo(gX+5,ty);c.lineTo(gX+gW-5,ty);c.stroke();
      c.setLineDash([]);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}


// 9-3 Tab 1 - الوزن والجاذبية مع السحب
// ══════════════════════════════════════════════════════════════
function simGravity1(){
  if((currentSim!=='gravity'&&currentSim!=='g6gravity')||currentTab!==0)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9G1=Object.assign({
    mass:5,planet:'earth',
    falling:false,dropped:false,
    ballY:0,ballV:0,fallTime:0,
    dragging:false,dragY:0
  },simState.u9G1||{});

  const PLANETS={
    earth:{label:'🌍 الأرض',g:10,col:'#2980B9',sky1:'#87CEEB',sky2:'#E3F2FD'},
    moon:{label:'🌕 القمر',g:1.6,col:'#7F8C8D',sky1:'#1A1A2E',sky2:'#2C2C4A'},
    mars:{label:'🔴 المريخ',g:3.72,col:'#E74C3C',sky1:'#E8A87C',sky2:'#FFCBA4'},
    jupiter:{label:'🪐 المشتري',g:24.8,col:'#D4870A',sky1:'#C4A35A',sky2:'#FFF3E0'},
  };
  const pl=PLANETS[S.planet];
  const groundY=cv.height*0.75; // مرفوع لإعطاء مساحة للسهم وزر "ماذا نستنتج"

  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">⚖️ الكتلة</div>
  <div class="ctrl-name">الكتلة: <span class="ctrl-val" id="gMass">${S.mass} kg</span></div>
  <input type="range" min="1" max="50" value="${S.mass}"
    oninput="simState.u9G1.mass=+this.value;document.getElementById('gMass').textContent=this.value+' kg';simState.u9G1.falling=false;simState.u9G1.dropped=false;simState.u9G1.ballV=0;simState.u9G1.ballY=0">
</div>
<div class="ctrl-section">
  <div class="ctrl-label">🌍 الكوكب</div>
  ${Object.entries(PLANETS).map(([k,v])=>`
    <button class="ctrl-btn${S.planet===k?' active':''}" style="${S.planet===k?'background:'+v.col+';color:#fff':''};font-size:13px"
      onclick="simState.u9G1.planet='${k}';simState.u9G1.falling=false;simState.u9G1.dropped=false;simState.u9G1.ballV=0;simState.u9G1.ballY=0;simGravity1()">
      ${v.label} (g=${v.g})</button>
  `).join('')}
</div>
<div class="ctrl-section">
  <button class="ctrl-btn play" onclick="simState.u9G1.falling=true;simState.u9G1.dropped=true;simState.u9G1.ballV=0;simState.u9G1.fallTime=0">🔽 أسقط الكرة</button>
  <button class="ctrl-btn reset" onclick="simState.u9G1.falling=false;simState.u9G1.dropped=false;simState.u9G1.ballV=0;simState.u9G1.ballY=0;simState.u9G1.fallTime=0">↺ إعادة</button>
</div>
<div class="ctrl-section">
  <div class="ctrl-label" style="font-size:13px">💡 اسحب الكرة لأعلى ثم حررها!</div>
</div>
<div class="q-box">
  <strong>❓ ما العلاقة بين الكتلة والوزن؟</strong>
  <div style="display:flex;flex-direction:column;gap:5px;margin-top:8px">
    <button class="q-opt-btn" onclick="window._grav1Ans(this,false)" style="padding:7px 10px;border-radius:8px;border:1.5px solid rgba(0,0,0,0.1);background:white;font-family:Tajawal;font-size:13px;cursor:pointer;text-align:right">١- الكتلة والوزن يمثلان نفس المصطلح</button>
    <button class="q-opt-btn" onclick="window._grav1Ans(this,false)" style="padding:7px 10px;border-radius:8px;border:1.5px solid rgba(0,0,0,0.1);background:white;font-family:Tajawal;font-size:13px;cursor:pointer;text-align:right">٢- لا توجد علاقة بين الكتلة والوزن</button>
    <button class="q-opt-btn" onclick="window._grav1Ans(this,true)" style="padding:7px 10px;border-radius:8px;border:1.5px solid rgba(0,0,0,0.1);background:white;font-family:Tajawal;font-size:13px;cursor:pointer;text-align:right">٣- بتغيير الكتلة تتغير قوة الوزن للجسم</button>
  </div>
  <div id="grav1Fb" style="display:none;margin-top:8px;padding:8px 10px;border-radius:8px;font-size:13px;line-height:1.7"></div>
</div>`;
  window._grav1Ans=function(btn,correct){
    document.querySelectorAll('.q-opt-btn').forEach(function(b){
      b.disabled=true; b.style.opacity='0.55';
    });
    btn.style.opacity='1';
    btn.style.background=correct?'rgba(39,174,96,0.15)':'rgba(192,57,43,0.12)';
    btn.style.borderColor=correct?'#27AE60':'#C0392B';
    btn.style.fontWeight='700';
    var fb=document.getElementById('grav1Fb');
    if(fb){
      fb.style.display='block';
      fb.style.background=correct?'rgba(39,174,96,0.08)':'rgba(192,57,43,0.06)';
      fb.style.color=correct?'#1E8449':'#C0392B';
      fb.innerHTML=correct
        ?'✅ صحيح! W = m × g — كلما زادت الكتلة زاد الوزن.'
        :'❌ الكتلة والوزن مختلفان. الكتلة ثابتة (kg) والوزن يتغير بحسب الجاذبية (N).';
    }
  };

  function getBallPos(){
    const bY=S.dropped?groundY-30-Math.max(0,groundY*0.8-S.ballY):cv.height*0.18;
    return{x:cv.width/2,y:S.dropped?cv.height*0.18+S.ballY:cv.height*0.18};
  }
  function onDown(e){
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const bPos={x:cv.width/2,y:S.dropped?cv.height*0.18+S.ballY:cv.height*0.18};
    if(Math.sqrt((pos.x-bPos.x)**2+(pos.y-bPos.y)**2)<30){
      S.dragging=true;S.falling=false;S.ballV=0;
    }
  }
  function onMove(e){
    if(!S.dragging)return;
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const topY=cv.height*0.1,botY=groundY-30;
    S.ballY=Math.max(0,Math.min(botY-cv.height*0.18,pos.y-cv.height*0.18));
    S.dropped=true;
  }
  function onUp(){
    if(S.dragging){S.dragging=false;S.falling=true;S.fallTime=0;}
  }
  cv.addEventListener('mousedown',onDown);cv.addEventListener('mousemove',onMove);cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',onDown,{passive:false});cv.addEventListener('touchmove',onMove,{passive:false});cv.addEventListener('touchend',onUp);
  cv.style.cursor='pointer';

  function draw(){
    if((currentSim!=='gravity'&&currentSim!=='g6gravity')||currentTab!==0){
      cv.removeEventListener('mousedown',onDown);cv.removeEventListener('mousemove',onMove);cv.removeEventListener('mouseup',onUp);
      cv.removeEventListener('touchstart',onDown);cv.removeEventListener('touchmove',onMove);cv.removeEventListener('touchend',onUp);
      cv.style.cursor='default';return;
    }
    const w=cv.width,h=cv.height;
    const plNow=PLANETS[S.planet];
    const gNow=plNow.g;
    const W=S.mass*gNow;

    if(S.falling&&!S.dragging){
      S.ballV+=gNow*0.016*2;
      S.ballY+=S.ballV*0.5;
      S.fallTime+=0.016;
      const ballRNow=Math.max(18,Math.min(50,14+S.mass*1.8));
      // صوت سقوط متصاعد (كل 12 frame)
      if(S.t%12===0 && S.ballV>2){
        const progress=Math.min(S.ballY/(groundY-h*0.18),1);
        U9Sound.falling(progress);
      }
      if(S.ballY>=groundY-h*0.18-ballRNow){
        S.ballY=groundY-h*0.18-ballRNow;
        S.falling=false;
        // صوت ارتطام يتناسب مع السرعة والكتلة
        const impactVol=Math.min(0.85, 0.2+S.mass*0.025+S.ballV*0.008);
        const impactFreq=Math.max(25,100-S.mass*2-S.ballV*0.5);
        U9Sound.thud(impactVol, impactFreq);
        U9.addParticles('grav1',w/2,groundY,plNow.col,Math.min(18,8+S.mass));
      }
    }
    if(!S._t) S._t=0; S._t++;

    c.clearRect(0,0,w,h);
    const sky=c.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,plNow.sky1);sky.addColorStop(1,plNow.sky2);
    c.fillStyle=sky;c.fillRect(0,0,w,h);

    // نجوم على القمر/المريخ
    if(S.planet==='moon'||S.planet==='mars'){
      c.fillStyle='rgba(255,255,255,0.8)';
      for(let i=0;i<30;i++){
        const sx=(i*137)%w,sy=(i*73)%(h*0.7);
        c.beginPath();c.arc(sx,sy,1.2,0,Math.PI*2);c.fill();
      }
    }

    // أرضية
    c.fillStyle=plNow.col+'44';c.fillRect(0,groundY,w,h-groundY);
    c.fillStyle=plNow.col;c.fillRect(0,groundY,w,6);

    // مسطرة ارتفاع
    const rulerX=w*0.85;
    const rulerH=groundY-h*0.1;
    c.strokeStyle='rgba(255,255,255,0.5)';c.lineWidth=2;
    c.beginPath();c.moveTo(rulerX,h*0.1);c.lineTo(rulerX,groundY);c.stroke();
    for(let i=0;i<=10;i++){
      const ty=h*0.1+i*(rulerH/10);
      c.fillStyle='rgba(255,255,255,0.7)';
      c.fillRect(rulerX-8,ty,16,2);
      U9.txt(c,(10-i)+' m',rulerX+20,ty,'rgba(255,255,255,0.8)',15,false,'left');
    }

    // الكرة — تكبر مع زيادة الكتلة
    const ballX=w/2,ballRealY=h*0.18+S.ballY;
    const ballR=Math.max(18,Math.min(50,14+S.mass*1.8));
    const ballG=c.createRadialGradient(ballX-ballR*0.3,ballRealY-ballR*0.3,2,ballX,ballRealY,ballR);
    ballG.addColorStop(0,'#FFF');ballG.addColorStop(0.4,plNow.col);ballG.addColorStop(1,plNow.col+'88');
    c.beginPath();c.arc(ballX,ballRealY,ballR,0,Math.PI*2);
    c.fillStyle=ballG;
    c.shadowColor=plNow.col;c.shadowBlur=18;c.fill();c.shadowBlur=0;
    c.strokeStyle='rgba(255,255,255,0.5)';c.lineWidth=2.5;c.stroke();
    U9.txt(c,S.mass+' kg',ballX,ballRealY,'#fff',Math.max(12,Math.min(17,9+S.mass*0.4)),true);

    // سهام — دائماً واضحة، تنطلق من مركز الكرة، طول ثابت
    const arX = ballX + ballR + 14;
    const arLen = 45;
    if(!S.falling){
      U9.arrow(c,arX,ballRealY,arX,ballRealY+arLen,plNow.col,5,'W='+W.toFixed(1)+' N',1);
    } else {
      // سهم التسارع لأسفل أثناء السقوط
      U9.arrow(c,arX,ballRealY,arX,ballRealY+arLen,plNow.col,5,'g='+gNow,1);
    }
    // لوحة بيانات
    const infoRows=[
      {l:'الكتلة',v:S.mass+' kg',col:'#AED6F1'},
      {l:'الجاذبية g',v:gNow+' m/s²',col:plNow.col},
      {l:'الوزن W',v:W.toFixed(1)+' N',col:'#F1948A'},
      {l:'السرعة v',v:S.ballV.toFixed(2)+' m/s',col:'#82E0AA'},
      {l:'الزمن t',v:S.fallTime.toFixed(2)+' s',col:'#F8C471'},
    ];
    drawDataPanel(c,10,10,250,plNow.label,infoRows);

    U9.drawParticles(c,'grav1');
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 9-3 Tab 2 - سباق الكواكب
// ══════════════════════════════════════════════════════════════
function simGravity2(){
  if((currentSim!=='gravity'&&currentSim!=='g6gravity')||currentTab!==1)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9G2=Object.assign({
    selected:['earth','moon','mars','jupiter'],
    mass:5,running:false,
    balls:{},times:{},winner:null,t:0
  },simState.u9G2||{});

  const PLANETS={
    earth:{label:'🌍 الأرض',g:10,col:'#2980B9'},
    moon:{label:'🌕 القمر',g:1.6,col:'#7F8C8D'},
    mars:{label:'🔴 المريخ',g:3.72,col:'#E74C3C'},
    jupiter:{label:'🪐 المشتري',g:24.8,col:'#D4870A'},
    venus:{label:'♀️ الزهرة',g:8.87,col:'#D4AC0D'},
  };

  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">☑️ اختر الكواكب</div>
  ${Object.entries(PLANETS).map(([k,v])=>`
    <label style="display:flex;align-items:center;gap:8px;font-size:14px;margin-bottom:6px;cursor:pointer">
      <input type="checkbox" ${S.selected.includes(k)?'checked':''}
        onchange="const s=simState.u9G2.selected;const i=s.indexOf('${k}');if(this.checked&&i<0)s.push('${k}');else if(!this.checked&&i>=0)s.splice(i,1)">
      <span style="color:${v.col};font-weight:bold">${v.label} (g=${v.g})${k==='earth'?'<br><span style="font-size:11px;color:#888;font-weight:normal">مع إهمال مقاومة الهواء</span>':''}</span>
    </label>
  `).join('')}
</div>
<div class="ctrl-section">
  <div class="ctrl-label">⚖️ الكتلة: <span class="ctrl-val" id="g2Mass">${S.mass} kg</span></div>
  <input type="range" min="1" max="30" value="${S.mass}" oninput="simState.u9G2.mass=+this.value;document.getElementById('g2Mass').textContent=this.value+' kg'">
</div>
<div class="ctrl-section">
  <button class="ctrl-btn play" onclick="simState.u9G2.running=true;simState.u9G2.balls={};simState.u9G2.times={};simState.u9G2.winner=null;simState.u9G2.t=0">🏁 ابدأ السباق</button>
  <button class="ctrl-btn reset" onclick="simState.u9G2.running=false;simState.u9G2.balls={};simState.u9G2.times={};simState.u9G2.winner=null">↺ إعادة</button>
</div>`;

  function draw(){
    if((currentSim!=='gravity'&&currentSim!=='g6gravity')||currentTab!==1)return;
    const w=cv.width,h=cv.height;
    const startY=h*0.08;
    const surfH=Math.min(80,h*0.10);   // سطح أعلى قليلاً
    const sel=S.selected.filter(k=>PLANETS[k]);
    const n=sel.length||1;
    const laneW=w/n;
    const groundY=h-surfH-8;
    const bR_max=26; // أكبر نصف قطر ممكن
    const fallH=groundY-startY-bR_max; // الكرة تقف فوق السطح بمسافة nصف قطرها

    c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#060818');bg.addColorStop(1,'#1A1A3A');
    c.fillStyle=bg;c.fillRect(0,0,w,h);
    c.fillStyle='rgba(255,255,255,0.75)';
    for(let i=0;i<60;i++){const sx=(i*137+11)%w,sy=(i*79+5)%(h*0.85);c.beginPath();c.arc(sx,sy,i%5===0?1.5:0.8,0,Math.PI*2);c.fill();}

    if(S.running){
      S.t+=0.016;
      sel.forEach(k=>{
        if(!S.balls[k])S.balls[k]={y:0,v:0};
        const b=S.balls[k];
        if(b.y<fallH){
          b.v+=PLANETS[k].g*0.016*2;
          b.y+=b.v*0.5;
          if(b.y>=fallH){
            b.y=fallH;
            if(!S.times[k]){
              S.times[k]=S.t;
              if(!S.winner){S.winner=k;U9Sound.win();}
              else{U9Sound.thud(0.4,70);U9Sound.ping(440,0.2,0.2);}
            }
          }
        }
      });
      if(sel.every(k=>S.times[k]))S.running=false;
    }

    sel.forEach((k,i)=>{
      const pl=PLANETS[k];
      const lx=laneW*i, cx=lx+laneW/2;
      const bY=S.balls[k]?startY+S.balls[k].y:startY;
      const bR=Math.max(12,Math.min(26,10+Math.sqrt(S.mass)*2));

      // خط المسار
      c.strokeStyle=pl.col+'33';c.lineWidth=1;c.setLineDash([5,5]);
      c.beginPath();c.moveTo(cx,startY);c.lineTo(cx,groundY);c.stroke();
      c.setLineDash([]);

      // خط المسار
      c.strokeStyle=pl.col+'33';c.lineWidth=1;c.setLineDash([5,5]);
      c.beginPath();c.moveTo(cx,startY);c.lineTo(cx,groundY);c.stroke();
      c.setLineDash([]);

      // الكرة (ترسم أولاً — قبل السطح)
      c.shadowColor='rgba(0,0,0,0.4)';c.shadowBlur=10;
      const bg2=c.createRadialGradient(cx-bR*0.3,bY-bR*0.3,2,cx,bY,bR);
      bg2.addColorStop(0,'#FAD7A0');bg2.addColorStop(0.55,'#E59866');bg2.addColorStop(1,'#784212');
      c.fillStyle=bg2;c.beginPath();c.arc(cx,bY,bR,0,Math.PI*2);c.fill();
      c.shadowBlur=0;
      c.strokeStyle=pl.col;c.lineWidth=2;c.beginPath();c.arc(cx,bY,bR,0,Math.PI*2);c.stroke();
      c.fillStyle='white';
      c.font='bold '+Math.max(8,Math.min(12,Math.round(bR*0.68)))+'px Tajawal,Arial';
      c.textAlign='center';c.textBaseline='middle';
      c.fillText(S.mass+' kg',cx,bY);

      if(S.times[k]){
        U9.rect(c,cx-26,bY-bR-26,52,20,pl.col+'DD',pl.col,4,1.5);
        U9.txt(c,S.times[k].toFixed(2)+' s',cx,bY-bR-16,'#fff',12,true);
      }
      if(k===S.winner){
        c.save();c.font='20px serif';c.textAlign='center';c.textBaseline='middle';
        c.shadowColor='#FFD700';c.shadowBlur=12;
        c.fillText('🥇',cx,bY-bR-34);c.restore();
      }

      // سطح الكوكب (يُرسم فوق الكرة — الاسم دائماً ظاهر)
      const sg=c.createLinearGradient(lx,groundY,lx,h);
      sg.addColorStop(0,pl.col);sg.addColorStop(1,pl.col+'66');
      c.fillStyle=sg;
      c.beginPath();c.roundRect(lx+2,groundY,laneW-4,surfH+8,[6,6,0,0]);c.fill();
      c.strokeStyle=pl.col+'BB';c.lineWidth=1.5;c.setLineDash([]);
      c.beginPath();c.roundRect(lx+2,groundY,laneW-4,surfH+8,[6,6,0,0]);c.stroke();

      // اسم الكوكب وqيمة g — دائماً فوق كل شيء
      const fs=Math.max(10,Math.min(14,laneW*0.13));
      c.fillStyle='rgba(0,0,0,0.55)';
      c.font='bold '+fs+'px Tajawal,Arial';
      c.textAlign='center';c.textBaseline='middle';
      c.fillText(pl.label,cx,groundY+surfH*0.30);
      c.fillStyle='rgba(255,255,255,0.95)';
      c.font='bold '+(fs-1)+'px Tajawal,Arial';
      c.fillText('g='+pl.g+' m/s²',cx,groundY+surfH*0.70);
    });

    if(S.winner&&!S.running){
      U9.rect(c,w/2-155,h*0.35,310,72,'rgba(0,0,0,0.88)','#FFD700',14,3);
      U9.txt(c,'🏆 الفائز: '+PLANETS[S.winner].label,w/2,h*0.35+20,'#FFD700',19,true);
      U9.txt(c,'في '+S.times[S.winner].toFixed(2)+' ثانية',w/2,h*0.35+46,'white',16,false);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  if(!S.balls||Object.keys(S.balls).length===0){
    S.selected.forEach(k=>{if(!S.balls)S.balls={};S.balls[k]={y:0,v:0};});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 9-4 Tab 1 - الاحتكاك التفاعلي (سحب مباشر - PhET style)
// ══════════════════════════════════════════════════════════════
function simFriction1(){
  if((currentSim!=='friction'&&currentSim!=='g6friction')||currentTab!==0)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  function W(){return cv.width;}
  function H(){return cv.height;}
  function GY(){return H()*0.68;}

  const SURFACES={
    ice:    {label:'جليد 🧊',  mu:0.05, top:'#AED6F1', bot:'#5DADE2'},
    smooth: {label:'بلاط 🪟',  mu:0.15, top:'#D5D8DC', bot:'#99A3A4'},
    wood:   {label:'خشب 🪵',   mu:0.35, top:'#C9A84C', bot:'#9A7D0A'},
    carpet: {label:'سجادة 🟫', mu:0.55, top:'#A04000', bot:'#784212'},
    rough:  {label:'خشن 🧱',   mu:0.75, top:'#7E5109', bot:'#5D4037'},
  };

  const MASS=20, G=10, PX_PER_M=55, DT=1/60;

  if(!simState.fr1) simState.fr1={
    surface:'wood',
    objX:0.5, objV:0,
    isDragging:false,
    dragStartMouseX:0, dragStartObjX:0,
    appliedF:0,        // القوة المحسوبة من السحب
    sparks:[], lastSpark:0, t:0,
  };
  const S=simState.fr1;

  function normalF()  { return MASS*G; }
  function staticMax(){ return SURFACES[S.surface].mu*normalF()*1.3; }
  function kineticF() { return SURFACES[S.surface].mu*normalF(); }
  function fricNow()  {
    if(Math.abs(S.objV)>0.01) return kineticF();
    return Math.min(Math.abs(S.appliedF), staticMax());
  }
  function netF(){
    if(Math.abs(S.appliedF)<=staticMax() && Math.abs(S.objV)<0.01) return 0;
    return S.appliedF - Math.sign(S.appliedF||1)*kineticF();
  }

  // ── لوحة التحكم ──
  controls(`
    <div class="ctrl-label">🏔️ نوع السطح</div>
    <div style="display:flex;flex-direction:column;gap:4px;margin-bottom:12px">
      ${Object.entries(SURFACES).map(([k,v])=>`
        <button onclick="window._fr1Surf('${k}')" id="frBtn_${k}"
          class="ctrl-btn" style="font-size:13px;text-align:right;padding:7px 10px;
          ${S.surface===k?'background:'+v.bot+';color:white;border-color:'+v.bot+';font-weight:700':''}">
          ${v.label}
          <span style="float:left;opacity:0.75;font-size:11px">μ=${v.mu}</span>
        </button>`).join('')}
    </div>
    <div id="fr1Info" style="padding:10px;background:rgba(26,143,168,0.07);
      border-radius:10px;font-size:13px;line-height:2.3;min-height:90px">
      اسحب الصندوق ←→
    </div>
    <button onclick="window._fr1Reset()"
      style="margin-top:10px;width:100%;padding:9px;border-radius:10px;
      background:rgba(0,0,0,0.05);border:1.5px solid rgba(0,0,0,0.1);
      font-family:Tajawal;font-size:14px;cursor:pointer">↺ إعادة</button>
    <div class="q-box" style="margin-top:10px">
      <strong>❓ ص٥٤:</strong> في أي اتجاه يعمل الاحتكاك؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">الاحتكاك يعمل دائماً عكس اتجاه الحركة أو محاولة الحركة.</div>
    </div>
  `);

  window._fr1Surf=function(k){
    S.surface=k; S.objX=0.5; S.objV=0;
    S.appliedF=0; S.isDragging=false; S.sparks=[];
    Object.keys(SURFACES).forEach(kk=>{
      const b=document.getElementById('frBtn_'+kk); if(!b) return;
      const v=SURFACES[kk];
      b.style.background=kk===k?v.bot:'';
      b.style.color=kk===k?'white':'';
      b.style.borderColor=kk===k?v.bot:'';
      b.style.fontWeight=kk===k?'700':'';
    });
  };
  window._fr1Reset=function(){
    S.objX=0.5; S.objV=0; S.appliedF=0; S.isDragging=false; S.sparks=[];
  };

  function updateInfo(){
    const el=document.getElementById('fr1Info'); if(!el)return;
    const fa=Math.abs(S.appliedF), ff=fricNow(), fn=netF();
    const moving=Math.abs(S.objV)>0.01;
    el.innerHTML=`
      <div>🔴 تطبيق: <strong style="color:#E74C3C">${fa.toFixed(1)} N</strong>
           ${S.appliedF>0?'←':S.appliedF<0?'→':''}</div>
      <div>🔵 احتكاك: <strong style="color:#2980B9">${ff.toFixed(1)} N</strong>
           ${S.appliedF>0?'→':S.appliedF<0?'←':''}</div>
      <div>⚡ محصلة: <strong style="color:${Math.abs(fn)<0.5?'#27AE60':'#E74C3C'}">${fn.toFixed(1)} N</strong></div>
      <div style="margin-top:3px;padding:3px 7px;border-radius:6px;font-size:12px;
        background:${moving?'rgba(231,76,60,0.1)':'rgba(39,174,96,0.1)'}">
        ${moving?'🏃 يتحرك':'🧱 ثابت'}
        — السرعة: ${(Math.abs(S.objV)*PX_PER_M).toFixed(2)} m/s
      </div>`;
  }

  // ── رسم السطح ──
  function drawSurface(){
    const gy=GY(), sf=SURFACES[S.surface];
    const sg=c.createLinearGradient(0,gy,0,H());
    sg.addColorStop(0,sf.top); sg.addColorStop(1,sf.bot);
    c.fillStyle=sg; c.fillRect(0,gy,W(),H()-gy);
    c.fillStyle=sf.bot; c.fillRect(0,gy,W(),5);
    // نسيج حركي
    c.strokeStyle='rgba(0,0,0,0.07)'; c.lineWidth=1;
    const sh=((S.objX*W()*0.4)|0)%28;
    for(let x=-30;x<W()+30;x+=28){
      c.beginPath(); c.moveTo(x+sh,gy+5); c.lineTo(x+sh+14,H()); c.stroke();
    }
    c.font='bold 12px Tajawal'; c.fillStyle='rgba(255,255,255,0.55)';
    c.textAlign='center'; c.textBaseline='top';
    c.fillText(sf.label, W()/2, gy+7);
  }

  // ── رسم سهم أفقي ──
  function arrow(x1,y,len,dir,col,lbl,above){
    if(len<6) return;
    const x2=x1+dir*len;
    c.strokeStyle=col; c.lineWidth=5; c.lineCap='round';
    c.beginPath(); c.moveTo(x1,y); c.lineTo(x2-dir*13,y); c.stroke();
    c.fillStyle=col;
    c.beginPath();
    c.moveTo(x2,y);
    c.lineTo(x2-dir*14,y-8);
    c.lineTo(x2-dir*14,y+8);
    c.closePath(); c.fill();
    c.font='bold 12px Tajawal'; c.fillStyle=col;
    c.textAlign='center'; c.textBaseline=above?'bottom':'top';
    c.fillText(lbl,(x1+x2)/2,above?y-14:y+14);
  }

  // ── رسم الجسم ──
  function drawBox(cx,gy){
    const bW=66,bH=50;
    // ظل
    c.fillStyle='rgba(0,0,0,0.12)';
    c.beginPath(); c.ellipse(cx+4,gy+4,bW*0.5,6,0,0,Math.PI*2); c.fill();
    // جسم
    const gr=c.createLinearGradient(cx,gy-bH,cx,gy);
    gr.addColorStop(0,'#7FB3D3'); gr.addColorStop(1,'#2471A3');
    c.shadowColor='rgba(0,0,0,0.25)'; c.shadowBlur=10;
    c.fillStyle=gr;
    c.beginPath(); c.roundRect(cx-bW/2,gy-bH,bW,bH,[8]); c.fill();
    c.shadowBlur=0;
    c.strokeStyle='#1A5276'; c.lineWidth=2;
    c.beginPath(); c.roundRect(cx-bW/2,gy-bH,bW,bH,[8]); c.stroke();
    c.font='22px serif'; c.textAlign='center'; c.textBaseline='middle';
    c.fillText('📦',cx,gy-bH*0.55);
    c.font='bold 11px Tajawal'; c.fillStyle='white'; c.textBaseline='middle';
    c.fillText(MASS+'kg',cx,gy-bH*0.15);
    // عجلات
    [-22,22].forEach(ox=>{
      const rot=S.objX*W()*0.08;
      c.save(); c.translate(cx+ox,gy+2);
      c.beginPath(); c.arc(0,0,9,0,Math.PI*2);
      c.fillStyle='#1C2833'; c.fill();
      c.rotate(rot);
      c.strokeStyle='#AAB7B8'; c.lineWidth=2;
      c.beginPath(); c.moveTo(-6,0); c.lineTo(6,0); c.stroke();
      c.beginPath(); c.moveTo(0,-6); c.lineTo(0,6); c.stroke();
      c.restore();
    });
    return {bW,bH};
  }

  // ── الرسم الرئيسي ──
  function draw(){
    if((currentSim!=='friction'&&currentSim!=='g6friction')||currentTab!==0)return;
    S.t++;
    const w=W(), h=H(), gy=GY();
    c.clearRect(0,0,w,h);

    // خلفية
    const bg=c.createLinearGradient(0,0,0,gy);
    bg.addColorStop(0,'#EBF5FB'); bg.addColorStop(1,'#D6EAF8');
    c.fillStyle=bg; c.fillRect(0,0,w,gy);

    // ── فيزياء ──
    if(!S.isDragging){
      // تطبيق المحصلة
      const fn=netF();
      S.objV += fn/MASS*DT;
      // تباطؤ طبيعي عند عدم السحب
      if(Math.abs(S.appliedF)<1){
        S.objV*=0.88;
        if(Math.abs(S.objV)<0.002) S.objV=0;
      }
    }
    // تحديث موضع
    const dxPx = S.objV*DT*PX_PER_M;
    S.objX=Math.max(0.07,Math.min(0.93,S.objX+dxPx/w));

    // ── سطح ──
    drawSurface();
    const cx=S.objX*w;

    // ── شرر ──
    if(Math.abs(S.objV)>0.4 && S.t-S.lastSpark>5){
      S.lastSpark=S.t;
      for(let i=0;i<4;i++) S.sparks.push({
        x:cx+(Math.random()-0.5)*20, y:gy-4,
        vx:(Math.random()-0.5)*5, vy:-Math.random()*4-1,
        life:1, col:['#F1C40F','#E67E22','#E74C3C'][i%3]
      });
    }
    S.sparks=S.sparks.filter(sp=>{
      sp.x+=sp.vx; sp.y+=sp.vy; sp.vy+=0.3; sp.life-=0.07;
      c.globalAlpha=sp.life; c.fillStyle=sp.col;
      c.beginPath(); c.arc(sp.x,sp.y,2.5,0,Math.PI*2); c.fill();
      c.globalAlpha=1; return sp.life>0;
    });

    // ── رسم الجسم ──
    const {bW,bH}=drawBox(cx,gy);
    const arY=gy-bH*0.5;
    const appDir=S.appliedF>=0?-1:1; // موجب = سحب يسار = اتجاه السهم يسار

    // سهم قوة التطبيق
    if(Math.abs(S.appliedF)>2){
      const len=Math.min(Math.abs(S.appliedF)*0.6,150);
      arrow(cx+appDir*(bW/2+8),arY,len,appDir,'#E74C3C',
            Math.abs(S.appliedF).toFixed(0)+' N',true);
    }

    // سهم الاحتكاك (معاكس)
    const ff=fricNow();
    if(ff>2){
      const len=Math.min(ff*0.6,150);
      arrow(cx-appDir*(bW/2+8),arY,len,-appDir,'#2980B9',
            ff.toFixed(0)+' N',false);
    }

    // ── لافتة حالة ──
    {
      const moving=Math.abs(S.objV)>0.05;
      const fn2=netF();
      const txt=moving
        ?'🏃 يتحرك — محصلة '+fn2.toFixed(1)+' N'
        :Math.abs(S.appliedF)>2
          ?'🧱 ثابت — الاحتكاك يعاكس القوة'
          :'← اسحب الصندوق →';
      const col=moving?'#E74C3C':'#27AE60';
      c.fillStyle=moving?'rgba(231,76,60,0.1)':'rgba(39,174,96,0.1)';
      c.beginPath(); c.roundRect(w/2-140,10,280,40,[10]); c.fill();
      c.strokeStyle=col+'55'; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(w/2-140,10,280,40,[10]); c.stroke();
      c.font='bold 14px Tajawal'; c.fillStyle='#2C3E50';
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText(txt,w/2,30);
    }

    // ── مؤشر سرعة ──
    {
      const spd=Math.abs(S.objV*PX_PER_M);
      const maxS=10, frac=Math.min(spd/maxS,1);
      const bx=14,by=h*0.54,bh=H()*0.10,bww=14;
      c.fillStyle='rgba(20,30,48,0.75)';
      c.beginPath(); c.roundRect(bx-2,by-2,bww+52,bh+18,[8]); c.fill();
      // شريط
      c.fillStyle='rgba(255,255,255,0.1)';
      c.beginPath(); c.roundRect(bx+2,by+2,bww,bh,[4]); c.fill();
      const barCol=frac<0.4?'#2ECC71':frac<0.75?'#F39C12':'#E74C3C';
      c.fillStyle=barCol;
      c.beginPath(); c.roundRect(bx+2,by+2+bh*(1-frac),bww,bh*frac,[4]); c.fill();
      c.font='bold 10px monospace'; c.fillStyle='white';
      c.textAlign='left'; c.textBaseline='middle';
      c.fillText(spd.toFixed(2),bx+bww+6,by+bh/2+2);
      c.font='9px Tajawal'; c.fillStyle='rgba(255,255,255,0.6)';
      c.fillText('m/s',bx+bww+6,by+bh+8);
    }

    updateInfo();
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }

  // ── السحب المباشر ──
  function getPos(e){
    const r=cv.getBoundingClientRect();
    const t=(e.touches&&e.touches[0])||e;
    return {x:(t.clientX-r.left)*cv.width/r.width,
            y:(t.clientY-r.top)*cv.height/r.height};
  }

  function onDown(e){
    e.preventDefault&&e.preventDefault();
    const p=getPos(e);
    const cx=S.objX*W(), gy=GY();
    // هل الضغط على الصندوق؟
    if(Math.abs(p.x-cx)<40 && p.y>gy-60 && p.y<gy+10){
      S.isDragging=true;
      S.dragStartMouseX=p.x;
      S.dragStartObjX=S.objX;
      S.objV=0;
      try{U9Sound.ping(440,0.1,0.08);}catch(ex){}
    }
  }

  function onMove(e){
    e.preventDefault&&e.preventDefault();
    if(!S.isDragging) return;
    const p=getPos(e);
    const dx=p.x-S.dragStartMouseX; // إزاحة الماوس بالبكسل

    // القوة = مقاومة الاحتكاك × نسبة السحب (تدريجي)
    // dx موجب = سحب يمين → قوة يمين (سالب بمحور الإزاحة)
    const rawForce = dx * 3.5; // N per px
    S.appliedF = -rawForce;    // سالب لأن السحب يمين = قوة ناحية اليمين

    // إذا تجاوزنا الاحتكاك الساكن — يتحرك الجسم مع الإصبع
    if(Math.abs(S.appliedF)>staticMax()){
      const newX=S.dragStartObjX + dx/W();
      S.objX=Math.max(0.07,Math.min(0.93,newX));
      S.objV=dx/W()/DT*0.012;
    }
  }

  function onUp(e){
    if(!S.isDragging) return;
    S.isDragging=false;
    // إذا كان يتحرك بسرعة عالية — اتركه يستمر مع احتكاك
    // إذا كان بطيئاً — أعد القوة للصفر
    if(Math.abs(S.objV)<0.05){
      S.appliedF=0;
      S.objV=0;
    } else {
      S.appliedF=0; // لا يوجد قوة تطبيق بعد الإفلات
    }
  }

  cv.addEventListener('mousedown', onDown,false);
  cv.addEventListener('mousemove', onMove,false);
  cv.addEventListener('mouseup',   onUp,  false);
  cv.addEventListener('touchstart',onDown,{passive:false});
  cv.addEventListener('touchmove', onMove,{passive:false});
  cv.addEventListener('touchend',  onUp,  false);

  draw();
}


// 9-4 Tab 2 - عوامل الاحتكاك — تفاعل مباشر على الـ canvas
// ══════════════════════════════════════════════════════════════
function simFriction2(){
  if((currentSim!=='friction'&&currentSim!=='g6friction')||currentTab!==1)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9Fr2=Object.assign({
    factor:'weight',
    weight:80,roughness:0.35,area:2,
    animT:0,
    // سحب مباشر
    dragging:null, // {type:'weight'|'rough', idx:0|1|2, startX, startVal}
    highlightIdx:-1,
    t:0,
  },simState.u9Fr2||{});

  function buildControls(){
    document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🔬 العامل المدروس</div>
  <button class="ctrl-btn${S.factor==='weight'?' active':''}" style="${S.factor==='weight'?'background:#3498DB;color:#fff':''}"
    onclick="simState.u9Fr2.factor='weight';simFriction2()">⚖️ الوزن</button>
  <button class="ctrl-btn${S.factor==='rough'?' active':''}" style="${S.factor==='rough'?'background:#E67E22;color:#fff':''}"
    onclick="simState.u9Fr2.factor='rough';simFriction2()">🧱 الخشونة</button>
  <button class="ctrl-btn${S.factor==='area'?' active':''}" style="${S.factor==='area'?'background:#27AE60;color:#fff':''}"
    onclick="simState.u9Fr2.factor='area';simFriction2()">📐 المساحة</button>
</div>
<div class="info-box" style="font-size:12px;line-height:1.9">
  ${S.factor==='weight'?
    `<strong>F = μ × N</strong><br>μ = 0.35 (ثابت)<br>N = الوزن (متغير)<br><br>💡 <em>اسحب الأجسام لأعلى/أسفل!</em>`:
  S.factor==='rough'?
    `<strong>F = μ × N</strong><br>μ = الخشونة (متغير)<br>N = ${S.weight} N (ثابت)<br><br>💡 <em>اسحب الأجسام أفقياً!</em>`:
    `<strong>F = μ × N</strong><br>المساحة <strong>لا تؤثر!</strong><br>F = 0.35 × ${S.weight} N = ${(0.35*S.weight).toFixed(0)} N<br><br>💡 <em>جرب: نفس الاحتكاك!</em>`}
</div>
${S.factor==='weight'?`
<div class="ctrl-section">
  <div class="ctrl-label">⚖️ الوزن المرجعي</div>
  <div class="ctrl-row">
    <div class="ctrl-name"><span class="ctrl-val" id="wF2">${S.weight}</span> N</div>
    <input type="range" min="20" max="200" value="${S.weight}"
      oninput="simState.u9Fr2.weight=+this.value;document.getElementById('wF2').textContent=this.value">
  </div>
</div>`:''}
${S.factor==='rough'?`
<div class="ctrl-section">
  <div class="ctrl-label">μ المرجعي</div>
  <div class="ctrl-row">
    <div class="ctrl-name"><span class="ctrl-val" id="muF2">${S.roughness.toFixed(2)}</span></div>
    <input type="range" min="0.02" max="0.8" step="0.01" value="${S.roughness}"
      oninput="simState.u9Fr2.roughness=+this.value;document.getElementById('muF2').textContent=(+this.value).toFixed(2)">
  </div>
</div>`:''}`;
  }
  buildControls();

  // حساب الحالات الثلاث
  function getCases(){
    if(S.factor==='weight')
      return [{w:S.weight*0.5,mu:0.35,label:'خفيف',col:'#3498DB'},
              {w:S.weight,    mu:0.35,label:'متوسط',col:'#E67E22'},
              {w:S.weight*1.5,mu:0.35,label:'ثقيل',col:'#E74C3C'}];
    if(S.factor==='rough')
      return [{w:S.weight,mu:Math.max(0.02,S.roughness*0.4),label:'ناعم',col:'#3498DB'},
              {w:S.weight,mu:S.roughness,                   label:'متوسط',col:'#E67E22'},
              {w:S.weight,mu:Math.min(0.9,S.roughness*1.8), label:'خشن',col:'#E74C3C'}];
    return [{w:S.weight,mu:0.35,a:1,  label:'صغير',col:'#3498DB'},
            {w:S.weight,mu:0.35,a:2,  label:'متوسط',col:'#E67E22'},
            {w:S.weight,mu:0.35,a:3.5,label:'كبير',col:'#E74C3C'}];
  }

  // سحب الأجسام مباشرة
  function getBoxBounds(i,w2,gY){
    const cases=getCases();
    const cas=cases[i];
    const laneW=w2/3;
    const cx=laneW*i+laneW/2;
    const maxBW=Math.min(laneW*0.38,72);
    const bW=S.factor==='area'?Math.min(maxBW,16*(cas.a||1)+16):Math.min(maxBW,52);
    const bH=S.factor==='weight'?Math.max(22,Math.min(gY*0.32,cas.w*0.30)):Math.min(gY*0.28,44);
    return{cx,bW,bH,cas,gY};
  }

  let hoveredBox=-1;
  function onDown(e){
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const w2=cv.width,gY=cv.height*0.48;
    for(let i=0;i<3;i++){
      const b=getBoxBounds(i,w2,gY);
      if(pos.x>b.cx-b.bW&&pos.x<b.cx+b.bW&&pos.y>gY-b.bH-30&&pos.y<gY+10){
        S.dragging={idx:i,startX:pos.x,startY:pos.y,
          startW:b.cas.w,startMu:b.cas.mu||0.35};
        cv.style.cursor='grabbing';break;
      }
    }
  }
  function onMove(e){
    const pos=U9.getPos(cv,e);
    const w2=cv.width,gY=cv.height*0.48;
    if(!S.dragging){
      hoveredBox=-1;
      for(let i=0;i<3;i++){
        const b=getBoxBounds(i,w2,gY);
        if(pos.x>b.cx-b.bW&&pos.x<b.cx+b.bW&&pos.y>gY-b.bH-30&&pos.y<gY+10){
          hoveredBox=i;break;
        }
      }
      cv.style.cursor=hoveredBox>=0?'grab':'default';
      return;
    }
    e.preventDefault();
    const dy=S.dragging.startY-pos.y;
    const dx=pos.x-S.dragging.startX;
    if(S.factor==='weight'){
      // سحب لأعلى = زيادة وزن الوسط
      const newW=Math.max(10,Math.min(300,S.dragging.startW+dy*0.8));
      S.weight=newW; // تحديث الوزن المرجعي للمتوسط
    } else if(S.factor==='rough'){
      // سحب أفقياً لتغيير الخشونة
      const newMu=Math.max(0.02,Math.min(0.85,S.dragging.startMu+dx*0.004));
      S.roughness=newMu;
    }
    // تحديث الـ slider
    const sl=document.querySelector('#simControlsPanel input[type=range]');
    if(sl){
      if(S.factor==='weight'){sl.value=S.weight;const el=document.getElementById('wF2');if(el)el.textContent=S.weight.toFixed(0);}
      else if(S.factor==='rough'){sl.value=S.roughness;const el=document.getElementById('muF2');if(el)el.textContent=S.roughness.toFixed(2);}
    }
  }
  function onUp(){S.dragging=null;cv.style.cursor='default';}
  cv.addEventListener('mousedown',onDown);
  cv.addEventListener('mousemove',onMove);
  cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',onDown,{passive:false});
  cv.addEventListener('touchmove',onMove,{passive:false});
  cv.addEventListener('touchend',onUp);

  function draw(){
    if((currentSim!=='friction'&&currentSim!=='g6friction')||currentTab!==1){
      cv.removeEventListener('mousedown',onDown);cv.removeEventListener('mousemove',onMove);cv.removeEventListener('mouseup',onUp);
      cv.removeEventListener('touchstart',onDown);cv.removeEventListener('touchmove',onMove);cv.removeEventListener('touchend',onUp);
      return;
    }
    S.animT+=0.025;S.t+=0.02;
    const w=cv.width,h=cv.height;

    // تقسيم الشاشة: 55% للأجسام، 45% للرسم البياني
    const gY=h*0.48;        // خط الأرضية أعلى — يعطي مساحة للأرقام
    const chartTop=gY+28;   // فجوة كافية بين الأجسام والمستطيل
    const chartH=h-chartTop-52; // مساحة للرسم البياني — مع هامش لزر "ماذا نستنتج"

    const cases=getCases();

    c.clearRect(0,0,w,h);
    // خلفية منطقة الأجسام
    const bg=c.createLinearGradient(0,0,0,gY);
    bg.addColorStop(0,'#FFF8EE');bg.addColorStop(1,'#FFF2DC');
    c.fillStyle=bg;c.fillRect(0,0,w,gY);
    U9.grid(c,w,gY,'#F0E8D8',45);

    // خلفية منطقة الرسم البياني
    c.fillStyle='rgba(255,255,255,0.96)';
    c.beginPath();c.roundRect(6,chartTop,w-12,chartH,10);c.fill();
    c.strokeStyle='rgba(0,0,0,0.07)';c.lineWidth=1.5;
    c.beginPath();c.roundRect(6,chartTop,w-12,chartH,10);c.stroke();

    // أرضية مع نسيج
    c.fillStyle='#EDE5D8';c.fillRect(0,gY,w,6);
    if(S.factor==='rough'){
      for(let xi=0;xi<w;xi+=12){
        c.strokeStyle='rgba(120,66,18,0.3)';c.lineWidth=1;
        c.beginPath();c.moveTo(xi,gY);c.lineTo(xi+6,gY-6);c.stroke();
      }
    }
    c.fillStyle='#A0752A';c.fillRect(0,gY,w,3);

    // الحالات الثلاث — مساحة كل جسم w/3
    const laneW=w/3;
    cases.forEach((cas,i)=>{
      const cx=laneW*i+laneW/2;
      const fr=+(cas.mu*cas.w).toFixed(1);
      // حجم الجسم — مقيّد لمنع التداخل
      const maxBW=Math.min(laneW*0.38, 72);
      const bW=S.factor==='area'?Math.min(maxBW,16*(cas.a||1)+16):Math.min(maxBW,52);
      const bH=S.factor==='weight'?Math.max(22,Math.min(gY*0.32,cas.w*0.30)):Math.min(gY*0.28,44);
      const col=cas.col;
      const isDragging=S.dragging&&S.dragging.idx===i;
      const isHover=hoveredBox===i||isDragging;

      c.save();c.shadowColor=col+(isDragging?'88':'22');c.shadowBlur=isDragging?20:6;
      U9.rect(c,cx-bW,gY-bH,bW*2,bH,col+'2A',col,8,isHover?3:2);
      c.restore();

      // الرقم داخل الجسم
      const fs=Math.max(10,Math.min(14,bW*0.38));
      U9.txt(c,cas.w.toFixed(0)+' N',cx,gY-bH/2,col,fs,true);

      // وزن إضافي فوق الجسم (عامل الوزن فقط)
      if(S.factor==='weight'&&i>0){
        const extraH=Math.min((cas.w-cases[0].w)*0.22,28);
        if(extraH>4){
          U9.rect(c,cx-bW*0.65,gY-bH-extraH-1,bW*1.3,extraH,col+'44',col,4,1.5);
        }
      }

      // تسمية فوق الجسم
      U9.txt(c,cas.label,cx,gY-bH-10,col,11,true);

      // مؤشر السحب
      if(isHover){
        const hint=S.factor==='weight'?'↕':S.factor==='rough'?'↔':'—';
        U9.txt(c,hint,cx,gY-bH-22,'#888',10,true);
      }

      // سهم الاحتكاك — يسار الجسم، محدود الطول، فوق حد الرسم البياني
      const arLen=Math.max(16,Math.min(fr*0.55, laneW*0.38));
      const arY=Math.min(gY-bH/2, chartTop-18); // لا يتجاوز منطقة الرسم البياني
      U9.arrow(c,cx-bW-4,arY,cx-bW-4-arLen,arY,col,3.5,fr.toFixed(0)+' N',1);

      // سهم القوة — يمين الجسم
      U9.arrow(c,cx+bW+4,arY,cx+bW+4+arLen,arY,col,3.5,'',1);

      // خشونة السطح
      if(S.factor==='rough'){
        const dots=Math.max(3,Math.round(cas.mu*14));
        for(let d=0;d<dots;d++){
          const dx2=cx-bW+1+(d/(dots-1||1))*(bW*2-2);
          c.fillStyle=col+'77';c.beginPath();c.arc(dx2,gY+5,2.5,0,Math.PI*2);c.fill();
        }
      }
    });

    // عنوان الاستنتاج — في أعلى منطقة الرسم البياني بمساحة كافية
    const titleCol=S.factor==='area'?'#27AE60':'#1A6A8A';
    const title=S.factor==='weight'?'⚖️ الوزن ↑ ← احتكاك ↑  (F = μN)':
                S.factor==='rough' ?'🧱 الخشونة ↑ ← احتكاك ↑  (F = μN)':
                '📐 المساحة لا تؤثر على الاحتكاك!';
    const titleFs=Math.max(11,Math.min(13,w*0.018));
    // خلفية للعنوان لمنع التداخل
    c.fillStyle='rgba(255,255,255,0.9)';
    c.beginPath();c.roundRect(w/2-180,chartTop+4,360,24,6);c.fill();
    U9.txt(c,title,w/2,chartTop+16,titleCol,titleFs,true);

    // رسم بياني — يبدأ تحت العنوان بمسافة كافية
    const barVals=cases.map(cas=>+(cas.mu*cas.w).toFixed(1));
    const maxVal=Math.max(...barVals,1);
    const gbY=chartTop+34;                // بداية الرسم بعد العنوان
    const gbH=chartH-58;                  // مساحة للتسميات والأرقام تحت
    const totalBarW=w-48;
    const barW=Math.min(totalBarW/3*0.55, 80);
    const laneChart=totalBarW/3;

    cases.forEach((cas,i)=>{
      const bx=24+i*laneChart+(laneChart-barW)/2;
      const bh=Math.max(4, barVals[i]/maxVal*gbH);
      const prog=Math.min(S.animT*1.5,1);
      const actualH=bh*prog;

      // الشريط
      U9.rect(c,bx,gbY+gbH-actualH,barW,actualH,cas.col+'BB',cas.col,6,2);

      // قيمة فوق الشريط — فوق الشريط مباشرة بدون تداخل
      if(prog>0.3){
        const valY=gbY+gbH-actualH-4;
        c.fillStyle=cas.col;
        c.font=`bold ${Math.max(11,Math.min(13,barW*0.28))}px Tajawal,Arial`;
        c.textAlign='center';c.textBaseline='bottom';
        c.fillText(barVals[i].toFixed(0)+' N',bx+barW/2,valY);
      }

      // تسمية تحت الشريط
      c.font=`bold ${Math.max(10,Math.min(13,barW*0.22))}px Tajawal,Arial`;
      c.fillStyle=cas.col;c.textAlign='center';c.textBaseline='top';
      c.fillText(cas.label,bx+barW/2,gbY+gbH+6);
    });

    // خط المقارنة (عامل المساحة)
    if(S.factor==='area'){
      const lineY=gbY+gbH-barVals[0]/maxVal*gbH;
      c.strokeStyle='#27AE60';c.lineWidth=2;c.setLineDash([6,4]);
      c.beginPath();c.moveTo(20,lineY);c.lineTo(w-20,lineY);c.stroke();c.setLineDash([]);
      // خلفية للنص لمنع التداخل مع الأشرطة
      c.fillStyle='rgba(255,255,255,0.85)';
      c.beginPath();c.roundRect(w/2-70,lineY-18,140,18,4);c.fill();
      U9.txt(c,'✓ نفس الاحتكاك!',w/2,lineY-8,'#27AE60',11,true);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════

// 9-4 Tab 3 - الاحتكاك الجزيئي (PhET Friction style)
// ══════════════════════════════════════════════════════════════
function simFriction3(){
  if((currentSim!=='friction'&&currentSim!=='g6friction')||currentTab!==2)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');
  function W(){return cv.width;}
  function H(){return cv.height;}

  const ROUGH={
    smooth:{ label:'ناعم 🧈',  mu:0.05, bumps:0,  atomVib:1,  heatRate:0.00015, col:'#AED6F1' },
    medium:{ label:'متوسط 🪵', mu:0.35, bumps:5,  atomVib:2.5,heatRate:0.0008,  col:'#F0B27A' },
    rough: { label:'خشن 🧱',   mu:0.75, bumps:12, atomVib:5,  heatRate:0.0025,  col:'#E59866' },
  };

  if(!simState.fr3) simState.fr3={
    roughness:'medium',
    topX:0, speed:0,
    isDragging:false, dragStartX:0, dragStartTopX:0, lastX:0,
    heat:0, t:0, sparks:[], atoms:[],
  };
  const S=simState.fr3;

  function initAtoms(){
    S.atoms=[];
    // جزيئات سطح الكتاب الأسفل (صف واحد، ثابتة)
    for(let i=0;i<18;i++) S.atoms.push({
      layer:'bot', idx:i, ox:0, oy:0
    });
    // جزيئات سطح الكتاب الأعلى (صف واحد، تتحرك)
    for(let i=0;i<18;i++) S.atoms.push({
      layer:'top', idx:i, ox:0, oy:0
    });
  }
  if(S.atoms.length===0) initAtoms();

  // ── لوحة التحكم ──
  controls(`
    <div class="ctrl-label" style="font-size:15px">🔬 الاحتكاك الجزيئي</div>
    <div class="info-box" style="font-size:13px;line-height:1.9;text-align:center">
      اسحب الكتاب الأزرق ←→<br>
      وراقب الجزيئات والحرارة!
    </div>
    <div style="margin-top:12px">
      <div class="ctrl-label">خشونة السطح</div>
      <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">
        ${Object.entries(ROUGH).map(([k,v])=>`
          <button onclick="window._fr3Rough('${k}')" id="fr3Btn_${k}"
            style="padding:10px 12px;border-radius:10px;border:2px solid;
            font-family:Tajawal;font-size:14px;cursor:pointer;text-align:right;
            transition:all 0.2s;
            ${S.roughness===k
              ? 'background:'+v.col+';color:#2C3E50;border-color:'+v.col+';font-weight:700;box-shadow:0 3px 10px '+v.col+'88'
              : 'background:rgba(0,0,0,0.03);color:#555;border-color:rgba(0,0,0,0.1)'}">
            ${v.label}
            <span style="float:left;font-size:11px;opacity:0.7">μ = ${v.mu}</span>
          </button>`).join('')}
      </div>
    </div>
    <div style="margin-top:14px;padding:12px;background:rgba(231,76,60,0.07);
      border-radius:12px;border:1.5px solid rgba(231,76,60,0.15)">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <span class="ctrl-label" style="color:#C0392B;margin:0">🌡️ الحرارة</span>
        <span id="fr3Deg" style="font-size:20px;font-weight:800;color:#E74C3C;font-family:monospace">0°</span>
      </div>
      <div style="height:18px;background:rgba(0,0,0,0.08);border-radius:9px;overflow:hidden">
        <div id="fr3Bar" style="height:100%;width:0%;border-radius:9px;
          background:linear-gradient(90deg,#F9E79F,#F39C12,#E74C3C,#C0392B);
          transition:width 0.1s"></div>
      </div>
    </div>
    <div id="fr3Info" style="margin-top:10px;padding:10px;
      background:rgba(26,143,168,0.07);border-radius:10px;
      font-size:13px;line-height:2;min-height:65px">
      ابدأ السحب!
    </div>
    <button onclick="window._fr3Reset()"
      style="margin-top:10px;width:100%;padding:10px;border-radius:10px;
      background:rgba(0,0,0,0.05);border:1.5px solid rgba(0,0,0,0.1);
      font-family:Tajawal;font-size:14px;cursor:pointer">↺ إعادة</button>
    <div class="q-box" style="margin-top:10px">
      <strong>❓ ص٥٥:</strong> لماذا يتولّد الحرارة عند الاحتكاك؟
      <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
      <div class="q-ans-panel">لأن الجزيئات على السطحين تتصادم وتهتز بشدة، فتتحوّل الطاقة الحركية إلى طاقة حرارية.</div>
    </div>
  `);

  window._fr3Rough=function(k){
    S.roughness=k; S.heat=0; S.speed=0; S.topX=0; S.sparks=[];
    initAtoms();
    Object.keys(ROUGH).forEach(kk=>{
      const b=document.getElementById('fr3Btn_'+kk); if(!b) return;
      const v=ROUGH[kk];
      const sel=kk===k;
      b.style.background=sel?v.col:'rgba(0,0,0,0.03)';
      b.style.color=sel?'#2C3E50':'#555';
      b.style.borderColor=sel?v.col:'rgba(0,0,0,0.1)';
      b.style.fontWeight=sel?'700':'';
      b.style.boxShadow=sel?'0 3px 10px '+v.col+'88':'';
    });
    updateUI();
  };
  window._fr3Reset=function(){
    S.topX=0; S.heat=0; S.speed=0; S.sparks=[]; S.isDragging=false;
    initAtoms(); updateUI();
  };

  function updateUI(){
    const deg=Math.round(S.heat*150);
    const bar=document.getElementById('fr3Bar');
    const degEl=document.getElementById('fr3Deg');
    const info=document.getElementById('fr3Info');
    if(bar) bar.style.width=(S.heat*100).toFixed(1)+'%';
    if(degEl){
      degEl.textContent=deg+'°';
      degEl.style.color=deg<30?'#F39C12':deg<80?'#E74C3C':'#C0392B';
    }
    if(info){
      const spd=Math.abs(S.speed);
      const r=ROUGH[S.roughness];
      info.innerHTML=`
        <div>⚡ السرعة: <strong>${(spd*0.3).toFixed(2)} m/s</strong></div>
        <div>🔴 الخشونة: <strong>${r.label}</strong> (μ=${r.mu})</div>
        <div>🌡️ الحرارة: <strong style="color:#E74C3C">${deg}°</strong></div>
        <div style="font-size:11px;color:#888">
          ${deg>100?'⚠️ ساخن جداً!':deg>50?'🔥 يتولّد حرارة':spd>0.5?'💡 ابدأ تلاحظ الحرارة':'اسحب بقوة أكثر!'}
        </div>`;
    }
  }

  // ── رسم كتاب واقعي ──
  function drawBook(x, y, w2, h2, isTop){
    c.save();
    // ظل
    c.fillStyle='rgba(0,0,0,0.18)';
    c.beginPath(); c.roundRect(x+6,y+6,w2,h2,[6]); c.fill();

    // صفحات الكتاب (من الجانب)
    const pageCount=8;
    for(let i=pageCount;i>=0;i--){
      const py=y+i*(h2*0.04/(pageCount));
      c.fillStyle=`hsl(40,${30+i*3}%,${85+i*1.5}%)`;
      c.beginPath(); c.roundRect(x,py,w2,h2-i*(h2*0.04/pageCount),[i===0?6:2]); c.fill();
    }

    // غلاف الكتاب
    const coverCol  = isTop ? '#2471A3' : '#922B21';
    const spineCol  = isTop ? '#1A5276' : '#7B241C';
    const accentCol = isTop ? '#AED6F1' : '#F1948A';

    // غلاف رئيسي
    c.fillStyle=coverCol;
    c.beginPath(); c.roundRect(x,y,w2,h2,[6]); c.fill();

    // عمود الكتاب (يسار)
    c.fillStyle=spineCol;
    c.beginPath(); c.roundRect(x,y,16,h2,[6,0,0,6]); c.fill();

    // خط زخرفي أفقي
    c.fillStyle=accentCol;
    c.beginPath(); c.roundRect(x+20,y+h2*0.18,w2-28,4,[2]); c.fill();
    c.beginPath(); c.roundRect(x+20,y+h2*0.75,w2-28,4,[2]); c.fill();

    // عنوان
    c.font=`bold ${Math.max(11,w2*0.04)}px Tajawal`;
    c.fillStyle='rgba(255,255,255,0.9)';
    c.textAlign='center'; c.textBaseline='middle';
    c.fillText(isTop?'الكتاب الأعلى':'الكتاب الأسفل', x+w2/2+4, y+h2/2);

    // ليبل "اسحبني"
    if(isTop){
      c.fillStyle='rgba(255,255,255,0.5)';
      c.font=`11px Tajawal`;
      c.fillText('← اسحبني →', x+w2/2+4, y+h2*0.82);
    }

    c.restore();
    return {surfaceY: isTop ? y+h2 : y};
  }

  // ── رسم السطح المتعرج (خشونة) ──
  function drawSurface(x,y,w2,isTop,rough){
    const bumps=rough.bumps;
    if(bumps===0){
      // ناعم — خط مستقيم
      c.strokeStyle=isTop?'rgba(100,180,255,0.5)':'rgba(255,120,100,0.5)';
      c.lineWidth=2;
      c.setLineDash([]);
      c.beginPath(); c.moveTo(x,y); c.lineTo(x+w2,y); c.stroke();
      return;
    }
    // خشن — خط متعرج
    const seg=w2/bumps;
    const ht=rough.bumps===5?4:8;
    c.strokeStyle=isTop?'rgba(100,180,255,0.7)':'rgba(255,120,100,0.7)';
    c.lineWidth=2.5; c.setLineDash([]);
    c.beginPath(); c.moveTo(x,y);
    for(let i=0;i<bumps;i++){
      const bx=x+i*seg;
      const dir=isTop?-1:1;
      c.lineTo(bx+seg/4, y+dir*ht);
      c.lineTo(bx+seg/2, y);
      c.lineTo(bx+3*seg/4, y-dir*ht);
      c.lineTo(bx+seg, y);
    }
    c.stroke();
  }

  // ── رسم الجزيئات ──
  function drawAtoms(botY,topY,topX,rough){
    const w2=W()*0.72, bkX=(W()-w2)/2;
    const spd=Math.abs(S.speed);
    const vib=rough.atomVib * spd * 0.5 + S.heat*4;
    const N=18;

    S.atoms.forEach(a=>{
      const isTop=a.layer==='top';
      const seg=w2/N;
      let baseX, baseY;
      if(isTop){
        baseX = bkX + topX + (a.idx+0.5)*seg;
        baseY = topY + 8;
      } else {
        baseX = bkX + (a.idx+0.5)*seg;
        baseY = botY - 8;
      }

      // اهتزاز
      a.ox=(Math.random()-0.5)*vib*2;
      a.oy=(Math.random()-0.5)*vib;

      const ax=baseX+a.ox, ay=baseY+a.oy;
      const r2=isTop?5:5;

      // لون يتحول مع الحرارة
      const heat2=S.heat;
      let col;
      if(heat2<0.3){
        col=isTop?`rgba(52,152,219,0.85)`:`rgba(192,57,43,0.85)`;
      } else {
        const hf=Math.min((heat2-0.3)/0.7,1);
        col=isTop
          ?`rgba(${Math.round(52+hf*200)},${Math.round(152-hf*60)},${Math.round(219-hf*190)},0.9)`
          :`rgba(${Math.round(192+hf*60)},${Math.round(57+hf*20)},${Math.round(43-hf*20)},0.9)`;
      }

      // رسم الذرة
      const g2=c.createRadialGradient(ax-r2*0.3,ay-r2*0.3,1,ax,ay,r2);
      g2.addColorStop(0,'rgba(255,255,255,0.6)');
      g2.addColorStop(1,col);
      c.beginPath(); c.arc(ax,ay,r2,0,Math.PI*2);
      c.fillStyle=g2; c.fill();

      // هالة اهتزاز
      if(vib>2){
        c.strokeStyle=col.replace('0.9','0.3').replace('0.85','0.3');
        c.lineWidth=1.5;
        c.beginPath(); c.arc(ax,ay,r2+Math.min(vib,6),0,Math.PI*2); c.stroke();
      }
    });
  }

  // ── شرر ──
  function spawnSparks(x,y){
    if(S.t%3!==0) return;
    const n=Math.floor(ROUGH[S.roughness].mu*Math.abs(S.speed)*8);
    for(let i=0;i<Math.min(n,6);i++){
      S.sparks.push({
        x:x+(Math.random()-0.5)*W()*0.4,
        y:y,
        vx:(Math.random()-0.5)*8,
        vy:-Math.random()*6-2,
        life:1,
        r:2+Math.random()*3,
        col:['#F1C40F','#E67E22','#E74C3C','#F39C12'][Math.floor(Math.random()*4)]
      });
    }
  }

  // ── الرسم الرئيسي ──
  function draw(){
    if((currentSim!=='friction'&&currentSim!=='g6friction')||currentTab!==2)return;
    S.t++;
    const w=W(), h=H();
    c.clearRect(0,0,w,h);

    // خلفية تتلوّن بالحرارة
    const hf=S.heat;
    const r=Math.round(235+hf*20), g=Math.round(245-hf*50), b2=Math.round(251-hf*70);
    c.fillStyle=`rgb(${r},${g},${b2})`;
    c.fillRect(0,0,w,h);

    // تحديث الحرارة
    const spd=Math.abs(S.speed);
    const rough=ROUGH[S.roughness];
    if(spd>0.3){
      const spdFactor=Math.min(spd,8);
      S.heat=Math.min(1, S.heat+spdFactor*rough.heatRate);
    } else {
      S.heat=Math.max(0, S.heat-0.0015);
    }

    // أبعاد الكتب
    const bkW=w*0.72, bkH=h*0.16;
    const bkX=(w-bkW)/2;
    const midY=h*0.50;
    const botY=midY+4;      // سطح الكتاب الأسفل العلوي
    const topY=midY-4;      // سطح الكتاب الأعلى السفلي
    const tx=bkX+S.topX;   // x الكتاب الأعلى

    // ── رسم الكتاب الأسفل ──
    drawBook(bkX, botY, bkW, bkH, false);
    drawSurface(bkX, botY, bkW, false, rough);

    // ── رسم الكتاب الأعلى ──
    drawBook(tx, topY-bkH, bkW, bkH, true);
    drawSurface(tx, topY, bkW, true, rough);

    // ── منطقة التلامس (توهج حراري) ──
    if(hf>0.05){
      const heatGrad=c.createLinearGradient(0,midY-16,0,midY+16);
      heatGrad.addColorStop(0,'rgba(231,76,60,0)');
      heatGrad.addColorStop(0.5,`rgba(231,76,60,${Math.min(hf*0.55,0.45)})`);
      heatGrad.addColorStop(1,'rgba(231,76,60,0)');
      c.fillStyle=heatGrad;
      c.fillRect(tx, midY-16, bkW, 32);
    }

    // ── الجزيئات ──
    drawAtoms(botY, topY, S.topX, rough);

    // ── شرر ──
    if(spd>0.5) spawnSparks(tx+bkW/2, midY);
    S.sparks=S.sparks.filter(sp=>{
      sp.x+=sp.vx; sp.y+=sp.vy; sp.vy+=0.35; sp.life-=0.055;
      c.globalAlpha=sp.life;
      c.fillStyle=sp.col;
      c.beginPath(); c.arc(sp.x,sp.y,sp.r,0,Math.PI*2); c.fill();
      c.globalAlpha=1;
      return sp.life>0;
    });

    // ── مقبض السحب (مميز) ──
    {
      const hndX=tx+bkW/2, hndY=topY-bkH-18;
      c.fillStyle=S.isDragging?'#F39C12':'rgba(52,152,219,0.9)';
      c.beginPath(); c.roundRect(hndX-36,hndY-14,72,28,[8]); c.fill();
      c.font='bold 13px Tajawal'; c.fillStyle='white';
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText('↔ اسحب',hndX,hndY);
    }

    // ── مؤشر حرارة مرئي ──
    if(hf>0.04){
      const deg=Math.round(hf*150);
      c.font=`bold ${Math.round(18+hf*16)}px Tajawal`;
      c.fillStyle=`rgba(${Math.round(200+hf*55)},${Math.round(80-hf*60)},30,${Math.min(0.9,hf+0.2)})`;
      c.textAlign='center'; c.textBaseline='top';
      c.fillText('🌡️ '+deg+'°', w/2, 10);
    }

    // ── مقارنة مرئية للخشونة ──
    {
      const labels={smooth:'سطح ناعم ← حرارة بطيئة',medium:'سطح متوسط ← حرارة معتدلة',rough:'سطح خشن ← حرارة سريعة!'};
      c.font='13px Tajawal'; c.fillStyle='rgba(52,73,94,0.55)';
      c.textAlign='center'; c.textBaseline='bottom';
      c.fillText(labels[S.roughness], w/2, h-10);
    }

    // تعليمة أولية
    if(spd<0.1 && hf<0.02){
      c.font='14px Tajawal'; c.fillStyle='rgba(52,73,94,0.5)';
      c.textAlign='center'; c.textBaseline='middle';
      c.fillText('← اسحب الكتاب الأزرق ذهاباً وإياباً →', w/2, h*0.82);
    }

    updateUI();
    animFrame=requestAnimationFrame(()=>{try{draw();}catch(e){}});
  }

  // ── السحب ──
  function getPos(e){
    const r=cv.getBoundingClientRect();
    const t=(e.touches&&e.touches[0])||e;
    return {x:(t.clientX-r.left)*W()/r.width,
            y:(t.clientY-r.top)*H()/r.height};
  }

  function onDown(e){
    e.preventDefault&&e.preventDefault();
    const p=getPos(e);
    const bkW=W()*0.72, bkH=H()*0.16;
    const bkX=(W()-bkW)/2;
    const tx=bkX+S.topX, topY=H()*0.50-4;
    if(p.x>tx-10&&p.x<tx+bkW+10&&p.y>topY-bkH-36&&p.y<topY+10){
      S.isDragging=true;
      S.dragStartX=p.x; S.dragStartTopX=S.topX; S.lastX=p.x;
      try{U9Sound.ping(440,0.1,0.08);}catch(ex){}
    }
  }

  function onMove(e){
    e.preventDefault&&e.preventDefault();
    if(!S.isDragging) return;
    const p=getPos(e);
    const dx=p.x-S.dragStartX;
    const maxShift=W()*0.28;
    S.topX=Math.max(-maxShift,Math.min(maxShift,S.dragStartTopX+dx));
    S.speed=(p.x-S.lastX)*0.45;
    S.lastX=p.x;
  }

  function onUp(e){
    if(!S.isDragging) return;
    S.isDragging=false;
    S.speed*=0.4;
  }

  cv.addEventListener('mousedown', onDown,false);
  cv.addEventListener('mousemove', onMove,false);
  cv.addEventListener('mouseup',   onUp,  false);
  cv.addEventListener('touchstart',onDown,{passive:false});
  cv.addEventListener('touchmove', onMove,{passive:false});
  cv.addEventListener('touchend',  onUp,  false);

  draw();
}


// 9-5 Tab 1 - السقوط الحر مع السحب
// ══════════════════════════════════════════════════════════════
function simAirResist1(){
  if((currentSim!=='airresist'&&currentSim!=='g6airresist')||currentTab!==0)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  if(!simState.u9AR1) simState.u9AR1={
    selectedObjs:['parachute','metal','feather'],
    airDensity:1,running:false,
    objs:{},times:{},winner:null,t:0
  };
  const S=simState.u9AR1;

  const OBJECTS={
    parachute:{label:'مظلة 🪂',m:5,Cd:1.2,A:15,col:'#E74C3C',icon:'🪂'},
    feather:{label:'ريشة 🪶',m:0.01,Cd:1.0,A:0.05,col:'#8E44AD',icon:'🪶'},
    metal:{label:'كرة معدن ⚽',m:1,Cd:0.47,A:0.045,col:'#2980B9',icon:'⚽'},
    paper:{label:'ورقة 📄',m:0.005,Cd:1.5,A:0.06,col:'#27AE60',icon:'📄'},
    rock:{label:'حجر 🪨',m:3,Cd:0.8,A:0.02,col:'#7F8C8D',icon:'🪨'},
    balloon:{label:'بالون 🎈',m:0.01,Cd:0.47,A:0.05,col:'#D4870A',icon:'🎈'},
  };

  document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">☑️ اختر الأجسام</div>
  ${Object.entries(OBJECTS).map(([k,v])=>`
    <label style="display:flex;align-items:center;gap:8px;font-size:14px;margin-bottom:5px;cursor:pointer">
      <input type="checkbox" ${S.selectedObjs.includes(k)?'checked':''}
        onchange="const s=simState.u9AR1.selectedObjs;const i=s.indexOf('${k}');if(this.checked&&i<0)s.push('${k}');else if(!this.checked&&i>=0)s.splice(i,1)">
      <span style="color:${v.col};font-weight:bold">${v.label}</span>
    </label>
  `).join('')}
</div>
<div class="ctrl-section">
  <div class="ctrl-label">💨 كثافة الهواء: <span class="ctrl-val" id="arDens">${S.airDensity}</span></div>
  <input type="range" min="0" max="3" step="0.1" value="${S.airDensity}"
    oninput="simState.u9AR1.airDensity=+this.value;document.getElementById('arDens').textContent=(+this.value).toFixed(1)">
</div>
<div class="ctrl-section">
  <button class="ctrl-btn play" onclick="simState.u9AR1.running=true;simState.u9AR1.objs={};simState.u9AR1.times={};simState.u9AR1.winner=null;simState.u9AR1.t=0">🔽 أسقط</button>
  <button class="ctrl-btn reset" onclick="simState.u9AR1.running=false;simState.u9AR1.objs={};simState.u9AR1.times={};simState.u9AR1.winner=null">↺ إعادة</button>
</div>
<div class="q-box">
  <strong>❓ أسئلة الكتاب (ص٥٦-٥٧):</strong><br>
  ١- اذكر اسمَي القوّتين المؤثِّرتين على المظلّي عندما يهبط نحو الأرض، واذكر اتّجاه كلٍّ منهما.<br>
  ٢- لماذا لا تنفع المظلّة على القمر؟<br>
  <span style="color:#1A8FA8;font-size:13px">💡 جرِّب: اضبط كثافة الهواء = 0 وراقب النتيجة!</span>

    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الوزن (للأسفل) ومقاومة الهواء (للأعلى).<br>٢- لأن القمر لا يملك هواءً، فلا توجد مقاومة هواء.<br><b>🔬 الاستنتاج:</b> عند كثافة الهواء = صفر (فراغ)، <b>كل الأجسام تصل في نفس الوقت</b> بغض النظر عن كتلتها أو شكلها — لأن الجاذبية تُسرّع جميع الأجسام بنفس المقدار (g = 10 م/ث²).</div>
  </div>`;

  function draw(){
    if((currentSim!=='airresist'&&currentSim!=='g6airresist')||currentTab!==0)return;
    const S=simState.u9AR1;
    const w=cv.width,h=cv.height;
    const startY=h*0.08,groundY=h*0.87;
    const fallH=groundY-startY;
    const sel=S.selectedObjs.filter(k=>OBJECTS[k]);
    const laneW=sel.length>0?Math.min(w/sel.length,130):w;

    c.clearRect(0,0,w,h);
    const sky=c.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,S.airDensity<0.5?'#1A1A2E':'#87CEEB');
    sky.addColorStop(1,S.airDensity<0.5?'#2C2C54':'#B0E2FF');
    c.fillStyle=sky;c.fillRect(0,0,w,h);

    // جزيئات هواء
    if(S.airDensity>0.5&&S.running){
      c.fillStyle='rgba(255,255,255,0.15)';
      for(let i=0;i<S.airDensity*20;i++){
        const px=(i*137+S.t*10)%w,py=(i*71+S.t*5)%h;
        c.beginPath();c.arc(px,py,1.5,0,Math.PI*2);c.fill();
      }
    }
    c.fillStyle='#5D8A3C';c.fillRect(0,groundY,w,h-groundY);
    c.fillStyle='#4A7A2A';c.fillRect(0,groundY,w,5);
    U9.txt(c,'🏁 خط الوصول',w/2,groundY+22,'white',18,true);

    const g=10;
    if(S.running){
      S.t+=0.016;
      sel.forEach((k,idx)=>{
        if(!S.objs[k])S.objs[k]={y:0,v:0,trail:[]};
        const ob=S.objs[k];
        const obj=OBJECTS[k];
        if(ob.y<fallH){
          const drag=0.5*S.airDensity*obj.Cd*obj.A*ob.v*ob.v;
          const accel=g-(drag/obj.m);
          ob.v+=Math.max(accel,0)*0.016*2;
          ob.y+=ob.v*0.5;
          // صوت ريح للأجسام السريعة
          if(S.airDensity>0.3 && ob.v>8 && Math.random()<0.04) U9Sound.wind(0.08*S.airDensity);
          ob.trail.push({y:ob.y,x:0});if(ob.trail.length>40)ob.trail.shift();
          if(ob.y>=fallH){
            ob.y=fallH;
            if(!S.times[k]){
              S.times[k]=S.t;
              if(!S.winner){S.winner=k;U9Sound.win();}
              U9Sound.thud(Math.min(0.65,0.2+obj.m*0.05), obj.m>1?55:110);
            }
          }
        }
      });
      if(sel.every(k=>S.times[k]))S.running=false;
    }

    sel.forEach((k,i)=>{
      const obj=OBJECTS[k];
      const lane=laneW*i+laneW/2;
      const bY=S.objs[k]?startY+S.objs[k].y:startY;
      const bR=22;

      // خط المسار
      c.strokeStyle=obj.col+'44';c.lineWidth=1.5;c.setLineDash([6,4]);
      c.beginPath();c.moveTo(lane,startY);c.lineTo(lane,groundY);c.stroke();c.setLineDash([]);

      // ذيل الحركة
      if(S.objs[k]&&S.objs[k].trail.length>1){
        S.objs[k].trail.forEach((pt,pi)=>{
          const alpha=(pi/S.objs[k].trail.length)*0.25;
          c.fillStyle=obj.col+Math.floor(alpha*255).toString(16).padStart(2,'0');
          c.beginPath();c.arc(lane,startY+pt.y,bR*0.35,0,Math.PI*2);c.fill();
        });
      }

      // ── الجسم: دائرة ملونة + emoji ──
      // الدائرة الخلفية
      c.save();
      const cg=c.createRadialGradient(lane-bR*0.3,bY-bR*0.3,2,lane,bY,bR+5);
      cg.addColorStop(0,obj.col+'EE');cg.addColorStop(1,obj.col+'66');
      c.beginPath();c.arc(lane,bY,bR+5,0,Math.PI*2);
      c.shadowColor=obj.col;c.shadowBlur=16;
      c.fillStyle=cg;c.fill();c.shadowBlur=0;
      c.strokeStyle='rgba(255,255,255,0.55)';c.lineWidth=2;c.stroke();
      // emoji — بفونت صريح يدعم الألوان
      c.font=`${bR*1.65}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",Arial`;
      c.textAlign='center';c.textBaseline='middle';
      c.fillStyle='black'; // بعض المتصفحات تحتاج لون
      c.fillText(obj.icon,lane,bY+1);
      c.restore();

      // سهام القوى — كبيرة خارج الدائرة
      if(S.running&&S.objs[k]&&!S.times[k]){
        const vel=S.objs[k].v||0;
        const wLen=Math.max(Math.min(obj.m*10*0.55,55),10);
        U9.arrow(c,lane,bY+bR+8,lane,bY+bR+8+wLen,'#E74C3C',3.5,'',1);
        if(vel>0.5&&S.airDensity>0.1){
          const drag=0.5*S.airDensity*obj.Cd*obj.A*vel*vel;
          const dLen=Math.max(Math.min(drag*1.2,55),6);
          U9.arrow(c,lane,bY-bR-8,lane,bY-bR-8-dLen,'#3498DB',3.5,'',1);
        }
      }

      // وقت الوصول + ميدالية
      if(S.times[k]){
        U9.rect(c,lane-28,bY+bR+10,56,20,obj.col+'CC','rgba(255,255,255,0.3)',5,1);
        U9.txt(c,S.times[k].toFixed(2)+'s',lane,bY+bR+23,'#fff',11,true);
      }
      // عرض 🥇 فقط إذا كان هناك فائز حقيقي (مقاومة هواء موجودة)
      if(k===S.winner && S.airDensity>0.05){
        c.save();c.font='22px "Apple Color Emoji","Segoe UI Emoji",Arial';
        c.textAlign='center';c.textBaseline='middle';
        c.shadowColor='#FFD700';c.shadowBlur=12;
        c.fillText('🥇',lane,bY-bR-24);c.restore();
      }
      U9.txt(c,obj.label,lane,startY-26,obj.col,12,true);
    });

    // تحقق من حالة التعادل (فراغ أو كثافة منخفضة جداً)
    const allDone=sel.length>0&&sel.every(k=>S.times[k]);
    const timesArr=allDone?sel.map(k=>S.times[k]):[];
    const minT=timesArr.length?Math.min(...timesArr):0;
    const maxT=timesArr.length?Math.max(...timesArr):0;
    const isTie=allDone&&(maxT-minT)<0.08;

    if(allDone&&!S.running){
      if(isTie||S.airDensity<0.05){
        // حالة الفراغ أو التعادل
        U9.rect(c,w/2-195,h/2-40,390,80,'rgba(0,20,60,0.92)','#1A8FA8',14,3);
        U9.txt(c,'⚡ كلّ الأجسام وصلت في نفس الوقت!',w/2,h/2-12,'#7FFFFF',18,true);
        U9.txt(c,'في الفراغ: الجاذبية تُسرّع الجميع بالتساوي ✅',w/2,h/2+14,'white',14,false);
      } else {
        U9.rect(c,w/2-160,h/2-35,320,70,'rgba(0,0,0,0.85)','#FFD700',14,3);
        U9.txt(c,'🏆 '+OBJECTS[S.winner].label+' أسرع!',w/2,h/2-10,'#FFD700',19,true);
        U9.txt(c,'في '+S.times[S.winner].toFixed(2)+' ثانية',w/2,h/2+16,'white',17,false);
      }
    } else if(S.winner&&S.running&&S.airDensity>0.05){
      U9.rect(c,w/2-120,groundY-45,240,36,'rgba(0,0,0,0.7)','#FFD700',10,2);
      U9.txt(c,'🥇 '+OBJECTS[S.winner].label+' وصل أولاً!',w/2,groundY-24,'#FFD700',14,true);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════
// 9-5 Tab 2 - السرعة الحدّية — سحب مباشر للجسم
// ══════════════════════════════════════════════════════════════
function simAirResist2(){
  if((currentSim!=='airresist'&&currentSim!=='g6airresist')||currentTab!==1)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  const S=simState.u9AR2=Object.assign({
    objKey:'parachute',planet:'earth',
    v:0,t:0,vHistory:[],running:false,
    // تحكم إضافي قابل للسحب
    customArea:25,customMass:80,
    dragging:null, // 'parachute'|'mass'
    dragStart:{x:0,y:0,val:0},
  },simState.u9AR2||{});

  const OBJECTS={
    parachute:{label:'مظلة 🪂',    m:()=>S.customMass, Cd:1.2, A:()=>S.customArea, col:'#E74C3C', draggable:true},
    skydiver: {label:'قافز 🤸',    m:()=>75,            Cd:1.0, A:()=>0.7,          col:'#3498DB', draggable:false},
    ball:     {label:'كرة ⚽',     m:()=>0.45,          Cd:0.47,A:()=>0.038,        col:'#27AE60', draggable:false},
    feather:  {label:'ريشة 🪶',    m:()=>0.003,         Cd:1.0, A:()=>0.003,        col:'#9B59B6', draggable:false},
  };
  const ATMO={
    earth: {label:'🌍 الأرض',  g:10,  rho:1.225, col:'#2980B9', sky:'#1A2A5A'},
    mars:  {label:'🔴 المريخ', g:3.72, rho:0.02,  col:'#E74C3C', sky:'#2A0A00'},
    venus: {label:'♀️ الزهرة', g:8.87, rho:65,    col:'#D4870A', sky:'#1A0A00'},
  };

  function buildControls(){
    const obj=OBJECTS[S.objKey];
    const atm=ATMO[S.planet];
    const m=obj.m(), A=obj.A();
    const termV=atm.rho>0?Math.sqrt(2*m*atm.g/(atm.rho*obj.Cd*A)):Infinity;
    document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">🎯 الجسم</div>
  ${Object.entries(OBJECTS).map(([k,v])=>`
    <button class="ctrl-btn${S.objKey===k?' active':''}" style="${S.objKey===k?'background:'+v.col+';color:#fff':''};font-size:12px"
      onclick="simState.u9AR2.objKey='${k}';simState.u9AR2.v=0;simState.u9AR2.vHistory=[];simAirResist2()">
      ${v.label}</button>
  `).join('')}
</div>
${S.objKey==='parachute'?`
<div class="ctrl-section">
  <div class="ctrl-label">🪂 مساحة المظلة: <span class="ctrl-val" id="arArea">${S.customArea}</span> m²</div>
  <input type="range" min="1" max="50" value="${S.customArea}"
    oninput="simState.u9AR2.customArea=+this.value;document.getElementById('arArea').textContent=this.value;simState.u9AR2.v=0;simState.u9AR2.vHistory=[]">
  <div class="ctrl-label" style="margin-top:8px">⚖️ كتلة المظلة: <span class="ctrl-val" id="arMass">${S.customMass}</span> kg</div>
  <input type="range" min="10" max="200" value="${S.customMass}"
    oninput="simState.u9AR2.customMass=+this.value;document.getElementById('arMass').textContent=this.value;simState.u9AR2.v=0;simState.u9AR2.vHistory=[]">
  <div style="font-size:10px;color:#AAA;margin-top:4px">💡 اسحب المظلة أفقياً لتغيير مساحتها!</div>
</div>`:''}
<div class="ctrl-section">
  <div class="ctrl-label">🌍 الكوكب</div>
  ${Object.entries(ATMO).map(([k,v])=>`
    <button class="ctrl-btn${S.planet===k?' active':''}" style="${S.planet===k?'background:'+v.col+';color:#fff':''};font-size:12px"
      onclick="simState.u9AR2.planet='${k}';simState.u9AR2.v=0;simState.u9AR2.vHistory=[];simAirResist2()">
      ${v.label}</button>
  `).join('')}
</div>
<div class="ctrl-section">
  <button class="ctrl-btn play" onclick="simState.u9AR2.running=!simState.u9AR2.running;this.textContent=simState.u9AR2.running?'⏸ إيقاف':'▶ تشغيل'">${S.running?'⏸ إيقاف':'▶ تشغيل'}</button>
  <button class="ctrl-btn reset" onclick="simState.u9AR2.v=0;simState.u9AR2.t=0;simState.u9AR2.vHistory=[];simState.u9AR2.running=false">↺ إعادة</button>
</div>
<div class="info-box" style="font-size:11px;line-height:1.8">
  <strong>v الحدّية = √(2mg/ρCdA)</strong><br>
  = ${termV===Infinity?'∞':termV.toFixed(1)} m/s<br>
  السرعة الحالية: <strong style="color:${obj.col}">${S.v.toFixed(1)}</strong> m/s
</div>`;
  }
  buildControls();

  // سحب المظلة أفقياً لتغيير مساحتها
  const PARA_X=()=>cv.width*0.22, PARA_Y=()=>cv.height*0.35;
  function onDown(e){
    if(S.objKey!=='parachute')return;
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    const px=PARA_X(),py=PARA_Y();
    if(Math.abs(pos.x-px)<60&&Math.abs(pos.y-py)<50){
      S.dragging='parachute';
      S.dragStart={x:pos.x,y:pos.y,val:S.customArea};
    }
  }
  function onMove(e){
    if(!S.dragging)return;
    e.preventDefault();
    const pos=U9.getPos(cv,e);
    if(S.dragging==='parachute'){
      const dx=pos.x-S.dragStart.x;
      S.customArea=Math.max(1,Math.min(50,S.dragStart.val+dx*0.3));
      S.v=0;S.vHistory=[];
      const sl=document.querySelector('#simControlsPanel input[type=range]');
      if(sl){sl.value=S.customArea;const el=document.getElementById('arArea');if(el)el.textContent=S.customArea.toFixed(0);}
      // تحديث لوحة المعلومات
      const obj2=OBJECTS.parachute;const atm2=ATMO[S.planet];
      const tv=atm2.rho>0?Math.sqrt(2*S.customMass*atm2.g/(atm2.rho*obj2.Cd*S.customArea)):Infinity;
      const inf=document.querySelector('.info-box');
      if(inf)inf.innerHTML=`<strong>v الحدّية = √(2mg/ρCdA)</strong><br>= ${tv.toFixed(1)} m/s<br>السرعة الحالية: <strong style="color:#E74C3C">0.0</strong> m/s`;
    }
  }
  function onUp(){S.dragging=null;cv.style.cursor='default';}
  cv.addEventListener('mousedown',onDown);
  cv.addEventListener('mousemove',onMove);
  cv.addEventListener('mouseup',onUp);
  cv.addEventListener('touchstart',onDown,{passive:false});
  cv.addEventListener('touchmove',onMove,{passive:false});
  cv.addEventListener('touchend',onUp);

  function draw(){
    if((currentSim!=='airresist'&&currentSim!=='g6airresist')||currentTab!==1){
      cv.removeEventListener('mousedown',onDown);cv.removeEventListener('mousemove',onMove);cv.removeEventListener('mouseup',onUp);
      cv.removeEventListener('touchstart',onDown);cv.removeEventListener('touchmove',onMove);cv.removeEventListener('touchend',onUp);
      return;
    }
    const w=cv.width,h=cv.height;
    const obj=OBJECTS[S.objKey];
    const atm=ATMO[S.planet];
    const m=obj.m(), A=obj.A();

    if(S.running){
      S.t+=0.016;
      const drag=0.5*atm.rho*obj.Cd*A*S.v*S.v;
      const accel=Math.max(0,atm.g-(drag/m));
      S.v+=accel*0.016;
      S.vHistory.push(S.v);
      if(S.vHistory.length>200)S.vHistory.shift();
    }

    const termV=atm.rho>0?Math.sqrt(2*m*atm.g/(atm.rho*obj.Cd*A)):Infinity;
    const drag=0.5*atm.rho*obj.Cd*A*S.v*S.v;
    const weight=m*atm.g;
    const balanced=weight>0&&Math.abs(drag-weight)/weight<0.05;

    c.clearRect(0,0,w,h);
    // خلفية سماء ليلية متدرجة
    const sky=c.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,atm.sky);sky.addColorStop(1,atm.sky+'88');
    c.fillStyle=sky;c.fillRect(0,0,w,h);
    // نجوم
    for(let si=0;si<40;si++){
      c.fillStyle=`rgba(255,255,200,${0.3+Math.sin(S.t*0.5+si)*0.2})`;
      c.beginPath();c.arc((si*173)%w,(si*89)%(h*0.8),0.8,0,Math.PI*2);c.fill();
    }

    // الجسم الرئيسي وسهامه
    const ox=PARA_X(),oy=PARA_Y();

    // رسم المظلة أو الجسم
    if(S.objKey==='parachute'){
      const halfW=Math.max(18,Math.sqrt(S.customArea)*6);
      // قبة المظلة
      const paraG=c.createRadialGradient(ox,oy-20,5,ox,oy,halfW);
      paraG.addColorStop(0,'#F1948A');paraG.addColorStop(1,'#E74C3C88');
      c.save();
      c.shadowColor='#E74C3C';c.shadowBlur=S.dragging?24:10;
      c.beginPath();c.arc(ox,oy,halfW,Math.PI,Math.PI*2);
      c.fillStyle=paraG;c.fill();
      c.strokeStyle='#E74C3C';c.lineWidth=2.5;c.stroke();
      c.restore();
      // خطوط المظلة
      for(let si2=-1;si2<=1;si2+=0.5){
        c.strokeStyle='rgba(231,76,60,0.5)';c.lineWidth=1;
        c.beginPath();c.moveTo(ox+si2*halfW,oy);c.lineTo(ox,oy+halfW*0.9);c.stroke();
      }
      // الشخص
      U9.person(c,ox,oy+halfW*0.9+10,0.7);
      // مقياس المساحة
      U9.txt(c,'A='+S.customArea.toFixed(0)+'m²',ox,oy-halfW-12,'#E74C3C',10,true);
      U9.txt(c,S.dragging?'↔ اسحب':'',ox,oy+halfW*0.9+44,'#E74C3C88',9,true);
    } else {
      // إيموجي الجسم
      c.save();c.shadowColor=obj.col;c.shadowBlur=15;
      c.font='44px serif';c.textAlign='center';c.textBaseline='middle';
      c.fillText(obj.label.split(' ')[1]||'⚽',ox,oy);
      c.shadowBlur=0;c.restore();
    }

    // سهام القوى
    const wArrow=Math.min(weight*0.4,80);
    const dArrow=Math.min(drag*0.4,80);
    U9.arrow(c,ox+48,oy,ox+48,oy+wArrow,'#E74C3C',4,'W='+weight.toFixed(0)+'N',1);
    if(drag>0.1) U9.arrow(c,ox+48,oy,ox+48,oy-dArrow,'#3498DB',4,'D='+drag.toFixed(0)+'N',1);

    // حالة الحركة أسفل الجسم
    if(!balanced){
      U9.txt(c,weight>drag?'⬇️ يتسارع...':'⬆️ يتباطأ...',ox,oy+90,'rgba(255,255,255,0.6)',11);
    }

    // ── تخطيط الكانفاس: عمودان ──
    // العمود الأيسر: المظلة + سهام (40%)
    // العمود الأيمن: رسم بياني فوق + أعمدة تحت (60%)
    const pad=8;
    const leftW=Math.round(w*0.42);
    const rightX=leftW+pad;
    const rightW=w-rightX-pad;

    // ── العمود الأيسر: لوحة البيانات ──
    const panH=Math.round(h*0.46);
    U9.rect(c,pad,pad,leftW-pad,panH,'rgba(0,0,0,0.55)','rgba(255,255,255,0.13)',10,1.5);
    c.fillStyle='rgba(255,255,255,0.88)';
    c.font=`bold ${Math.round(w*0.022)}px Tajawal`;c.textAlign='center';
    c.fillText('📊 البيانات',pad+(leftW-pad)/2,pad+16);
    c.strokeStyle='rgba(255,255,255,0.18)';c.lineWidth=1;
    c.beginPath();c.moveTo(pad+6,pad+22);c.lineTo(leftW-6,pad+22);c.stroke();

    const rows=[
      {l:'الكتلة m', v:m+' kg',                       col:'#AED6F1'},
      {l:'الجاذبية g',v:atm.g+' m/s²',               col:'#F1948A'},
      {l:'الوزن W',  v:weight.toFixed(1)+' N',         col:'#E74C3C'},
      {l:'كثافة ρ',  v:atm.rho+' kg/m³',              col:'#85C1E9'},
      {l:'مساحة A',  v:A.toFixed(2)+' m²',            col:obj.col},
      {l:'مقاومة D', v:drag.toFixed(1)+' N',           col:'#3498DB'},
      {l:'سرعة v',   v:S.v.toFixed(1)+' m/s',         col:'#82E0AA'},
      {l:'v الحدّية',v:termV===Infinity?'∞':termV.toFixed(1)+' m/s',col:'#F39C12'},
    ];
    const fs=Math.max(10,Math.round(w*0.021));
    const rowH=(panH-26)/rows.length;
    rows.forEach((row,i)=>{
      const ry=pad+26+i*rowH+rowH*0.65;
      if(i%2===0){c.fillStyle='rgba(255,255,255,0.04)';c.fillRect(pad+2,pad+26+i*rowH,leftW-pad-4,rowH);}
      c.font=`${fs}px Tajawal`;
      c.fillStyle='rgba(255,255,255,0.5)';c.textAlign='right';
      c.fillText(row.l, leftW-10, ry);
      c.fillStyle=row.col;c.textAlign='left';
      c.fillText(row.v, pad+8, ry);
    });

    // ── رسم بياني السرعة (عمود أيمن، النصف العلوي) ──
    const gH=Math.round(h*0.46);
    const gX=rightX, gY=pad, gW=rightW;
    U9.rect(c,gX,gY,gW,gH,'rgba(0,0,0,0.45)','rgba(255,255,255,0.12)',10,1.5);
    U9.txt(c,'منحنى السرعة مع الزمن',gX+gW/2,gY+16,'rgba(255,255,255,0.85)',Math.round(w*0.022),true);

    if(S.vHistory.length>1){
      const maxV=Math.max(termV===Infinity?S.v*1.5:termV*1.4,S.v+1,5);
      if(termV!==Infinity){
        const ty=gY+gH-10-(termV/maxV)*(gH-28);
        c.strokeStyle='#F39C12';c.lineWidth=1.5;c.setLineDash([7,4]);
        c.beginPath();c.moveTo(gX+6,ty);c.lineTo(gX+gW-6,ty);c.stroke();c.setLineDash([]);
        U9.txt(c,'v∞='+termV.toFixed(1)+'m/s',gX+gW-8,ty-7,'#F39C12',Math.round(w*0.018),true,'right');
      }
      c.beginPath();
      S.vHistory.forEach((v2,i)=>{
        const px=gX+8+i*(gW-16)/200;
        const py=gY+gH-10-(v2/maxV)*(gH-28);
        i===0?c.moveTo(px,py):c.lineTo(px,py);
      });
      c.strokeStyle=obj.col;c.lineWidth=2.5;c.stroke();
      const lastPx=Math.min(gX+8+S.vHistory.length*(gW-16)/200,gX+gW-8);
      const lastPy=gY+gH-10-(S.v/maxV)*(gH-28);
      c.fillStyle=obj.col;c.shadowColor=obj.col;c.shadowBlur=8;
      c.beginPath();c.arc(lastPx,lastPy,5,0,Math.PI*2);c.fill();c.shadowBlur=0;
    }

    // ── أعمدة الوزن/المقاومة ──
    const bY=gY+gH+pad;
    const bH=h-bY-pad;
    const bX=pad, bTW=w-pad*2;
    const lblSize=Math.round(w*0.019);
    U9.rect(c,bX,bY,bTW,bH,'rgba(0,0,0,0.45)','rgba(255,255,255,0.12)',10,1.5);

    // عنوان + شارة التوازن في سطر واحد
    const titleTxt = balanced ? '⚖️ توازن! — الوزن = المقاومة' : 'الوزن (أحمر) ← مقاومة الهواء (أزرق)';
    const titleCol = balanced ? '#FFD700' : 'rgba(255,255,255,0.7)';
    U9.txt(c,titleTxt,bX+bTW/2,bY+16,titleCol,lblSize,true);

    const maxF=Math.max(weight,drag,1);
    const barW=bTW*0.18;
    // نترك 28px للعنوان فوق و20px للتسمية تحت
    const barTop=bY+28, barBot=bY+bH-22;
    const barMaxH=barBot-barTop;

    // عمود الوزن
    const wH2=Math.max(2,Math.min(weight/maxF*barMaxH,barMaxH));
    const wGr=c.createLinearGradient(0,barBot-wH2,0,barBot);
    wGr.addColorStop(0,'#E74C3C');wGr.addColorStop(1,'#C0392B88');
    c.fillStyle=wGr;c.fillRect(bX+bTW*0.18,barBot-wH2,barW,wH2);
    c.strokeStyle='#E74C3C';c.lineWidth=1.5;c.strokeRect(bX+bTW*0.18,barBot-wH2,barW,wH2);
    U9.txt(c,'W='+weight.toFixed(0)+'N',bX+bTW*0.18+barW/2,barBot+13,'#E74C3C',lblSize,true);

    // عمود المقاومة
    const dH2=Math.max(2,Math.min(drag/maxF*barMaxH,barMaxH));
    const dGr=c.createLinearGradient(0,barBot-dH2,0,barBot);
    dGr.addColorStop(0,'#3498DB');dGr.addColorStop(1,'#2980B988');
    c.fillStyle=dGr;c.fillRect(bX+bTW*0.58,barBot-dH2,barW,dH2);
    c.strokeStyle='#3498DB';c.lineWidth=1.5;c.strokeRect(bX+bTW*0.58,barBot-dH2,barW,dH2);
    U9.txt(c,'D='+drag.toFixed(0)+'N',bX+bTW*0.58+barW/2,barBot+13,'#3498DB',lblSize,true);

    // خط التوازن
    if(balanced){
      c.strokeStyle='#FFD700';c.lineWidth=2;c.setLineDash([6,3]);
      c.beginPath();c.moveTo(bX+12,barBot-wH2);c.lineTo(bX+bTW-12,barBot-wH2);c.stroke();
      c.setLineDash([]);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}



// ============================================================
// ══════════════════════════════════════════════════════════════
// 9-5 Tab 3 - استقصاء مساحة المظلة
// ══════════════════════════════════════════════════════════════
function simAirResist3(){
  if((currentSim!=='airresist'&&currentSim!=='g6airresist')||currentTab!==2)return;
  cancelAnimationFrame(animFrame);
  const cv=document.getElementById('simCanvas');
  const c=cv.getContext('2d');

  if(!simState.u9AR3) simState.u9AR3={
    area: 5,
    running: false,
    y: 0, v: 0, t: 0,
    trail: [],
    results: window._ar3Results || [],
    finished: false,
  };
  window._ar3Results = simState.u9AR3.results;

  const MASS = 80;
  const G    = 10;
  const RHO  = 1.225;
  const CD   = 2.0;
  const FALL = 200;
  const AREAS = [2, 5, 10, 20, 40];
  // مُضاعِف بصري: يجعل المظلة الصغيرة أسرع بكثير والكبيرة أبطأ بكثير
  const VISUAL_SPEED = 2.5; // ضغط/تمديد الزمن بصرياً

  // ─── دوال مساعدة تقرأ simState.u9AR3 مباشرة (لا closure قديمة) ───
  function resetRun(){
    simState.u9AR3.running=false;
    simState.u9AR3.y=0; simState.u9AR3.v=0; simState.u9AR3.t=0;
    simState.u9AR3.trail=[]; simState.u9AR3.finished=false;
    refreshPanel();
  }
  function clearTable(){
    simState.u9AR3.results=[];
    window._ar3Results=[];
    updateTable();
  }
  function setArea(a){
    simState.u9AR3.area=a;
    resetRun();
  }
  window._ar3Reset=resetRun;
  window._ar3Clear=clearTable;
  window._ar3Area=setArea;

  function updateTable(){
    const el=document.getElementById('inquiryTable');
    if(!el) return;
    const res = window._ar3Results || (simState.u9AR3 && simState.u9AR3.results) || [];
    if(res.length===0){el.innerHTML='';return;}
    el.innerHTML=`
<div class="ctrl-label" style="margin-bottom:6px">📊 نتائج الاستقصاء</div>
<table style="width:100%;border-collapse:collapse;font-size:12px;direction:rtl">
  <tr style="background:#1A3A72;color:white">
    <th style="padding:4px 6px;border-radius:4px 0 0 4px">مساحة المظلة</th>
    <th style="padding:4px 6px">وقت الوصول</th>
    <th style="padding:4px 6px;border-radius:0 4px 4px 0">السرعة الحدّية</th>
  </tr>
  ${res.map((r,i)=>`
  <tr style="background:${i%2===0?'rgba(26,58,114,0.08)':'rgba(26,58,114,0.04)'}">
    <td style="padding:5px 8px;text-align:center;color:#E74C3C;font-weight:bold">${r.area} م²</td>
    <td style="padding:5px 8px;text-align:center;font-weight:600">${r.time != null ? r.time.toFixed(1)+' ث' : '—'}</td>
    <td style="padding:5px 8px;text-align:center;color:#2980B9">${r.termV != null ? r.termV.toFixed(1)+' م/ث' : '—'}</td>
  </tr>`).join('')}
</table>
<div style="color:#888;font-size:11px;margin-top:6px;text-align:center">كلما زادت المساحة → زاد الوقت → قلّت السرعة</div>`;
  }

  function refreshPanel(){
    const cur=simState.u9AR3.area;
    document.getElementById('simControlsPanel').innerHTML=`
<div class="ctrl-section">
  <div class="ctrl-label">📐 مساحة المظلة</div>
  <div style="display:flex;flex-direction:column;gap:6px;margin-top:6px">
    ${AREAS.map(a=>`
      <button onclick="_ar3Area(${a})" class="area-btn ctrl-btn"
        style="font-size:13px;padding:6px 8px;${cur===a?'background:#E74C3C;color:white;':''}">
        🪂 ${a} م²</button>
    `).join('')}
  </div>
</div>
<div class="ctrl-section">
  <button class="ctrl-btn play" onclick="
    simState.u9AR3.y=0;simState.u9AR3.v=0;simState.u9AR3.t=0;simState.u9AR3.elapsed=0;
    simState.u9AR3.trail=[];simState.u9AR3.finished=false;simState.u9AR3.running=true;
  ">▶ أسقط المظلي</button>
  <button class="ctrl-btn reset" onclick="_ar3Reset()">↺ إعادة</button>
  <button class="ctrl-btn" style="background:#8E44AD;color:white;margin-top:6px"
    onclick="_ar3Clear()">🗑 مسح الجدول</button>
</div>
<div class="ctrl-section" id="inquiryTable" style="direction:rtl"></div>`;
    updateTable();
  }

  refreshPanel();

  function draw(){
    if((currentSim!=='airresist'&&currentSim!=='g6airresist')||currentTab!==2)return;
    const S=simState.u9AR3;  // دائماً أحدث نسخة
    const w=cv.width, h=cv.height;
    const groundY=h*0.88;
    // نبدأ المظلة أسفل قليلاً لتظهر القبة كاملة
    const startY=h*0.16;
    const fallH=groundY-startY;

    c.clearRect(0,0,w,h);

    // خلفية سماء
    const sky=c.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,'#1B3A6B');
    sky.addColorStop(0.6,'#2E86C1');
    sky.addColorStop(1,'#85C1E9');
    c.fillStyle=sky;c.fillRect(0,0,w,h);

    // سحب خلفية
    [[0.15,0.12,80,20],[0.55,0.18,100,18],[0.75,0.08,70,15]].forEach(([fx,fy,rw,rh])=>{
      c.fillStyle='rgba(255,255,255,0.12)';
      c.beginPath();c.ellipse(fx*w,fy*h,rw,rh,0,0,Math.PI*2);c.fill();
    });

    // الأرض
    c.fillStyle='#4A7A2A';c.fillRect(0,groundY,w,h-groundY);
    c.fillStyle='#5D8A3C';c.fillRect(0,groundY,w,8);
    U9.txt(c,'🏁 الأرض',w/2,groundY+18,'white',14,true);

    // خط البداية
    c.strokeStyle='rgba(255,255,255,0.2)';c.lineWidth=1;c.setLineDash([6,4]);
    c.beginPath();c.moveTo(0,startY);c.lineTo(w,startY);c.stroke();c.setLineDash([]);
    U9.txt(c,'↕ 400 م',w*0.88,startY+10,'rgba(255,255,255,0.5)',11,true);

    // ─── محاكاة الفيزياء ───
    if(S.running && !S.finished){
      // السرعة البصرية: المساحة الصغيرة أسرع بصرياً بكثير
      const termV = Math.sqrt(2*MASS*G/(RHO*CD*S.area));
      const areaFactor = 40 / S.area;
      const speedMult = Math.pow(areaFactor, 0.904);
      const dt = 0.016 * speedMult;  // الوقت البصري المُسرَّع
      const dtReal = 0.016;          // الوقت الحقيقي لكل frame
      const steps = 6;
      const dtStep = dt / steps;          // للحركة البصرية
      const dtStepReal = dtReal / steps;  // للوقت الحقيقي
      for(let i=0; i<steps; i++){
        const drag = 0.5*RHO*CD*S.area*S.v*S.v;
        const accel = G - (drag/MASS);
        // حرّك الجسم بصرياً بـ dtStep (مُسرَّع)
        S.v = Math.max(0, S.v + accel*dtStep);
        S.y += S.v*dtStep;
        // لكن احسب الوقت الحقيقي بـ dtStepReal
        S.t += dtStep;
        S.elapsed = (S.elapsed||0) + dtStepReal;
        if(S.y>=FALL){
          S.y=FALL; S.running=false; S.finished=true;
          const exists=S.results.find(r=>r.area===S.area);
          if(!exists){
            const finalTime = S.elapsed > 0 ? S.elapsed : S.t / speedMult;
            window._ar3Results = window._ar3Results || [];
            window._ar3Results.push({area:S.area, time:finalTime, termV:termV});
            window._ar3Results.sort((a,b)=>a.area-b.area);
            S.results = window._ar3Results;
          }
          U9Sound.win();
          setTimeout(updateTable,100);
          break;
        }
      }
      S.trail.push(S.y);
      if(S.trail.length>60)S.trail.shift();
      if(S.v>3 && Math.random()<0.04) U9Sound.wind(0.05);
    }

    // موضع المظلة على الشاشة
    const dispY = S.y>0 ? startY + (S.y/FALL)*fallH : startY;

    // ذيل الحركة
    S.trail.forEach((ty,ti)=>{
      const alpha=(ti/S.trail.length)*0.18;
      c.fillStyle=`rgba(231,76,60,${alpha})`;
      const ty2=startY+(ty/FALL)*fallH;
      c.beginPath();c.arc(w/2,ty2,6,0,Math.PI*2);c.fill();
    });

    // ─── رسم المظلة ───
    const parasX=w/2;
    // مركز القبة = dispY (أسفل الخط بمسافة كافية لظهور القبة)
    const domeR = 10 + Math.sqrt(S.area)*11;
    const parasY = dispY + domeR; // مركز القبة يبدأ بعد ارتفاع القبة من الخط

    // خيوط المظلة
    c.strokeStyle='rgba(255,255,255,0.7)';c.lineWidth=1;
    [[-domeR*0.7,0],[-domeR*0.3,0],[0,0],[domeR*0.3,0],[domeR*0.7,0]].forEach(([dx])=>{
      c.beginPath();c.moveTo(parasX+dx,parasY);c.lineTo(parasX,parasY+domeR+28);c.stroke();
    });

    // قبة المظلة
    c.save();
    const domeGrad=c.createRadialGradient(parasX-domeR*0.2,parasY-domeR*0.3,2,parasX,parasY,domeR*1.1);
    domeGrad.addColorStop(0,'#F1948A');
    domeGrad.addColorStop(0.5,'#E74C3C');
    domeGrad.addColorStop(1,'#922B21');
    c.beginPath();
    c.moveTo(parasX-domeR,parasY);
    c.bezierCurveTo(parasX-domeR,parasY-domeR*1.3,parasX+domeR,parasY-domeR*1.3,parasX+domeR,parasY);
    c.closePath();
    c.shadowColor='rgba(231,76,60,0.4)';c.shadowBlur=14;
    c.fillStyle=domeGrad;c.fill();
    c.strokeStyle='rgba(255,255,255,0.3)';c.lineWidth=1;c.shadowBlur=0;
    [-domeR*0.5,0,domeR*0.5].forEach(dx=>{
      c.beginPath();
      c.moveTo(parasX+dx,parasY);
      c.bezierCurveTo(parasX+dx,parasY-domeR*1.1,parasX+dx,parasY-domeR*1.1,parasX+dx*0.6,parasY-domeR*1.15);
      c.stroke();
    });
    c.restore();
    U9.txt(c,S.area+' م²',parasX,parasY-domeR*1.3-6,'white',13,true);

    // المظلي
    c.save();
    c.font='22px "Apple Color Emoji","Segoe UI Emoji",Arial';
    c.textAlign='center';c.textBaseline='top';
    c.fillText('🧍',parasX-9,parasY+domeR+22);
    c.restore();

    // ─── سهام القوى ───
    if(S.running && S.v>0){
      const weight=MASS*G;
      const drag=0.5*RHO*CD*S.area*S.v*S.v;
      const wLen=Math.min(weight*0.18,60);
      const dLen=Math.min(drag*0.18,60);
      U9.arrow(c,parasX+domeR+22,parasY,parasX+domeR+22,parasY+wLen,'#E74C3C',3,'W',1);
      U9.txt(c,weight.toFixed(0)+'N',parasX+domeR+42,parasY+wLen/2,'#E74C3C',10,false);
      U9.arrow(c,parasX+domeR+22,parasY,parasX+domeR+22,parasY-dLen,'#3498DB',3,'D',1);
      U9.txt(c,drag.toFixed(0)+'N',parasX+domeR+42,parasY-dLen/2,'#3498DB',10,false);
    }

    // ─── بيانات ───
    if(S.running||S.finished){
      U9.rect(c,8,8,178,76,'rgba(0,0,0,0.75)','#3498DB',8,2);
      U9.txt(c,'⏱ '+S.t.toFixed(1)+' ث',97,24,'white',13,true);
      U9.txt(c,'💨 '+S.v.toFixed(1)+' م/ث',97,43,'#3498DB',13,true);
      const termV=Math.sqrt(2*MASS*G/(RHO*CD*S.area));
      U9.txt(c,'🎯 حدّي: '+termV.toFixed(1)+' م/ث',97,62,'#2ECC71',12,true);
    }

    // ─── رسالة الوصول ───
    if(S.finished){
      U9.rect(c,w/2-160,h/2-42,320,84,'rgba(0,0,0,0.88)','#2ECC71',14,3);
      U9.txt(c,'✅ وصل المظلي بأمان!',w/2,h/2-18,'#2ECC71',17,true);
      U9.txt(c,'استغرق '+(S.elapsed||0).toFixed(1)+' ث بمظلة '+S.area+' م²',w/2,h/2+6,'white',14,true);
      const termV2=Math.sqrt(2*MASS*G/(RHO*CD*S.area));
      U9.txt(c,'السرعة الحدّية: '+termV2.toFixed(1)+' م/ث',w/2,h/2+28,'#3498DB',13,true);
    }

    // ─── تعليمة البداية ───
    if(!S.running && !S.finished){
      U9.rect(c,w/2-145,h*0.45,290,46,'rgba(0,0,0,0.7)','#E74C3C',10,2);
      U9.txt(c,'📐 اختر مساحة المظلة',w/2,h*0.45+14,'white',14,true);
      U9.txt(c,'ثم اضغط ▶ أسقط المظلي',w/2,h*0.45+32,'rgba(255,255,255,0.75)',13,true);
    }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error('SIM ERR:',e)}});
  }
  draw();
}

