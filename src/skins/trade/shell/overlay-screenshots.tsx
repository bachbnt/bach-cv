/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { fillCopy } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import { TvViewer } from '@/skins/trade/shell/overlay-viewer';

/**
 * The screenshots of a project in the picture viewer: previous and next (also the arrow keys, wrapping around), the counter, a strip
 * of thumbnails, Esc to close. Every opening starts at the first screenshot. The words and the rules are those of the Standard window.
 */
export function TvScreenshots({
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
    <TvViewer
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
      thumbnails={{
        items: images.map((src, i) => ({
          src,
          label: fillCopy(copy.dialog.thumbnail, { current: i + 1 }),
        })),
        current: index,
        onSelect: setIndex,
        groupLabel: copy.dialog.thumbnails,
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
