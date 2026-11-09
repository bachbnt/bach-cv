/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronRight, ImageIcon } from 'lucide-react';
import { useId, type ReactNode } from 'react';
import {
  screenshotsLabel,
  skillsOf,
} from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { tradeDataCopy } from '@/content/copy/trade-data';
import type { Doc } from '@/lib/content/schema';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { cn } from '@/lib/utils';
import type {
  Density,
  ProjectColumn,
} from '@/skins/trade/blocks/data-projects-model';
import { HintTip } from '@/skins/trade/chart/hint-tip';
import { DataKind } from '@/skins/trade/blocks/data-kind';
import { DataProjectDetail } from '@/skins/trade/blocks/data-project-detail';
import { DataTags } from '@/skins/trade/blocks/data-tags';
import { ProjectLinks } from '@/skins/trade/blocks/project-links';
import { TvChip } from '@/skins/trade/ui/tv-chip';
import { cssVars } from '@/skins/trade/ui/css-vars';
import { Thumbnail } from '@/skins/trade/blocks/data-project-thumbnail';

export function ProjectRow({
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
            <HintTip
              label={fill(open ? words.details.hide : words.details.show, {
                name: project.name,
              })}
              side='top'
            >
              <button
                type='button'
                data-row-button=''
                tabIndex={tabbable ? 0 : -1}
                aria-expanded={open}
                aria-controls={detailId}
                onFocus={onFocusRow}
                onClick={onToggle}
                className='-ml-1 flex min-h-8 cursor-pointer items-center gap-1 rounded px-1 text-left pointer-coarse:min-h-11'
              >
                <ChevronRight
                  aria-hidden='true'
                  className={cn(
                    'size-3.5 flex-none text-tv-mute transition-transform duration-160',
                    open && 'rotate-90',
                  )}
                />
                <span className='min-w-0 break-words'>{project.name}</span>
              </button>
            </HintTip>
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
      style={cssVars({ '--i': Math.min(index, 8) })}
      className='animate-tv-fade-up border-b border-tv-line transition-[background-color] duration-160 [animation-delay:calc(var(--i)*35ms)] data-[open=true]:bg-tv-hover/40'
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
        className='grid grid-rows-[0fr] transition-[grid-template-rows,visibility] duration-240 ease-tv-out data-[open=false]:invisible data-[open=true]:grid-rows-[1fr]'
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
