
// ===== AI ASSISTANT ENGINE =====
var _ai = { open: false, history: [], loading: false };

var _aiSuggestions = {
  default: ['ما الفرق بين الضوء والصوت؟','ما أهمية الخلية في الكائنات؟','كيف تعمل الكهرباء؟'],
  g5: ['لماذا نرى ألوان قوس قزح؟','كيف تنعكس الأشعة على المرايا؟','لماذا يختلف طول الظل؟'],
  g6: ['ما أنواع القوى في الطبيعة؟','كيف يعمل الدائرة الكهربائية؟','ما الفرق بين الناقل والعازل؟'],
  g7: ['ما الفرق بين الفلزات واللافلزات؟','كيف تعمل سلاسل الغذاء؟','ما مفهوم التكيّف عند الحيوانات؟'],
  g8: ['كيف يعمل الجهاز الدوري؟','ما أهمية التنفس الخلوي؟','ما دور الجينات في الوراثة؟'],
  g9bio: ['كيف يؤثر الأوكسين على نمو النباتات؟','ما الفرق بين الانتحاء والهرمون؟','كيف تتكيف النباتات مع الضوء؟'],
  g9chem: ['ما الفرق بين الحمض والقاعدة؟','كيف تتكون الأملاح؟','ما خاصية pH ؟'],
  g9phys: ['ما قانون أوم؟','كيف تعمل العدسات؟','ما مبدأ انعكاس الضوء الكلي؟']
};

function _aiGetContext() {
  var sim = typeof currentSim !== 'undefined' ? currentSim : null;
  var grade = window._activeGrade || 7;
  var title = '';
  var titleEl = document.getElementById('simPanelTitle');
  if(titleEl) title = titleEl.textContent || '';
  return { sim: sim, grade: grade, title: title };
}

function _aiGetSuggestions() {
  var ctx = _aiGetContext();
  var g = ctx.grade;
  var sim = ctx.sim || '';
  if(sim.startsWith('g9bio') || sim.includes('plant') || sim.includes('auxin')) return _aiSuggestions.g9bio;
  if(sim.startsWith('g9') && (sim.includes('acid')||sim.includes('salt')||sim.includes('ph')||sim.includes('ion'))) return _aiSuggestions.g9chem;
  if(sim.startsWith('g9')) return _aiSuggestions.g9phys;
  if(g===5) return _aiSuggestions.g5;
  if(g===6) return _aiSuggestions.g6;
  if(g===7) return _aiSuggestions.g7;
  if(g===8) return _aiSuggestions.g8;
  return _aiSuggestions.default;
}

function _aiSystemPrompt() {
  var ctx = _aiGetContext();
  var gradeNames = {5:'الخامس',6:'السادس',7:'السابع',8:'الثامن',9:'التاسع'};
  var base = 'YOU MUST ALWAYS RESPOND IN ARABIC ONLY. NEVER USE ENGLISH OR ANY OTHER LANGUAGE. '
    + 'You are a science assistant for grade ' + (ctx.grade||7) + ' students in Oman. '
    + 'Rules: (1) ARABIC ONLY - if you respond in English you have failed. '
    + '(2) Be concise, 3-4 sentences max. '
    + '(3) No greetings or preamble, answer directly. '
    + '(4) Use simple everyday examples. '
    + '(5) Stay within science topics only. ';
  if(ctx.sim && ctx.title) {
    base += 'الطالب يعمل الآن على استقصاء: «' + ctx.title + '» (رمز: ' + ctx.sim + '). '
      + 'ركّز إجاباتك على المفاهيم المرتبطة بهذا الاستقصاء وربطها بالتجربة أمامه. ';
  }
  return base;
}

function aiToggle() {
  _ai.open = !_ai.open;
  var panel = document.getElementById('ai-panel');
  var fab = document.getElementById('ai-fab');
  if(_ai.open) {
    panel.classList.add('show');
    fab.classList.add('active');
    fab.textContent = '✕';
    _aiUpdateContext();
    if(_ai.history.length === 0) _aiWelcome();
    document.getElementById('ai-input').focus();
  } else {
    panel.classList.remove('show');
    fab.classList.remove('active');
    fab.textContent = '🤖';
  }
}

function _aiUpdateContext() {
  var ctx = _aiGetContext();
  var pill = document.getElementById('ai-context-pill');
  var titleEl = document.getElementById('simPanelTitle');
  var title = titleEl ? titleEl.textContent : '';
  pill.textContent = title ? title.slice(0,14) + (title.length>14?'…':'') : 'عام';
  pill.title = title || 'وضع عام';
  // Update suggestions
  var sugs = _aiGetSuggestions();
  var sugBox = document.getElementById('ai-suggestions');
  sugBox.innerHTML = '';
  sugs.slice(0,3).forEach(function(s){
    var btn = document.createElement('button');
    btn.className = 'ai-sug';
    btn.textContent = s;
    btn.onclick = function(){ aiSendText(s); };
    sugBox.appendChild(btn);
  });
}

function _aiWelcome() {
  var ctx = _aiGetContext();
  var msg;
  if(ctx.sim && ctx.title) {
    msg = 'مرحباً! 👋 أنا مساعدك في استقصاء «' + ctx.title + '». اسألني عن أي مفهوم أو ظاهرة ترى فيه!';
  } else {
    msg = 'مرحباً! 👋 أنا بيّن AI، مساعدك العلمي. افتح أي استقصاء وسأساعدك على فهمه، أو اسألني عن أي مفهوم علمي!';
  }
  _aiAddMsg('bot', msg);
}

function _aiAddMsg(role, text) {
  var msgs = document.getElementById('ai-messages');
  var div = document.createElement('div');
  div.className = 'ai-msg ' + (role==='user'?'user':'bot');
  var icon = role==='user' ? '👤' : '🧪';
  div.innerHTML = '<div class="ai-msg-icon">'+icon+'</div><div class="ai-bubble">'+text.replace(/\n/g,'<br>')+'</div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
  _ai.history.push({role: role==='user'?'user':'assistant', content: text});
  if(_ai.history.length > 20) _ai.history = _ai.history.slice(-20);
}

function _aiShowTyping() {
  var msgs = document.getElementById('ai-messages');
  var div = document.createElement('div');
  div.className = 'ai-msg bot'; div.id = 'ai-typing-indicator';
  div.innerHTML = '<div class="ai-msg-icon">🧪</div><div class="ai-bubble"><div class="ai-typing"><span></span><span></span><span></span></div></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function _aiRemoveTyping() {
  var t = document.getElementById('ai-typing-indicator');
  if(t) t.remove();
}

async function _aiCall(userMsg) {
  _ai.loading = true;
  document.getElementById('ai-send').disabled = true;
  _aiShowTyping();
  
  var messages = _ai.history.slice(-10).concat([{role:'user', content: userMsg}]);
  
  try {
    var OR_KEY = (window.BAYYIN_CONFIG && window.BAYYIN_CONFIG.orKey) || '';
    var orMsgs = [{role:'system', content: _aiSystemPrompt()}].concat(
      messages.filter(function(m){ return m.content && m.content.trim(); })
    );
    var response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OR_KEY,
        'HTTP-Referer': 'https://bayyin-six.vercel.app',
        'X-Title': 'Bayyin AI'
      },
      body: JSON.stringify({
        model: 'openrouter/free',
        messages: orMsgs,
        max_tokens: 800,
        stream: true
      })
    });

    _aiRemoveTyping();

    // Streaming bubble
    var msgs = document.getElementById('ai-messages');
    var bubble = document.createElement('div');
    bubble.className = 'ai-msg bot';
    var iconEl = document.createElement('div');
    iconEl.className = 'ai-msg-icon';
    iconEl.textContent = '🧪';
    var streamEl = document.createElement('div');
    streamEl.className = 'ai-bubble';
    streamEl.id = 'ai-stream-bubble';
    bubble.appendChild(iconEl);
    bubble.appendChild(streamEl);
    msgs.appendChild(bubble);

    var fullText = '';
    var reader = response.body.getReader();
    var decoder = new TextDecoder();

    while(true) {
      var res = await reader.read();
      if(res.done) break;
      var chunk = decoder.decode(res.value, {stream: true});
      var lines = chunk.split('\n');
      for(var li = 0; li < lines.length; li++) {
        var line = lines[li].trim();
        if(!line || line === 'data: [DONE]') continue;
        if(line.startsWith('data: ')) {
          try {
            var json = JSON.parse(line.slice(6));
            var delta = json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content;
            if(delta) {
              fullText += delta;
              streamEl.innerHTML = fullText.replace(/\n/g, '<br>');
              msgs.scrollTop = msgs.scrollHeight;
            }
          } catch(parseErr) {}
        }
      }
    }

    _ai.history.push({role: 'assistant', content: fullText});
    if(_ai.history.length > 20) _ai.history = _ai.history.slice(-20);
    streamEl.id = '';

  } catch(e) {
    _aiRemoveTyping();
    _aiAddMsg('bot', '\u062e\u0637\u0623: ' + (e && e.message ? e.message : String(e)));
  }
  
  _ai.loading = false;
  document.getElementById('ai-send').disabled = false;
  document.getElementById('ai-input').focus();
}
function aiSend() {
  if(_ai.loading) return;
  var input = document.getElementById('ai-input');
  var text = input.value.trim();
  if(!text) return;
  input.value = ''; input.style.height = 'auto';
  document.getElementById('ai-suggestions').style.display = 'none';
  _aiAddMsg('user', text);
  _aiCall(text);
}

function aiSendText(text) {
  if(_ai.loading) return;
  document.getElementById('ai-suggestions').style.display = 'none';
  _aiAddMsg('user', text);
  _aiCall(text);
}

// Update AI context when sim opens
var _origOpenSim = typeof openSim === 'function' ? openSim : null;
document.addEventListener('DOMContentLoaded', function(){
  var origOpen = window.openSim;
  if(origOpen) {
    window.openSim = function(type) {
      origOpen(type);
      setTimeout(function(){
        if(_ai.open) _aiUpdateContext();
      }, 300);
    };
  }
});
// ===== END AI ASSISTANT =====

