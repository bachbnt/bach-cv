(function(){
if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
var sel='main section h2,main article,main a.rowlink,#grid > *,section[aria-labelledby="build-h"] .wrap > div > div,main details';
var els=[].slice.call(document.querySelectorAll(sel)).filter(function(el){return !el.closest('.hi')&&!el.closest('.pipeline')});
els.forEach(function(el){
var p=el.parentElement,i=p?[].indexOf.call(p.children,el):0;
el.setAttribute('data-reveal','');el.style.setProperty('--d',Math.min((i%6)*70,350)+'ms');});
var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1,rootMargin:'0px 0px -5% 0px'});
els.forEach(function(el){io.observe(el)});
})();
