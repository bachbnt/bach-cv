/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  ArrowDown,
  ArrowUp,
  ChevronRight,
  ChevronsUpDown,
  ImageIcon,
} from 'lucide-react';
import {
  useId,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { ProjectCover } from '@/components/projects/project-cover';
import { skillsOf } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { Doc } from '@/lib/content/schema';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import {
  ariaSort,
  type ProjectColumn,
  type SortState,
} from '@/skins/trade/blocks/data-projects-model';
import { DataKind } from '@/skins/trade/blocks/data-kind';
import { DataProjectDetail } from '@/skins/trade/blocks/data-project-detail';
import { DataTags } from '@/skins/trade/blocks/data-tags';
import { ProjectLinks } from '@/skins/trade/blocks/project-links';
import { screenshotsLabel } from '@/skins/trade/blocks/screenshots-label';
import { TvChip } from '@/skins/trade/ui/tv-chip';

export type Density = 'compact' | 'comfortable';

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
  const style = {
    '--tv-cols': shown.map((column) => TRACK[column].width).join(' '),
    // the 12px gaps between columns and the 12px padding on each side
    minWidth:
      shown.reduce((sum, column) => sum + TRACK[column].min + 12, 0) + 12,
  } as CSSProperties;

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

function HeaderButton({
  label,
  sortLabel,
  state,
  onClick,
}: {
  label: string;
  sortLabel: string;
  state: 'ascending' | 'descending' | 'none';
  onClick: () => void;
}) {
  const Icon =
    state === 'ascending'
      ? ArrowUp
      : state === 'descending'
        ? ArrowDown
        : ChevronsUpDown;
  return (
    <button
      type='button'
      aria-label={sortLabel}
      onClick={onClick}
      className={cn(
        'inline-flex h-8 cursor-pointer items-center gap-1 rounded px-1 -ml-1 whitespace-nowrap transition-colors hover:text-tv-ink active:text-tv-ink pointer-coarse:min-h-11',
        state !== 'none' && 'font-semibold text-tv-ink',
      )}
    >
      {label}
      <Icon
        aria-hidden='true'
        className={cn('size-3', state === 'none' && 'opacity-40')}
      />
    </button>
  );
}

function ProjectRow({
  project,
  skills,
  shown,
  density,
  index,
  open,
  tabbable,
  onToggle,
  onFocusRow,
  onOpenScreenshots,
}: {
  project: Doc<'projects'>;
  skills: Map<string, Doc<'skills'>>;
  shown: ProjectColumn[];
  density: Density;
  index: number;
  open: boolean;
  tabbable: boolean;
  onToggle: () => void;
  onFocusRow: () => void;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const { projects: words } = useCopy(tradeDataCopy);
  const detailId = useId();
  const tags = skillsOf(project.technologies, skills);
  const comfy = density === 'comfortable';
  const cells: Record<ProjectColumn, ReactNode> = {
    name: (
      <div className='flex min-w-0 items-center gap-2.5'>
        <Thumbnail
          project={project}
          firstSkill={tags[0]}
          comfy={comfy}
          duplicated={shown.includes('screenshots')}
          onOpenScreenshots={onOpenScreenshots}
        />
        <div className='min-w-0'>
          <h3 className='text-[13px] leading-snug font-semibold'>
            <button
              type='button'
              data-row-button=''
              tabIndex={tabbable ? 0 : -1}
              aria-expanded={open}
              aria-controls={detailId}
              title={fill(open ? words.details.hide : words.details.show, {
                name: project.name,
              })}
              onFocus={onFocusRow}
              onClick={onToggle}
              className='-ml-1 flex min-h-8 cursor-pointer items-center gap-1 rounded px-1 text-left pointer-coarse:min-h-11'
            >
              <ChevronRight
                aria-hidden='true'
                className={cn(
                  'size-3.5 flex-none text-tv-mute transition-transform duration-200',
                  open && 'rotate-90',
                )}
              />
              <span className='min-w-0 break-words'>{project.name}</span>
            </button>
          </h3>
          {comfy && project.summary && (
            <p className='line-clamp-2 pl-3.5 text-xs/[1.45] text-tv-mute'>
              {project.summary}
            </p>
          )}
        </div>
      </div>
    ),
    kind: <DataKind kind={project.kind} />,
    featured:
      project.highlight !== null ? (
        <TvChip tone='gold'>
          {copy.featuredTag} {fill(words.rank, { rank: project.highlight })}
        </TvChip>
      ) : null,
    technologies: <DataTags skills={tags} limit={comfy ? 5 : 3} />,
    screenshots:
      project.images.length > 0 ? (
        <button
          type='button'
          aria-label={screenshotsLabel(project.images.length, copy)}
          onClick={() => onOpenScreenshots(project)}
          className='inline-flex h-7 cursor-zoom-in items-center gap-1.5 rounded border border-tv-line px-2 text-xs tabular-nums transition-colors hover:bg-tv-hover active:bg-tv-hover pointer-coarse:min-h-11'
        >
          <ImageIcon aria-hidden='true' className='size-3.5 text-tv-mute' />
          {project.images.length}
        </button>
      ) : null,
    links: <ProjectLinks links={project.links} />,
  };

  return (
    <div
      role='rowgroup'
      data-flip={project.id}
      data-testid='project'
      data-open={open}
      style={{ '--i': Math.min(index, 8) } as CSSProperties}
      className='animate-[tv-fade-up_0.32s_cubic-bezier(0.2,0.7,0.2,1)_both] border-b border-tv-line [animation-delay:calc(var(--i)*35ms)] data-[open=true]:bg-tv-hover/40'
    >
      <div
        role='row'
        className={cn(
          'grid grid-cols-(--tv-cols) items-center gap-x-3 px-3 transition-colors hover:bg-tv-hover/60',
          comfy ? 'py-2.5' : 'py-1',
        )}
      >
        {shown.map((column) => (
          <div key={column} role='cell' className='min-w-0'>
            {cells[column]}
          </div>
        ))}
      </div>
      <div
        id={detailId}
        data-open={open}
        inert={!open}
        className='grid grid-rows-[0fr] transition-[grid-template-rows,visibility] duration-300 ease-out data-[open=false]:invisible data-[open=true]:grid-rows-[1fr]'
      >
        <div role='row' className='overflow-hidden'>
          <div role='cell' className='border-t border-tv-line/60'>
            <DataProjectDetail
              project={project}
              skills={skills}
              onOpenScreenshots={onOpenScreenshots}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Thumbnail({
  project,
  firstSkill,
  comfy,
  duplicated,
  onOpenScreenshots,
}: {
  project: Doc<'projects'>;
  firstSkill?: Doc<'skills'>;
  comfy: boolean;
  /** the Screenshots column is shown, so this cover is only a bigger target for the mouse */
  duplicated: boolean;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
}) {
  const copy = useCopy(projectsCopy);
  const cover = (
    <ProjectCover
      project={project}
      firstSkill={firstSkill}
      className={cn(
        'rounded text-xs',
        comfy ? 'h-11 w-16' : 'h-7 w-10 text-[10px]',
      )}
    />
  );
  if (project.images.length === 0)
    return <div className='flex-none overflow-hidden rounded'>{cover}</div>;
  return (
    <button
      type='button'
      aria-label={screenshotsLabel(project.images.length, copy)}
      aria-hidden={duplicated || undefined}
      tabIndex={duplicated ? -1 : undefined}
      onClick={() => onOpenScreenshots(project)}
      className='flex-none cursor-zoom-in overflow-hidden rounded outline-offset-2 transition-transform hover:scale-105 active:scale-95 pointer-coarse:min-h-11'
    >
      {cover}
    </button>
  );
}
