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
  function getXY(e){ const _s=e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e; return{x:_s.clientX,y:_s.clientY}; }
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
