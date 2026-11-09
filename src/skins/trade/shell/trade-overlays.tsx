/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import dynamic from 'next/dynamic';
import { useChat } from '@/components/chat/chat-provider';
import { useOnceTrue } from '@/hooks/use-once-true';
import { useTrade } from '@/skins/trade/shell/trade-context';

const TvCvDialog = dynamic(
  () =>
    import('@/skins/trade/shell/overlay-cv-dialog').then((m) => m.TvCvDialog),
  { ssr: false },
);
const TradeChat = dynamic(
  () => import('@/skins/trade/shell/trade-chat').then((m) => m.TradeChat),
  { ssr: false },
);
const SearchPalette = dynamic(
  () =>
    import('@/skins/trade/shell/search-palette').then((m) => m.SearchPalette),
  { ssr: false },
);

/**
 * What the Trade skin floats above the page: the symbol search, the CV window and the chat. Each is loaded the first time it
 * is opened. (The picture viewer and the QR window are opened by the blocks that have the pictures.)
 */
export function TradeOverlays() {
  const { cvOpen, closeCv, searchOpen } = useTrade();
  const { isOpen } = useChat();
  const cvLoaded = useOnceTrue(cvOpen);
  const chatLoaded = useOnceTrue(isOpen);
  const searchLoaded = useOnceTrue(searchOpen);
  return (
    <>
      {searchLoaded && <SearchPalette />}
      {cvLoaded && (
        <TvCvDialog
          open={cvOpen}
          onOpenChange={(open) => {
            if (!open) closeCv();
          }}
        />
      )}
      {chatLoaded && <TradeChat />}
    </>
  );
}
