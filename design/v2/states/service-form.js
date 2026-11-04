(function(){
var MAXNAME=100,MAXMSG=1000,WARN=900;
var TEMPLATES={
'App Development':"Hi Bach, I'm looking for help with a mobile app. What I have in mind: ",
'Web Development':"Hi Bach, I'd like a website or web app built. What I have in mind: ",
'Open Source':"Hi Bach, I'd like to collaborate on an open source project: ",
'Programming Teaching':"Hi Bach, I'm interested in programming lessons or mentoring: ",
'Blog Writing':"Hi Bach, I'd like to talk about technical writing: "
};
var card=document.querySelector('.cta-formcard'); if(!card)return;
var live=document.getElementById('cta-live');
var FORM_HTML=card.innerHTML;                 // pristine form, used to reset without reloading the page
var chips=[].slice.call(document.querySelectorAll('.cta-chips .chip'));
var topic='',lastTemplate='',form,name,email,msg,send,count,fail;
var FORCE_FAIL=/[?&]form=error/.test(location.search);   // design review: ?form=error shows the failure state
function say(t){live.textContent='';setTimeout(function(){live.textContent=t},30)}
function bind(){
form=document.getElementById('cta-form');name=form.elements.name;email=form.elements.email;msg=form.elements.message;
send=form.querySelector('.send');count=form.querySelector('.count');fail=form.querySelector('.fail');
msg.addEventListener('input',update);
[name,email,msg].forEach(function(el){el.addEventListener('input',function(){if(el.getAttribute('aria-invalid')==='true')err(el,'')})});
form.addEventListener('submit',onSubmit);
update();
}
function err(el,text){document.getElementById('e-'+el.name).textContent=text||'';el.setAttribute('aria-invalid',text?'true':'false')}
function update(){var n=msg.value.length;count.textContent=n>=MAXMSG?'Limit reached, '+n+'/'+MAXMSG:n+'/'+MAXMSG;count.classList.toggle('warn',n>=WARN)}
function setMessage(v){msg.value=v;update()}
// topic chips: starting text follows the chosen topic and keeps whatever the visitor already typed after it
chips.forEach(function(c){c.addEventListener('click',function(){
var t=c.getAttribute('data-topic'),on=c.getAttribute('aria-pressed')!=='true',next=on?(TEMPLATES[t]||''):'';
chips.forEach(function(x){x.setAttribute('aria-pressed','false')});
var v=msg.value;
if(!v.trim()){setMessage(next)}
else if(lastTemplate&&v.indexOf(lastTemplate)===0){setMessage(next+v.slice(lastTemplate.length))}   // swap the opener, keep their words
lastTemplate=next;topic=on?t:'';
if(on)c.setAttribute('aria-pressed','true');
msg.focus();msg.setSelectionRange(msg.value.length,msg.value.length);
})});
function validate(){
var bad=[];
if(!name.value.trim()){err(name,'Name is required');bad.push('Name')}else err(name,'');
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())){err(email,'Enter a valid email so I can reply');bad.push('Email')}else err(email,'');
if(!msg.value.trim()){err(msg,'Message is required');bad.push('Message')}
else if(lastTemplate&&msg.value.trim()===lastTemplate.trim()){err(msg,'Add a few details about what you need');bad.push('Message')}
else err(msg,'');
if(bad.length){say(bad.length+(bad.length===1?' field needs':' fields need')+' attention: '+bad.join(', '));var first=form.querySelector('[aria-invalid="true"]');first&&first.focus()}
return !bad.length}
// design prototype: stands in for useSendMessage().mutateAsync(payload) -> Firestore `message`
// (email and topic need the model, zod schema and Firestore rules to allow them)
function deliver(payload){return new Promise(function(res,rej){setTimeout(function(){FORCE_FAIL?rej(new Error('network')):res()},1100)})}
function onSubmit(e){
e.preventDefault();
if(send.disabled)return;
fail.hidden=true;
if(!validate())return;
var payload={name:name.value.trim().slice(0,MAXNAME),email:email.value.trim(),topic:topic,message:msg.value.trim().slice(0,MAXMSG)};
window.__lastPayload=payload;
send.disabled=true;form.setAttribute('aria-busy','true');send.innerHTML='<span class="spin" aria-hidden="true"></span>Sending';say('Sending your message');
deliver(payload).then(function(){success(payload)},function(){
send.disabled=false;form.removeAttribute('aria-busy');send.textContent='Try again';fail.hidden=false;say('Message not sent. Check your connection and try again.');send.focus();
});
}
function success(p){
card.innerHTML='<div class="cta-ok"><span class="tick" aria-hidden="true"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5 9-10"/></svg></span><h3 tabindex="-1">Message sent</h3><p></p><button class="ask" type="button" id="again">Send another message</button></div>';
card.querySelector('p').textContent='Thanks, '+p.name+'. I\'ll reply to '+p.email+'.';
var h=card.querySelector('h3');h.focus();say('Message sent. I will reply to '+p.email);
document.getElementById('again').addEventListener('click',function(){
card.innerHTML=FORM_HTML;lastTemplate='';topic='';chips.forEach(function(x){x.setAttribute('aria-pressed','false')});bind();document.getElementById('f-name').focus();
});
}
var askBtn=document.querySelector('.cta-band .ask');
if(askBtn)askBtn.addEventListener('click',function(){if(window.__openChat)window.__openChat();else{var f=document.querySelector('.chat-fab');f&&f.click()}});
bind();
})();
