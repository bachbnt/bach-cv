/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { LibraryJoin } from '@/skins/stream/blocks/library-join';
import { StreamPage } from '@/skins/stream/ui/stream-page';

/** Payment as the Join page of a channel: the methods as membership levels, with copy buttons, QR codes in the picture viewer and the paused state. */
export function PaymentPage() {
  return (
    <StreamPage page='payment'>
      <LibraryJoin />
    </StreamPage>
  );
}
