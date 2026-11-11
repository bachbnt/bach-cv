/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { PREFS_CACHE_KEY } from '@/lib/preference/remote';
import { DEFAULT_SKIN, SKIN_IDS, SKIN_STORAGE_KEY } from '@/lib/skin/skins';
import { THEME_STORAGE_KEY } from '@/lib/theme/theme-script';
import { THEMES } from '@/lib/theme/themes';

/** How long the head script waits for the chosen skin before it shows the default look. */
export const SKIN_WATCHDOG_MS = 8000;

/**
 * Runs in <head> before the first paint and settles the skin and the colour theme, in the way `preference.ts` says (the owner's force, the
 * visitor's `?skin=` / `?theme=` and saved choice, the owner's default, the fallbacks; what the owner left out is skipped), from the last
 * `site/live` `prefs` that this browser read. The static HTML is the default skin and the language of the site, so this puts the skin on
 * <html data-skin>, which `globals.css` keeps the body hidden for until the skin is ready, and the theme as the `dark` class and as
 * `data-theme` (`system`, `light` or `dark`, so the header button shows the right icon with CSS alone). A watchdog gives the page back after
 * a few seconds if the skin has not come (a chunk that hangs, a script that throws): the default look shows, and the skin still takes
 * over if it arrives later. It keeps nothing: `?skin=` and `?theme=` are used for the page, and are kept by the providers once what the owner
 * said has been read (a first visit does not know it yet, and a force must not be undone by a link). The language needs no head script: it is
 * settled after hydration. Plain ES5 text, because it is inlined into
 * the static HTML; `tests/unit/lib/preference-script.test.ts` runs it against `preference.ts`.
 */
export const PREFS_SCRIPT = `(function(){try{
var D=document.documentElement;
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function has(a,v){return !!a&&a.indexOf(v)>-1}
var cache={};try{cache=JSON.parse(get('${PREFS_CACHE_KEY}')||'{}')||{}}catch(e){}
var P=null;try{P=new URLSearchParams(location.search)}catch(e){}
function param(n){return P?P.get(n):null}
function pick(all,keep,r,url,saved,fb){
r=r||{};var off=r.off||[];var opts=[];var i;
for(i=0;i<all.length;i++){if(all[i]===keep||!has(off,all[i]))opts.push(all[i])}
var f=has(opts,r.force)?r.force:null;
var c=[url,saved,r['default']].concat(fb||[]);var v=null;
for(i=0;i<c.length;i++){if(has(opts,c[i])){v=c[i];break}}
return{v:f||v||keep,o:opts,f:!!f}}
try{var sk=param('skin');var S=pick(${JSON.stringify(SKIN_IDS)},'${DEFAULT_SKIN}',cache.skin,sk,get('${SKIN_STORAGE_KEY}'),[]);
if(S.v!=='${DEFAULT_SKIN}'){D.setAttribute('data-skin',S.v);setTimeout(function(){if(D.hasAttribute('data-skin')&&!D.hasAttribute('data-skin-ready'))D.removeAttribute('data-skin')},${SKIN_WATCHDOG_MS})}}catch(e){}
try{var T=cache.theme||{};var toff=T.off||[];var noLight=has(toff,'light');var noDark=has(toff,'dark');var tv;
if(noLight!==noDark){tv=noLight?'dark':'light'}else{
var th=param('theme');
var R=pick(${JSON.stringify(THEMES)},'light',{'default':T['default'],force:T.force,off:has(toff,'system')?['system']:[]},th,get('${THEME_STORAGE_KEY}'),['system']);
tv=R.v}
D.setAttribute('data-theme',tv);
if(tv==='dark'||(tv==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches))D.classList.add('dark')}catch(e){}
}catch(e){}})();`;
