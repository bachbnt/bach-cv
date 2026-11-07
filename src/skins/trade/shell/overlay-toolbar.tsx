/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';

/**
 * The one toolbar of every window of the skin (picture viewer, screenshots, certificates, QR code, CV): the zoom on the left, then a
 * separator and the actions of the window (Open PDF, Copy number, Download PDF), and at the right end the way through the pictures
 * or pages (previous, counter, next). A part that a window does not have is simply left out. It wraps on a narrow screen.
 */
export function TvToolbar({
  label,
  zoom,
  actions,
  end,
}: {
  /** accessible name of the toolbar */
  label: string;
  zoom?: ReactNode;
  actions?: ReactNode;
  end?: ReactNode;
}) {
  return (
    <div
      role='toolbar'
      aria-label={label}
      className='flex min-h-10 flex-none flex-wrap items-center gap-x-0.5 gap-y-0.5 border-b border-tv-line px-2 py-0.5 pointer-coarse:min-h-12'
    >
      {zoom}
      {actions && (
        <div className='ml-2 flex min-w-0 flex-wrap items-center gap-1 border-l border-tv-line pl-2 [&_a]:h-8 [&_button[data-slot=tv-button]]:h-8'>
          {actions}
        </div>
      )}
      <span className='flex-1' />
      {end}
    </div>
  );
}
