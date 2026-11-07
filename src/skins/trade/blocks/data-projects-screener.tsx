/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { LayoutDashboard, LayoutGrid, Table2 } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { kindsPresent } from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { tradeDataCopy } from '@/content/copy/trade-data';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { DataProjectsCards } from '@/skins/trade/blocks/data-projects-cards';
import {
  DataProjectsGrid,
  type Density,
} from '@/skins/trade/blocks/data-projects-grid';
import { DataProjectsHeatmap } from '@/skins/trade/blocks/data-projects-heatmap';
import { DataProjectsSkeleton } from '@/skins/trade/blocks/data-projects-skeleton';
import {
  DEFAULT_SORT,
  filterProjects,
  isFiltering,
  nextSort,
  NO_FILTERS,
  PROJECT_COLUMNS,
  sortProjects,
  techOptions,
  type ProjectColumn,
  type ProjectFilters,
  type SortState,
} from '@/skins/trade/blocks/data-projects-model';
import { DataScreenerBar } from '@/skins/trade/blocks/data-screener-bar';
import { DataSegmented } from '@/skins/trade/blocks/data-segmented';
import { useFlip } from '@/skins/trade/blocks/data-use-flip';
import { useScreenshotsDialog } from '@/skins/trade/blocks/use-screenshots-dialog';
import { useSkillMap } from '@/skins/trade/blocks/use-skill-map';
import { useReducedMotion } from '@/skins/trade/shell/use-reduced-motion';
import { TvButton } from '@/skins/trade/ui/tv-button';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvPanel } from '@/skins/trade/ui/tv-panel';
import { TvStateNotice } from '@/skins/trade/ui/tv-state-notice';

type View = 'table' | 'cards' | 'heatmap';

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));

/**
 * The Projects page as a screener: a bar of filters over the projects shown as a table, as cards or as a heatmap. Sorting and filtering
 * re-lay the list out with a slide (`useFlip`). `/` focuses the filter from anywhere on the page, Esc clears the filters.
 */
export function DataProjectsScreener() {
  const copy = useCopy(projectsCopy);
  const { projects: words } = useCopy(tradeDataCopy);
  const query = useContentQuery('projects');
  const skills = useSkillMap();
  const reduced = useReducedMotion();
  const [openScreenshots, dialog] = useScreenshotsDialog();
  const [view, setView] = useState<View>('table');
  const [density, setDensity] = useState<Density>('compact');
  const [columns, setColumns] = useState(
    () => new Set<ProjectColumn>(PROJECT_COLUMNS),
  );
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const [filters, setFilters] = useState<ProjectFilters>(NO_FILTERS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const capture = useFlip(listRef, !reduced);

  useEffect(() => {
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (
        e.key !== '/' ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey ||
        isTyping(e.target) ||
        (e.target as Element | null)?.closest('[role="dialog"]')
      )
        return;
      // the terminal opens its symbol search on "/" too: on this page the filter takes the key first (Ctrl or Cmd with K still opens the search)
      e.preventDefault();
      e.stopPropagation();
      inputRef.current?.focus();
    };
    addEventListener('keydown', onKey, { capture: true });
    return () => removeEventListener('keydown', onKey, { capture: true });
  }, []);

  const projects = query.data ?? [];
  const kinds = kindsPresent(projects);
  const techs = techOptions(projects, skills);
  const matching = filterProjects(projects, filters, skills);
  const shown = sortProjects(matching, sort, skills);

  const changeFilters = (next: ProjectFilters) => {
    capture();
    setFilters(next);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.key === 'Escape' &&
      event.currentTarget.contains(event.target as Node) &&
      isFiltering(filters)
    )
      changeFilters(NO_FILTERS);
  };

  const switcher = projects.length > 0 && (
    <DataSegmented
      label={words.view.label}
      value={view}
      onChange={(next) => {
        setView(next);
        setSelectedId(null);
      }}
      options={[
        {
          value: 'table',
          label: words.view.table,
          icon: <Table2 aria-hidden='true' />,
        },
        {
          value: 'cards',
          label: words.view.cards,
          icon: <LayoutGrid aria-hidden='true' />,
        },
        {
          value: 'heatmap',
          label: words.view.heatmap,
          icon: <LayoutDashboard aria-hidden='true' />,
        },
      ]}
    />
  );

  return (
    <TvPanel title={copy.title} intro={copy.intro} actions={switcher}>
      <TvDataState
        query={query}
        count={projects.length}
        empty='projects'
        subject='projects'
        skeleton={<DataProjectsSkeleton />}
        className='m-3.5'
      >
        <div onKeyDown={onKeyDown}>
          <DataScreenerBar
            filters={filters}
            onFilters={changeFilters}
            kinds={kinds}
            techs={techs}
            density={density}
            onDensity={(next) => {
              capture();
              setDensity(next);
            }}
            columns={columns}
            onColumns={setColumns}
            showColumns={view === 'table'}
            showDensity={view !== 'heatmap'}
            shown={shown.length}
            total={projects.length}
            inputRef={inputRef}
          />
          {shown.length === 0 ? (
            <TvStateNotice
              kind='empty'
              level={3}
              className='m-3.5'
              title={words.noMatch.title}
              body={words.noMatch.body}
            >
              <TvButton
                variant='outline'
                onClick={() => changeFilters(NO_FILTERS)}
              >
                {words.filter.clear}
              </TvButton>
            </TvStateNotice>
          ) : view === 'table' ? (
            <DataProjectsGrid
              projects={shown}
              skills={skills}
              columns={columns}
              density={density}
              sort={sort}
              onSort={(column) => {
                capture();
                setSort((old) => nextSort(old, column));
              }}
              onOpenScreenshots={openScreenshots}
              listRef={listRef}
            />
          ) : view === 'cards' ? (
            <DataProjectsCards
              projects={shown}
              skills={skills}
              density={density}
              onOpenScreenshots={openScreenshots}
              listRef={listRef}
            />
          ) : (
            <DataProjectsHeatmap
              projects={shown}
              skills={skills}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onOpenScreenshots={openScreenshots}
              listRef={listRef}
            />
          )}
          <p className='px-3.5 pt-1 pb-4 text-xs text-tv-dim max-[1100px]:hidden'>
            {words.keys}
          </p>
        </div>
      </TvDataState>
      {dialog}
    </TvPanel>
  );
}
