/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties } from 'react';

/** A style object that sets custom properties (`--i`, `--c`...), which `CSSProperties` does not know, without a cast at every use. */
export const cssVars = (
  vars: Record<`--${string}`, string | number | undefined>,
  style?: CSSProperties,
): CSSProperties => ({ ...style, ...vars });
