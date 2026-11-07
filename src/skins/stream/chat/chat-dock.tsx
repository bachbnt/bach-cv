/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { WIDE_QUERY } from '@/skins/stream/config';
import { useMediaQuery } from '@/skins/stream/shell/use-media-query';
import { useStreamChat } from '@/skins/stream/chat/stream-chat-context';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

const HEIGHT = 'h-[min(640px,calc(100dvh-110px))]';

const StreamChatPanel = dynamic(
  () =>
    import('@/skins/stream/chat/stream-chat-panel').then(
      (m) => m.StreamChatPanel,
    ),
  {
    ssr: false,
    loading: () => <StreamSkeleton className={HEIGHT} />,
  },
);

/** The live chat beside the reel of the Projects page, on a wide screen. It is the same conversation as the sheet's. */
export function ChatDock() {
  const { enabled, docked, setDocked, panel } = useStreamChat();
  const wide = useMediaQuery(WIDE_QUERY);
  const here = enabled && wide;

  // while it is on screen the sheet and the chat button of the top bar step aside
  useEffect(() => {
    setDocked(here);
    return () => setDocked(false);
  }, [here, setDocked]);

  if (!enabled || !docked) return null;
  return <StreamChatPanel {...panel} labelled className={HEIGHT} />;
}
