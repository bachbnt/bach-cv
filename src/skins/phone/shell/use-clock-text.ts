/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLang } from '@/lib/i18n/language';
import { useClockMinute } from '@/skins/phone/shell/use-clock';

/** The time of the status bar (`14:06`) in the language of the page, `''` until the page has a clock. */
export function useClockText(): string {
  const { lang } = useLang();
  const minute = useClockMinute();
  return minute
    ? new Date(minute * 60_000).toLocaleTimeString(lang, {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';
}
