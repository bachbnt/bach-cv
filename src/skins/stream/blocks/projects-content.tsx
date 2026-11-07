/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ChevronDown, ChevronUp, Pause, Play } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useMemo, useState } from 'react';
import {
  kindsPresent,
  skillsOf,
  fillCopy,
} from '@/components/projects/project-helpers';
import { projectsCopy } from '@/content/copy/projects';
import { streamCopy } from '@/content/copy/stream';
import type { Doc } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { ChatDock } from '@/skins/stream/chat/chat-dock';
import { useStreamChat } from '@/skins/stream/chat/stream-chat-context';
import { ChannelReelChapters } from '@/skins/stream/blocks/channel-reel-chapters';
import { ReelCard } from '@/skins/stream/blocks/reel-card';
import { useReelKeys } from '@/skins/stream/blocks/use-reel-keys';
import { stepIndex } from '@/skins/stream/config';
import { ICON_BUTTON } from '@/skins/stream/ui/icon-button-class';
import { StreamChip } from '@/skins/stream/ui/stream-chip';
import { StreamDataState } from '@/skins/stream/ui/stream-data-state';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

// the picture viewer is the Standard one, loaded when a visitor first opens a project's screenshots
const ScreenshotsDialog = dynamic(
  () =>
    import('@/components/projects/screenshots-dialog').then(
      (m) => m.ScreenshotsDialog,
    ),
  { ssr: false },
);

type Filter = 'all' | Doc<'projects'>['kind'];

/**
 * The projects as a Shorts page: the kind filter as chips, then a reel with one project at a time (arrow keys, the two buttons and a
 * swipe move through the filtered list) and, on a wide screen, the live chat beside it. The data and its states are Standard's.
 */
export function ProjectsContent() {
  const copy = useCopy(projectsCopy);
  const { reel } = useCopy(streamCopy);
  const { enabled } = useStreamChat();
  const projectsQuery = useContentQuery('projects', { featuredFirst: true });
  const { data: skillList = [] } = useContentQuery('skills');
  const skills = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const [state, setState] = useState<{ filter: Filter; index: number }>({
    filter: 'all',
    index: 0,
  });
  const [viewer, setViewer] = useState<Doc<'projects'> | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  // the reel goes on by itself while the bar fills; the visitor can stop it (a moving thing needs a way to stop it that works without a mouse)
  const [auto, setAuto] = useState(true);

  const projects = projectsQuery.data ?? [];
  const kinds = kindsPresent(projects);
  const shown =
    state.filter === 'all'
      ? projects
      : projects.filter((p) => p.kind === state.filter);
  const index = Math.min(state.index, Math.max(shown.length - 1, 0));
  const current = shown[index];
  const total = shown.length;

  const step = useCallback(
    (by: 1 | -1) =>
      setState((s) => ({
        ...s,
        index: stepIndex(Math.min(s.index, total - 1), by, total),
      })),
    [total],
  );
  useReelKeys(step, total > 1);

  return (
    <section aria-label={copy.title} className='px-3 min-[701px]:px-0'>
      <StreamDataState
        query={projectsQuery}
        count={projects.length}
        empty='projects'
        subject='projects'
        skeleton={
          <div className='mx-auto flex justify-center'>
            <StreamSkeleton className='aspect-[9/16] w-[min(100%,360px)] rounded-2xl' />
          </div>
        }
        className='mt-2'
      >
        {kinds.length > 1 && (
          <div
            role='group'
            aria-label={copy.filterLabel}
            className='mb-4 flex gap-3 overflow-x-auto [scrollbar-width:none] min-[701px]:flex-wrap'
          >
            {(['all', ...kinds] as const).map((value) => (
              <StreamChip
                key={value}
                aria-pressed={state.filter === value}
                onClick={() => setState({ filter: value, index: 0 })}
              >
                {value === 'all' ? copy.filterAll : copy.kinds[value]}
              </StreamChip>
            ))}
          </div>
        )}
        <div
          className={cn(
            'mx-auto grid max-w-[1100px] grid-cols-1 items-start gap-8',
            enabled && 'min-[1100px]:grid-cols-[minmax(0,1fr)_360px]',
          )}
        >
          {current && (
            <div className='flex w-full flex-col items-center gap-3 min-[701px]:flex-row min-[701px]:items-center min-[701px]:justify-center min-[701px]:gap-4'>
              <ReelCard
                project={current}
                skills={skillsOf(current.technologies, skills)}
                index={index}
                total={total}
                playing={auto && !viewerOpen}
                onStep={step}
                onOpenScreenshots={(project) => {
                  setViewer(project);
                  setViewerOpen(true);
                }}
              />
              {total > 1 && (
                <div className='flex items-center gap-3 min-[701px]:flex-col'>
                  <button
                    type='button'
                    aria-label={reel.previous}
                    onClick={() => step(-1)}
                    className={cn(
                      ICON_BUTTON,
                      'size-12 bg-sm-hover hover:bg-sm-hover2',
                    )}
                  >
                    <ChevronUp aria-hidden='true' />
                  </button>
                  <span
                    aria-live='polite'
                    className='min-w-12 text-center text-xs text-sm-mute tabular-nums'
                  >
                    {fillCopy(reel.position, { current: index + 1, total })}
                  </span>
                  <button
                    type='button'
                    aria-label={reel.next}
                    onClick={() => step(1)}
                    className={cn(
                      ICON_BUTTON,
                      'size-12 bg-sm-hover hover:bg-sm-hover2',
                    )}
                  >
                    <ChevronDown aria-hidden='true' />
                  </button>
                  <button
                    type='button'
                    aria-pressed={!auto}
                    aria-label={auto ? reel.pause : reel.play}
                    onClick={() => setAuto((on) => !on)}
                    className={cn(
                      ICON_BUTTON,
                      'size-12 bg-sm-hover hover:bg-sm-hover2 motion-reduce:hidden',
                    )}
                  >
                    {auto ? (
                      <Pause aria-hidden='true' />
                    ) : (
                      <Play aria-hidden='true' />
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
          {current && (
            <ChannelReelChapters
              projects={shown}
              index={index}
              onSelect={(i) => setState((s) => ({ ...s, index: i }))}
            />
          )}
          <ChatDock />
        </div>
      </StreamDataState>
      {viewer && (
        <ScreenshotsDialog
          name={viewer.name}
          images={viewer.images}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}
    </section>
  );
}
