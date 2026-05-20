// ===== REVIEW MODE ENGINE =====
var _rv = {
  allQ: [], queue: [], idx: 0, correct: 0, wrong: 0, answered: false, grade: 7, subject: 'all'
};

var _rvG7Sims = ['forces','forcemeter','gravity','friction','airresist','variation','invertebrates',
  'vertebrates','plantclass','dichotomous','genetics','acidbase','acidinquiry','indicator',
  'phscale','neutralisation','neutralapp','salts_what','salts_metal','salts_oxide','salts_carbonate',
  'materials','metals','nonmetals','metalcompare','magnets','magfield','electromagnet','emstronger',
  'staticelec','electrons','sound_pitch','sound_vibration','sound_travel','sound_oscilloscope',
  'conservation','foodchain','foodweb','adaptation','decomposer','pollution','ozone',
  'resistance','parallel12','cellvoltage','charges','magcompare'];

var _rvG8Sims = ['blood8','circsystem','heart8','lungs8','vessels8','gasex8','respiration8','smoking8',
  'circuit8','fitness8','repro_gametes','repro_fertilisation','repro_development','repro_growth',
  'repro_lifestyle','human'];

function _rvMatchGrade(k, g) {
  if(g===5) return k.startsWith('g5');
  if(g===6) return k.startsWith('g6');
  if(g===9) return k.startsWith('g9');
  if(g===7) return _rvG7Sims.some(function(s){ return k===s || k.startsWith(s+'_'); });
  if(g===8) return _rvG8Sims.some(function(s){ return k===s || k.startsWith(s+'_'); });
  return false;
}

function _rvMatchSubject(k, subject) {
  if(subject==='all') return true;
  if(subject==='bio')  return /^g9bio/.test(k);
  if(subject==='phys') return /^g9(refl|mirror|ray|refract|tir|fiber|lens|current|voltage|ohm|power|wire|iv|energy|solar|wind|fossil|greenhouse|efficiency|energymix)/.test(k) && !/^g9bio/.test(k);
  if(subject==='chem') return k.startsWith('g9') && !/^g9bio/.test(k) && !/^g9(refl|mirror|ray|refract|tir|fiber|lens|current|voltage|ohm|power|wire|iv|energy|solar|wind|fossil|greenhouse|efficiency|energymix)/.test(k);
  return true;
}

function _rvLoadQuestions() {
  var qs = [];
  Object.keys(SIM_QUESTIONS).forEach(function(k) {
    if(!_rvMatchGrade(k, _rv.grade)) return;
    if(_rv.grade===9 && !_rvMatchSubject(k, _rv.subject)) return;
    var q = SIM_QUESTIONS[k];
    if(q && q.q && q.opts && typeof q.ans==='number') {
      qs.push({key:k, q:q.q, opts:q.opts, ans:q.ans, fb:q.fb||''});
    }
  });
  return qs;
}

function _rvShuffle(a) {
  a = a.slice();
  for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}
  return a;
}

function _rvAr(n) { return (''+n).replace(/[0-9]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[d];}); }

function openReview() {
  var grade = window._activeGrade || 7;
  _rv.grade = grade; _rv.subject = 'all';
  document.getElementById('review-overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
  var gNames = {5:'الصف الخامس',6:'الصف السادس',7:'الصف السابع',8:'الصف الثامن',9:'الصف التاسع'};
  document.getElementById('rv-subtitle').textContent = 'مراجعة أسئلة '+(gNames[grade]||'');
  var sf = document.getElementById('rv-subject-filter');
  if(grade===9){ sf.classList.add('show'); document.querySelectorAll('.rv-subject-pill').forEach(function(p){p.classList.toggle('active',p.dataset.subject==='all');}); }
  else sf.classList.remove('show');
  rvStartSession();
}

function closeReview() {
  document.getElementById('review-overlay').classList.remove('show');
  document.body.style.overflow = '';
}

function rvSetSubject(subject) {
  _rv.subject = subject;
  document.querySelectorAll('.rv-subject-pill').forEach(function(p){p.classList.toggle('active',p.dataset.subject===subject);});
  rvStartSession();
}

function rvStartSession() {
  _rv.allQ = _rvLoadQuestions();
  _rv.queue = _rvShuffle(_rv.allQ).slice(0, Math.min(20, _rv.allQ.length));
  _rv.idx=0; _rv.correct=0; _rv.wrong=0; _rv.answered=false;
  document.getElementById('rv-results').classList.remove('show');
  document.getElementById('rv-card').style.display='';
  document.getElementById('rv-stats').style.display='';
  _rvStats(); rvShowQ();
}

function _rvStats() {
  document.getElementById('rv-n-correct').textContent=_rvAr(_rv.correct);
  document.getElementById('rv-n-wrong').textContent=_rvAr(_rv.wrong);
  document.getElementById('rv-n-remain').textContent=_rvAr(Math.max(0,_rv.queue.length-_rv.idx));
  document.getElementById('rv-progress-bar').style.width=(_rv.queue.length>0?(_rv.idx/_rv.queue.length*100):0)+'%';
}

function rvShowQ() {
  if(_rv.idx>=_rv.queue.length){rvResults();return;}
  var q=_rv.queue[_rv.idx]; _rv.answered=false;
  document.getElementById('rv-q-num').textContent='السؤال '+_rvAr(_rv.idx+1)+' من '+_rvAr(_rv.queue.length);
  document.getElementById('rv-q-text').textContent=q.q;
  var opts=_rvShuffle(q.opts.map(function(o,i){return {text:o,i:i};}));
  document.getElementById('rv-opts').innerHTML=opts.map(function(o){
    return '<button class="rv-opt" onclick="rvAns('+o.i+',this)" data-idx="'+o.i+'"><span class="rv-opt-icon"></span>'+o.text+'</button>';
  }).join('');
  var fb=document.getElementById('rv-feedback');
  fb.className=''; fb.textContent=''; fb.style.display='none';
  document.getElementById('rv-next-btn').style.display='none';
}

function rvAns(chosen, btn) {
  if(_rv.answered) return;
  _rv.answered=true;
  var q=_rv.queue[_rv.idx];
  var ok=(chosen===q.ans);
  if(ok)_rv.correct++; else _rv.wrong++;
  _rv.idx++;
  document.querySelectorAll('.rv-opt').forEach(function(b){
    b.disabled=true;
    var idx=parseInt(b.dataset.idx);
    if(idx===q.ans){b.classList.add('rv-correct');b.querySelector('.rv-opt-icon').textContent='✅';}
    else if(b===btn&&!ok){b.classList.add('rv-wrong');b.querySelector('.rv-opt-icon').textContent='❌';}
  });
  if(q.fb){var fb=document.getElementById('rv-feedback');fb.textContent=q.fb;fb.className='show '+(ok?'ok':'err');fb.style.display='block';}
  _rvStats();
  var nb=document.getElementById('rv-next-btn');
  nb.style.display='block';
  nb.textContent=_rv.idx>=_rv.queue.length?'📊 النتائج →':'التالي ←';
}

function rvNext() {
  if(_rv.idx>=_rv.queue.length){rvResults();return;}
  var c=document.getElementById('rv-card');c.style.animation='none';c.offsetHeight;c.style.animation='rvCardIn 0.2s ease';
  rvShowQ();
}

function rvResults() {
  document.getElementById('rv-card').style.display='none';
  document.getElementById('rv-stats').style.display='none';
  document.getElementById('rv-progress-bar').style.width='100%';
  var t=_rv.queue.length, c=_rv.correct, pct=t>0?Math.round(c/t*100):0;
  var emoji=pct>=80?'🏆':pct>=60?'👍':pct>=40?'💪':'📚';
  var msg=pct>=80?'ممتاز! أنت مستعد للامتحان':pct>=60?'جيد! راجع الأسئلة الخاطئة':pct>=40?'استمر في المراجعة':'راجع الوحدات من جديد';
  document.getElementById('rv-score-emoji').textContent=emoji;
  document.getElementById('rv-score-num').textContent=_rvAr(c)+'/'+_rvAr(t);
  document.getElementById('rv-score-label').textContent='نسبة الإجابات الصحيحة: '+_rvAr(pct)+'%';
  document.getElementById('rv-score-msg').textContent=msg;
  document.getElementById('rv-results').classList.add('show');
}
