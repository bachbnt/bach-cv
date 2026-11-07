/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { KIND_ORDER } from '@/components/projects/project-helpers';
import type { CSSProperties, RefObject } from 'react';
import { projectsCopy } from '@/content/copy/projects';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { Doc } from '@/lib/content/schema';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import { useBox } from '@/skins/trade/blocks/data-use-box';
import { DataKind } from '@/skins/trade/blocks/data-kind';
import { KIND_TILE } from '@/skins/trade/blocks/data-kind-style';
import { DataProjectDetail } from '@/skins/trade/blocks/data-project-detail';
import { heatValue } from '@/skins/trade/blocks/data-projects-model';
import { layoutTreemap } from '@/skins/trade/blocks/data-treemap';

/**
 * The projects as a heatmap (a treemap): one tile for each, its area the number of technologies the project lists, its colour its kind.
 * A tile opens the project below the map. The legend says what area and colour mean.
 */
export function DataProjectsHeatmap({
  projects,
  skills,
  selectedId,
  onSelect,
  onOpenScreenshots,
  listRef,
}: {
  projects: Doc<'projects'>[];
  skills: Map<string, Doc<'skills'>>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onOpenScreenshots: (project: Doc<'projects'>) => void;
  listRef: RefObject<HTMLDivElement | null>;
}) {
  const copy = useCopy(projectsCopy);
  const { projects: words } = useCopy(tradeDataCopy);
  const { width, height } = useBox(listRef);
  const count = (project: Doc<'projects'>) => heatValue(project, skills);
  const rects = layoutTreemap(
    projects.map((p) => ({ id: p.id, value: Math.max(1, count(p)) })),
    width,
    height,
  );
  const byId = new Map(projects.map((p) => [p.id, p]));
  const selected = projects.find((p) => p.id === selectedId);
  const kinds = KIND_ORDER.filter((kind) =>
    projects.some((p) => p.kind === kind),
  );

  return (
    <div className='p-3.5'>
      <div className='mb-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-tv-mute'>
        <span>{words.heatmap.area}</span>
        <span>{words.heatmap.colour}</span>
        <ul className='m-0 flex list-none flex-wrap gap-x-3 gap-y-1 p-0 text-tv-ink'>
          {kinds.map((kind) => (
            <li key={kind}>
              <DataKind kind={kind} />
            </li>
          ))}
        </ul>
      </div>
      <div
        ref={listRef}
        role='group'
        aria-label={words.heatmap.label}
        className='relative h-[340px] w-full min-[901px]:h-[400px]'
      >
        {rects.map((rect, index) => {
          const project = byId.get(rect.id);
          if (!project) return null;
          const n = count(project);
          const technologies =
            n === 1
              ? words.heatmap.technologiesOne
              : fill(words.heatmap.technologiesMany, { count: n });
          const tiny = rect.w < 96 || rect.h < 58;
          return (
            <div
              key={rect.id}
              data-flip={rect.id}
              data-testid='project'
              style={
                {
                  left: `${(rect.x / width) * 100}%`,
                  top: `${(rect.y / height) * 100}%`,
                  width: `${(rect.w / width) * 100}%`,
                  height: `${(rect.h / height) * 100}%`,
                  '--i': Math.min(index, 10),
                } as CSSProperties
              }
              className='absolute animate-[tv-pop_0.38s_cubic-bezier(0.2,0.7,0.2,1)_both] p-px [animation-delay:calc(var(--i)*45ms)]'
            >
              <button
                type='button'
                aria-pressed={project.id === selectedId}
                aria-label={fill(words.heatmap.tile, {
                  name: project.name,
                  kind: copy.kinds[project.kind],
                  technologies,
                })}
                onClick={() =>
                  onSelect(project.id === selectedId ? null : project.id)
                }
                className={cn(
                  'flex size-full cursor-pointer flex-col items-start justify-between gap-1 overflow-hidden rounded-sm border border-l-[3px] p-2 text-left transition-[filter,scale,box-shadow] duration-200 hover:z-10 hover:scale-[1.015] hover:brightness-125 active:scale-[0.99] aria-pressed:shadow-[inset_0_0_0_2px_var(--tv-ink)]',
                  KIND_TILE[project.kind],
                )}
              >
                <span
                  className={cn(
                    'leading-tight font-semibold text-tv-ink',
                    tiny
                      ? 'truncate text-[11px]'
                      : rect.w > 240 && rect.h > 120
                        ? 'text-lg'
                        : 'line-clamp-2 text-[13px]',
                  )}
                >
                  {project.name}
                </span>
                {!tiny && (
                  <span className='text-[11px] text-tv-mute tabular-nums'>
                    {technologies}
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
      <div
        role='region'
        aria-label={words.heatmap.selected}
        className='mt-3 min-h-10 rounded-md border border-dashed border-tv-line'
      >
        {selected ? (
          <div
            key={selected.id}
            className='animate-[tv-fade-up_0.3s_cubic-bezier(0.2,0.7,0.2,1)_both]'
          >
            <h3 className='px-3.5 pt-3 text-[13px] font-semibold'>
              {selected.name}
            </h3>
            <DataProjectDetail
              project={selected}
              skills={skills}
              onOpenScreenshots={onOpenScreenshots}
            />
          </div>
        ) : (
          <p className='px-3.5 py-2.5 text-xs text-tv-mute'>
            {words.heatmap.hint}
          </p>
        )}
      </div>
    </div>
  );
}
