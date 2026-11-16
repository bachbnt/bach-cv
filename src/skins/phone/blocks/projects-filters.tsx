/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { SlidersHorizontal } from 'lucide-react';
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
import { ProjectsFilterFooter } from '@/skins/phone/blocks/projects-filter-footer';
import { ProjectsFilterGroups } from '@/skins/phone/blocks/projects-filter-groups';
import { raiseToolbar } from '@/skins/phone/blocks/raise-toolbar';
import { useWideScreen } from '@/skins/phone/blocks/use-wide-screen';
import { usePhScreen } from '@/skins/phone/shell/screen-context';
import { PhSheet } from '@/skins/phone/ui/ph-sheet';
import { activeFilterCount } from '@/lib/derive/project-view';

/**
 * The button of the filters and what it opens: a bottom sheet on a phone, a popover under the button on a tablet. The popover hangs from the right end of the
 * list (where the button is) and is no wider, so the project beside the list stays in view and follows every choice.
 */
export function ProjectsFilters({ view }: { view: ProjectView }) {
  const copy = useCopy(projectsCopy);
  const wide = useWideScreen();
  const screen = usePhScreen();
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const active = activeFilterCount(view.groups);

  const label = (
    <>
      <SlidersHorizontal aria-hidden='true' className='size-5' />
      {active > 0 && (
        <span
          aria-hidden='true'
          className='absolute -top-1 -right-1 grid h-5 min-w-5 place-items-center rounded-full bg-ph-accent px-1 text-[12px] leading-none font-bold text-ph-on-accent tabular-nums'
        >
          {active}
        </span>
      )}
    </>
  );
  const name =
    active > 0 ? `${copy.filters.title}, ${active}` : copy.filters.title;

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
          aria-label={name}
          data-active={active > 0 ? '' : undefined}
          render={<ProjectsControl ref={trigger} />}
        >
          {label}
        </PopoverTrigger>
        <PopoverContent
          align='end'
          sideOffset={8}
          alignOffset={-58}
          container={screen.root}
          collisionBoundary={screen.root ?? undefined}
          collisionAvoidance={POPOVER_AVOIDANCE}
          aria-label={copy.filters.title}
          className='ph-root w-[26rem] max-w-(--available-width) gap-0 max-h-[min(34rem,var(--available-height))] overflow-y-auto overscroll-contain rounded-ph-panel border-0 bg-ph-sheet-2 p-0 text-ph-ink shadow-ph-float ring-1 ring-ph-line'
        >
          <div className='p-5'>
            <ProjectsFilterGroups view={view} />
          </div>
          <ProjectsFilterFooter view={view} onDone={() => setOpen(false)} />
        </PopoverContent>
      </Popover>
    );

  return (
    <>
      <ProjectsControl
        aria-label={name}
        aria-haspopup='dialog'
        aria-expanded={open}
        data-active={active > 0 ? '' : undefined}
        data-popup-open={open ? '' : undefined}
        onClick={() => setOpen(true)}
      >
        {label}
      </ProjectsControl>
      <PhSheet open={open} onOpenChange={setOpen} title={copy.filters.title}>
        <div className='px-5 pt-3 pb-6'>
          <ProjectsFilterGroups view={view} />
        </div>
        <ProjectsFilterFooter view={view} onDone={() => setOpen(false)} />
      </PhSheet>
    </>
  );
}
