/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { defineCopy } from '@/lib/i18n/define-copy';

/** Words only the Services page of the Moba skin has (the small headings and the shop button). The page's own text is the Standard copy. */
export const mobaServicesCopy = defineCopy(
  {
    kickers: {
      shop: 'Shop',
      order: 'Order desk',
    },
    /** the button of a service in the shop: it does what the topic chip of the same name does */
    choose: 'Choose this topic',
  },
  {
    kickers: {
      shop: 'Cửa hàng',
      order: 'Quầy đặt hàng',
    },
    choose: 'Chọn chủ đề này',
  },
);
