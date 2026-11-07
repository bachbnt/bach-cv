/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/** The map is drawn twice (the stage and the minimap), so the ids of its gradients and patterns carry a prefix per drawing. */
export const idOf = (prefix: string, key: string): string => `${prefix}-${key}`;
export const refOf = (prefix: string, key: string): string =>
  `url(#${prefix}-${key})`;
