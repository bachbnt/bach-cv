/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import dynamic from 'next/dynamic';
import { useAcOverlays } from '@/skins/academic/shell/overlay-context';
import { AcToast } from '@/skins/academic/shell/ac-toast';
import { useOnceTrue } from '@/skins/academic/shell/use-once-true';

const AcViewer = dynamic(
  () => import('@/skins/academic/shell/ac-viewer').then((m) => m.AcViewer),
  { ssr: false },
);
const AcCvSheet = dynamic(
  () => import('@/skins/academic/shell/ac-cv-sheet').then((m) => m.AcCvSheet),
  { ssr: false },
);
const AcChat = dynamic(
  () => import('@/skins/academic/shell/ac-chat').then((m) => m.AcChat),
  { ssr: false },
);

/**
 * Everything the Academic skin lays over the page: the chat slip, the viewer, the CV sheet and the toast. They live here, once, so they
 * survive a change of page, and each loads when it is first opened.
 */
export function AcOverlays() {
  const { viewer, cvOpen } = useAcOverlays();
  const viewerLoaded = useOnceTrue(viewer !== null);
  const cvLoaded = useOnceTrue(cvOpen);
  return (
    <>
      <AcChat />
      {viewerLoaded && <AcViewer />}
      {cvLoaded && <AcCvSheet />}
      <AcToast />
    </>
  );
}
