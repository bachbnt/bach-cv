/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState, type KeyboardEvent, type RefObject } from 'react';
import { projectsCopy } from '@/content/copy/projects';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { Doc } from '@/lib/content/schema';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import {
  ariaSort,
  type Density,
  type ProjectColumn,
  type SortState,
} from '@/skins/trade/blocks/data-projects-model';
import { cssVars } from '@/skins/trade/ui/css-vars';
import { HeaderButton } from '@/skins/trade/blocks/data-projects-header-button';
import { ProjectRow } from '@/skins/trade/blocks/data-project-row';

const TRACK: Record<ProjectColumn, { width: string; min: number }> = {
  name: { width: 'minmax(220px,2.4fr)', min: 220 },
  kind: { width: '104px', min: 104 },
  featured: { width: '118px', min: 118 },
  technologies: { width: 'minmax(220px,2fr)', min: 220 },
  screenshots: { width: '110px', min: 110 },
  links: { width: 'minmax(140px,1.3fr)', min: 140 },
};

const shownColumns = (columns: Set<ProjectColumn>) =>
  (Object.keys(TRACK) as ProjectColumn[]).filter(
    (column) => column === 'name' || columns.has(column),
  );

/** The projects as a data grid: sortable columns, the columns of the visitor's choice, a row that opens to everything about the project. */
export function DataProjectsGrid({
  projects,
  skills,
  columns,
  density,
  sort,
  onSort,
  onOpenScreenshots,
  listRef,
}: {
  projects: Doc<'projects'>[];
  skills: Map<string, Doc<'skills'>>;
  columns: Set<ProjectColumn>;
  density: Density;
  sort: SortState;
  onSort: (column: ProjectColumn) => void;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
  listRef: RefObject<HTMLDivElement | null>;
}) {
  const copy = useCopy(projectsCopy);
  const { projects: words } = useCopy(tradeDataCopy);
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const [active, setActive] = useState<string | null>(null);
  const shown = shownColumns(columns);
  const activeId = projects.some((p) => p.id === active)
    ? active
    : projects[0]?.id;
  const style = cssVars(
    { '--tv-cols': shown.map((column) => TRACK[column].width).join(' ') },
    {
      // the 12px gaps between columns and the 12px padding on each side
      minWidth:
        shown.reduce((sum, column) => sum + TRACK[column].min + 12, 0) + 12,
    },
  );

  const toggle = (id: string) =>
    setOpen((old) => {
      const next = new Set(old);
      if (!next.delete(id)) next.add(id);
      return next;
    });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    if (!target.hasAttribute('data-row-button')) return;
    const buttons = [
      ...event.currentTarget.querySelectorAll<HTMLElement>('[data-row-button]'),
    ];
    const at = buttons.indexOf(target);
    const to = {
      ArrowDown: at + 1,
      ArrowUp: at - 1,
      Home: 0,
      End: buttons.length - 1,
    }[event.key];
    if (to === undefined) return;
    event.preventDefault();
    buttons[Math.max(0, Math.min(buttons.length - 1, to))]?.focus();
  };

  return (
    <div className='overflow-x-auto' data-testid='project-grid'>
      <div
        role='table'
        aria-label={copy.all}
        style={style}
        onKeyDown={onKeyDown}
      >
        <div role='rowgroup'>
          <div
            role='row'
            className='grid grid-cols-(--tv-cols) gap-x-3 border-b border-tv-line px-3 text-xs text-tv-mute'
          >
            {shown.map((column) => (
              <div
                key={column}
                role='columnheader'
                aria-sort={ariaSort(sort, column)}
              >
                <HeaderButton
                  label={words.columns[column]}
                  sortLabel={fill(words.sortBy, {
                    column: words.columns[column],
                  })}
                  state={ariaSort(sort, column)}
                  onClick={() => onSort(column)}
                />
              </div>
            ))}
          </div>
        </div>
        <div ref={listRef} role='none'>
          {projects.map((project, index) => (
            <ProjectRow
              key={project.id}
              project={project}
              skills={skills}
              shown={shown}
              density={density}
              index={index}
              open={open.has(project.id)}
              tabbable={project.id === activeId}
              onToggle={() => toggle(project.id)}
              onFocusRow={() => setActive(project.id)}
              onOpenScreenshots={onOpenScreenshots}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
