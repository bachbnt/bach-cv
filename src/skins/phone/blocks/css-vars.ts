/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties } from 'react';

/** A `style` that sets custom properties, which `CSSProperties` does not know. */
export type CssVars = CSSProperties & Record<`--${string}`, string>;

/** The wait before a part of a widget arrives (`css/stats.css` reads it as `--ph-delay`). */
export const delayStyle = (ms: number): CssVars => ({
  '--ph-delay': `${ms}ms`,
});
