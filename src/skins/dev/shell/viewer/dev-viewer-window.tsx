/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { useState, type KeyboardEvent, type MouseEvent } from 'react';
import { copyToClipboard } from '@/lib/copy-to-clipboard';
import { DialogDescription } from '@/components/ui/dialog';
import { devOverlaysCopy } from '@/content/copy/dev-overlays';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { mono } from '@/skins/dev/fonts';
import {
  useDevOverlays,
  type ViewerItem,
} from '@/skins/dev/shell/dev-overlay-context';
import { DevViewerInfo } from '@/skins/dev/shell/viewer/dev-viewer-info';
import { DevViewerStage } from '@/skins/dev/shell/viewer/dev-viewer-stage';
import { DevViewerStatus } from '@/skins/dev/shell/viewer/dev-viewer-status';
import { DevViewerThumbs } from '@/skins/dev/shell/viewer/dev-viewer-thumbs';
import { DevViewerTools } from '@/skins/dev/shell/viewer/dev-viewer-tools';
import { imageFileName, saveImage } from '@/skins/dev/shell/viewer/save-image';
import { useImageInfo } from '@/skins/dev/shell/viewer/use-image-info';
import { useViewerZoom } from '@/skins/dev/shell/viewer/use-viewer-zoom';
import {
  DevWindow,
  DevWindowBar,
  DevWindowDots,
  DevWindowSub,
  DevWindowTitle,
  windowPopupClass,
} from '@/skins/dev/shell/window-chrome';

/** The round buttons at the sides of the picture. */
const NAV_BUTTON =
  'mx-auto grid size-[38px] cursor-pointer place-items-center rounded-full border border-line-2 bg-[color-mix(in_srgb,var(--chrome)_90%,transparent)] text-head [transition:transform_0.2s,border-color_0.2s] hover:border-signal hover:[transform:scale(1.08)] pointer-coarse:size-11';

/** The window of the viewer: the title bar, the picture with its neighbours, the tags and the status line. */
export function DevViewerWindow({
  items,
  index,
}: {
  items: ViewerItem[];
  index: number;
}) {
  const { setViewerIndex, closeViewer, say } = useDevOverlays();
  const copy = useCopy(devOverlaysCopy).viewer;
  const [maximized, setMaximized] = useState(false);
  const [bare, setBare] = useState(false);
  const item = items[index] ?? items[0];
  const zoom = useViewerZoom(`${index}:${item.src}`);
  const info = useImageInfo(item.src);
  const total = items.length;
  const single = total < 2;
  const hasInfo = !!item.tags?.length || !!item.links?.length || !!item.copy;
  const canHide = !single || hasInfo;

  const step = (by: number) => setViewerIndex((index + by + total) % total);

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft' && !single) step(-1);
    else if (event.key === 'ArrowRight' && !single) step(1);
    else if (event.key === '+' || event.key === '=') zoom.zoomBy(1.5);
    else if (event.key === '-') zoom.zoomBy(1 / 1.5);
    else if (event.key === '0') zoom.fit();
  };

  const copyText = async (text: string, done: string) => {
    if (await copyToClipboard(text)) say(done);
  };

  const download = async () => {
    const saved = await saveImage(item.src);
    if (saved) say(fill(copy.saved, { file: imageFileName(item.src) }));
  };

  const onBackdropClick = (event: MouseEvent) => {
    if (event.target === event.currentTarget) closeViewer();
  };

  return (
    <DialogPrimitive.Popup
      data-slot='dev-viewer'
      data-maximized={maximized || undefined}
      className={cn(windowPopupClass(maximized), mono.variable)}
      onKeyDown={onKeyDown}
      onClick={onBackdropClick}
    >
      <DevWindow
        className={
          maximized ? 'h-dvh max-h-none w-full rounded-none' : undefined
        }
      >
        <DevWindowBar>
          <DevWindowDots
            onClose={closeViewer}
            closeLabel={item.labels?.close}
            onMinimize={canHide ? () => setBare((b) => !b) : undefined}
            minimizeLabel={bare ? copy.showDetails : copy.hideDetails}
            folded={bare}
            onMaximize={() => setMaximized((m) => !m)}
            maximized={maximized}
          />
          <DevIcon
            name='file-media'
            className='flex-none text-sky max-[700px]:hidden'
          />
          <DevWindowTitle>{item.title}</DevWindowTitle>
          <DevWindowSub>
            {item.subtitle ?? imageFileName(item.src)}
          </DevWindowSub>
          <DevViewerTools
            src={item.src}
            zoom={zoom.zoom}
            onZoomBy={zoom.zoomBy}
            onFit={zoom.fit}
            onDownload={download}
            onCopyLink={() =>
              copyText(
                new URL(item.src, window.location.href).href,
                copy.linkCopied,
              )
            }
          />
        </DevWindowBar>
        <DialogDescription className='sr-only'>
          {copy.description}
        </DialogDescription>

        <div
          className={cn(
            'relative grid grid-cols-[52px_minmax(0,1fr)_52px] items-center bg-[radial-gradient(ellipse_70%_80%_at_50%_42%,color-mix(in_srgb,var(--bg)_90%,var(--fg)),color-mix(in_srgb,var(--bg)_95%,#000))] max-[700px]:min-h-0 max-[700px]:flex-1 max-[700px]:grid-cols-[34px_minmax(0,1fr)_34px]',
            maximized && 'min-h-0 flex-1',
          )}
        >
          {single ? (
            <span />
          ) : (
            <button
              type='button'
              className={NAV_BUTTON}
              aria-label={item.labels?.previous ?? copy.previous}
              onClick={() => step(-1)}
            >
              <DevIcon name='chevron-left' className='size-[18px]' />
            </button>
          )}
          <figure
            data-slot='dev-viewer-stage'
            className={cn(
              'm-0 grid h-[min(66vh,700px)] grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] place-items-center overflow-hidden pt-4 pb-[82px] max-[700px]:h-auto max-[700px]:self-stretch',
              (single || bare) && 'pb-4',
              maximized && 'h-auto self-stretch',
            )}
          >
            <DevViewerStage
              src={item.src}
              alt={item.caption}
              zoom={zoom.zoom}
              x={zoom.x}
              y={zoom.y}
              onZoomBy={zoom.zoomBy}
              onZoomTo={zoom.zoomTo}
              onPan={zoom.panTo}
              onLoad={info.onLoad}
            />
          </figure>
          {single ? (
            <span />
          ) : (
            <button
              type='button'
              className={NAV_BUTTON}
              aria-label={item.labels?.next ?? copy.next}
              onClick={() => step(1)}
            >
              <DevIcon name='chevron-right' className='size-[18px]' />
            </button>
          )}
          {!single && !bare && (
            <DevViewerThumbs
              items={items}
              index={index}
              onSelect={setViewerIndex}
            />
          )}
        </div>

        {!bare && <DevViewerInfo item={item} onCopy={copyText} />}
        <DevViewerStatus info={info.text} index={index} total={total} />
      </DevWindow>
    </DialogPrimitive.Popup>
  );
}
