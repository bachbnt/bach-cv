/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useProjectView } from '@/hooks/use-project-view';
import type { Doc } from '@/lib/content/schema';
import { cn } from '@/lib/utils';
import { ProjectDetail } from '@/skins/phone/blocks/project-detail';
import { ProjectList } from '@/skins/phone/blocks/project-list';
import { ProjectsNone } from '@/skins/phone/blocks/projects-none';
import { PROJECTS_GRID } from '@/skins/phone/blocks/projects-layout';
import { ProjectsPane } from '@/skins/phone/blocks/projects-pane';
import { screenScroller } from '@/skins/phone/blocks/screen-scroller';
import { ProjectsToolbar } from '@/skins/phone/blocks/projects-toolbar';
import { useOpenScreenshots } from '@/skins/phone/blocks/use-open-screenshots';
import { useWideScreen } from '@/skins/phone/blocks/use-wide-screen';
import { usePhScreen } from '@/skins/phone/shell/screen-context';

/**
 * The list of projects with its controls and the project that is open. A tablet shows them side by side (the first project is open until
 * another is picked); on an open foldable the left pane is `--ph-pane-left` wide and the right one the rest, both with the page's margins, so the crease falls in the
 * gap between them (the shell works it out). A phone shows the list, and a tap pushes the project as a screen of its
 * own, sliding in from the side the way a phone's navigation does: the list comes back where it was scrolled to, with focus on the row that
 * was open. The order and the filters are `useProjectView`'s, which opens with the featured projects first.
 */
export function ProjectsBrowser({
  projects,
  skills,
}: {
  projects: Doc<'projects'>[];
  skills: Map<string, Doc<'skills'>>;
}) {
  const view = useProjectView(projects, skills, 'featured', {
    transition: false,
  });
  const wide = useWideScreen();
  // what scrolls the list: the scroller of a device or a tablet layout, else the document of a phone's window
  const { scroller } = usePhScreen();
  const openScreenshots = useOpenScreenshots();
  const [selectedId, setSelectedId] = useState<string>();
  const [pushed, setPushed] = useState(false);
  // which way the screen that arrives came, so it slides in from there (nothing moves when the page opens)
  const [move, setMove] = useState<'push' | 'pop'>();
  const detailRef = useRef<HTMLElement>(null);
  // where the list was scrolled to when a project was pushed, and the row to give focus back to
  const back = useRef<{ scrollTop: number; rowId: string | null }>({
    scrollTop: 0,
    rowId: null,
  });

  const current =
    view.shown.find((project) => project.id === selectedId) ??
    (wide ? view.shown[0] : undefined);
  const showDetail = current !== undefined && (wide || pushed);
  const showList = wide || !showDetail;
  const pushedScreen = !wide && showDetail;

  useLayoutEffect(() => {
    if (wide) return;
    if (pushedScreen) {
      // the screen starts under the app bar (its `scroll-mt`), the title of the page stays above it
      detailRef.current?.scrollIntoView({
        block: 'start',
        behavior: 'instant',
      });
      detailRef.current?.focus({ preventScroll: true });
    } else if (back.current.rowId) {
      const scrolled = screenScroller(scroller);
      if (scrolled) scrolled.scrollTop = back.current.scrollTop;
      document
        .getElementById(back.current.rowId)
        ?.focus({ preventScroll: true });
      back.current.rowId = null;
    }
  }, [pushedScreen, wide, scroller]);

  const select = (project: Doc<'projects'>) => {
    back.current = {
      scrollTop: screenScroller(scroller)?.scrollTop ?? 0,
      rowId: `ph-project-${project.id}`,
    };
    setSelectedId(project.id);
    if (!wide) {
      setMove('push');
      setPushed(true);
    }
  };

  const pop = () => {
    setMove('pop');
    setPushed(false);
  };

  // `?project=<id>` (the link of a featured project on Home) opens that project once, on arrival, and is then taken off the address: a filter that hides
  // it is cleared, a phone pushes its screen and the list scrolls to its row. Run after every render but it does anything only the first time.
  const arrival = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (arrival.current === undefined) {
      const params = new URLSearchParams(window.location.search);
      arrival.current = params.get('project');
      if (arrival.current !== null) {
        params.delete('project');
        const { pathname, hash } = window.location;
        const query = params.toString();
        window.history.replaceState(
          null,
          '',
          `${pathname}${query ? `?${query}` : ''}${hash}`,
        );
      }
    }
    const id = arrival.current;
    if (!id) return;
    arrival.current = null;
    const project = projects.find((item) => item.id === id);
    if (!project) return;
    if (!view.shown.some((item) => item.id === id)) view.clear();
    select(project);
    requestAnimationFrame(() =>
      document
        .getElementById(`ph-project-${id}`)
        ?.scrollIntoView({ block: 'nearest' }),
    );
  });

  return (
    <div className={PROJECTS_GRID}>
      {showList && (
        <div
          className={cn(
            'min-w-0 transition-[opacity,translate] duration-[180ms] ease-out',
            // the list that comes back after Back slides in from the side it left to
            move === 'pop' && 'starting:-translate-x-6 starting:opacity-0',
          )}
        >
          <ProjectsToolbar view={view} />
          <div className='mt-5'>
            {view.shown.length > 0 ? (
              <ProjectList
                projects={view.shown}
                skills={skills}
                selectedId={current?.id}
                onSelect={select}
              />
            ) : (
              <ProjectsNone view={view} />
            )}
          </div>
        </div>
      )}
      {showDetail &&
        (wide ? (
          <ProjectsPane>
            <ProjectDetail
              key={current.id}
              project={current}
              skills={skills}
              onOpenScreenshots={openScreenshots}
            />
          </ProjectsPane>
        ) : (
          <ProjectDetail
            key={current.id}
            project={current}
            skills={skills}
            ref={detailRef}
            className='transition-[opacity,translate] duration-[180ms] ease-out starting:translate-x-8 starting:opacity-0'
            onBack={pop}
            onOpenScreenshots={openScreenshots}
          />
        ))}
    </div>
  );
}
