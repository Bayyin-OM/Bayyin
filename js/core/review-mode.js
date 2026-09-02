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

// Sim key → semester (1 or 2), derived from each unit card's data-sem tag.
// Keys not listed here have no determined semester yet and are always included.
var _rvSimSemester = {"acidbase": 2, "acidinquiry": 2, "adaptation": 2, "airresist": 2, "blood8": 2, "cellvoltage": 2, "charges": 2, "circsystem": 2, "circuit8": 2, "conservation": 2, "decomposer": 2, "dichotomous": 2, "electromagnet": 2, "electrons": 2, "emstronger": 2, "fitness8": 2, "foodchain": 2, "foodweb": 2, "forcemeter": 2, "forces": 2, "friction": 2, "g10chem1n1": 1, "g10chem1n2": 1, "g10chem1n4": 1, "g10chem2n1": 1, "g10chem2n2": 1, "g10chem2n3": 1, "g10chem2n4": 1, "g10chem2n4_1": 1, "g5behindyou": 2, "g5bio1n1": 1, "g5bio1n2": 1, "g5bio1n3": 1, "g5bio1n4": 1, "g5bio1n5": 1, "g5earthorbit": 2, "g5earthsun": 2, "g5lightdir": 2, "g5lightintensity": 2, "g5lighttravel": 2, "g5mirror": 2, "g5rainbow": 2, "g5reflection": 2, "g5rotation": 2, "g5shadowfactor": 2, "g5shadowsize": 2, "g5stars": 2, "g5sundial": 2, "g5sunrise": 2, "g5sunseeming": 2, "g5transparent": 2, "g5water1": 1, "g5water2": 1, "g5water3": 1, "g5water4": 1, "g6airresist": 2, "g6battery": 2, "g6body1": 1, "g6body2": 1, "g6body3": 1, "g6body4": 1, "g6body5": 1, "g6body6": 1, "g6body7": 1, "g6bodyconductor": 2, "g6circuit": 2, "g6circuitchange": 2, "g6conductors": 2, "g6eco1": 1, "g6eco2": 1, "g6eco3": 1, "g6eco4": 1, "g6eco5": 1, "g6eco6": 1, "g6eco7": 1, "g6eco8": 1, "g6eco9": 1, "g6forces1": 2, "g6forces2": 2, "g6friction": 2, "g6frictionInquiry": 2, "g6gravity": 2, "g6metalconductor": 2, "g6voltage": 2, "g6waterconductor": 2, "g6wirelength": 2, "g6work": 2, "g7bio1n1": 1, "g7bio1n10": 1, "g7bio1n2": 1, "g7bio1n3": 1, "g7bio1n4": 1, "g7bio1n5": 1, "g7bio1n6": 1, "g7bio1n7": 1, "g7bio1n8": 1, "g7bio1n9": 1, "g7cell1": 1, "g7cell2": 1, "g7cell3": 1, "g7cell4": 1, "g7cell6": 1, "g7cell7": 1, "g7earth2b": 1, "g7earth2c": 1, "g7earth4": 1, "g7earth5": 1, "g7energy1": 1, "g7energy2": 1, "g7energy3": 1, "g7energy4": 1, "g7energy5": 1, "g7energy6": 1, "g7energy7": 1, "g7energy8": 1, "g7energy9": 1, "g7states2": 1, "g7states3": 1, "g7states5": 1, "g8bio1n1": 1, "g8bio1n2": 1, "g8bio1n3": 1, "g8bio1n4": 1, "g8bio1n5": 1, "g8bio1n6": 1, "g8bio3n1": 1, "g8bio3n2": 1, "g8bio3n3": 1, "g8bio3n4": 1, "g8bio3n5": 1, "g8bio3n6": 1, "g8chem2n2": 1, "g8chem2n9": 1, "g8mot6n1": 1, "g8mot6n2": 1, "g8mot6n3": 1, "g8mot6n4": 1, "g8mot6n5": 1, "g8mot6n6": 1, "g8mot6n7": 1, "g8mot6n8": 1, "g9acidprop": 2, "g9acidrain": 2, "g9aircomp": 2, "g9aniontest": 2, "g9balance": 2, "g9bio10n1": 2, "g9bio10n2": 2, "g9bio10n3": 2, "g9bio10n4": 2, "g9bio7n1": 2, "g9bio7n10": 2, "g9bio7n2": 2, "g9bio7n3": 2, "g9bio7n4": 2, "g9bio7n5": 2, "g9bio7n6": 2, "g9bio7n7": 2, "g9bio7n8": 2, "g9bio7n9": 2, "g9bio8n1": 2, "g9bio8n2": 2, "g9bio8n3": 2, "g9bio8n4": 2, "g9bio8n5": 2, "g9bio8n6": 2, "g9bio8n7": 2, "g9bio8n8": 2, "g9bio9n1": 2, "g9bio9n2": 2, "g9bio9n3": 2, "g9bio9n4": 2, "g9bio9n5": 2, "g9cationppt": 2, "g9chemlab": 2, "g9combustion": 2, "g9current": 2, "g9efficiency": 2, "g9energy": 2, "g9energymix": 2, "g9fiber": 2, "g9flametest": 2, "g9fossil": 2, "g9greenhouse": 2, "g9hydro": 2, "g9indicator": 2, "g9ions": 2, "g9ivchar": 2, "g9lens": 2, "g9limestone": 2, "g9mirror": 2, "g9ohm": 2, "g9ohmslaw": 2, "g9oxides": 2, "g9phscale": 2, "g9power15": 2, "g9raydiagram": 2, "g9rayrefl": 2, "g9refl": 2, "g9refltype": 2, "g9refract": 2, "g9refractN": 2, "g9saltacid": 2, "g9saltmake": 2, "g9saltmetal": 2, "g9salttitra": 2, "g9solar": 2, "g9statesym": 2, "g9tir": 2, "g9voltage": 2, "g9watergas": 2, "g9wind": 2, "g9wireres": 2, "g9wordeq": 2, "gasex8": 2, "genetics": 2, "gravity": 2, "heart8": 2, "human": 2, "indicator": 2, "invertebrates": 2, "lungs8": 2, "magcompare": 2, "magfield": 2, "magnets": 2, "materials": 2, "metalcompare": 2, "metals": 2, "neutralapp": 2, "neutralisation": 2, "nonmetals": 2, "ozone": 2, "parallel12": 2, "phscale": 2, "plantclass": 2, "pollution": 2, "repro_development": 2, "repro_fertilisation": 2, "repro_gametes": 2, "repro_growth": 2, "repro_lifestyle": 2, "resistance": 2, "respiration8": 2, "salts_carbonate": 2, "salts_metal": 2, "salts_oxide": 2, "salts_what": 2, "smoking8": 2, "sound_oscilloscope": 2, "sound_pitch": 2, "sound_travel": 2, "sound_vibration": 2, "staticelec": 2, "variation": 2, "vertebrates": 2, "vessels8": 2};

function _rvMatchGrade(k, g) {
  if(g===5) return k.startsWith('g5');
  if(g===6) return k.startsWith('g6');
  if(g===9) return k.startsWith('g9');
  if(g===10) return k.startsWith('g10');
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
  var sem = window._activeSemester || 2;
  Object.keys(SIM_QUESTIONS).forEach(function(k) {
    if(!_rvMatchGrade(k, _rv.grade)) return;
    if(_rv.grade===9 && !_rvMatchSubject(k, _rv.subject)) return;
    if(_rvSimSemester[k] && _rvSimSemester[k]!==sem) return;
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
  var gNames = {5:'الصف الخامس',6:'الصف السادس',7:'الصف السابع',8:'الصف الثامن',9:'الصف التاسع',10:'الصف العاشر'};
  var semLabel = (window._activeSemester===1) ? ' — الفصل الأول' : ' — الفصل الثاني';
  document.getElementById('rv-subtitle').textContent = 'مراجعة أسئلة '+(gNames[grade]||'')+semLabel;
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
