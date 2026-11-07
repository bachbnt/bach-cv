/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';

/**
 * The one toolbar of the picture windows (viewer, screenshots, certificates, QR ticket): the zoom on the left, then the actions the
 * window brings (Open PDF, Copy number, Save QR), and at the right end the way through the pictures (previous, counter, next). A part
 * a window does not have is left out. It wraps on a narrow screen.
 */
export function TlToolbar({
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
      className='flex flex-none flex-wrap items-center gap-x-1.5 gap-y-2 border-b border-tl-line px-3 py-2'
    >
      {/* on a phone the way through the pictures stands beside the zoom and the actions take the next line */}
      {zoom && <div className='order-1 flex items-center gap-1'>{zoom}</div>}
      {actions && (
        <div className='order-3 flex min-w-0 flex-wrap items-center gap-1.5 min-[701px]:order-2'>
          {actions}
        </div>
      )}
      {end && <div className='order-2 ml-auto min-[701px]:order-3'>{end}</div>}
    </div>
  );
}
