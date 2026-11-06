/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

interface ImageInfo {
  src: string;
  width: number;
  height: number;
  bytes: number;
}

const empty = (src: string): ImageInfo => ({
  src,
  width: 0,
  height: 0,
  bytes: 0,
});

const formatBytes = (bytes: number) =>
  bytes >= 1048576
    ? `${(bytes / 1048576).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/**
 * What the status line says about the picture: its size in pixels, its type and, when the server tells, its weight.
 * The pixels come from the loaded image; the weight from a HEAD request, which a server may refuse (then it is left out).
 */
export function useImageInfo(src: string) {
  const [info, setInfo] = useState<ImageInfo>(() => empty(src));
  const current = info.src === src ? info : empty(src);

  const onLoad = useCallback(
    (image: HTMLImageElement) =>
      setInfo((prev) => ({
        ...(prev.src === src ? prev : empty(src)),
        width: image.naturalWidth,
        height: image.naturalHeight,
      })),
    [src],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetch(src, { method: 'HEAD', signal: controller.signal })
      .then((response) => {
        const bytes = Number(response.headers.get('content-length'));
        if (bytes > 0) {
          setInfo((prev) => ({
            ...(prev.src === src ? prev : empty(src)),
            bytes,
          }));
        }
      })
      .catch(() => {
        // refused (a host that does not answer a HEAD, or the policy of the site): the weight is left out
      });
    return () => controller.abort();
  }, [src]);

  const type = (src.split('?')[0].split('.').pop() ?? '').toUpperCase();
  const text = [
    current.width ? `${current.width} × ${current.height}` : '…',
    type,
    current.bytes ? formatBytes(current.bytes) : '',
  ]
    .filter(Boolean)
    .join(' · ');

  return { text, onLoad };
}
