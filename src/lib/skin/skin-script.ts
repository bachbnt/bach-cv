/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { DEFAULT_SKIN, SKIN_IDS, SKIN_STORAGE_KEY } from '@/lib/skin/skins';

/** How long the head script waits for the chosen skin before it shows the default look. */
export const SKIN_WATCHDOG_MS = 8000;

/**
 * Runs in <head> before the first paint. The static HTML is the default skin, so a visitor who chose another would see it first:
 * this puts the saved choice (or `?skin=name`, which also saves it) on <html data-skin>, and `globals.css` hides the body until the
 * skin is ready. A watchdog gives the page back after a few seconds if the skin has not come (a chunk that hangs, a script that throws):
 * the default look shows, and the skin still takes over if it arrives later. Plain ES5 text, because it is inlined into the static HTML.
 */
export const SKIN_SCRIPT = `(function(){try{var ids=${JSON.stringify(SKIN_IDS)};var key='${SKIN_STORAGE_KEY}';var s=null;try{var q=new URLSearchParams(location.search).get('skin');if(q&&ids.indexOf(q)>-1)localStorage.setItem(key,q);s=localStorage.getItem(key)}catch(e){}if(s&&s!=='${DEFAULT_SKIN}'&&ids.indexOf(s)>-1){var h=document.documentElement;h.setAttribute('data-skin',s);setTimeout(function(){if(h.hasAttribute('data-skin')&&!h.hasAttribute('data-skin-ready'))h.removeAttribute('data-skin')},${SKIN_WATCHDOG_MS})}}catch(e){}})();`;
