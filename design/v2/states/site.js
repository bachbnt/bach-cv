(function(){
var conn=[];
var nav=[["About", "about.html", ""], ["Resume", "resume.html", ""], ["Projects", "projects.html", ""], ["Services", "services.html", "soon"], ["Payment", "payment.html", "soon"]];
var css=document.createElement('style');
css.textContent='dialog.cvdlg{border:0;padding:0;border-radius:20px;width:min(1000px,calc(100vw - 48px));height:min(92vh,900px);box-shadow:0 24px 64px rgba(27,31,39,.35);font-family:"Public Sans",system-ui,sans-serif;color:#1B1F27;overflow:hidden}'+
'dialog.cvdlg::backdrop{background:rgba(27,31,39,.55)}'+
'dialog.cvdlg[open]{display:flex;flex-direction:column}'+
'.cvdlg-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 20px;border-bottom:1px solid #DADDE4;background:#fff}'+
'.cvdlg-bar h2{margin:0;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:700 18px "Bricolage Grotesque",sans-serif;letter-spacing:-.02em}'+
'.cvdlg-act{display:flex;align-items:center;gap:10px}'+
'.cvdlg-dl{display:inline-flex;align-items:center;gap:8px;background:var(--accent,#B3301F);color:#fff;border:0;border-radius:10px;padding:10px 18px;font:600 15px "Public Sans",sans-serif;cursor:pointer}'+
'.cvdlg-dl{white-space:nowrap;flex:none}.cvdlg-act{flex:none}'+
'.cvdlg-dl:hover{filter:brightness(.92)}'+
'.cvdlg-x{width:40px;height:40px;border:1px solid #DADDE4;background:#fff;border-radius:10px;font-size:20px;cursor:pointer;line-height:1}'+
'.cvdlg-x:hover{background:#E7E9EE}'+
'.cvdlg iframe{flex:1;border:0;width:100%;background:#D5D8DF}'+
'.mnav{position:fixed;inset:0;z-index:50;display:none}'+
'.mnav.open{display:block}'+
'.mnav .mscrim{position:absolute;inset:0;background:rgba(27,31,39,.5)}'+
'.mnav .mpanel{position:absolute;top:0;right:0;bottom:0;box-sizing:border-box;width:min(88vw,360px);background:#fff;border-radius:24px 0 0 24px;display:flex;flex-direction:column;padding:16px 16px 0;box-shadow:-20px 0 48px rgba(27,31,39,.2);overflow-y:auto}'+
'.mnav .mtop{display:flex;align-items:center;justify-content:space-between;padding:4px 4px 12px}'+
'.mnav .mbrand{display:flex;align-items:center;gap:10px;font:700 18px "Bricolage Grotesque",sans-serif;letter-spacing:-.01em;color:#1B1F27;text-decoration:none}'+
'.mnav .mlinks{display:flex;flex-direction:column;gap:2px;margin:4px 0 12px}'+
'.mnav .mlinks a{display:flex;align-items:center;min-height:52px;padding:0 14px;border-radius:14px;font:600 20px "Bricolage Grotesque",sans-serif;letter-spacing:-.01em;color:#1B1F27;text-decoration:none}'+
'.mnav .msoon{display:flex;align-items:center;gap:10px;min-height:52px;padding:0 14px;font:600 20px "Bricolage Grotesque",sans-serif;color:#566070}.mnav .msoon small{padding:2px 8px;border-radius:999px;background:#E7E9EE;font:600 12px "Public Sans",sans-serif}'+
'.mnav .mlinks a[aria-current]{background:var(--pagetint,#F5F6F8)}'+
'.mnav .mlinks a:active{background:#F5F6F8}'+
'.mnav .msec{padding:14px 4px;border-top:1px solid #DADDE4}'+
'.mnav .mlabel{margin:0 0 10px;font:600 13px "Public Sans",sans-serif;color:#566070}'+
'.mnav .mconn{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}'+
'.mnav .mconn a{aspect-ratio:1;border-radius:14px;background:#F5F6F8;color:#1B1F27;display:flex;align-items:center;justify-content:center;transition:background-color .15s ease,color .15s ease}'+
'.mnav .mconn a:active,.mnav .mconn a:hover{background:var(--c,#1B1F27);color:#fff}'+
'.mnav .mrow{display:flex;align-items:center;justify-content:space-between;gap:12px}'+
'.mnav .mrow .mlabel{margin:0}'+
'.mnav .mseg{display:inline-flex;padding:3px;background:#F5F6F8;border-radius:12px}'+
'.mnav .mseg button{min-width:56px;min-height:40px;padding:0 14px;border:0;border-radius:10px;background:transparent;font:600 15px "Public Sans",sans-serif;color:#566070;cursor:pointer}'+
'.mnav .mseg button[aria-pressed=true]{background:#1B1F27;color:#fff}'+
'.mnav .mcta{position:sticky;bottom:0;margin:auto -16px 0;padding:12px 16px 20px;background:#fff;box-shadow:0 -10px 14px rgba(255,255,255,.95)}'+
'.mnav .mcv{display:flex;align-items:center;justify-content:center;gap:10px;min-height:52px;border-radius:12px;background:#B3301F;color:#fff;font:600 16px "Public Sans",sans-serif;text-decoration:none}'+
'@media(max-height:700px){.mnav .mlinks a{min-height:46px;font-size:19px}.mnav .msec{padding:10px 4px}}'+
'@keyframes mfade{from{opacity:0}}@keyframes mdrawer{from{transform:translateX(100%)}}@keyframes mrise{from{opacity:0;transform:translateX(14px)}}'+
'@media(prefers-reduced-motion:no-preference){.mnav.open .mscrim{animation:mfade .25s ease}.mnav.open .mpanel{animation:mdrawer .32s cubic-bezier(.2,.8,.2,1)}.mnav.open .mlinks a{animation:mrise .4s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(var(--i) * 35ms + 120ms)}}'+
'@media(max-width:720px){dialog.cvdlg{width:100%;max-width:none;height:calc(100vh - 12px);height:calc(100dvh - 12px);max-height:none;margin:auto 0 0;border-radius:20px 20px 0 0}.cvdlg-bar{padding:12px 14px}.cvdlg-bar h2{font-size:16px}.cvdlg-dl{padding:10px 14px}}';
document.head.appendChild(css);
var d=document.createElement('dialog');d.className='cvdlg';d.setAttribute('aria-labelledby','cvdlg-t');
d.innerHTML='<div class="cvdlg-bar"><h2 id="cvdlg-t">Bui Ngo Ton Bach CV</h2><div class="cvdlg-act"><button class="cvdlg-dl" type="button"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>Download PDF</button><button class="cvdlg-x" type="button" aria-label="Close">&times;</button></div></div><iframe title="CV preview"></iframe>';
document.body.appendChild(d);
var f=d.querySelector('iframe');
function open(e){if(e)e.preventDefault();if(!f.getAttribute('src'))f.src='cv.html';d.showModal()}
d.querySelector('.cvdlg-x').onclick=function(){d.close()};
d.addEventListener('click',function(e){if(e.target===d)d.close()});
d.querySelector('.cvdlg-dl').onclick=function(){try{f.contentWindow.focus();f.contentWindow.print()}catch(x){}};
document.querySelectorAll('a').forEach(function(a){if(/download cv/i.test(a.textContent)&&!a.closest('dialog'))a.addEventListener('click',open)});
var DLICON='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>';
var here=location.pathname.split('/').pop()||'index.html';
var m=document.createElement('div');m.className='mnav';m.setAttribute('role','dialog');m.setAttribute('aria-modal','true');m.setAttribute('aria-label','Menu');
m.innerHTML='<div class="mscrim"></div><aside class="mpanel">'+
'<div class="mtop"><a class="mbrand" href="index.html"><img src="logo.png" alt="" width="32" style="width:32px;height:auto">Bach Bui</a><button class="cvdlg-x" type="button" aria-label="Close menu">&times;</button></div>'+
'<nav class="mlinks" aria-label="Main">'+nav.map(function(n,i){if(n[2]==='soon')return '<span class="msoon" aria-disabled="true">'+n[0]+'<small>Soon</small></span>';return '<a href="'+n[1]+'" style="--i:'+i+'"'+(n[1]===here?' aria-current="page"':'')+'>'+n[0]+'</a>'}).join('')+'</nav>'+
(conn.length?'<div class="msec"><p class="mlabel">Connect</p><div class="mconn">'+conn.map(function(c){return '<a href="'+c[1]+'" style="--c:'+c[2]+'" aria-label="'+c[0]+'">'+c[3]+'</a>'}).join('')+'</div></div>':'')+
'<div class="msec mrow"><span class="mlabel">Language</span><div class="mseg" role="group" aria-label="Language"><button type="button" data-code="EN" aria-pressed="true">EN</button><button type="button" data-code="VI" aria-pressed="false">VI</button></div></div>'+
'<div class="mcta"><a href="#" class="mcv">'+DLICON+'Download CV</a></div></aside>';
document.body.appendChild(m);
document.querySelectorAll('[data-back]').forEach(function(a){a.addEventListener('click',function(e){var same=false;try{same=!!document.referrer&&new URL(document.referrer).origin===location.origin}catch(x){}
if(same){e.preventDefault();history.back()}})});
document.querySelectorAll('a.brand').forEach(function(a){a.addEventListener('click',function(e){
var home=/(^|\/)(index\.html)?$/.test(location.pathname);
if(home){e.preventDefault();var r=matchMedia('(prefers-reduced-motion: reduce)').matches;window.scrollTo({top:0,behavior:r?'auto':'smooth'});if(!r){a.classList.remove('spin');void a.offsetWidth;a.classList.add('spin');setTimeout(function(){a.classList.remove('spin')},650)}}
})});
var mb=document.querySelector('a.menu');
function mopen(v){m.classList.toggle('open',v);document.documentElement.style.overflow=v?'hidden':'';if(v){m.querySelector('.cvdlg-x').focus()}else if(mb){mb.focus()}}
m.querySelector('.mscrim').onclick=function(){mopen(false)};
m.querySelector('.cvdlg-x').onclick=function(){mopen(false)};
m.querySelector('.mcv').onclick=function(e){mopen(false);open(e)};
m.querySelectorAll('.mlinks a').forEach(function(a){a.addEventListener('click',function(){mopen(false)})});
m.addEventListener('keydown',function(e){
if(e.key==='Escape'){mopen(false);return}
if(e.key==='Tab'){var f=[].slice.call(m.querySelectorAll('a[href],button')).filter(function(x){return x.offsetParent});var first=f[0],last=f[f.length-1];
if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
document.querySelectorAll('.lang').forEach(function(box){
var btn=box.querySelector('.lang-btn'),menu=box.querySelector('.lang-menu'),cur=box.querySelector('.lang-cur'),opts=[].slice.call(menu.querySelectorAll('[role=option]'));
function setOpen(v){menu.hidden=!v;btn.setAttribute('aria-expanded',String(v));if(v){var sel=menu.querySelector('[aria-selected=true]');sel&&sel.focus()}}
btn.addEventListener('click',function(e){e.stopPropagation();setOpen(menu.hidden)});
opts.forEach(function(o,i){o.addEventListener('click',function(){opts.forEach(function(x){x.setAttribute('aria-selected',String(x===o))});cur.textContent=o.getAttribute('data-code');document.documentElement.lang=o.getAttribute('data-code').toLowerCase();setOpen(false);btn.focus()});
o.addEventListener('keydown',function(e){if(e.key==='ArrowDown'){e.preventDefault();opts[(i+1)%opts.length].focus()}if(e.key==='ArrowUp'){e.preventDefault();opts[(i-1+opts.length)%opts.length].focus()}})});
document.addEventListener('click',function(e){if(!box.contains(e.target))setOpen(false)});
box.addEventListener('keydown',function(e){if(e.key==='Escape'&&!menu.hidden){setOpen(false);btn.focus()}});
});
m.querySelectorAll('.mseg button').forEach(function(b,i,all){b.addEventListener('click',function(){all.forEach(function(x){x.setAttribute('aria-pressed',String(x===b))});document.querySelectorAll('.lang-cur').forEach(function(c){c.textContent=b.getAttribute('data-code')})})});
document.querySelectorAll('.connect').forEach(function(box){
var btn=box.querySelector('.connect-btn');
var cp=box.querySelector('.cn-copy');
if(cp)cp.addEventListener('click',function(){var v=cp.getAttribute('data-copy'),ok=function(){cp.textContent='Copied';cp.setAttribute('aria-live','polite');setTimeout(function(){cp.textContent='Copy'},1600)};
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(v).then(ok,function(){})}else{var a=document.createElement('textarea');a.value=v;a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();try{document.execCommand('copy');ok()}catch(e){}a.remove()}});
function set(v){box.setAttribute('data-open',String(v));btn.setAttribute('aria-expanded',String(v))}
btn.addEventListener('click',function(e){e.stopPropagation();set(box.getAttribute('data-open')!=='true')});
document.addEventListener('click',function(e){if(!box.contains(e.target))set(false)});
box.addEventListener('keydown',function(e){if(e.key==='Escape'){set(false);btn.focus()}});
});
if(mb)mb.addEventListener('click',function(e){e.preventDefault();mopen(true)});
})();
