/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import dynamic from 'next/dynamic';
import { useChat } from '@/components/chat/chat-provider';
import { useOnceTrue } from '@/skins/travel/shell/overlay-use-once';
import { ChatLauncher } from '@/skins/travel/shell/overlay-chat-launcher';
import { useTravel } from '@/skins/travel/shell/travel-context';

const TlCvDialog = dynamic(
  () =>
    import('@/skins/travel/shell/overlay-cv-dialog').then((m) => m.TlCvDialog),
  { ssr: false },
);
const TravelChat = dynamic(
  () => import('@/skins/travel/shell/travel-chat').then((m) => m.TravelChat),
  { ssr: false },
);

/**
 * What the Travel skin floats above the page: the round Ask BB Bot button, the BB Bot card and the CV window. The card and the window
 * are loaded the first time they are opened and kept after that. (The picture viewer and the QR window are opened by the blocks that
 * have the pictures.)
 */
export function TravelOverlays() {
  const { cvOpen, closeCv } = useTravel();
  const { isOpen } = useChat();
  const cvLoaded = useOnceTrue(cvOpen);
  const chatLoaded = useOnceTrue(isOpen);
  return (
    <>
      <ChatLauncher />
      {cvLoaded && (
        <TlCvDialog
          open={cvOpen}
          onOpenChange={(open) => {
            if (!open) closeCv();
          }}
        />
      )}
      {chatLoaded && <TravelChat />}
    </>
  );
}
