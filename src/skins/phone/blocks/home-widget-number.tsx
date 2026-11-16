/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';

/** The large number of a stat widget of the home screen: the same size in the middle of the years ring and above the bars of the projects. */
export function HomeWidgetNumber({ children }: { children: ReactNode }) {
  return (
    <p className='text-[36px]/none font-extrabold tracking-[-0.02em] tabular-nums'>
      {children}
    </p>
  );
}
