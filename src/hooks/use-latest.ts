/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef } from 'react';

/** A ref that always holds the value of the last committed render, so a long-lived listener reads fresh props without being re-registered. */
export function useLatest<T>(value: T) {
  const latest = useRef(value);
  useEffect(() => {
    latest.current = value;
  });
  return latest;
}
