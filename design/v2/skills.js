(function(){
var chips=[].slice.call(document.querySelectorAll('.sk-chip[data-tip]'));
if(!chips.length)return;
var tip=document.createElement('div');
tip.className='sk-tip';tip.id='sk-tip';tip.setAttribute('role','tooltip');tip.hidden=true;
document.body.appendChild(tip);
var cur=null,t0=0,ptype='mouse';
function place(c){
var r=c.getBoundingClientRect(),w=tip.offsetWidth,h=tip.offsetHeight;
var x=r.left+r.width/2-w/2;x=Math.max(8,Math.min(x,document.documentElement.clientWidth-w-8));
var y=r.top-h-10,below=y<8;if(below)y=r.bottom+10;
tip.classList.toggle('below',below);
tip.style.left=(x+window.pageXOffset)+'px';tip.style.top=(y+window.pageYOffset)+'px';
tip.style.setProperty('--ax',Math.round(r.left+r.width/2-x)+'px');
}
function show(c){
if(cur&&cur!==c)cur.removeAttribute('aria-describedby');
t0=Date.now();cur=c;tip.textContent=c.getAttribute('data-tip');tip.hidden=false;
c.setAttribute('aria-describedby','sk-tip');place(c);
requestAnimationFrame(function(){tip.classList.add('on')});
}
function hide(){
if(cur){cur.removeAttribute('aria-describedby');cur=null}
tip.classList.remove('on');tip.hidden=true;
}
chips.forEach(function(c){
c.addEventListener('mouseenter',function(){show(c)});
c.addEventListener('mouseleave',hide);
c.addEventListener('focus',function(){show(c)});
c.addEventListener('blur',hide);
c.addEventListener('pointerdown',function(e){ptype=e.pointerType});
c.addEventListener('click',function(){
if(ptype!=='touch'||Date.now()-t0<350)return;      // mouse and keyboard already handled; the tap's own focus just showed it
cur===c&&!tip.hidden?hide():show(c);                // touch: tapping again hides it
});
});
addEventListener('scroll',hide,{passive:true});
addEventListener('resize',hide);
addEventListener('keydown',function(e){if(e.key==='Escape')hide()});
document.addEventListener('click',function(e){if(cur&&!cur.contains(e.target))hide()});
})();
