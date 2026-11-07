/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState, type ReactNode } from 'react';
import type { Doc } from '@/lib/content/schema';
import { LazyScreenshotsDialog } from '@/skins/travel/blocks/lazy-dialogs';

/**
 * The Standard screenshots window, opened for a project: returns the function that opens it and the element to render. The window
 * is loaded the first time a project is opened.
 */
export function useScreenshotsDialog(): [
  open: (project: Doc<'projects'>) => void,
  dialog: ReactNode,
] {
  const [active, setActive] = useState<Doc<'projects'> | null>(null);
  const [open, setOpen] = useState(false);
  const dialog = active && (
    <LazyScreenshotsDialog
      name={active.name}
      images={active.images}
      open={open}
      onOpenChange={setOpen}
    />
  );
  return [
    (project) => {
      setActive(project);
      setOpen(true);
    },
    dialog,
  ];
}
