/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef } from 'react';
import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { cn } from '@/lib/utils';
import { ResumeRoleDetail } from '@/skins/phone/blocks/resume-role-detail';
import { ResumeRoleList } from '@/skins/phone/blocks/resume-role-list';
import { ROLES_GRID } from '@/skins/phone/blocks/resume-layout';
import { ResumeRolesSkeleton } from '@/skins/phone/blocks/resume-roles-skeleton';
import { HINGE_PANES } from '@/skins/phone/blocks/hinge-panes';
import { useWideScreen } from '@/skins/phone/blocks/use-wide-screen';
import { PhDataState } from '@/skins/phone/ui/ph-data-state';
import { PhSection } from '@/skins/phone/ui/ph-section';

/**
 * Experience as a master and a detail. On a tablet the list of roles is at the left and the role that is picked (the first, until one is)
 * at the right. On a phone the list is a screen and a tapped role another: `selected` says which, and the control at the top of the role
 * goes back, with the focus on the role it came from. On an open device the two are the panes the shell sizes, so that the crease lies in the gap between them. The address `#role-<id>` opens that role (the links of Home end in it).
 */
export function ResumeRoles({
  selected,
  onSelect,
}: {
  /** the role the visitor opened, or `null` for the list */
  selected: string | null;
  onSelect: (id: string | null) => void;
}) {
  const copy = useCopy(resumeCopy);
  const query = useContentQuery('experience');
  const { byId } = useSkills();
  const wide = useWideScreen();
  const detail = useRef<HTMLDivElement>(null);
  const came = useRef<string | null>(null);
  const fromAddress = useRef(false);
  const jobs = query.data ?? [];
  const job = jobs.find((item) => item.id === (selected ?? jobs[0]?.id));
  const ready = jobs.length > 0;

  // the address of a role opens it, once the roles are there
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!ready || !id.startsWith('role-')) return;
    fromAddress.current = true;
    onSelect(id.slice('role-'.length));
  }, [ready, onSelect]);

  // on a phone the focus follows the screen: to the role when it opens, back to its row when the list returns
  useEffect(() => {
    if (wide) {
      // beside the list the role is already on screen, but the address scrolled to its row (`useScrollToHash` of the page), which puts the
      // top of the role above the bars: bring the role itself to the top, under the bars and not behind them (the scroll padding of the scroller)
      if (fromAddress.current && selected !== null) {
        fromAddress.current = false;
        detail.current?.scrollIntoView();
      }
      return;
    }
    fromAddress.current = false;
    if (selected !== null) {
      came.current = selected;
      detail.current?.focus();
      detail.current?.scrollIntoView();
    } else if (came.current !== null) {
      const row = document.getElementById(`role-${came.current}`);
      row?.focus({ preventScroll: true });
      row?.scrollIntoView({ block: 'nearest' });
      came.current = null;
    }
  }, [selected, wide]);

  return (
    <PhSection title={copy.experience.title} className='mt-0'>
      <PhDataState
        query={query}
        count={jobs.length}
        empty='experience'
        subject='experience'
        level={3}
        skeleton={<ResumeRolesSkeleton />}
      >
        <div className={cn(ROLES_GRID, HINGE_PANES)}>
          <div
            className={cn(
              'min-w-0 @min-[900px]:sticky @min-[900px]:top-[calc(var(--ph-bar-shown)+1rem)]',
              selected !== null && '@max-[899px]:hidden',
            )}
          >
            <ResumeRoleList jobs={jobs} shown={job?.id} onSelect={onSelect} />
          </div>
          <div
            className={cn(
              'min-w-0',
              selected === null && '@max-[899px]:hidden',
            )}
          >
            {job && (
              <ResumeRoleDetail
                key={job.id}
                job={job}
                skills={byId}
                detailRef={detail}
                onBack={() => onSelect(null)}
              />
            )}
          </div>
        </div>
      </PhDataState>
    </PhSection>
  );
}
