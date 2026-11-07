/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { LibraryPlaylist } from '@/skins/stream/blocks/library-playlist';
import { StreamPage } from '@/skins/stream/ui/stream-page';

/** Certificates as a playlist page: the card of the playlist (its title is the page's `h1`) beside the numbered list of rows. */
export function CertificatesPage() {
  return (
    <StreamPage page='certificates'>
      <LibraryPlaylist />
    </StreamPage>
  );
}
