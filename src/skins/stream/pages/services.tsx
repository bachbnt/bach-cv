/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { LibraryCommunity } from '@/skins/stream/blocks/library-community';
import { StreamPage } from '@/skins/stream/ui/stream-page';

/** Services as the Community tab of a channel: the services as posts, the contact form as the comment composer. */
export function ServicesPage() {
  return (
    <StreamPage page='services'>
      <LibraryCommunity />
    </StreamPage>
  );
}
