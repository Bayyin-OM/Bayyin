// ║         UNIT 8  —  خصائص المادّة  (v2 Enhanced)         ║
// ╚══════════════════════════════════════════════════════════╝

// ─── shared data ───────────────────────────────────────────
const METALS_DATA = [
  { name:'الحديد',     sym:'Fe', color:'#7A8090', shine:'#B8BCC8', use:'الجسور والهياكل الإنشائية',  shiny:true,  conduct:true,  malleable:true,  magnetic:true,  mp:1538, icon:'🔩', fact:'الحديد أكثر الفلزّات استخداماً في البناء' },
  { name:'النحاس',     sym:'Cu', color:'#C06830', shine:'#E8A060', use:'الأسلاك الكهربائية',         shiny:true,  conduct:true,  malleable:true,  magnetic:false, mp:1085, icon:'🔌', fact:'النحاس ثاني أفضل موصّل للكهرباء بعد الفضة' },
  { name:'الذهب',      sym:'Au', color:'#C8900A', shine:'#F0C840', use:'المجوهرات والدوائر الدقيقة',shiny:true,  conduct:true,  malleable:true,  magnetic:false, mp:1064, icon:'💍', fact:'الذهب لا يصدأ ويظل لامعاً للأبد' },
  { name:'الألومنيوم', sym:'Al', color:'#9AA8B8', shine:'#D0DCE8', use:'الطائرات والعلب والنوافذ',  shiny:true,  conduct:true,  malleable:true,  magnetic:false, mp:660,  icon:'✈️', fact:'الألومنيوم أخف الفلزّات الشائعة وأكثرها في القشرة الأرضية' },
  { name:'الفضة',      sym:'Ag', color:'#B0B8C8', shine:'#E0E8F0', use:'المجوهرات والأدوات الطبية',shiny:true,  conduct:true,  malleable:true,  magnetic:false, mp:962,  icon:'🥈', fact:'الفضة أفضل موصّل للكهرباء والحرارة بين جميع الفلزّات' },
  { name:'الزنك',      sym:'Zn', color:'#8A9898', shine:'#B8C8C8', use:'طلاء الفولاذ لمنع الصدأ',  shiny:true,  conduct:true,  malleable:true,  magnetic:false, mp:420,  icon:'🛡️', fact:'يُستخدم الزنك لحماية الحديد من الصدأ بعملية الغلفنة' },
];
const NM_DATA = [
  { name:'الأكسجين',  sym:'O₂', state:'غاز',  color:'#4A9AE0', use:'التنفّس والمستشفيات وحرق الوقود',icon:'💨', brittle:false, conduct:false, shiny:false, fact:'يشكّل 21٪ من الهواء، ضروري لكل الكائنات الهوائية' },
  { name:'الكربون',   sym:'C',  state:'صلب',  color:'#3A3A4A', use:'تنقية الماء وصناعة الأقلام',    icon:'🪨', brittle:true,  conduct:false, shiny:false, fact:'الألماس والجرافيت كلاهما كربون خالص!' },
  { name:'الكبريت',   sym:'S',  state:'صلب',  color:'#D4C020', use:'تصليب المطاط وصناعة الأسمدة',  icon:'🟡', brittle:true,  conduct:false, shiny:false, fact:'يوجد الكبريت كثيراً بالقرب من البراكين' },
  { name:'الكلور',    sym:'Cl₂',state:'غاز',  color:'#78A840', use:'تعقيم مياه الشرب والمسابح',     icon:'🫧', brittle:false, conduct:false, shiny:false, fact:'ملح الطعام (NaCl) يحتوي على الكلور!' },
  { name:'الهيليوم',  sym:'He', state:'غاز',  color:'#E07878', use:'البالونات والمناطيد',            icon:'🎈', brittle:false, conduct:false, shiny:false, fact:'الهيليوم أخف العناصر بعد الهيدروجين وغير قابل للاشتعال' },
  { name:'السيليكون', sym:'Si', state:'صلب',  color:'#9A9AB0', use:'الرقائق الإلكترونية والألواح الشمسية',icon:'💻', brittle:true, conduct:false, shiny:false, fact:'السيليكون أساس صناعة الإلكترونيات الحديثة' },
  { name:'الفسفور',   sym:'P',  state:'صلب',  color:'#F0802A', use:'الأسمدة وعيدان الثقاب',         icon:'🔥', brittle:true,  conduct:false, shiny:false, fact:'الفسفور الأبيض يشتعل تلقائياً في الهواء' },
  { name:'النيتروجين',sym:'N₂', state:'غاز',  color:'#60A0D0', use:'التبريد السريع وصناعة الأسمدة', icon:'❄️', brittle:false, conduct:false, shiny:false, fact:'يشكّل النيتروجين 78٪ من الهواء الذي نتنفّسه' },
];

function simMetals() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  simState = { selected: null, t: 0 };
  const METALS = METALS_DATA;

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔩 اختر الفلزّ — نشاط 1-8</div>
      <span id="metals-btns-ph"></span>    </div>
    <div class="quran-banner" style="margin:6px 0;padding:9px 12px">
      <div class="quran-text" style="font-size:16px">﴿ وَأَلَنَّا لَهُ الْحَدِيدَ ﴾</div>
      <div class="quran-ref">سورة سبأ · الآية ١٠</div>
    </div>
    <div id="metal-info" class="info-box">اضغط على أي فلزّ لاستعراض خصائصه التفصيلية</div>
    <div class="q-box">
      <strong>❓ أسئلة الكتاب (ص٣٧):</strong><br>
      ١- اذكر عشرة فلزّات.<br>
      ٢- لماذا يُستخدم النحاس في صناعة الأسلاك الكهربائية؟<br>
      ٣- ما معنى «قابل للطرق» و«قابل للسحب»؟
    
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الحديد، النحاس، الذهب، الفضة، الألومنيوم، الزنك، القصدير، الرصاص، النيكل، الكوبالت.<br>٢- لأنه يوصّل الكهرباء جيداً وقابل للسحب.<br>٣- قابل للطرق: يمكن تشكيله بضربه. قابل للسحب: يمكن سحبه على شكل أسلاك.</div>
  </div>
  `);
  buildBtns('metals-btns-ph', METALS, 'window._selMetal', 'mb');

  window._selMetal = (i) => {
    simState.selected = i;
    METALS.forEach((_,j)=>{ const b=document.getElementById('mb'+j); if(b) b.style.outline = j===i?'2px solid #1A8FA8':'none'; });
    const m = METALS[i];
    const sym = m.sym || m.ar;
    document.getElementById('metal-info').innerHTML = `
      <strong style="color:#1A8FA8;font-size:16px;display:block;margin-bottom:8px">${m.icon} ${m.name} (${sym})</strong>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px 8px;font-size:15px;margin-bottom:8px">
        <span>✨ لامع</span><span>${m.shiny?'✅ نعم':'❌ لا'}</span>
        <span>⚡ موصّل كهربائي</span><span>${m.conduct?'✅ نعم':'❌ لا'}</span>
        <span>🔨 قابل للطرق</span><span>${m.malleable?'✅ نعم':'❌ لا'}</span>
        <span>🧲 مغناطيسي</span><span>${m.magnetic?'✅ نعم':'❌ لا'}</span>
        ${m.mp?`<span>🌡️ نقطة الانصهار</span><span>${m.mp}°م</span>`:''}
      </div>
      <div style="padding:7px;background:rgba(212,144,26,0.09);border-radius:6px;font-size:15px;color:#7A5010">
        📌 ${m.use}${m.fact?`<br>💡 ${m.fact}`:''}
      </div>`;
  };

  const cv = document.getElementById('simCanvas');
  cv.onclick = (e) => {
    const r=cv.getBoundingClientRect(), mx=e.clientX-r.left, my=e.clientY-r.top;
    const w=cv.width, cols=Math.min(6,Math.floor(w/82));
    const bW=Math.min(76,(w-40)/cols), bH=bW*1.25, sx=(w-cols*(bW+10))/2;
    METALS.forEach((_,i)=>{
      const col=i%cols, row=Math.floor(i/cols), x=sx+col*(bW+10), y=52+row*(bH+10);
      if(mx>=x&&mx<=x+bW&&my>=y&&my<=y+bH) window._selMetal(i);
    });
  };

  function draw() {
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h);
    const bg=c.createLinearGradient(0,0,0,h);
    bg.addColorStop(0,'#F5F2EC'); bg.addColorStop(1,'#EDEAE3');
    c.fillStyle=bg; c.fillRect(0,0,w,h);
    simState.t++;
    const tt=simState.t;

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(18,w*0.038)}px Tajawal`;
    c.textAlign='center'; c.fillText('الفلزّات — اضغط على أي فلزّ لاستعراض خصائصه', w/2, 34);

    const cols=Math.min(5,Math.floor(w/130));
    const gap=16;
    const bW=Math.min(Math.floor((w-40-gap*(cols-1))/cols), 150);
    const bH=bW*1.3, sx=(w-(cols*(bW+gap)-gap))/2;

    METALS.forEach((m,i)=>{
      const col=i%cols, row=Math.floor(i/cols), x=sx+col*(bW+gap), y=54+row*(bH+gap);
      const sel=simState.selected===i;
      const pulse=sel?1+Math.sin(tt*0.08)*0.025:1;
      const shine=m.shine||m.color+'EE';

      c.save(); c.translate(x+bW/2,y+bH/2); c.scale(pulse,pulse); c.translate(-bW/2,-bH/2);
      c.shadowColor=sel?'rgba(26,143,168,0.30)':'rgba(0,0,0,0.07)';
      c.shadowBlur=sel?16:5; c.shadowOffsetY=sel?4:2;
      c.fillStyle=sel?'#E4F4F8':'white';
      c.strokeStyle=sel?'#1A8FA8':'rgba(0,0,0,0.07)'; c.lineWidth=sel?2:1;
      c.beginPath(); c.roundRect(0,0,bW,bH,10); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      const r=bW*0.27;
      const grad=c.createRadialGradient(bW*0.37,bH*0.23,r*0.1,bW/2,bH*0.31,r);
      grad.addColorStop(0,shine); grad.addColorStop(0.55,m.color); grad.addColorStop(1,m.color+'77');
      c.beginPath(); c.arc(bW/2,bH*0.31,r,0,Math.PI*2); c.fillStyle=grad; c.fill();
      c.beginPath(); c.ellipse(bW*0.37,bH*0.21,r*0.27,r*0.17,-0.5,0,Math.PI*2);
      c.fillStyle='rgba(255,255,255,0.55)'; c.fill();

      const sym=m.sym||m.ar||'';
      c.fillStyle='rgba(255,255,255,0.92)'; c.font=`bold ${Math.min(15,bW*0.13)}px Tajawal`;
      c.textAlign='center'; c.fillText(sym,bW/2,bH*0.34);

      c.fillStyle=sel?'#1A6A80':'#2C3A4A';
      c.font=`bold ${Math.min(15,bW*0.13)}px Tajawal`; c.fillText(m.name,bW/2,bH*0.61);

      c.font=`${Math.min(24,bW*0.20)}px Arial`; c.fillText(m.icon,bW/2,bH*0.82);

      if(sel){ c.fillStyle='#1A8FA8'; c.font=`bold ${Math.min(7.5,bW*0.1)}px Tajawal`;
        c.fillText(m.mp?m.mp+'°م':'', bW/2, bH*0.94); }
      c.restore();
    });

    if(simState.selected!==null){
      const m=METALS[simState.selected];
      const rows=Math.ceil(METALS.length/cols);
      const sy=46+rows*(bH+10)+6;
      if(sy+68<h){
        c.fillStyle='rgba(26,143,168,0.07)'; c.strokeStyle='rgba(26,143,168,0.18)'; c.lineWidth=1;
        c.beginPath(); c.roundRect(10,sy,w-20,66,10); c.fill(); c.stroke();
        c.fillStyle='#1A6A80'; c.font=`bold ${Math.min(12,w*0.028)}px Tajawal`;
        c.textAlign='center'; c.fillText(m.icon+' '+m.name+' — '+m.use,w/2,sy+17);
        const props=[{l:'لامع ✨',ok:m.shiny},{l:'موصّل ⚡',ok:m.conduct},{l:'طرق 🔨',ok:m.malleable},{l:'مغناطيسي 🧲',ok:m.magnetic}];
        props.forEach((p,i)=>{
          const px=10+i*(w-20)/4+(w-20)/8;
          c.fillStyle=p.ok?'#1E7A40':'#8B2020';
          c.font=`bold ${Math.min(10,w*0.024)}px Tajawal`; c.textAlign='center';
          c.fillText((p.ok?'✅ ':'❌ ')+p.l, px, sy+38);
        });
        if(m.fact){ c.fillStyle='#7A6020'; c.font=`${Math.min(10,w*0.023)}px Tajawal`;
          c.fillText('💡 '+m.fact, w/2, sy+56, w-30); }
      }
    }
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-1 TAB 2: METAL LAB — مختبر الاختبار =====
function simMetalLab() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  simState = { test: 'shiny', t: 0, metalIdx: 0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 اختر التجربة</div>
      <button class="ctrl-btn action" id="lt_shiny"    onclick="window._setTest('shiny')">✨ اختبار اللمعة</button>
      <button class="ctrl-btn action" id="lt_conduct"  onclick="window._setTest('conduct')">⚡ اختبار التوصيل</button>
      <button class="ctrl-btn action" id="lt_malleable" onclick="window._setTest('malleable')">🔨 اختبار الطرق</button>
      <button class="ctrl-btn action" id="lt_magnetic" onclick="window._setTest('magnetic')">🧲 اختبار المغناطيسية</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🔩 الفلزّ المُختبَر</div>
      <span id="metallab-btns-ph"></span>
    </div>
    <div id="lab-result" class="info-box">اختر تجربة وفلزاً</div>
  `);
  buildBtns('metallab-btns-ph', METALS_DATA, 'window._labMetal', null);

  window._setTest = (t) => { simState.test = t; simState.t = 0; _updateLabResult(); };
  window._labMetal = (i) => { simState.metalIdx = i; simState.t = 0; _updateLabResult(); };

  window._updateLabResult = () => {
    const m = METALS_DATA[simState.metalIdx];
    const t = simState.test;
    const ok = m[t];
    const msgs = {
      shiny:    ['\u2705 ' + m.name + ' \u0644\u0627\u0645\u0639 \u2014 \u0633\u0637\u062d\u0647 \u064a\u0639\u0643\u0633 \u0627\u0644\u0636\u0648\u0621 \u0628\u0639\u062f \u0627\u0644\u062a\u0644\u0645\u064a\u0639', '\u274c \u0647\u0630\u0627 \u0627\u0644\u0645\u0639\u062f\u0646 \u0644\u0627 \u064a\u064f\u0639\u062f\u0651 \u0645\u0646 \u0627\u0644\u0641\u0644\u0632\u0651\u0627\u062a \u0627\u0644\u0644\u0627\u0645\u0639\u0629'],
      conduct:  ['\u2705 ' + m.name + ' \u0645\u0648\u0635\u0651\u0644 \u062c\u064a\u062f \u2014 \u0627\u0644\u0645\u0635\u0628\u0627\u062d \u064a\u064f\u0636\u064a\u0621!', '\u274c ' + m.name + ' \u0644\u0627 \u064a\u0648\u0635\u0651\u0644 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u062c\u064a\u062f\u0627\u064b'],
      malleable:['\u2705 ' + m.name + ' \u0642\u0627\u0628\u0644 \u0644\u0644\u0637\u0631\u0642 \u2014 \u064a\u062a\u0634\u0643\u0651\u0644 \u062f\u0648\u0646 \u0623\u0646 \u064a\u062a\u0643\u0633\u0651\u0631', '\u274c ' + m.name + ' \u064a\u062a\u0643\u0633\u0651\u0631 \u0639\u0646\u062f \u0627\u0644\u0637\u0631\u0642'],
      magnetic: ['\u2705 ' + m.name + ' \u0645\u063a\u0646\u0627\u0637\u064a\u0633\u064a \u2014 \u064a\u064f\u062c\u0630\u0628 \u0644\u0644\u0645\u063a\u0646\u0627\u0637\u064a\u0633 \u0628\u0642\u0648\u0629!', '\u274c ' + m.name + ' \u063a\u064a\u0631 \u0645\u063a\u0646\u0627\u0637\u064a\u0633\u064a']
    };
    const msg = (msgs[t] || ['',''])[ok ? 0 : 1];
    const color = ok ? '#27AE60' : '#C0392B';
    document.getElementById('lab-result').innerHTML = '<strong style="color:' + color + '">' + msg + '</strong>';
  };

  function draw() {
    const c = ctx(), w = W(), h = H();
    c.clearRect(0,0,w,h);
    c.fillStyle = '#F5F2EC'; c.fillRect(0,0,w,h);
    // Lab bench background
    c.fillStyle = '#E8E0D0'; c.fillRect(0, h*0.72, w, h*0.28);
    c.fillStyle = '#D8CEC0'; c.fillRect(0, h*0.72, w, 4);
    simState.t++;
    const tt = simState.t;
    const m = METALS_DATA[simState.metalIdx];
    const cx = w/2, cy = h*0.42;

    const TITLES = { shiny:'اختبار اللمعة ✨', conduct:'اختبار التوصيل الكهربائي ⚡', malleable:'اختبار الطرق 🔨', magnetic:'اختبار المغناطيسية 🧲' };
    c.fillStyle = '#1E2D3D'; c.font = `bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign = 'center'; c.fillText(TITLES[simState.test], w/2, 32);
    c.fillStyle = '#5A6A7A'; c.font = `bold ${Math.min(13,w*0.03)}px Tajawal`;
    c.fillText(`الفلزّ: ${m.icon} ${m.name}`, w/2, 54);

    if (simState.test === 'shiny') {
      // Metal block
      const shine = (Math.sin(tt*0.035)+1)/2;
      const grad = c.createRadialGradient(cx-30,cy-20,10, cx,cy,70);
      grad.addColorStop(0,'rgba(255,255,255,0.9)');
      grad.addColorStop(0.3, m.shine); grad.addColorStop(1, m.color);
      c.fillStyle = grad;
      c.beginPath(); c.roundRect(cx-65, cy-40, 130, 80, 10); c.fill();
      c.strokeStyle = m.color+'AA'; c.lineWidth = 2; c.stroke();
      // Shine rays
      for(let i=0;i<10;i++){
        const a=(i/10)*Math.PI*2+tt*0.015;
        const r1=80, r2=105+shine*25;
        c.strokeStyle = `rgba(255,215,80,${shine*0.55})`;
        c.lineWidth = 1.5+shine; c.beginPath();
        c.moveTo(cx+Math.cos(a)*r1, cy+Math.sin(a)*r1*0.6);
        c.lineTo(cx+Math.cos(a)*r2, cy+Math.sin(a)*r2*0.6); c.stroke();
      }
      c.fillStyle = '#B07800'; c.font = `bold ${Math.min(14,w*0.032)}px Tajawal`;
      c.textAlign='center'; c.fillText('سطح لامع — يعكس الضوء', cx, cy+75);

    } else if (simState.test === 'conduct') {
      // Full circuit: battery—wire—metal—wire—bulb—wire back
      const s = Math.min(w*0.85, 340); const lx = cx-s/2, rx = cx+s/2; const by2 = cy;
      // Battery left
      c.fillStyle='#4A7A3A'; c.beginPath(); c.roundRect(lx, by2-22, 34, 44, 5); c.fill();
      c.fillStyle='#6A9A5A'; c.fillRect(lx+34, by2-14, 9, 28);
      c.fillStyle='white'; c.font='bold 16px Arial'; c.textAlign='center';
      c.fillText('+', lx+17, by2+5); c.fillText('−', lx+38, by2+5);
      // Wire segments (animated electron flow)
      const wireSegs = [[lx+43, by2, cx-55, by2],[cx+55, by2, rx-30, by2]];
      wireSegs.forEach(([x1,y1,x2,y2])=>{
        c.strokeStyle='#5080C0'; c.lineWidth=4;
        c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke();
        // Electrons
        const len=Math.hypot(x2-x1,y2-y1);
        for(let e=0;e<3;e++){
          const prog=((tt*1.8+e*33)%len)/len;
          const ex=x1+(x2-x1)*prog, ey=y1+(y2-y1)*prog;
          c.beginPath(); c.arc(ex,ey,4,0,Math.PI*2);
          c.fillStyle='#FFD040'; c.fill();
        }
      });
      // Metal piece centre
      const mg = c.createLinearGradient(cx-50, by2-18, cx+50, by2+18);
      mg.addColorStop(0, m.shine); mg.addColorStop(1, m.color);
      c.fillStyle=mg; c.beginPath(); c.roundRect(cx-50,by2-18,100,36,7); c.fill();
      c.fillStyle='rgba(255,255,255,0.6)'; c.font=`bold ${Math.min(12,w*0.028)}px Tajawal`;
      c.textAlign='center'; c.fillText(m.sym, cx, by2+5);
      // Bulb right
      const bx2=rx-15;
      c.strokeStyle='#8A8A6A'; c.lineWidth=4;
      c.beginPath(); c.moveTo(rx-30, by2); c.lineTo(bx2-25, by2); c.stroke();
      const bulbOn = m.conduct;
      c.beginPath(); c.arc(bx2, by2, 22, 0, Math.PI*2);
      c.fillStyle = bulbOn ? `rgba(255,230,60,${0.7+Math.sin(tt*0.08)*0.3})` : '#E8E0C0';
      if(bulbOn){ c.shadowColor='rgba(255,200,0,0.6)'; c.shadowBlur=25; }
      c.fill(); c.shadowBlur=0;
      c.strokeStyle='#9A8A40'; c.lineWidth=2; c.stroke();
      c.font=`${Math.min(12,w*0.028)}px Arial`; c.fillStyle=bulbOn?'#5A4000':'#888';
      c.fillText(bulbOn?'💡':'○', bx2, by2+5);
      // Result text
      c.fillStyle = bulbOn ? '#1E7A40':'#8B2020';
      c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText(bulbOn ? m.name + ' يوصّل — المصباح يُضيء ✅' : m.name + ' لا يوصّل جيداً ❌', cx, cy+72);

    } else if (simState.test === 'malleable') {
      const phase = (tt % 80) / 80;
      const hammerY = cy - 70 + Math.abs(Math.sin(phase*Math.PI)) * 55;
      const flatten = Math.min(18, tt * 0.08);
      // Metal block (gets flatter)
      const mGrad = c.createLinearGradient(cx-55, cy, cx+55, cy+40);
      mGrad.addColorStop(0, m.shine); mGrad.addColorStop(1, m.color);
      c.fillStyle = mGrad;
      c.beginPath(); c.roundRect(cx-55, cy+5, 110, 42-flatten*0.4, 6); c.fill();
      c.strokeStyle = m.color; c.lineWidth = 1.5; c.stroke();
      // Hammer handle
      c.fillStyle = '#8A6A3A';
      c.beginPath(); c.roundRect(cx-5, hammerY-65, 10, 60, 3); c.fill();
      // Hammer head
      c.fillStyle='#5A5A6A';
      c.beginPath(); c.roundRect(cx-22, hammerY-30, 44, 28, 5); c.fill();
      c.fillStyle='#7A7A8A'; c.fillRect(cx-18, hammerY-29, 36, 6);
      // Impact sparks
      if (hammerY > cy + 5) {
        for(let i=0;i<6;i++){
          const a = (i/6)*Math.PI;
          c.strokeStyle=`rgba(255,${160+i*12},40,0.8)`;
          c.lineWidth=1.5; c.beginPath();
          c.moveTo(cx,cy+8);
          c.lineTo(cx+Math.cos(a)*22,cy+8-Math.sin(a)*18); c.stroke();
        }
      }
      c.fillStyle='#1E7A40'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`;
      c.textAlign='center'; c.fillText(`${m.name} قابل للطرق 🔨 — يتشكّل ولا يتكسّر`, cx, cy+80);

    } else if (simState.test === 'magnetic') {
      const isMag = m.magnetic;
      const pull = isMag ? (Math.sin(tt*0.04)+1)*0.5 : 0;
      const magCX = cx - 70;
      // Horseshoe magnet
      c.strokeStyle='transparent';
      c.fillStyle='#C0392B'; c.beginPath(); c.roundRect(magCX-25, cy-50, 20, 70, 5); c.fill();
      c.fillStyle='#2980B9'; c.beginPath(); c.roundRect(magCX+5, cy-50, 20, 70, 5); c.fill();
      c.fillStyle='#888'; c.beginPath(); c.roundRect(magCX-25, cy-55, 50, 15, 4); c.fill();
      c.fillStyle='white'; c.font='bold 16px Arial'; c.textAlign='center';
      c.fillText('N', magCX-15, cy+12); c.fillText('S', magCX+15, cy+12);
      // Metal object
      const metX = cx + 40 + (isMag ? -pull*35 : 0);
      const mG2 = c.createLinearGradient(metX-18, cy-20, metX+18, cy+20);
      mG2.addColorStop(0, m.shine); mG2.addColorStop(1, m.color);
      c.fillStyle = mG2; c.beginPath(); c.roundRect(metX-18,cy-20,36,40,6); c.fill();
      c.fillStyle='rgba(255,255,255,0.5)'; c.font=`bold 14px Tajawal`; c.textAlign='center';
      c.fillText(m.sym, metX, cy+4);
      // Field lines if magnetic
      if(isMag){
        for(let i=0;i<5;i++){
          const yOff = (i-2)*15;
          c.strokeStyle = `rgba(180,80,200,${0.15+pull*0.35})`;
          c.lineWidth = 1.2; c.setLineDash([4,4]);
          c.beginPath(); c.moveTo(magCX+5, cy+yOff); c.lineTo(metX-18, cy+yOff); c.stroke();
          c.setLineDash([]);
        }
      }
      c.fillStyle = isMag ? '#8A2EA8' : '#888888';
      c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText(isMag ? m.name + ' مغناطيسي — يُجذب! 🧲' : m.name + ' غير مغناطيسي ❌', cx, cy+80);
    }

    // Bottom desc strip
    const DESCS = {
      shiny: 'الفلزّات عادةً لامعة لأنها تعكس الضوء — هذا يساعد في تمييز الفلزّ من اللافلزّ',
      conduct: 'الفلزّات موصّلات ممتازة — الإلكترونات الحرة فيها تنقل الشحنة بسهولة',
      malleable: 'طبقات ذرات الفلزّ تنزلق فوق بعضها عند الطرق — لذا لا تتكسّر بل تتشكّل',
      magnetic: 'الحديد والنيكل والكوبالت فقط مغناطيسية — معظم الفلزّات الأخرى غير مغناطيسية'
    };
    c.fillStyle='rgba(26,143,168,0.07)'; c.strokeStyle='rgba(26,143,168,0.15)'; c.lineWidth=1;
    c.beginPath(); c.roundRect(10, h-58, w-20, 46, 8); c.fill(); c.stroke();
    c.fillStyle='#3A5A6A'; c.font=`${Math.min(11.5,w*0.027)}px Tajawal`; c.textAlign='center';
    c.fillText(DESCS[simState.test], w/2, h-34, w-30);

    animFrame = requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-2 TAB 1: NON-METALS — خصائص اللافلزّات =====
function simNonMetals() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  simState = { selected: null, t: 0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔍 اختر لافلزاً</div>
      <span id="nm-btns-ph"></span>
    </div>
    <div id="nm-info" class="info-box">اضغط على أي لافلزّ لتعرّف على خصائصه</div>
    <div class="q-box">
      <strong>❓ أسئلة الكتاب (ص٣٩):</strong><br>
      ١- اذكر خمسة عناصر من اللافلزّات غير الكبريت والهيليوم.<br>
      ٢- فيم يُستخدم الكبريت؟<br>
      ٣- ما الخاصية التي تميّز الهيليوم وتجعله مفيداً في البالونات؟
    
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الأكسجين، الكربون، الكلور، الفوسفور، النيتروجين (أو السيليكون).<br>٢- يُستخدم في تنقية الماء وصناعة المطاط الصلب.<br>٣- خفيف جداً — أخفّ من الهواء، لذا يرفع البالونات.</div>
  </div>
  `);
  buildBtns('nm-btns-ph', NM_DATA, 'window._selNM', 'nmb');

  window._selNM = (i) => {
    simState.selected = i;
    NM_DATA.forEach((_,j)=>{ const b=document.getElementById('nmb'+j); if(b) b.style.borderColor=j===i?'#1A8FA8':''; });
    const m = NM_DATA[i];
    document.getElementById('nm-info').innerHTML = `
      <strong style="color:#1A8FA8;font-size:16px;display:block;margin-bottom:7px">${m.icon} ${m.name} (${m.sym})</strong>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:15px">
        <span>الحالة</span><span><strong>${m.state}</strong></span>
        <span>✨ لامع</span><span>${m.shiny?'✅':'❌'}</span>
        <span>⚡ موصّل</span><span>${m.conduct?'✅':'❌ (معظم اللافلزّات)'}</span>
        <span>💥 هش</span><span>${m.brittle===false?(m.state==='غاز'?'— غاز':'❌'):'✅ نعم'}</span>
      </div>
      <div style="margin-top:8px;padding:7px;background:rgba(26,122,152,0.07);border-radius:6px;font-size:15px">
        📌 الاستخدام: ${m.use}<br>💡 ${m.fact}
      </div>`;
  };

  const cv = document.getElementById('simCanvas');
  cv.onclick = (e) => {
    const r=cv.getBoundingClientRect(); const mx=e.clientX-r.left, my=e.clientY-r.top;
    const w=cv.width, cols=Math.min(4, Math.floor(w/105));
    const bW=Math.min(96,(w-36)/cols), bH=bW*1.18, startX=(w-cols*(bW+10))/2;
    NM_DATA.forEach((_,i)=>{
      const col=i%cols, row=Math.floor(i/cols);
      const x=startX+col*(bW+10), y=50+row*(bH+10);
      if(mx>=x&&mx<=x+bW&&my>=y&&my<=y+bH) window._selNM(i);
    });
  };

  function draw() {
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h);
    c.fillStyle='#F5F2EC'; c.fillRect(0,0,w,h);
    simState.t++;
    const tt=simState.t;

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('اللافلزّات Non-Metals', w/2, 34);

    const cols=Math.min(4, Math.floor(w/160));
    const gap=16;
    const bW=Math.min(Math.floor((w-36-gap*(cols-1))/cols), 170);
    const bH=bW*1.18;
    const startX=(w-(cols*(bW+gap)-gap))/2;

    NM_DATA.forEach((m,i)=>{
      const col=i%cols, row=Math.floor(i/cols);
      const x=startX+col*(bW+gap), y=54+row*(bH+gap);
      const sel=simState.selected===i;

      c.shadowColor=sel?'rgba(26,143,168,0.25)':'rgba(0,0,0,0.06)';
      c.shadowBlur=sel?14:4; c.shadowOffsetY=sel?3:1;
      c.fillStyle=sel?'#E4F4F8':'white';
      c.strokeStyle=sel?'#1A8FA8':'rgba(0,0,0,0.07)'; c.lineWidth=sel?2:1;
      c.beginPath(); c.roundRect(x,y,bW,bH,10); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      // Element background
      const elGrad=c.createRadialGradient(x+bW*0.4,y+bH*0.28,4, x+bW/2,y+bH*0.32, bW*0.3);
      elGrad.addColorStop(0,'rgba(255,255,255,0.7)');
      elGrad.addColorStop(1, m.color+'CC');
      c.beginPath(); c.arc(x+bW/2, y+bH*0.32, bW*0.28, 0, Math.PI*2);
      c.fillStyle=elGrad; c.fill();

      // Gas particles animation
      if(m.state==='غاز'){
        for(let p=0;p<5;p++){
          const a=(p/5)*Math.PI*2+tt*0.025*(p%2?1:-1);
          const pr=bW*0.24+Math.sin(tt*0.04+p)*bW*0.04;
          c.beginPath(); c.arc(x+bW/2+Math.cos(a)*pr, y+bH*0.32+Math.sin(a)*pr*0.7, 3, 0, Math.PI*2);
          c.fillStyle=m.color+'99'; c.fill();
        }
      }

      // Symbol
      c.fillStyle='rgba(255,255,255,0.92)';
      c.font=`bold ${Math.min(16,bW*0.12)}px Tajawal`; c.textAlign='center';
      c.fillText(m.sym, x+bW/2, y+bH*0.35);

      // State badge
      const stateColors={غاز:'#4A9AE0', صلب:'#7A5A3A'};
      c.fillStyle=stateColors[m.state]||'#888'; c.font=`${Math.min(13,bW*0.09)}px Tajawal`;
      c.fillText(m.state, x+bW/2, y+bH*0.47);

      // Name
      c.fillStyle=sel?'#1A6A80':'#2C3A4A';
      c.font=`bold ${Math.min(16,bW*0.12)}px Tajawal`;
      c.fillText(m.name, x+bW/2, y+bH*0.63);

      // Icon
      c.font=`${Math.min(26,bW*0.18)}px Arial`;
      c.fillText(m.icon, x+bW/2, y+bH*0.84);

      if(sel){
        c.fillStyle='#1A8FA8'; c.font=`bold ${Math.min(7.5,bW*0.09)}px Tajawal`;
        c.fillText(m.brittle===false&&m.state==='غاز'?'غاز':m.brittle?'هش':'مرن', x+bW/2, y+bH*0.95);
      }
    });
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-2 TAB 2: NON-METAL RESEARCH =====
function simNonMetalResearch() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  simState = { selected: null, t: 0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📋 اختر لافلزاً للبحث التفصيلي</div>
      <span id="nmr-btns-ph"></span>
    </div>
    <div id="nmr-info" class="info-box">اختر لافلزاً لعرض بطاقته البحثية الكاملة</div>
  `);
  buildBtns('nmr-btns-ph', NM_DATA, 'window._nmR', null);

  window._nmR = (i) => {
    simState.selected = i;
    const m = NM_DATA[i];
    document.getElementById('nmr-info').innerHTML = `
      <strong style="color:#1A8FA8;font-size:16px;display:block;margin-bottom:8px">${m.icon} ${m.name} (${m.sym})</strong>
      <table style="width:100%;font-size:15px;border-collapse:collapse">
        <tr style="background:rgba(26,143,168,0.07)"><td style="padding:4px 6px;font-weight:700">الحالة</td><td style="padding:4px 6px">${m.state}</td></tr>
        <tr><td style="padding:4px 6px;font-weight:700">الاستخدامات</td><td style="padding:4px 6px">${m.use}</td></tr>
        <tr style="background:rgba(26,143,168,0.07)"><td style="padding:4px 6px;font-weight:700">لامع</td><td style="padding:4px 6px">${m.shiny?'✅':'❌'}</td></tr>
        <tr><td style="padding:4px 6px;font-weight:700">موصّل للكهرباء</td><td style="padding:4px 6px">${m.conduct?'✅':'❌ لا يوصّل'}</td></tr>
        <tr style="background:rgba(26,143,168,0.07)"><td style="padding:4px 6px;font-weight:700">هش</td><td style="padding:4px 6px">${m.brittle===false?'— (غاز)':'✅ نعم'}</td></tr>
      </table>
      <div style="margin-top:8px;padding:8px;background:rgba(212,144,26,0.08);border-radius:6px;font-size:15px;color:#7A5010">💡 ${m.fact}</div>`;
  };

  function draw() {
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h);
    simState.t++;
    // Animated background — element symbols floating
    c.fillStyle='#F5F2EC'; c.fillRect(0,0,w,h);
    NM_DATA.forEach((m,i)=>{
      const x = w*0.08 + (i*w*0.12)%(w*0.88);
      const y = h*0.2 + Math.sin(simState.t*0.012+i*1.1)*h*0.12 + i*h*0.09;
      c.fillStyle=m.color+'15'; c.font=`bold ${Math.min(18,w*0.04)}px Tajawal`;
      c.textAlign='center'; c.fillText(m.sym, x, y);
    });
    if(simState.selected===null){
      c.fillStyle='#2C3A4A'; c.font=`bold ${Math.min(17,w*0.038)}px Tajawal`;
      c.textAlign='center'; c.fillText('نشاط 2-8: بحث حول اللافلزّات', w/2, h/2-16);
      c.fillStyle='#7A8A98'; c.font=`${Math.min(13,w*0.03)}px Tajawal`;
      c.fillText('اختر لافلزاً من اللوحة لعرض بطاقته البحثية', w/2, h/2+16);
    } else {
      const m=NM_DATA[simState.selected];
      c.fillStyle=m.color+'33';
      c.beginPath(); c.arc(w/2, h/2, Math.min(w,h)*0.25, 0, Math.PI*2); c.fill();
      c.fillStyle=m.color+'88'; c.font=`${Math.min(60,h*0.18)}px Arial`;
      c.textAlign='center'; c.fillText(m.icon, w/2, h/2+20);
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(18,w*0.04)}px Tajawal`;
      c.fillText(m.name, w/2, h/2-50);
      c.fillStyle='#1A8FA8'; c.font=`bold ${Math.min(14,w*0.032)}px Tajawal`;
      c.fillText(m.sym+' — '+m.state, w/2, h/2-28);
    }
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-3 TAB 1: COMPARISON TABLE =====
function simMetalCompare() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  simState = { highlight: -1, t: 0 };

  const ROWS = [
    { prop:'اللمعة ✨',      metal:'✅ لامعة',        nonmetal:'❌ غير لامعة',      mOk:true,  nmOk:false },
    { prop:'الحالة الصلبة',  metal:'✅ صلبة (معظمها)',nonmetal:'⚡ متنوعة',          mOk:true,  nmOk:null },
    { prop:'التوصيل الكهربائي ⚡',metal:'✅ موصّلة',  nonmetal:'❌ معظمها عازلة',   mOk:true,  nmOk:false },
    { prop:'الهشاشة 💥',     metal:'❌ لا تتكسّر',   nonmetal:'✅ هشّة (الصلبة)',   mOk:false, nmOk:true  },
    { prop:'قابلية الطرق 🔨', metal:'✅ قابلة',       nonmetal:'❌ غير قابلة',       mOk:true,  nmOk:false },
    { prop:'التوصيل الحراري 🌡️',metal:'✅ موصّلة',   nonmetal:'❌ معظمها عازلة',   mOk:true,  nmOk:false },
    { prop:'الرنين عند الطرق 🔔',metal:'✅ تُصدر رنيناً',nonmetal:'❌ لا',          mOk:true,  nmOk:false },
    { prop:'نقطة الانصهار 🌡️',metal:'⬆️ عالية عموماً',nonmetal:'⬇️ منخفضة عموماً',mOk:null, nmOk:null },
  ];
  const HL_MAP = { shiny:0, state:1, conduct:2, brittle:3, malleable:4, thermal:5, ring:6, melt:7 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🔦 اضغط لتمييز خاصية</div>
      <button class="ctrl-btn action" onclick="window._hl(0)">✨ اللمعة</button>
      <button class="ctrl-btn action" onclick="window._hl(2)">⚡ التوصيل</button>
      <button class="ctrl-btn action" onclick="window._hl(3)">💥 الهشاشة</button>
      <button class="ctrl-btn action" onclick="window._hl(4)">🔨 الطرق</button>
      <button class="ctrl-btn reset"  onclick="window._hl(-1)">↺ الكل</button>
    </div>
    <div class="q-box">
      <strong>❓ أسئلة الكتاب (ص٤٠-٤١):</strong><br>
      ١- اذكر خمسة أشياء فلزّية وخمسة لافلزّية من الصورة.<br>
      ٢- مادة غير لامعة وهشة وغير موصِّلة — من أيٍّ هي؟<br>
      ٣- الزئبق فلزّ غير مألوف. لماذا؟
    
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- الفلزيّة: لامعة، موصِّلة، غير هشّة. اللافلزيّة: غير لامعة، هشّة، عازلة.<br>٢- من اللافلزيّات (غير لامعة وهشّة وعازلة).<br>٣- لأنه سائل في درجة حرارة الغرفة على عكس بقية الفلزّات.</div>
  </div>
  `);
  window._hl = (r) => { simState.highlight = r; };

  const cv = document.getElementById('simCanvas');
  cv.onclick = (e) => {
    const rect = cv.getBoundingClientRect();
    const my = e.clientY - rect.top;
    const h = cv.height, w = cv.width;
    const tW = Math.min(w-24, 560), tX = (w-tW)/2;
    const rH = Math.min(36, (h-56)/(ROWS.length+1));
    for(let i=0; i<ROWS.length; i++){
      const ry = 44 + rH + i*rH;
      if(my >= ry && my <= ry+rH){ window._hl(simState.highlight===i ? -1 : i); return; }
    }
  };

  function draw() {
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h); c.fillStyle='#F5F2EC'; c.fillRect(0,0,w,h);
    simState.t++;

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('مقارنة الفلزّات ⚙️ واللافلزّات 🫧', w/2, 30);

    const tW=Math.min(w-24, w*0.95), tX=(w-tW)/2;
    const c1=tW*0.40, c2=tW*0.30, c3=tW*0.30;
    const rH=Math.min(Math.round(h*0.1), Math.floor((h-56)/(ROWS.length+1)));

    // Header
    c.fillStyle='#1A8FA8';
    c.beginPath(); c.roundRect(tX,44,tW,rH,[8,8,0,0]); c.fill();
    c.fillStyle='white'; c.font=`bold ${Math.min(15,w*0.030)}px Tajawal`; c.textAlign='center';
    c.fillText('الخاصية', tX+c1/2, 44+rH/2+5);
    c.fillText('الفلزّات ⚙️', tX+c1+c2/2, 44+rH/2+5);
    c.fillText('اللافلزّات 🫧', tX+c1+c2+c3/2, 44+rH/2+5);

    ROWS.forEach((row, i) => {
      const ry=44+rH+i*rH;
      const isHL = i===simState.highlight;
      // Row BG
      if(isHL){
        c.fillStyle='rgba(26,143,168,0.13)';
        c.strokeStyle='rgba(26,143,168,0.35)'; c.lineWidth=1.5;
      } else {
        c.fillStyle = i%2===0?'white':'#FAFAF8';
        c.strokeStyle='rgba(0,0,0,0.04)'; c.lineWidth=0.5;
      }
      c.beginPath(); c.roundRect(tX,ry,tW,rH,0); c.fill(); c.stroke();

      // Property col
      c.fillStyle=isHL?'#0A5A70':'#2C3A4A';
      c.font=`${isHL?'bold ':''}${Math.min(14,w*0.028)}px Tajawal`;
      c.textAlign='right'; c.fillText(row.prop, tX+c1-10, ry+rH/2+5);

      // Metal col
      c.textAlign='center';
      if(row.mOk===true) c.fillStyle='#1E7A40';
      else if(row.mOk===false) c.fillStyle='#8B2020';
      else c.fillStyle='#7A5010';
      c.font=`${Math.min(14,w*0.028)}px Tajawal`;
      c.fillText(row.metal, tX+c1+c2/2, ry+rH/2+5);

      // Non-metal col
      if(row.nmOk===true) c.fillStyle='#1E7A40';
      else if(row.nmOk===false) c.fillStyle='#8B2020';
      else c.fillStyle='#7A5010';
      c.fillText(row.nonmetal, tX+c1+c2+c3/2, ry+rH/2+5);
    });

    // Bottom highlight glow bar
    if(simState.highlight>=0){
      const row=ROWS[simState.highlight];
      const by2=h-55;
      c.fillStyle='rgba(26,143,168,0.08)'; c.strokeStyle='rgba(26,143,168,0.2)'; c.lineWidth=1;
      c.beginPath(); c.roundRect(12,by2,w-24,44,8); c.fill(); c.stroke();
      c.fillStyle='#0A5A70'; c.font=`bold ${Math.min(13,w*0.03)}px Tajawal`; c.textAlign='center';
      c.fillText(`الخاصية المُميَّزة: ${row.prop}`, w/2, by2+16);
      c.fillStyle='#1E7A40'; c.font=`${Math.min(11,w*0.026)}px Tajawal`;
      c.fillText(`فلزّات: ${row.metal}  |  لافلزّات: ${row.nonmetal}`, w/2, by2+34);
    }
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-3 TAB 2: MATERIAL IDENTIFICATION LAB =====
function simMaterialTest() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  const ITEMS = [
    { name:'مسمار حديد',   type:'metal',    color:'#7A8090', shine:'#B8C0CC', icon:'🔩', tests:{shiny:true, conduct:true, brittle:false, magnetic:true} },
    { name:'قطعة كبريت',   type:'nonmetal', color:'#C8B818', shine:'#E8D840', icon:'🟡', tests:{shiny:false,conduct:false,brittle:true, magnetic:false} },
    { name:'سلك نحاسي',    type:'metal',    color:'#B86028', shine:'#D89050', icon:'🔌', tests:{shiny:true, conduct:true, brittle:false, magnetic:false} },
    { name:'قطعة كربون',   type:'nonmetal', color:'#3A3A4A', shine:'#6A6A7A', icon:'🪨', tests:{shiny:false,conduct:false,brittle:true, magnetic:false} },
    { name:'شريط ألومنيوم',type:'metal',    color:'#9AA8B8', shine:'#D0DCE8', icon:'✈️', tests:{shiny:true, conduct:true, brittle:false, magnetic:false} },
    { name:'قطعة زجاج',    type:'nonmetal', color:'#A8D0E0', shine:'#C8EEF8', icon:'🪟', tests:{shiny:false,conduct:false,brittle:true, magnetic:false} },
  ];
  simState = { sel: null, test: null, revealed: {}, t:0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">📦 اختر المادة</div>
      <span id="items-btns-ph"></span>
    </div>
    <div class="ctrl-section" id="test-btns" style="display:none">
      <div class="ctrl-label">🔬 اختر الاختبار</div>
      <button class="ctrl-btn action" onclick="window._doTest('shiny')">✨ اللمعة</button>
      <button class="ctrl-btn action" onclick="window._doTest('conduct')">⚡ التوصيل</button>
      <button class="ctrl-btn action" onclick="window._doTest('brittle')">💥 الهشاشة</button>
      <button class="ctrl-btn action" onclick="window._doTest('magnetic')">🧲 المغناطيسية</button>
    </div>
    <div id="mt-result" class="info-box">اختر مادة للبدء</div>
  `);
  buildBtns('items-btns-ph', ITEMS, 'window._pickItem', 'mti');

  window._pickItem = (i) => {
    simState.sel = i; simState.revealed = {};
    ITEMS.forEach((_,j)=>{ const b=document.getElementById('mti'+j); if(b) b.style.borderColor=j===i?'#1A8FA8':''; });
    document.getElementById('test-btns').style.display='';
    document.getElementById('mt-result').innerHTML = `<strong style="color:#1A8FA8">${ITEMS[i].icon} ${ITEMS[i].name}</strong><br>اختر اختباراً لتحديد ما إذا كانت فلزاً أم لافلزاً`;
  };
  window._doTest = (test) => {
    if(simState.sel===null) return;
    const m=ITEMS[simState.sel]; simState.test=test; simState.revealed[test]=true;
    const labels={shiny:'اللمعة ✨', conduct:'التوصيل ⚡', brittle:'الهشاشة 💥', magnetic:'المغناطيسية 🧲'};
    const res=m.tests[test];
    let msg=`<strong style="color:${res?'#27AE60':'#C0392B'}">${labels[test]}: ${res?'✅ نعم':'❌ لا'}</strong>`;
    const done=Object.keys(simState.revealed).length;
    if(done>=3){
      const isM=m.type==='metal';
      msg+=`<br><br><strong style="color:#1A8FA8;font-size:16px">🏷️ النتيجة: ${m.icon} ${m.name} هو <em>${isM?'فلزّ ⚙️':'لافلزّ 🫧'}</em></strong>`;
    } else {
      msg+=`<br><em style="font-size:15px;color:#888">أجرِ ${3-done} اختبارات أخرى للتأكد من التصنيف</em>`;
    }
    document.getElementById('mt-result').innerHTML=msg;
  };

  function draw(){
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h); c.fillStyle='#F5F2EC'; c.fillRect(0,0,w,h);
    // Lab bench
    c.fillStyle='#E0D8C8'; c.fillRect(0,h*0.68,w,h*0.32);
    c.fillStyle='#D0C8B0'; c.fillRect(0,h*0.68,w,5);
    simState.t++;
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('مختبر تصنيف المواد 🔬', w/2, 32);

    if(simState.sel===null){
      c.fillStyle='#9AA8B5'; c.font=`${Math.min(13,w*0.03)}px Tajawal`;
      c.fillText('اختر مادة من اللوحة لاختبارها', w/2, h/2);
    } else {
      const m=ITEMS[simState.sel];
      const cx=w/2, cy=h*0.4;
      // Object
      const mg=c.createRadialGradient(cx-15,cy-15,5,cx,cy,40);
      mg.addColorStop(0,m.shine); mg.addColorStop(1,m.color);
      c.fillStyle=mg; c.beginPath(); c.roundRect(cx-42,cy-30,84,60,8); c.fill();
      c.fillStyle='rgba(255,255,255,0.4)'; c.font=`${Math.min(20,w*0.045)}px Arial`;
      c.textAlign='center'; c.fillText(m.icon,cx,cy+9);
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(12,w*0.028)}px Tajawal`;
      c.fillText(m.name, cx, cy+55);

      // Test result badges
      const tests=['shiny','conduct','brittle','magnetic'];
      const tlbls=['✨','⚡','💥','🧲'];
      tests.forEach((t,i)=>{
        if(!simState.revealed[t]) return;
        const bx=cx-90+i*46, by=cy+68;
        const ok=m.tests[t];
        c.fillStyle=ok?'rgba(39,174,96,0.15)':'rgba(192,57,43,0.1)';
        c.strokeStyle=ok?'#27AE60':'#C0392B'; c.lineWidth=1.5;
        c.beginPath(); c.roundRect(bx,by,42,32,6); c.fill(); c.stroke();
        c.fillStyle=ok?'#1E7A40':'#8B2020';
        c.font=`bold ${Math.min(10,w*0.025)}px Tajawal`; c.textAlign='center';
        c.fillText(tlbls[i]+(ok?'✅':'❌'), bx+21, by+20);
      });
    }
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-4 TAB 1: DAILY MATERIALS =====
function simMaterials() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  const MATS = [
    { name:'الزجاج', en:'Glass', color:'#A0CCE0', shine:'#D0EEF8', icon:'🪟',
      props:['شفاف ✨','مقاوم للماء 💧','صلب لكنه هش 💥','قابل لإعادة التدوير ♻️'],
      uses:'النوافذ · قناني الشرب · الأدوات العلمية · مرايا السيارات',
      pros:'شفاف · لا يتفاعل مع الطعام · يمكن تدويره', cons:'ثقيل · يتكسّر بسهولة',
      fact:'الزجاج مصنوع أساساً من رمل السيليكا SiO₂' },
    { name:'البلاستيك', en:'Plastic', color:'#D890C0', shine:'#F0B8E0', icon:'🧴',
      props:['خفيف الوزن 🪶','مرن أو صلب 🔄','ألوان متنوعة 🎨','قابل للتشكيل ✨'],
      uses:'أواني الطعام · الألعاب · التغليف · الأنابيب',
      pros:'خفيف · رخيص · متنوع الأشكال', cons:'يدوم طويلاً في البيئة — مشكلة للنفايات',
      fact:'يستغرق البلاستيك قرابة 450 سنة ليتحلل!' },
    { name:'الخزفيات', en:'Ceramics', color:'#D4A870', shine:'#F0C890', icon:'🏺',
      props:['صلبة وهشّة 💥','تتحمّل حرارة عالية 🌡️','عازلة للكهرباء ⚡','غير تفاعلية كيميائياً'],
      uses:'الأرضيات والجدران · أواني الطهي · هيكل مكوك الفضاء',
      pros:'تتحمل الحرارة الشديدة · لا تصدأ', cons:'هشّة جداً عند الصدمات',
      fact:'الخزفيات تُستخدم في درع الحرارة لمركبات الفضاء!' },
    { name:'الألياف', en:'Fibres', color:'#90C890', shine:'#B8E8B8', icon:'🧶',
      props:['طبيعية أو صناعية 🌱','مرنة وخيطية','قوية نسبياً لوزنها','نسيج سهل التشكيل'],
      uses:'الملابس القطنية والحريرية · حبال الطائرة الورقية · خيوط جراحية',
      pros:'مريحة · خفيفة · متنوعة', cons:'بعض الألياف الصناعية غير قابلة للتحلل',
      fact:'ألياف الكيفلار أقوى من الفولاذ بخمس مرات لنفس الوزن!' },
  ];
  simState = { selected: null, t: 0 };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🏠 اختر المادة</div>
      <span id="mats-btns-ph"></span>
    </div>
    <div id="mat-info" class="info-box">اختر مادة لتعرّف على خصائصها</div>
    <div class="q-box">
      <strong>❓ أسئلة الكتاب (ص٤٣):</strong><br>
      ١- اذكر خاصيتين مشتركتين دائماً بين الزجاج والبلاستيك.<br>
      ٢- لماذا يُفضَّل البلاستيك في ألعاب الأطفال على المعادن؟<br>
      ٣- ما الخاصية التي تجعل الزجاج مناسباً للنوافذ؟
    
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
<div class="q-ans-panel">١- كلاهما قابل للتلوين وكلاهما غير موصِّل للكهرباء.<br>٢- أخفّ وأأمن (لا يكسر) وأرخص ويمكن تشكيله بأشكال متعددة.<br>٣- الشفافية — تسمح بمرور الضوء للداخل.</div>
  </div>
  `);
  buildBtns('mats-btns-ph', MATS, 'window._selMat', 'matb');

  window._selMat = (i) => {
    simState.selected = i;
    MATS.forEach((_,j)=>{ const b=document.getElementById('matb'+j); if(b) b.style.borderColor=j===i?'#1A8FA8':''; });
    const m=MATS[i];
    document.getElementById('mat-info').innerHTML = `
      <strong style="color:#1A8FA8;font-size:16px;display:block;margin-bottom:7px">${m.icon} ${m.name} (${m.en})</strong>
      <div style="font-size:15px">
        <strong>الخصائص:</strong> ${m.props.join(' · ')}<br>
        <strong>الاستخدامات:</strong> ${m.uses}<br>
        <span style="color:#1E7A40">✅ مزايا: ${m.pros}</span><br>
        <span style="color:#8B2020">⚠️ عيوب: ${m.cons}</span>
      </div>
      <div style="margin-top:7px;padding:6px;background:rgba(212,144,26,0.08);border-radius:6px;font-size:15px;color:#7A5010">💡 ${m.fact}</div>`;
  };

  const cv=document.getElementById('simCanvas');
  cv.onclick=(e)=>{
    const r=cv.getBoundingClientRect(); const mx=e.clientX-r.left, my=e.clientY-r.top;
    const w=cv.width, cols=Math.min(4,Math.floor(w/185));
    const gap4=18;
    const bW=Math.min(Math.floor((w-36-gap4*(cols-1))/cols),200), bH=bW*1.3, sx=(w-(cols*(bW+gap4)-gap4))/2;
    MATS.forEach((_,i)=>{
      const col=i%cols, row=Math.floor(i/cols);
      const x=sx+col*(bW+gap4), y=54+row*(bH+gap4);
      if(mx>=x&&mx<=x+bW&&my>=y&&my<=y+bH) window._selMat(i);
    });
  };

  function draw(){
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h); c.fillStyle='#F5F2EC'; c.fillRect(0,0,w,h);
    simState.t++;
    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('المواد في حياتنا اليومية — اضغط للتفاصيل', w/2, 34);

    const cols=Math.min(4,Math.floor(w/185));
    const gap4=18;
    const bW=Math.min(Math.floor((w-36-gap4*(cols-1))/cols),200), bH=bW*1.3, sx=(w-(cols*(bW+gap4)-gap4))/2;

    MATS.forEach((m,i)=>{
      const col=i%cols, row=Math.floor(i/cols);
      const x=sx+col*(bW+gap4), y=54+row*(bH+gap4);
      const sel=simState.selected===i;

      c.shadowColor=sel?'rgba(26,143,168,0.28)':'rgba(0,0,0,0.07)';
      c.shadowBlur=sel?16:4; c.shadowOffsetY=sel?4:2;
      c.fillStyle=sel?'#E4F4F8':'white';
      c.strokeStyle=sel?'#1A8FA8':'rgba(0,0,0,0.07)'; c.lineWidth=sel?2:1;
      c.beginPath(); c.roundRect(x,y,bW,bH,10); c.fill(); c.stroke();
      c.shadowBlur=0; c.shadowOffsetY=0;

      // Colour swatch
      const swH=bH*0.45;
      const sg=c.createLinearGradient(x+bW*0.1,y+6,x+bW*0.9,y+swH);
      sg.addColorStop(0,m.shine); sg.addColorStop(1,m.color);
      c.fillStyle=sg; c.beginPath(); c.roundRect(x+bW*0.08,y+6,bW*0.84,swH,6); c.fill();

      // Icon large
      c.font=`${Math.min(42,bW*0.33)}px Arial`; c.textAlign='center';
      c.fillText(m.icon, x+bW/2, y+swH*0.62+12);

      // Name
      c.fillStyle=sel?'#1A6A80':'#2C3A4A';
      c.font=`bold ${Math.min(17,bW*0.12)}px Tajawal`;
      c.fillText(m.name, x+bW/2, y+swH+28);
      c.fillStyle='#9AA8B5'; c.font=`${Math.min(13,bW*0.09)}px Tajawal`;
      c.fillText(m.en, x+bW/2, y+swH+44);

      // First prop
      c.fillStyle=sel?'#1A8FA8':'#7A8A98'; c.font=`${Math.min(13,bW*0.09)}px Tajawal`;
      c.fillText(m.props[0], x+bW/2, y+bH-12);
    });
    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ===== 8-4 TAB 2: GLASS vs PLASTIC — interactive =====
function simGlassPlastic() {
  if (animFrame) { cancelAnimationFrame(animFrame); animFrame = null; }
  simState = { scene: 'both', t: 0, drop: null, dropT: 0 };

  const GP = {
    glass: {
      name:'الزجاج', color:'#A0CCE0', shine:'#D0EEF8', icon:'🪟',
      props: [
        { lbl:'شفاف تماماً 🪟',   ok:true  },
        { lbl:'مقاوم للماء 💧',   ok:true  },
        { lbl:'صلب وقوي 💪',      ok:true  },
        { lbl:'خفيف الوزن 🪶',    ok:false },
        { lbl:'مقاوم للكسر 🛡️',  ok:false },
        { lbl:'قابل للتدوير ♻️',  ok:true  },
      ]
    },
    plastic: {
      name:'البلاستيك', color:'#D890C0', shine:'#F0B8E0', icon:'🧴',
      props: [
        { lbl:'شفاف تماماً 🪟',   ok:false },
        { lbl:'مقاوم للماء 💧',   ok:true  },
        { lbl:'صلب وقوي 💪',      ok:false },
        { lbl:'خفيف الوزن 🪶',    ok:true  },
        { lbl:'مقاوم للكسر 🛡️',  ok:true  },
        { lbl:'قابل للتدوير ♻️',  ok:false },
      ]
    }
  };

  controls(`
    <div class="ctrl-section">
      <div class="ctrl-label">🖼️ وضع العرض</div>
      <button class="ctrl-btn action" onclick="window._gpScene('glass')">🪟 الزجاج فقط</button>
      <button class="ctrl-btn action" onclick="window._gpScene('plastic')">🧴 البلاستيك فقط</button>
      <button class="ctrl-btn action" onclick="window._gpScene('both')">⚖️ مقارنة جنباً لجنب</button>
    </div>
    <div class="ctrl-section">
      <div class="ctrl-label">🧪 محاكاة تجربة</div>
      <button class="ctrl-btn action" onclick="window._gpDrop('glass')">🪟💧 اسكب ماء على الزجاج</button>
      <button class="ctrl-btn action" onclick="window._gpDrop('plastic')">🧴💧 اسكب ماء على البلاستيك</button>
      <button class="ctrl-btn action" onclick="window._gpDrop('break')">💥 أسقط الزجاج</button>
    </div>
    <div class="q-box">
      <strong>💭 تساؤل:</strong> لماذا تُصنع نوافذ المنازل من الزجاج لا البلاستيك؟<br>
      <strong>💭 تساؤل:</strong> لماذا يُفضّل البلاستيك في ألعاب الأطفال؟
    <button class="q-ans-btn" onclick="toggleAnswer(this)">💡 أظهر الإجابة</button>
    <div class="q-ans-panel">النوافذ: الزجاج شفاف تماماً ومقاوم للخدش وأكثر صموداً مع الوقت.<br>الألعاب: البلاستيك خفيف وآمن (لا يتكسّر بحواف حادة) وأرخص ويمكن تلوينه بأشكال متنوعة.</div>
    </div>
  `);

  window._gpScene = (v) => { simState.scene=v; };
  window._gpDrop  = (v) => { simState.drop=v; simState.dropT=0; };

  function draw(){
    const c=ctx(), w=W(), h=H();
    c.clearRect(0,0,w,h); c.fillStyle='#F5F2EC'; c.fillRect(0,0,w,h);
    simState.t++; if(simState.dropT<120) simState.dropT++;
    const tt=simState.t, dt=simState.dropT;

    c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(16,w*0.036)}px Tajawal`;
    c.textAlign='center'; c.fillText('الزجاج 🪟  vs  البلاستيك 🧴', w/2, 30);

    const showG=simState.scene!=='plastic', showP=simState.scene!=='glass';
    const panH=h-60;

    function drawPanel(mat, px, pw){
      const m=GP[mat];
      c.fillStyle=m.color+'22'; c.strokeStyle=m.color+'88'; c.lineWidth=2;
      c.beginPath(); c.roundRect(px,45,pw,panH,12); c.fill(); c.stroke();

      // Header
      const hg=c.createLinearGradient(px,45,px,45+40);
      hg.addColorStop(0,m.color+'AA'); hg.addColorStop(1,m.color+'44');
      c.fillStyle=hg; c.beginPath(); c.roundRect(px,45,pw,40,[12,12,0,0]); c.fill();
      c.fillStyle='#1E2D3D'; c.font=`bold ${Math.min(14,pw*0.14)}px Tajawal`;
      c.textAlign='center'; c.fillText(m.icon+' '+m.name, px+pw/2, 72);

      // Illustration
      const igY=90, igR=Math.min(pw*0.22,28);
      const ig=c.createRadialGradient(px+pw/2-igR*0.3, igY+igR*0.4, igR*0.1, px+pw/2, igY+igR*0.6, igR);
      ig.addColorStop(0, m.shine); ig.addColorStop(1, m.color);
      c.fillStyle=ig; c.beginPath(); c.roundRect(px+pw/2-igR, igY, igR*2, igR*3, igR*0.3); c.fill();
      c.fillStyle='rgba(255,255,255,0.5)'; c.font=`${Math.min(18,igR*0.8)}px Arial`;
      c.textAlign='center'; c.fillText(m.icon, px+pw/2, igY+igR*1.8);

      // Props
      m.props.forEach((p,pi)=>{
        const py=180+pi*30;
        const ok=p.ok;
        c.fillStyle=ok?'rgba(39,174,96,0.1)':'rgba(192,57,43,0.07)';
        c.beginPath(); c.roundRect(px+6, py-14, pw-12, 24, 6); c.fill();
        c.fillStyle=ok?'#1E7A40':'#8B2020';
        c.font=`${Math.min(11,pw*0.11)}px Tajawal`;
        c.textAlign='right'; c.fillText((ok?'✅ ':'❌ ')+p.lbl, px+pw-10, py+2);
      });

      // Drop animation on this panel
      if(simState.drop==='glass'&&mat==='glass'||simState.drop==='plastic'&&mat==='plastic'){
        const dropProgress=dt/80;
        const dy=45+dropProgress*panH*0.5;
        c.fillStyle=`rgba(80,140,220,${0.8*(1-dropProgress)})`;
        for(let d=0;d<3;d++){
          c.beginPath(); c.ellipse(px+pw/2+(d-1)*12,dy,5,8,0,0,Math.PI*2); c.fill();
        }
        if(dt>50){ // splash
          for(let s=0;s<6;s++){
            const a=(s/6)*Math.PI*2;
            const sr=(dt-50)*1.5;
            c.strokeStyle=`rgba(80,140,220,${0.7*(1-(dt-50)/70)})`;
            c.lineWidth=1.5; c.beginPath(); c.moveTo(px+pw/2, dy+20);
            c.lineTo(px+pw/2+Math.cos(a)*sr, dy+20+Math.sin(a)*sr*0.5); c.stroke();
          }
        }
        if(dt>60){
          c.fillStyle='rgba(80,140,220,0.6)'; c.font=`bold ${Math.min(11,pw*0.11)}px Tajawal`;
          c.textAlign='center'; c.fillText('الماء يتدحرج على السطح ✅', px+pw/2, dy+40);
        }
      }
      // Break animation glass
      if(simState.drop==='break'&&mat==='glass'){
        if(dt<30){
          const by2=igY+igR*3+dt*2;
          c.fillStyle=m.color;
          c.beginPath(); c.roundRect(px+pw/2-igR, by2, igR*2, igR*3, igR*0.3); c.fill();
        } else {
          const shards=[[-1.3,0.3],[0.1,-0.6],[1.2,0.4],[-0.5,0.8],[0.7,-0.3]];
          shards.forEach((sh,si)=>{
            const prog=(dt-30)/90;
            const sx2=px+pw/2+sh[0]*(prog*35);
            const sy=igY+igR*3+(si%2?1:-0.5)*prog*40+prog*prog*40;
            c.fillStyle=m.color+'CC'; c.strokeStyle=m.color; c.lineWidth=1;
            c.beginPath(); c.moveTo(sx2,sy); c.lineTo(sx2+10,sy+15);
            c.lineTo(sx2-5,sy+20); c.closePath(); c.fill(); c.stroke();
          });
          c.fillStyle='#8B2020'; c.font=`bold ${Math.min(11,pw*0.11)}px Tajawal`;
          c.textAlign='center'; c.fillText('يتكسّر عند السقوط 💥', px+pw/2, igY+igR*3+80);
        }
      }
    }

    if(showG&&showP){ drawPanel('glass',8,w/2-12); drawPanel('plastic',w/2+4,w/2-12); }
    else if(showG){ drawPanel('glass',12,w-24); }
    else { drawPanel('plastic',12,w-24); }

    animFrame=requestAnimationFrame(()=>{try{draw()}catch(e){console.error("SIM ERR:",e)}});
  }
  draw();
}

// ══════════════════════════════════════════════════════════════════
