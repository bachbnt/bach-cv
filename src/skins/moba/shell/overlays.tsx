/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import dynamic from 'next/dynamic';
import { ChatWindow } from '@/skins/moba/shell/chat-window';
import { useOverlays } from '@/skins/moba/shell/overlay-context';
import { Toast } from '@/skins/moba/shell/toast';
import { useOnceTrue } from '@/skins/moba/shell/use-once-true';

const Viewer = dynamic(
  () => import('@/skins/moba/shell/viewer').then((m) => m.Viewer),
  { ssr: false },
);
const CvWindow = dynamic(
  () => import('@/skins/moba/shell/cv-window').then((m) => m.CvWindow),
  { ssr: false },
);
const KeysDialog = dynamic(
  () => import('@/skins/moba/shell/keys-dialog').then((m) => m.KeysDialog),
  { ssr: false },
);

/**
 * Everything the Moba skin floats above the page: the chat window, the picture viewer, the CV window, the key list and the toast. They
 * live here, once, so they survive a change of page, and each window's code loads when it is first opened.
 */
export function Overlays() {
  const { viewer, cvOpen, keysOpen } = useOverlays();
  const viewerLoaded = useOnceTrue(viewer !== null);
  const cvLoaded = useOnceTrue(cvOpen);
  const keysLoaded = useOnceTrue(keysOpen);
  return (
    <>
      <ChatWindow />
      {viewerLoaded && <Viewer />}
      {cvLoaded && <CvWindow />}
      {keysLoaded && <KeysDialog />}
      <Toast />
    </>
  );
}
