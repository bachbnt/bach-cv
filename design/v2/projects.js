(function(){
var btns=[].slice.call(document.querySelectorAll('.proj-shots'));
if(!btns.length)return;
var d=document.createElement('dialog');d.className='lb';d.setAttribute('aria-labelledby','lb-t');
d.innerHTML='<div class="lb-bar"><h2 id="lb-t"></h2><button class="lb-x" type="button" aria-label="Close screenshots">&times;</button></div><div class="lb-stage"><img alt=""></div><div class="lb-foot"><p></p><div class="lb-actions"><span class="lb-navs"><button class="lb-nav" type="button" data-prev aria-label="Previous screenshot">&#8249;</button><button class="lb-nav" type="button" data-next aria-label="Next screenshot">&#8250;</button></span></div></div>';
document.body.appendChild(d);
var shots=[],title='',cur=0,opener=null,t=d.querySelector('#lb-t'),img=d.querySelector('img'),meta=d.querySelector('.lb-foot p');
function show(i){cur=(i+shots.length)%shots.length;t.textContent=title;img.src=shots[cur];img.alt=title+' screenshot '+(cur+1);meta.textContent='Screenshot '+(cur+1)+' of '+shots.length}
btns.forEach(function(b){b.addEventListener('click',function(){shots=JSON.parse(b.getAttribute('data-shots'));title=b.getAttribute('data-title');opener=b;show(0);d.showModal()})});
d.querySelector('.lb-x').addEventListener('click',function(){d.close()});
d.querySelector('[data-prev]').addEventListener('click',function(){show(cur-1)});
d.querySelector('[data-next]').addEventListener('click',function(){show(cur+1)});
d.addEventListener('click',function(e){if(e.target===d)d.close()});
d.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});
d.addEventListener('close',function(){if(opener)opener.focus()});
})();
