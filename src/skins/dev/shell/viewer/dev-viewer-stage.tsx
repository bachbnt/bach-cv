/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef, type PointerEvent } from 'react';

/**
 * The picture: it fits the stage, zooms with the wheel or a double click and, once zoomed, is dragged to pan.
 * The wheel listener is native because React's is passive and could not stop the page from scrolling.
 */
export function DevViewerStage({
  src,
  alt,
  zoom,
  x,
  y,
  onZoomBy,
  onZoomTo,
  onPan,
  onLoad,
}: {
  src: string;
  alt: string;
  zoom: number;
  x: number;
  y: number;
  onZoomBy: (factor: number) => void;
  onZoomTo: (zoom: number) => void;
  onPan: (x: number, y: number) => void;
  onLoad: (image: HTMLImageElement) => void;
}) {
  const image = useRef<HTMLImageElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = image.current;
    if (!element) return;
    if (element.complete && element.naturalWidth) onLoad(element);
    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      onZoomBy(event.deltaY < 0 ? 1.12 : 1 / 1.12);
    };
    element.addEventListener('wheel', onWheel, { passive: false });
    return () => element.removeEventListener('wheel', onWheel);
  }, [src, onLoad, onZoomBy]);

  const onPointerDown = (event: PointerEvent<HTMLImageElement>) => {
    if (zoom <= 1) return;
    drag.current = { x: event.clientX - x, y: event.clientY - y };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const onPointerMove = (event: PointerEvent<HTMLImageElement>) => {
    if (drag.current) {
      onPan(event.clientX - drag.current.x, event.clientY - drag.current.y);
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element -- the picture's own size and a CSS transform drive the layout
    <img
      ref={image}
      src={src}
      alt={alt}
      draggable={false}
      className='max-h-full max-w-full cursor-zoom-in rounded-[6px] bg-white object-contain shadow-[0_14px_44px_rgba(0,0,0,0.5),0_0_0_1px_color-mix(in_srgb,var(--fg)_10%,transparent)] [transition:transform_0.18s_ease] select-none touch-none data-[zoomed]:cursor-grab data-[zoomed]:active:cursor-grabbing'
      data-zoomed={zoom > 1 || undefined}
      style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})` }}
      onLoad={(event) => onLoad(event.currentTarget)}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onDoubleClick={() => onZoomTo(zoom > 1 ? 1 : 2)}
    />
  );
}
