/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { Lightbox } from '@/components/lightbox/lightbox';
import { fillCopy } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';

/**
 * The screenshots of a project, in the same dialog as the certificates and QR codes: previous/next
 * (also with the arrow keys, wrapping around), a counter between the arrows, Escape or the backdrop to close.
 * Every opening starts at the first screenshot.
 */
export function ScreenshotsDialog({
  name,
  images,
  open,
  onOpenChange,
}: {
  name: string;
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const copy = useCopy(projectsCopy);
  const [index, setIndex] = useState(0);
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) setIndex(0);
  }

  const total = images.length;
  const current = images[index];
  if (!current) return null;
  const go = (step: number) => setIndex((i) => (i + step + total) % total);

  return (
    <Lightbox
      open={open}
      onOpenChange={onOpenChange}
      title={name}
      closeLabel={copy.dialog.close}
      image={{
        src: current,
        alt: fillCopy(copy.dialog.alt, { name, current: index + 1 }),
        width: 900,
        height: 1600,
      }}
      nav={
        total > 1
          ? {
              onPrev: () => go(-1),
              onNext: () => go(1),
              prevLabel: copy.dialog.previous,
              nextLabel: copy.dialog.next,
              counter: fillCopy(copy.dialog.counter, {
                current: index + 1,
                total,
              }),
            }
          : undefined
      }
    />
  );
}
