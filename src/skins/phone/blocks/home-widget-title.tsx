/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';

/** The small title of a widget of the home screen (the years, the projects); the widgets and their skeletons share it. */
export function HomeWidgetTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className='text-[12px]/[1.3] font-semibold tracking-[0.06em] text-ph-mute uppercase'>
      {children}
    </h2>
  );
}
