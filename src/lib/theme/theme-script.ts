/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** localStorage key of the visitor's choice: `light`, `dark`, or nothing for "follow the system". */
export const THEME_STORAGE_KEY = 'bach-cv-theme';

/**
 * Runs in <head> before the first paint, so a visitor who prefers dark never sees a white flash. It only reads the saved
 * choice and the system setting and puts the `dark` class on <html>, and the choice itself in `data-theme` (`system`, `light`
 * or `dark`) so the header button can show the right icon with CSS alone; <ThemeProvider> takes over after hydration.
 * Kept as plain ES5 text because it is inlined into the static HTML.
 */
export const THEME_SCRIPT = `(function(){try{var t=null;try{t=localStorage.getItem('${THEME_STORAGE_KEY}')}catch(e){}var c=t==='dark'||t==='light'?t:'system';document.documentElement.setAttribute('data-theme',c);var d=c==='dark'||(c==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark')}catch(e){}})();`;
