/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/** The words only the Phone skin has for Certificates, Services and Payment. `{name}` is filled in by `fill()`. */
export const phonePayCopy = defineCopy(
  {
    services: {
      /** the action on a service: it starts the message of the form on that topic */
      discuss: 'Discuss',
      discussLabel: 'Discuss {name}',
    },
  },
  {
    services: {
      discuss: 'Trao đổi',
      discussLabel: 'Trao đổi về {name}',
    },
  },
);
