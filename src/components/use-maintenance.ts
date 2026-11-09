/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { useLive } from '@/hooks/use-live';
import { localize } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useContentQuery } from '@/lib/query/use-content';
import { emailContact } from '@/lib/derive/contacts';

export interface Maintenance {
  /** the switch of `site/live`: when it is on, the whole site is replaced by the maintenance screen */
  enabled: boolean;
  /** the owner's message in the visitor's language, or the default words */
  message: string;
  /** the way to reach the owner sooner */
  email?: { label: string; url: string };
}

export function useMaintenance(): Maintenance {
  const { maintenance } = useLive();
  const { lang } = useLang();
  const copy = useCopy(commonCopy);
  const { data: contacts = [] } = useContentQuery('contacts');
  const email = emailContact(contacts);
  return {
    enabled: maintenance.enabled,
    message: localize(maintenance, lang).message || copy.maintenance.body,
    email: email ? { label: email.label, url: email.url } : undefined,
  };
}
