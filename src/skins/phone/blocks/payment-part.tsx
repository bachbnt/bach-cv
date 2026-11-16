/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useId, type ReactNode } from 'react';

/** A part of the Payment page with its own large heading (the featured methods, "More ways to pay"). */
export function PaymentPart({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const id = useId();
  return (
    <section aria-labelledby={id} className='mt-10'>
      <h2
        id={id}
        className='mb-4 px-1 text-[22px]/[1.2] font-bold tracking-[-0.01em]'
      >
        {title}
      </h2>
      {children}
    </section>
  );
}
