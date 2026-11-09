/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/**
 * Words of the Travel Payment page (the ticket counter) that Standard has no word for. The kicker and the window number are decoration
 * in the voice of a trip; every Standard word of the page (title, note, labels, toasts) stays `paymentCopy`. `{n}` is filled with `fill`.
 */
export const travelDeskCopy = defineCopy(
  {
    payment: {
      kicker: 'Ticket counter',
      window: 'Window {n}',
      closed: 'Counter closed',
    },
  },
  {
    payment: {
      kicker: 'Quầy vé',
      window: 'Quầy {n}',
      closed: 'Quầy đã đóng',
    },
  },
);
