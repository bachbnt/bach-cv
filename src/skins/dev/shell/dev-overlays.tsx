/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import dynamic from 'next/dynamic';
import { DevChat } from '@/skins/dev/shell/dev-chat';
import { useDevOverlays } from '@/skins/dev/shell/dev-overlay-context';
import { useOnceTrue } from '@/hooks/use-once-true';

const DevViewer = dynamic(
  () => import('@/skins/dev/shell/dev-viewer').then((m) => m.DevViewer),
  { ssr: false },
);
const DevCvWindow = dynamic(
  () => import('@/skins/dev/shell/dev-cv-window').then((m) => m.DevCvWindow),
  { ssr: false },
);

/**
 * Everything the Dev skin floats above the page: the chat button and window, the picture viewer, the CV window. They live here,
 * once, so they survive a change of page and `DevShell` stays small. The viewer and the CV window load when first opened.
 */
export function DevOverlays() {
  const { viewer, cvOpen } = useDevOverlays();
  const viewerLoaded = useOnceTrue(viewer !== null);
  const cvLoaded = useOnceTrue(cvOpen);
  return (
    <>
      <DevChat />
      {viewerLoaded && <DevViewer />}
      {cvLoaded && <DevCvWindow />}
    </>
  );
}
