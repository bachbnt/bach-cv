/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import dynamic from 'next/dynamic';
import { useChat } from '@/components/chat/chat-provider';
import { useOnceTrue } from '@/hooks/use-once-true';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';

const PhViewer = dynamic(
  () => import('@/skins/phone/shell/ph-viewer').then((m) => m.PhViewer),
  { ssr: false },
);
const PhCvSheet = dynamic(
  () => import('@/skins/phone/shell/ph-cv-sheet').then((m) => m.PhCvSheet),
  { ssr: false },
);
const PhConnectSheet = dynamic(
  () =>
    import('@/skins/phone/shell/ph-connect-sheet').then(
      (m) => m.PhConnectSheet,
    ),
  { ssr: false },
);
const PhShade = dynamic(
  () => import('@/skins/phone/shell/ph-shade').then((m) => m.PhShade),
  { ssr: false },
);
const PhChat = dynamic(
  () => import('@/skins/phone/shell/ph-chat').then((m) => m.PhChat),
  { ssr: false },
);

/**
 * Everything the Phone skin lays over the page: the chat, the viewer and the sheets, each in the layer over the screen. They live here, once, so they survive a
 * change of page, and each loads when it is first opened.
 */
export function PhOverlays() {
  const { viewer, cvOpen, connectOpen, settingsOpen } = usePhOverlays();
  const { isOpen: chatOpen } = useChat();
  const viewerLoaded = useOnceTrue(viewer !== null);
  const cvLoaded = useOnceTrue(cvOpen);
  const connectLoaded = useOnceTrue(connectOpen);
  const settingsLoaded = useOnceTrue(settingsOpen);
  const chatLoaded = useOnceTrue(chatOpen);
  return (
    <>
      {chatLoaded && <PhChat />}
      {viewerLoaded && <PhViewer />}
      {cvLoaded && <PhCvSheet />}
      {connectLoaded && <PhConnectSheet />}
      {settingsLoaded && <PhShade />}
    </>
  );
}
