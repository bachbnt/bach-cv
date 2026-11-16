/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import {
  PROJECT_PANE_BODY,
  PROJECT_PANE_CARD,
} from '@/skins/phone/blocks/projects-layout';
import { usePaneFit } from '@/skins/phone/blocks/use-pane-fit';

/**
 * The page beside the list on a tablet: a card that stays under the bars (`--ph-bar-shown`: the status bar and the app bar while it is shown,
 * the status bar alone once the app bar has slid away) while the list scrolls, and ends above the home bar (`usePaneFit` cuts it). A project
 * that is taller than that scrolls inside the card, which has no scrollbar of its own to see (the shell's are thin overlays) and fades at its
 * foot, so nothing is cut by a hard edge.
 */
export function ProjectsPane({
  skeleton = false,
  children,
}: {
  /** the card of the skeleton, which is cut to the same height as the loaded one */
  skeleton?: boolean;
  children: ReactNode;
}) {
  const card = useRef<HTMLElement>(null);
  const maxHeight = usePaneFit(card);
  return (
    <aside
      ref={card}
      data-projects-part={skeleton ? undefined : 'detail'}
      data-skeleton={skeleton ? 'detail' : undefined}
      style={{ maxHeight }}
      className={cn(
        'sticky top-[calc(var(--ph-bar-shown)+1rem)] animate-ph-fade',
        PROJECT_PANE_CARD,
      )}
    >
      <div className={PROJECT_PANE_BODY}>{children}</div>
    </aside>
  );
}
