/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { homeBuildCopy } from '@/content/copy/home-build';
import { homeCopy } from '@/content/copy/home';
import { homeProjectsCopy } from '@/content/copy/home-projects';
import { statesCopy } from '@/content/copy/states';
import { travelTripCopy } from '@/content/copy/travel-trip';
import { skillsOf } from '@/components/projects/project-helpers';
import { featuredProjects, HOME_ROLES } from '@/lib/derive/home-lists';
import { stripSkills } from '@/lib/derive/skill-strip';
import { initialsOf } from '@/lib/derive/initials';
import { useCopy } from '@/lib/i18n/copy';
import { useContentQuery } from '@/lib/query/use-content';
import { latestStops } from '@/skins/travel/blocks/home-roles';
import { TripStopList } from '@/skins/travel/blocks/trip-stop-list';
import { useTravel } from '@/skins/travel/shell/travel-context';
import { TlChip } from '@/skins/travel/ui/tl-chip';
import { TlDataState } from '@/skins/travel/ui/tl-data-state';
import { TlRowsSkeleton, TlSkeleton } from '@/skins/travel/ui/tl-skeleton';

const heading = 'm-0 text-[17px] font-extrabold';

/** How a bug becomes a merge request: the three steps of the Standard pipeline as the legs of a short trip. */
export function HomePipeline() {
  const { pipeline } = useCopy(homeCopy);
  return (
    <section
      aria-labelledby='tl-pipeline'
      className='rounded-2xl bg-tl-panel-2 p-4'
    >
      <h2 id='tl-pipeline' className={heading}>
        {pipeline.title}
      </h2>
      <p className='m-0 mt-1 text-[13px] text-tl-muted'>{pipeline.subtitle}</p>
      <ol className='m-0 mt-3 grid grid-cols-1 list-none gap-3 p-0'>
        {pipeline.steps.map((step, i) => (
          <li key={step.title} className='relative flex gap-3'>
            <span
              aria-hidden='true'
              className='grid size-6 flex-none place-items-center rounded-full bg-tl-coral text-[12px] font-extrabold text-tl-on-coral'
            >
              {i + 1}
            </span>
            <div className='min-w-0'>
              <h3 className='m-0 text-[14.5px] font-bold'>{step.title}</h3>
              <p className='m-0 text-[13px] text-tl-muted'>{step.body}</p>
              {step.tags.length > 0 && (
                <ul className='m-0 mt-1.5 flex list-none flex-wrap gap-1.5 p-0'>
                  {step.tags.map((tag) => (
                    <li key={tag}>
                      <TlChip>{tag}</TlChip>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** The technologies of Standard's moving strip, as luggage tags that stand still (nothing moves, so there is nothing to pause). */
export function HomeLuggage() {
  const copy = useCopy(homeCopy);
  const { data: skills = [], isPending } = useContentQuery('skills');
  const shown = stripSkills(skills);
  if (isPending) return <TlSkeleton className='h-14' />;
  if (!shown.length) return null;
  return (
    <section aria-label={copy.technologies}>
      <ul className='m-0 flex list-none flex-wrap gap-1.5 p-0'>
        {shown.map((skill) => (
          <li key={skill.id}>
            <TlChip>{skill.name}</TlChip>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** What was built at the destination: the six items of Standard's "What I've built" as things to see. */
export function HomeBuilds() {
  const copy = useCopy(homeBuildCopy);
  return (
    <section aria-labelledby='tl-builds'>
      <h2 id='tl-builds' className={heading}>
        {copy.title}
      </h2>
      <p className='m-0 mb-2 text-[13px] text-tl-muted'>{copy.intro}</p>
      <ul className='m-0 grid grid-cols-1 list-none gap-2 p-0'>
        {copy.items.map((item, i) => (
          <li
            key={item.title}
            style={
              {
                '--tl-pc': `var(--tl-stop-${(i % 6) + 1})`,
              } as React.CSSProperties
            }
            className='rounded-xl border-l-4 border-[var(--tl-pc)] bg-tl-panel-2 px-3 py-2'
          >
            <h3 className='m-0 text-[14px] font-bold'>{item.title}</h3>
            <p className='m-0 text-[13px] text-tl-muted'>{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

/**
 * Where I've worked: the latest roles of Standard (`latestRoles` of `lib/derive/home-lists`, newest first, the same list and the same
 * number as Standard's) as their stops of the trip, with the Standard link to the full resume. The school and the older jobs are
 * still on the map and on the Resume page. A stop sends the map there and opens the Resume page.
 */
export function HomeWork() {
  const copy = useCopy(homeCopy);
  const words = useCopy(travelTripCopy).home;
  const router = useRouter();
  const { select, selectedId, stops, queries } = useTravel();
  const { experience } = queries;
  const shown = latestStops(experience.data ?? [], stops);
  return (
    <section aria-labelledby='tl-work'>
      <div className='mb-1 flex flex-wrap items-baseline justify-between gap-2'>
        <h2 id='tl-work' className={heading}>
          {copy.work.title}
        </h2>
        <Link
          href='/resume'
          className='inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4 pointer-coarse:min-h-11 pointer-coarse:items-center'
        >
          {copy.work.all}
          <ArrowRight aria-hidden='true' className='size-3.5' />
        </Link>
      </div>
      <TlDataState
        query={experience}
        count={shown.length}
        empty='work'
        subject='work'
        level={3}
        skeleton={<TlRowsSkeleton count={HOME_ROLES - 1} />}
      >
        <p className='sr-only'>{words.showOnMap}</p>
        <TripStopList
          only={shown}
          selectedId={selectedId}
          showTagline
          onPick={(id) => {
            select(id);
            router.push('/resume');
          }}
        />
      </TlDataState>
    </section>
  );
}

/** The featured projects of Standard (at most three, in rank order) as small postcards that lead to the Projects page. */
export function HomeFeatured() {
  const copy = useCopy(homeProjectsCopy);
  const states = useCopy(statesCopy);
  const query = useContentQuery('projects');
  const { data: skillList = [] } = useContentQuery('skills');
  const byId = new Map(skillList.map((s) => [s.id, s]));
  const shown = featuredProjects(query.data ?? []);
  // featured projects are an extra: with none (or if they fail to load) the block is left out, as in Standard
  if (query.isError || (!query.isPending && !shown.length)) return null;
  return (
    <section aria-labelledby='tl-featured'>
      <div className='mb-2 flex flex-wrap items-baseline justify-between gap-2'>
        <h2 id='tl-featured' className={heading}>
          {copy.title}
        </h2>
        <Link
          href='/projects'
          className='inline-flex items-center gap-1 text-sm font-bold underline underline-offset-4 pointer-coarse:min-h-11 pointer-coarse:items-center'
        >
          {copy.all}
          <ArrowRight aria-hidden='true' className='size-3.5' />
        </Link>
      </div>
      {query.isPending ? (
        <div role='status' aria-busy='true' aria-label={states.loading}>
          <TlRowsSkeleton count={2} />
        </div>
      ) : (
        <ul className='m-0 grid grid-cols-1 list-none gap-2.5 p-0'>
          {shown.map((project) => {
            const tags = skillsOf(project.technologies, byId);
            return (
              <li key={project.id}>
                <Link
                  href={project.links[0]?.url ?? '/projects'}
                  className='flex gap-3 rounded-2xl bg-tl-panel-2 p-2.5'
                >
                  <span className='relative h-16 w-24 flex-none overflow-hidden rounded-xl bg-tl-chip'>
                    {project.cover ? (
                      <Image
                        src={project.cover}
                        alt=''
                        fill
                        sizes='96px'
                        className='object-cover object-top'
                      />
                    ) : (
                      <span
                        aria-hidden='true'
                        className='grid size-full place-items-center text-xl font-extrabold text-tl-chip-ink'
                      >
                        {initialsOf(project.name)}
                      </span>
                    )}
                  </span>
                  <span className='min-w-0'>
                    <b className='block text-[14.5px]'>{project.name}</b>
                    {project.summary && (
                      <span className='line-clamp-2 text-[12.5px] text-tl-muted'>
                        {project.summary}
                      </span>
                    )}
                    {tags.length > 0 && (
                      <span className='block truncate text-[11.5px] text-tl-muted'>
                        {tags.map((t) => t.name).join(', ')}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
