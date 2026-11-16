/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The contactless mark of a bank card (three arcs), drawn: decoration, so it is hidden from readers. */
export function PaymentContactless({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden='true'
      viewBox='0 0 28 28'
      className={className}
      fill='none'
      strokeWidth='2.4'
      strokeLinecap='round'
    >
      <path
        d='M8 9.5a6.5 6.5 0 0 1 0 9M13 6.5a11 11 0 0 1 0 15M18 3.5a15.5 15.5 0 0 1 0 21'
        className='stroke-ph-on-tile'
      />
    </svg>
  );
}
