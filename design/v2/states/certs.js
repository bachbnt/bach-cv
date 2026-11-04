(function(){
var items=[].slice.call(document.querySelectorAll('[data-cert]')).map(function(el){return {title:el.getAttribute('data-title'),meta:el.getAttribute('data-meta'),img:el.getAttribute('data-img'),pdf:el.getAttribute('data-pdf')}});
if(!items.length)return;
var d=document.createElement('dialog');d.className='lb';d.setAttribute('aria-labelledby','lb-t');
d.innerHTML='<div class="lb-bar"><h2 id="lb-t"></h2><button class="lb-x" type="button" aria-label="Close preview">&times;</button></div><div class="lb-stage"><img alt=""></div><div class="lb-foot"><p></p><div class="lb-actions"><a class="lb-btn lb-open" target="_blank" rel="noopener"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>Open PDF</a><span class="lb-navs"><button class="lb-nav" type="button" data-prev aria-label="Previous certificate">&#8249;</button><button class="lb-nav" type="button" data-next aria-label="Next certificate">&#8250;</button></span></div></div>';
document.body.appendChild(d);
var cur=0,t=d.querySelector('#lb-t'),img=d.querySelector('img'),meta=d.querySelector('.lb-foot p'),pdf=d.querySelector('.lb-open'),opener=null;
function show(i){cur=(i+items.length)%items.length;var it=items[cur];t.textContent=it.title;img.src=it.img;img.alt=it.title+' certificate';meta.textContent=it.meta;pdf.href=it.pdf}
function open(i,from){opener=from||null;show(i);d.showModal()}
document.querySelectorAll('[data-open]').forEach(function(b){b.addEventListener('click',function(){var host=b.closest('[data-cert]');open(items.indexOf(items.filter(function(x){return x.title===host.getAttribute('data-title')})[0]),b)})});
d.querySelector('.lb-x').addEventListener('click',function(){d.close()});
d.querySelector('[data-prev]').addEventListener('click',function(){show(cur-1)});
d.querySelector('[data-next]').addEventListener('click',function(){show(cur+1)});
d.addEventListener('click',function(e){if(e.target===d)d.close()});
d.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){show(cur-1)}if(e.key==='ArrowRight'){show(cur+1)}});
d.addEventListener('close',function(){if(opener)opener.focus()});
})();
