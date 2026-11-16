/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { errorsCopy } from '@/content/copy/errors';
import type { Lang } from '@/lib/content/schema';
import { recover, savedLang } from '@/lib/error/recover';

// The last screen: it shows when the root layout, a provider or a screen for an error threw, and nothing is left to catch an error of its own. So
// it is plain markup with its own styles: no skin, no theme tokens, no provider, no icon library, no data. Light or dark follows the browser.
const CSS = `
html,body{margin:0;height:100%}
.ge{min-height:100%;display:flex;align-items:center;justify-content:center;padding:16px;box-sizing:border-box;
  font-family:system-ui,-apple-system,"Segoe UI",sans-serif;background:#fff;color:#111}
.ge *{box-sizing:border-box}
.ge-box{width:100%;max-width:28rem;text-align:center}
.ge-icon{display:block;width:44px;height:44px;margin:0 auto 14px}
.ge h1{font-size:24px;line-height:1.2;margin:0 0 8px}
.ge p{margin:0 0 22px;opacity:.72;font-size:15px;line-height:1.5}
.ge-btns{display:flex;gap:10px;justify-content:center}
.ge-b{display:inline-flex;align-items:center;justify-content:center;height:44px;padding:0 20px;border-radius:10px;
  font:600 15px system-ui,sans-serif;text-decoration:none;cursor:pointer;color:inherit;background:none;border:1px solid currentColor}
.ge-b.p{background:#111;color:#fff;border-color:#111}
.ge-site{margin-top:28px;font-size:12px;opacity:.45}
@media (prefers-color-scheme:dark){.ge{background:#0d0e11;color:#f2f2f2}.ge-b.p{background:#f2f2f2;color:#0d0e11;border-color:#f2f2f2}}
@media (max-width:480px){.ge-btns{flex-direction:column}}
`;

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  // the server says English; in the browser the saved language, read once (nothing changes it while this screen is up)
  const lang = useSyncExternalStore<Lang>(
    () => () => {},
    () => savedLang(),
    () => 'en',
  );
  useEffect(() => {
    console.error(error);
  }, [error]);
  const words = errorsCopy[lang].plain;
  return (
    <html lang={lang}>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>{words.title}</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <div className='ge' role='alert'>
          <div className='ge-box'>
            <svg
              className='ge-icon'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.6'
              strokeLinecap='round'
              strokeLinejoin='round'
              aria-hidden='true'
            >
              <path d='M12 3 2 20h20L12 3Z' />
              <path d='M12 10v4M12 17.2v.01' />
            </svg>
            <h1>{words.title}</h1>
            <p>{words.body}</p>
            <div className='ge-btns'>
              <button type='button' className='ge-b p' onClick={recover}>
                {words.retry}
              </button>
              {/* a plain link on purpose: the router may be what failed, so this loads the home page from the server */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a className='ge-b' href='/'>
                {words.home}
              </a>
            </div>
            <div className='ge-site'>bachbnt.dev</div>
          </div>
        </div>
      </body>
    </html>
  );
}
