(function(){
var cards=[].slice.call(document.querySelectorAll('[data-pay]'));
if(!cards.length)return;
function info(el){return {name:el.getAttribute('data-name'),holder:el.getAttribute('data-holder'),account:el.getAttribute('data-account'),qr:el.getAttribute('data-qr')}}
// ---- toast (also announced to screen readers)
var toast=document.createElement('div');toast.className='pay-toast';toast.setAttribute('role','status');toast.setAttribute('aria-live','polite');document.body.appendChild(toast);
var tt;function say(t){toast.textContent='';clearTimeout(tt);setTimeout(function(){toast.textContent=t;toast.classList.add('show')},20);tt=setTimeout(function(){toast.classList.remove('show')},2000)}
// ---- copy with a fallback for pages without clipboard access
function copy(text,done){
function fallback(){var a=document.createElement('textarea');a.value=text;a.setAttribute('readonly','');a.style.cssText='position:fixed;opacity:0';document.body.appendChild(a);a.select();var ok=false;try{ok=document.execCommand('copy')}catch(e){}a.remove();say(ok?done:'Could not copy. Select the number and press Ctrl or Cmd + C.')}
if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){say(done)},fallback)}else fallback()}
function doCopy(kind,i){
if(kind==='all')copy(i.name+'\nAccount name: '+i.holder+'\nAccount number: '+i.account,i.name+' details copied');
else copy(i.account,i.name+' account number copied')}
document.querySelectorAll('[data-copy]').forEach(function(b){b.addEventListener('click',function(){doCopy(b.getAttribute('data-copy'),info(b.closest('[data-pay]')))})});
// ---- filter (rows only; preferred methods always stay visible)
var rows=[].slice.call(document.querySelectorAll('.pay-row')),chips=[].slice.call(document.querySelectorAll('.pay-filter .chip'));
chips.forEach(function(c){c.addEventListener('click',function(){
chips.forEach(function(x){x.setAttribute('aria-pressed',String(x===c))});
var f=c.getAttribute('data-filter');
rows.forEach(function(r){r.hidden=!(f==='all'||r.getAttribute('data-type')===f)});
})});
// ---- QR lightbox
var d=document.createElement('dialog');d.className='lb pay';d.setAttribute('aria-labelledby','lb-t');
var COPYI='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
var SAVEI='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>';
d.innerHTML='<div class="lb-bar"><h2 id="lb-t"></h2><button class="lb-x" type="button" aria-label="Close QR code">&times;</button></div><div class="lb-stage"><img alt=""></div><div class="lb-foot"><div class="lb-info"><p class="h"></p><p class="a"></p></div><div class="lb-actions"><button class="lb-btn" type="button" data-c>'+COPYI+'Copy number</button><button class="lb-btn line" type="button" data-s>'+SAVEI+'Save QR</button><span class="lb-navs"><button class="lb-nav" type="button" data-prev aria-label="Previous method">&#8249;</button><button class="lb-nav" type="button" data-next aria-label="Next method">&#8250;</button></span></div></div>';
document.body.appendChild(d);
var cur=0,opener=null,t=d.querySelector('#lb-t'),img=d.querySelector('img'),h=d.querySelector('.h'),a=d.querySelector('.a');
function show(n){cur=(n+cards.length)%cards.length;var i=info(cards[cur]);t.textContent=i.name+' QR code';img.src=i.qr;img.alt=i.name+' payment QR code';h.innerHTML='Account name: <b></b>';h.querySelector('b').textContent=i.holder;a.innerHTML='Account number: <b></b>';a.querySelector('b').textContent=i.account}
function open(el,from){opener=from;show(cards.indexOf(el));d.showModal()}
document.querySelectorAll('[data-qr-open]').forEach(function(b){b.addEventListener('click',function(){open(b.closest('[data-pay]'),b)})});
d.querySelector('[data-c]').addEventListener('click',function(){doCopy('account',info(cards[cur]))});
d.querySelector('[data-s]').addEventListener('click',function(){
var i=info(cards[cur]);
fetch(i.qr).then(function(r){if(!r.ok)throw 0;return r.blob()}).then(function(bl){var u=URL.createObjectURL(bl),l=document.createElement('a');l.href=u;l.download=i.name.replace(/\s+/g,'-').toLowerCase()+'-qr.'+(bl.type.split('/')[1]||'png');document.body.appendChild(l);l.click();l.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000);say('QR code saved')}).catch(function(){window.open(i.qr,'_blank','noopener');say('Opened the QR image. Save it from the new tab.')})});
d.querySelector('.lb-x').addEventListener('click',function(){d.close()});
if(cards.length<2){d.querySelector('.lb-navs').remove()}
else{d.querySelector('[data-prev]').addEventListener('click',function(){show(cur-1)});
d.querySelector('[data-next]').addEventListener('click',function(){show(cur+1)})}
d.addEventListener('click',function(e){if(e.target===d)d.close()});
d.addEventListener('keydown',function(e){if(e.key==='ArrowLeft')show(cur-1);if(e.key==='ArrowRight')show(cur+1)});
d.addEventListener('close',function(){if(opener)opener.focus()});
})();
