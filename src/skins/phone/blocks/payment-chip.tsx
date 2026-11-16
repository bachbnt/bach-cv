/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The chip of a bank card, drawn: decoration of the card, so it is hidden from readers. */
export function PaymentChip({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 44 34'
      className={className}
      fill='none'
      strokeWidth='1.5'
    >
      <rect
        x='1'
        y='1'
        width='42'
        height='32'
        rx='7'
        className='fill-ph-tile-certificates-a stroke-ph-tile-certificates-b'
      />
      <path
        d='M1 12h14a4 4 0 0 1 4 4v2a4 4 0 0 1-4 4H1M43 12H29a4 4 0 0 0-4 4v2a4 4 0 0 0 4 4h14M15 1v10M29 1v10M15 23v10M29 23v10'
        className='stroke-ph-tile-certificates-b'
      />
    </svg>
  );
}
