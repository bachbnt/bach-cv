(function(){
var MAX=20,MAXLEN=500;
var state=new URLSearchParams(location.search).get('chat'); // open | typing | error | limit (design review only)
var REPLIES={
'What do you do at FPT?':'I lead a team of 5 developers delivering 13 business modules (47 functions) across 26+ repositories for 9PP, the Yamato Transport Android app. I also write and review Detail Designs and build Claude Code workflows for bug fixing, code review and design-to-code sync.',
'Tell me about your AI tooling':'The main one is a bug-fixing pipeline on Claude Code (14 skills, 2 agents). It polls Jira, traces the root cause across source, design docs and device logs, then opens a fix MR, a vendor Q&A or paired design and code MRs. There is also a Teams bot, MR review and design-sync agents, and a detekt-fix workflow.',
'Which stack do you use?':'Mobile: Kotlin, KMM, React Native, Flutter and Swift, with Jetpack Compose, MVVM and Clean Architecture. Tooling: Python and Claude Code. Web: ReactJS, VueJS and NodeJS.',
'How can I contact you?':'Email bachbnt@gmail.com, or find me on LinkedIn and GitHub (bachbnt). I am based in Ho Chi Minh City.'
};
var FALLBACK='This is a design prototype, so I can only answer the suggested questions. In the real app, replies come from the chat proxy.';
var icoChat='<svg class="ic-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/></svg>';
var icoClose='<svg class="ic-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
var icoSend='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
var box=document.createElement('div');box.className='chat';box.setAttribute('data-open','false');
box.innerHTML='<section class="chat-panel" role="dialog" aria-label="BB Bot, AI assistant" hidden>'+
'<header class="chat-head"><img src="logo.png" alt=""><div><strong>BB Bot</strong><small>AI assistant</small></div><button class="chat-x" type="button" aria-label="Close chat"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg></button></header>'+
'<div class="chat-msgs" role="log" aria-live="polite"></div>'+
'<form class="chat-form"><textarea rows="1" maxlength="'+MAXLEN+'" placeholder="Ask me anything" aria-label="Message"></textarea><button class="chat-send" type="submit" aria-label="Send chat message" disabled>'+icoSend+'</button></form>'+
'<p class="chat-foot"><span class="chat-count"></span><span>AI answers may be inaccurate.</span></p>'+
'</section><button class="chat-fab" type="button" aria-expanded="false" aria-label="Open chat">'+icoChat+icoClose+'</button>';
document.body.appendChild(box);
var panel=box.querySelector('.chat-panel'),msgs=box.querySelector('.chat-msgs'),form=box.querySelector('.chat-form'),ta=form.querySelector('textarea'),send=form.querySelector('.chat-send'),fab=box.querySelector('.chat-fab'),count=box.querySelector('.chat-count');
var used=0,busy=false,asked={};
function scroll(){msgs.scrollTop=msgs.scrollHeight}
function bubble(cls,text){var d=document.createElement('div');d.className='chat-b '+cls;d.textContent=text;msgs.appendChild(d);scroll();return d}
function typing(){var d=document.createElement('div');d.className='chat-b bot';d.innerHTML='<span class="chat-dots" aria-label="BB Bot is typing"><i></i><i></i><i></i></span>';msgs.appendChild(d);scroll();return d}
function clearSugg(){var s=msgs.querySelector('.chat-sugg');if(s)s.remove()}
function showSugg(){clearSugg();if(used>=MAX)return;var rest=Object.keys(REPLIES).filter(function(q){return !asked[q]});if(!rest.length)return;
var s=document.createElement('div');s.className='chat-sugg';
rest.forEach(function(q){var b=document.createElement('button');b.type='button';b.textContent=q;b.addEventListener('click',function(){ask(q)});s.appendChild(b)});
msgs.appendChild(s);scroll()}
function updateCount(){count.textContent=used+'/'+MAX+' messages'}
function limit(){var l=document.createElement('p');l.className='chat-limit';l.textContent='Message limit reached';form.replaceWith(l)}
function setOpen(v,focus){box.setAttribute('data-open',String(v));fab.setAttribute('aria-expanded',String(v));fab.setAttribute('aria-label',v?'Close chat':'Open chat');panel.hidden=!v;if(v&&focus!==false){var t=box.querySelector('textarea');t&&t.focus()}}
function ask(text){
text=text.trim().slice(0,MAXLEN);if(!text||busy||used>=MAX)return;
clearSugg();asked[text]=true;bubble('user',text);used++;updateCount();ta.value='';ta.style.height='auto';send.disabled=true;busy=true;if(document.activeElement===document.body)ta.focus();
var t=typing();
setTimeout(function(){t.remove();bubble('bot',REPLIES[text]||FALLBACK);busy=false;if(used>=MAX)limit();else showSugg()},1200);
}
function showError(){var d=bubble('err','Something went wrong');var b=document.createElement('button');b.type='button';b.textContent='Try again';d.appendChild(b)}
bubble('bot','Hi, I\'m BB Bot. How can I help?');
showSugg();
updateCount();
form.addEventListener('submit',function(e){e.preventDefault();ask(ta.value)});
ta.addEventListener('input',function(){send.disabled=!ta.value.trim()||busy;ta.style.height='auto';ta.style.height=Math.min(ta.scrollHeight,96)+'px'});
ta.addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask(ta.value)}});
fab.addEventListener('click',function(){setOpen(panel.hidden)});
box.querySelector('.chat-x').addEventListener('click',function(){setOpen(false);fab.focus()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden){setOpen(false);fab.focus()}});
document.querySelectorAll('a').forEach(function(a){if(/BB Bot/i.test(a.textContent)&&!a.closest('.chat')&&!a.closest('dialog'))a.addEventListener('click',function(e){e.preventDefault();setOpen(true)})});
window.__openChat=function(){setOpen(true)};
// design-review states: ?chat=open|typing|error|limit
if(state){setOpen(true,false);
if(state==='typing'){clearSugg();bubble('user','Tell me about your AI tooling');used=1;updateCount();typing()}
if(state==='error'){clearSugg();bubble('user','Which stack do you use?');used=1;updateCount();showError()}
if(state==='limit'){clearSugg();bubble('user','How can I contact you?');bubble('bot',REPLIES['How can I contact you?']);used=MAX;updateCount();limit()}}
})();
