/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import dynamic from 'next/dynamic';

/** The picture windows of the skin (the viewer, the screenshots and the QR window, built on `TvDialogShell`), loaded the first time a visitor opens one. The blocks that open them keep the props of the Standard windows. */
export const LazyLightbox = dynamic(
  () => import('@/skins/trade/shell/overlay-viewer').then((m) => m.TvViewer),
  { ssr: false },
);
export const LazyScreenshotsDialog = dynamic(
  () =>
    import('@/skins/trade/shell/overlay-screenshots').then(
      (m) => m.TvScreenshots,
    ),
  { ssr: false },
);
export const LazyPaymentQrDialog = dynamic(
  () =>
    import('@/skins/trade/shell/overlay-qr-dialog').then((m) => m.TvQrDialog),
  { ssr: false },
);
