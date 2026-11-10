/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { announceCopied } from '@/lib/copied-event';

/** Writes text to the clipboard, falling back to a hidden textarea where the Clipboard API is blocked. Resolves to success. */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    announceCopied();
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.cssText = 'position:fixed;opacity:0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    if (ok) announceCopied();
    return ok;
  }
}
