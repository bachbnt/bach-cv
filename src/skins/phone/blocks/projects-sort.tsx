/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowUpDown } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { projectsCopy } from '@/content/copy/projects';
import type { ProjectView } from '@/hooks/use-project-view';
import { useCopy } from '@/lib/i18n/copy';
import { POPOVER_AVOIDANCE } from '@/skins/phone/blocks/popover-avoidance';
import { ProjectsControl } from '@/skins/phone/blocks/projects-control';
import { ProjectsSortOptions } from '@/skins/phone/blocks/projects-sort-options';
import { raiseToolbar } from '@/skins/phone/blocks/raise-toolbar';
import { useWideScreen } from '@/skins/phone/blocks/use-wide-screen';
import { usePhScreen } from '@/skins/phone/shell/screen-context';
import { PhSheet } from '@/skins/phone/ui/ph-sheet';

/** The round button of the order (the order in use is its hidden text and the caption under the buttons) and what it opens: a bottom sheet on a phone, a small popover under the button on a tablet. */
export function ProjectsSort({ view }: { view: ProjectView }) {
  const copy = useCopy(projectsCopy);
  const wide = useWideScreen();
  const screen = usePhScreen();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const label = (
    <>
      <ArrowUpDown aria-hidden='true' className='size-5' />
      {/* the order in use, for readers and for the caption under the buttons; the button's name stays the same */}
      <span className='sr-only'>{copy.sort[view.sort.value]}</span>
    </>
  );

  if (wide)
    return (
      <Popover
        open={open}
        onOpenChange={(next) => {
          if (next) raiseToolbar(trigger.current, screen.scroller);
          setOpen(next);
        }}
      >
        <PopoverTrigger
          aria-label={copy.sortLabel}
          render={<ProjectsControl ref={trigger} />}
        >
          {label}
        </PopoverTrigger>
        <PopoverContent
          align='end'
          sideOffset={8}
          container={screen.root}
          collisionBoundary={screen.root ?? undefined}
          collisionAvoidance={POPOVER_AVOIDANCE}
          aria-label={copy.sortLabel}
          className='ph-root w-72 max-w-(--available-width) gap-0 max-h-[min(34rem,var(--available-height))] overflow-y-auto overscroll-contain rounded-ph-panel border-0 bg-ph-sheet-2 p-0 text-ph-ink shadow-ph-float ring-1 ring-ph-line'
        >
          <ProjectsSortOptions view={view} onPick={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    );

  return (
    <>
      <ProjectsControl
        aria-label={copy.sortLabel}
        aria-haspopup='dialog'
        aria-expanded={open}
        data-popup-open={open ? '' : undefined}
        onClick={() => setOpen(true)}
      >
        {label}
      </ProjectsControl>
      <PhSheet open={open} onOpenChange={setOpen} title={copy.sortLabel}>
        <div className='pb-6'>
          <ProjectsSortOptions view={view} onPick={() => setOpen(false)} />
        </div>
      </PhSheet>
    </>
  );
}
