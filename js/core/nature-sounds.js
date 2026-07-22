/* ── Nature Sounds Engine ── */
(function(){
  var _ac = null;
  var _nodes = {};   // active sound nodes
  var _current = null;

  function getAC(){
    if(!_ac) _ac = new (window.AudioContext||window.webkitAudioContext)();
    if(_ac.state==='suspended') _ac.resume();
    return _ac;
  }

  // ── صوت العصفور (chirp) ──
  function chirp(ac, freq, t, vol){
    vol = vol || 0.12;
    var osc = ac.createOscillator();
    var gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    osc.frequency.exponentialRampToValueAtTime(freq*1.5, t+0.06);
    osc.frequency.exponentialRampToValueAtTime(freq*1.2, t+0.12);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t+0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t+0.18);
    osc.start(t); osc.stop(t+0.2);
  }

  function startBirds(vol, interval){
    vol = vol || 0.12; interval = interval || 1800;
    var ac = getAC(), stopped = false;
    function schedule(){
      if(stopped) return;
      var now = ac.currentTime;
      var freqs = [1800,2200,1600,2500];
      var n = Math.floor(Math.random()*2)+1;
      for(var i=0;i<n;i++){
        var f = freqs[Math.floor(Math.random()*freqs.length)];
        chirp(ac, f*(0.9+Math.random()*0.2), now+Math.random()*0.3, vol);
        if(Math.random()>0.6)
          chirp(ac, f*0.8, now+0.22+Math.random()*0.2, vol);
      }
      _nodes.birdsTimer = setTimeout(schedule, interval+Math.random()*interval);
    }
    schedule();
    return function(){ stopped=true; clearTimeout(_nodes.birdsTimer); };
  }

  // ── صوت الموج ──
  function startOcean(vol){
    vol = vol || 0.18;
    var ac = getAC(), mg = ac.createGain(), stopped = false;
    mg.gain.value = vol; mg.connect(ac.destination);
    function makeWave(freq, delay){
      if(stopped) return;
      var buf = ac.createBuffer(1, ac.sampleRate*2.5, ac.sampleRate);
      var d = buf.getChannelData(0);
      for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
      var src=ac.createBufferSource(); src.buffer=buf;
      var flt=ac.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=freq; flt.Q.value=0.8;
      var g=ac.createGain(), t=ac.currentTime+delay;
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(1,t+0.8);
      g.gain.setValueAtTime(1,t+1.2);
      g.gain.exponentialRampToValueAtTime(0.001,t+2.4);
      src.connect(flt); flt.connect(g); g.connect(mg);
      src.start(t); src.stop(t+2.5);
      if(!stopped) setTimeout(function(){ makeWave(freq,0); }, (delay+1800+Math.random()*600));
    }
    makeWave(300,0); makeWave(250,0.7); makeWave(200,1.4);
    return function(){ stopped=true; try{mg.gain.linearRampToValueAtTime(0,ac.currentTime+0.5);}catch(e){} };
  }

  // ── ريح خفيفة ──
  function startWind(vol){
    vol = vol || 0.04;
    var ac=getAC(), buf=ac.createBuffer(1,ac.sampleRate*4,ac.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
    var src=ac.createBufferSource(); src.buffer=buf; src.loop=true;
    var flt=ac.createBiquadFilter(); flt.type='lowpass'; flt.frequency.value=350;
    var g=ac.createGain(); g.gain.value=vol;
    src.connect(flt); flt.connect(g); g.connect(ac.destination); src.start();
    return function(){ try{src.stop();}catch(e){} };
  }

  // ── غابة هادئة (عصفور نادر + ريح خفيفة) ──
  function startForest(){
    var s1=startWind(0.025);
    var s2=startBirds(0.04, 4000);
    return function(){ s1(); s2(); };
  }

  // ── مختبر (نقرات وطنين خفيف جداً) ──
  function startLab(){
    var ac=getAC(), stopped=false;
    // طنين هادئ جداً = صوت تهوية المختبر
    var buf=ac.createBuffer(1,ac.sampleRate*3,ac.sampleRate);
    var d=buf.getChannelData(0);
    for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
    var src=ac.createBufferSource(); src.buffer=buf; src.loop=true;
    var flt=ac.createBiquadFilter(); flt.type='highpass'; flt.frequency.value=800;
    var g=ac.createGain(); g.gain.value=0.015;
    src.connect(flt); flt.connect(g); g.connect(ac.destination); src.start();
    // نقرة خفيفة متقطعة أحياناً
    function drip(){
      if(stopped) return;
      var osc=ac.createOscillator(), gg=ac.createGain();
      osc.connect(gg); gg.connect(ac.destination);
      osc.type='sine'; osc.frequency.value=900+Math.random()*400;
      var t=ac.currentTime;
      gg.gain.setValueAtTime(0,t);
      gg.gain.linearRampToValueAtTime(0.04,t+0.01);
      gg.gain.exponentialRampToValueAtTime(0.001,t+0.15);
      osc.start(t); osc.stop(t+0.16);
      _nodes.labTimer=setTimeout(drip, 3000+Math.random()*4000);
    }
    drip();
    return function(){ stopped=true; clearTimeout(_nodes.labTimer); try{src.stop();}catch(e){} };
  }

  // ── حفيف هواء خفيف (للقوى) ──
  function startWhoosh(){
    var ac=getAC(), stopped=false;
    function puff(){
      if(stopped) return;
      var buf=ac.createBuffer(1,ac.sampleRate*0.4,ac.sampleRate);
      var d=buf.getChannelData(0);
      for(var i=0;i<d.length;i++) d[i]=(Math.random()*2-1);
      var src=ac.createBufferSource(); src.buffer=buf;
      var flt=ac.createBiquadFilter(); flt.type='bandpass'; flt.frequency.value=600; flt.Q.value=1.5;
      var g=ac.createGain(), t=ac.currentTime;
      g.gain.setValueAtTime(0,t);
      g.gain.linearRampToValueAtTime(0.05,t+0.05);
      g.gain.exponentialRampToValueAtTime(0.001,t+0.35);
      src.connect(flt); flt.connect(g); g.connect(ac.destination);
      src.start(t); src.stop(t+0.4);
      _nodes.whooshTimer=setTimeout(puff, 4000+Math.random()*3000);
    }
    puff();
    return function(){ stopped=true; clearTimeout(_nodes.whooshTimer); };
  }

  // ── خريطة الاستقصاءات للأصوات ──
  var SOUND_MAP = {
    // الصف 8 — النباتات (الفصل الأول)
    g8bio1n1:       'forest',
    // نشاط 7-5: الإنسان — يُتحكم فيه عبر openSim مباشرة (بحر أو عصافير حسب التاب)
    // نشاط 7: البيئة
    foodchain:      'birds_soft',
    foodweb:        'birds_soft',
    decomposer:     'forest',
    conservation:   'birds_soft',
    pollution:      'wind_soft',
    ozone:          'wind_soft',
    // نشاط 8: المواد — بدون صوت
    // metals, nonmetals, metalcompare, materials
    // نشاط 10: التصنيف
    variation:      null,
    plantclass:     'forest',
    vertebrates:    'birds_soft',
    invertebrates:  'forest',
    dichotomous:    'birds_soft',
    // genetics — بدون صوت
    // نشاط 11: الأحماض — بدون صوت
    // acidbase, indicator, phscale, neutralisation, neutralapp, acidinquiry
  };

  var _stopFn = null;

  function stopCurrent(){
    if(_stopFn){ try{_stopFn();}catch(e){} _stopFn=null; }
    _current=null;
  }

  function playSoundFor(simType){
    var sound = SOUND_MAP[simType] || null;
    if(sound===_current) return;
    stopCurrent();
    if(!sound) return;
    _current=sound;
    try{
      if(sound==='birds')       _stopFn=startBirds(0.12,1800);
      else if(sound==='birds_soft') _stopFn=startBirds(0.05,3500);
      else if(sound==='ocean')  _stopFn=startOcean(0.18);
      else if(sound==='forest') _stopFn=startForest();
      else if(sound==='lab')    _stopFn=startLab();
      else if(sound==='whoosh') _stopFn=startWhoosh();
      else if(sound==='wind_soft') _stopFn=startWind(0.03);
    }catch(e){ console.warn('Nature sound error:',e); }
  }

  // ── ربط مع openSim و closeSim ──
  var _origOpenSim = window.openSim;
  window.openSim = function(type){
    if(_origOpenSim) _origOpenSim(type);
    setTimeout(function(){
      if(type==='human'){
        // تاب 0 = صيد الأسماك → بحر ، تاب 1 = زراعة → عصافير
        var tab = window.currentTab || 0;
        var sound = tab===0 ? 'ocean' : 'birds';
        stopCurrent(); _current=sound;
        try{ _stopFn = sound==='ocean' ? startOcean(0.18) : startBirds(0.12,1800); }catch(e){}
      } else {
        playSoundFor(type);
      }
    }, 1200);
  };

  // عند تبديل تاب في استقصاء الإنسان

  var _origCloseSim = window.closeSim;
  window.closeSim = function(){
    if(_origCloseSim) _origCloseSim();
    stopCurrent();
  };

  window._playSoundFor = playSoundFor;
  window._stopNatureSound = stopCurrent;
  window._playOcean = function(){ stopCurrent(); _current='ocean'; try{_stopFn=startOcean(0.18);}catch(e){} };
  window._playBirds = function(){ stopCurrent(); _current='birds'; try{_stopFn=startBirds(0.12,1800);}catch(e){} };
})();
