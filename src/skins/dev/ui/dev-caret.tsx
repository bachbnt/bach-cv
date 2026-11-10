/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useLoopGate } from '@/hooks/use-loop-gate';

/** The block caret after the title of a terminal card: it blinks only while it is on screen (decoration, `aria-hidden`). */
export function DevCaret() {
  const gate = useLoopGate();
  return <span ref={gate} className='dv-caret' aria-hidden='true' />;
}
