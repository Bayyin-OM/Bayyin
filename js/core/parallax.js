(function(){
  var landing = document.getElementById('landing');
  if(!landing) return;
  var bg      = document.getElementById('px-bg');
  var scene   = document.getElementById('px-scene');
  var dune1   = document.getElementById('px-dune1');
  var dune2   = document.getElementById('px-dune2');
  var dune3   = document.getElementById('px-dune3');
  var hero    = document.querySelector('.hero-illustration');
  var heroTxt = document.querySelector('.hero-text');
  var ticking = false;
  function onScroll(){
    if(!ticking){ requestAnimationFrame(update); ticking=true; }
  }
  function onMouse(e){
    var cx=((e.touches&&e.touches[0]||e.changedTouches&&e.changedTouches[0]||e).clientX/window.innerWidth-0.5)*2;
    var cy=(e.clientY/window.innerHeight-0.5)*2;
    applyMouse(cx,cy);
  }
  function applyMouse(cx,cy){
    if(bg)      bg.style.transform      = 'translate('+cx*10+'px,'+cy*8+'px) scale(1.04)';
    if(hero)    hero.style.transform    = 'translate('+(cx*-14)+'px,'+(cy*-10)+'px)';
    if(heroTxt) heroTxt.style.transform = 'translate('+cx*6+'px,'+cy*4+'px)';
    if(dune1)   dune1.style.transform   = 'translateX('+cx*18+'px)';
    if(dune2)   dune2.style.transform   = 'translateX('+cx*10+'px)';
    if(dune3)   dune3.style.transform   = 'translateX('+cx*5+'px)';
  }
  function update(){
    var scrollY=window.scrollY||0;
    if(scene) scene.style.transform='translateY('+(scrollY*0.3)+'px)';
    ticking=false;
  }
  landing.addEventListener('mousemove',onMouse,{passive:true});
  window.addEventListener('scroll',onScroll,{passive:true});
  var style=document.createElement('style');
  style.textContent='#px-bg{transition:transform 0.1s ease-out}'
    +'.hero-illustration{transition:transform 0.12s ease-out}'
    +'.hero-text{transition:transform 0.10s ease-out}'
    +'#px-dune1,#px-dune2,#px-dune3{transition:transform 0.08s ease-out}';
  document.head.appendChild(style);
})();
