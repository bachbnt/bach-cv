/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import dynamic from 'next/dynamic';

/** The picture windows of the skin (the viewer, the screenshots and the QR window), loaded the first time a visitor opens one. The blocks that open them keep the props of the Standard windows. */
export const LazyLightbox = dynamic(
  () => import('@/skins/travel/shell/overlay-viewer').then((m) => m.TlViewer),
  { ssr: false },
);
export const LazyScreenshotsDialog = dynamic(
  () =>
    import('@/skins/travel/shell/overlay-screenshots').then(
      (m) => m.TlScreenshots,
    ),
  { ssr: false },
);
export const LazyPaymentQrDialog = dynamic(
  () =>
    import('@/skins/travel/shell/overlay-qr-dialog').then((m) => m.TlQrDialog),
  { ssr: false },
);
