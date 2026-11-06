/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useState } from 'react';

const MIN_ZOOM = 1;
const MAX_ZOOM = 5;

interface View {
  key: string;
  zoom: number;
  x: number;
  y: number;
}

const fresh = (key: string): View => ({ key, zoom: 1, x: 0, y: 0 });

/** The zoom and the pan of the picture on show. A new `key` (another picture) starts from the fit again. */
export function useViewerZoom(key: string) {
  const [state, setState] = useState<View>(() => fresh(key));
  const view = state.key === key ? state : fresh(key);

  const zoomBy = useCallback(
    (factor: number) =>
      setState((prev) => {
        const base = prev.key === key ? prev : fresh(key);
        const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, base.zoom * factor));
        return zoom === 1 ? fresh(key) : { ...base, zoom };
      }),
    [key],
  );
  const zoomTo = useCallback(
    (zoom: number) =>
      setState((prev) => {
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
        return next === 1
          ? fresh(key)
          : { ...(prev.key === key ? prev : fresh(key)), zoom: next };
      }),
    [key],
  );
  const panTo = useCallback(
    (x: number, y: number) =>
      setState((prev) => ({
        ...(prev.key === key ? prev : fresh(key)),
        x,
        y,
      })),
    [key],
  );
  const fit = useCallback(() => setState(fresh(key)), [key]);

  return { ...view, zoomBy, zoomTo, panTo, fit };
}
