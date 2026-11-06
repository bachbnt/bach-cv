/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { devOverlaysCopy } from '@/content/copy/dev-overlays';
import { useCopy } from '@/lib/i18n/copy';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import { DevViewerTool } from '@/skins/dev/shell/viewer/dev-viewer-tool';
import {
  DevWindowTools,
  windowToolClass,
} from '@/skins/dev/shell/window-chrome';

/** The tools in the title bar: zoom out and in, fit, open the original, download and copy the link. */
export function DevViewerTools({
  src,
  zoom,
  onZoomBy,
  onFit,
  onDownload,
  onCopyLink,
}: {
  src: string;
  zoom: number;
  onZoomBy: (factor: number) => void;
  onFit: () => void;
  onDownload: () => void;
  onCopyLink: () => void;
}) {
  const copy = useCopy(devOverlaysCopy).viewer;
  return (
    <DevWindowTools>
      <DevViewerTool
        icon='zoom-out'
        label={copy.zoomOut}
        onClick={() => onZoomBy(1 / 1.5)}
      />
      <span
        data-slot='dev-viewer-zoom'
        className='min-w-[44px] text-center font-code text-[12px] leading-[normal] text-mute max-[700px]:hidden'
      >
        {Math.round(zoom * 100)}%
      </span>
      <DevViewerTool
        icon='zoom-in'
        label={copy.zoomIn}
        onClick={() => onZoomBy(1.5)}
      />
      <DevViewerTool icon='screen-normal' label={copy.fit} onClick={onFit} />
      <span
        className='mx-[6px] h-4 w-px bg-line-2 max-[700px]:hidden'
        aria-hidden='true'
      />
      <a
        href={src}
        target='_blank'
        rel='noopener'
        aria-label={copy.openOriginal}
        title={copy.openOriginal}
        className={windowToolClass}
      >
        <DevIcon name='link-external' />
      </a>
      <DevViewerTool
        icon='cloud-download'
        label={copy.download}
        onClick={onDownload}
      />
      <DevViewerTool icon='copy' label={copy.copyLink} onClick={onCopyLink} />
    </DevWindowTools>
  );
}
