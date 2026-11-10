/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { highlighted } from '@/lib/derive/highlighted';
import {
  BookOpen,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { resumeCopy } from '@/content/copy/resume';
import { travelTripCopy } from '@/content/copy/travel-trip';
import { useSkills } from '@/components/skills/use-skills';
import { skillsOf } from '@/components/projects/project-helpers';
import { formatPeriod } from '@/lib/format';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { fill } from '@/lib/chat/fill';
import { TripCurrentFlag } from '@/skins/travel/blocks/trip-current-flag';
import { useReducedMotion } from '@/skins/travel/shell/use-reduced-motion';
import { useTravel, type TripStop } from '@/skins/travel/shell/travel-context';
import { TlButton } from '@/skins/travel/ui/tl-button';
import { TlChip } from '@/skins/travel/ui/tl-chip';
import { TlKicker } from '@/skins/travel/ui/tl-kicker';

/**
 * The card of one stop: what Standard tells about a role (company, role and team, period, Current, summary, key projects,
 * technologies, responsibilities) or about the school (degrees, period, major, thesis and its links), as a guidebook page: the
 * responsibilities are "things to see", the technologies "souvenirs in the luggage".
 */
export function TripStopCard({
  stop,
  index,
  total,
  onStep,
}: {
  stop: TripStop;
  index: number;
  total: number;
  onStep: (by: number) => void;
}) {
  const words = useCopy(travelTripCopy).resume;
  const copy = useCopy(resumeCopy);
  const { lang } = useLang();
  const { byId } = useSkills();
  const [open, setOpen] = useState(false);
  const { career, map } = stop;
  const { stops } = useTravel();
  const reduced = useReducedMotion();
  const card = useRef<HTMLElement>(null);
  // the card is not rebuilt for every stop (a focused Previous or Next button would be lost, and the keyboard would start again from the
  // top of the page): its state starts again and the book is opened again, by hand
  const [shownFor, setShownFor] = useState(map.id);
  if (shownFor !== map.id) {
    setShownFor(map.id);
    setOpen(false);
  }
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced) return;
    card.current?.animate(
      [
        { opacity: 0, transform: 'perspective(800px) rotateX(-55deg)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 600, easing: 'cubic-bezier(0.2, 0.9, 0.3, 1.1)' },
    );
  }, [map.id, reduced]);
  // the stops of the main road are numbered from 1, in the order of the career; the school and the side trips have a name of their own
  const number = stops
    .slice(0, index + 1)
    .filter((s) => !s.career.side && s.career.type === 'job').length;
  const kicker = career.current
    ? words.destination
    : career.type === 'school'
      ? words.trailhead
      : career.side
        ? words.sideTrip
        : fill(words.stop, { n: String(number) });

  return (
    <article
      ref={card}
      aria-label={map.name}
      style={{ '--tl-pc': `var(--tl-stop-${map.color})` } as CSSProperties}
      className='tl-guide-open rounded-2xl border border-tl-line border-t-[5px] border-t-[var(--tl-pc)] bg-tl-panel-2 p-4'
    >
      <TlKicker className='text-[var(--tl-pc)]'>{kicker}</TlKicker>
      {career.type === 'job' ? (
        <>
          <h3 className='mt-1 flex flex-wrap items-center gap-2 text-xl/[1.15] font-extrabold'>
            {career.job.company}
            {career.current && (
              <TripCurrentFlag>{copy.experience.current}</TripCurrentFlag>
            )}
          </h3>
          <p className='mt-1 font-bold'>
            {career.job.role}
            {career.job.team && (
              <span className='font-normal text-tl-muted'>
                {' '}
                · {career.job.team}
              </span>
            )}
          </p>
          <p className='mt-1.5 inline-flex items-center gap-1.5 rounded-full bg-tl-chip px-2.5 py-0.5 text-xs font-bold text-tl-muted'>
            <CalendarDays aria-hidden='true' className='size-3.5' />
            {formatPeriod(career.startMonth, career.endMonth, lang)}
          </p>
          {career.job.logo && (
            <div className='relative mt-3 h-28 overflow-hidden rounded-xl bg-tl-chip'>
              <Image
                src={career.job.logo}
                alt={career.job.company}
                fill
                sizes='420px'
                className='object-cover'
              />
            </div>
          )}
          {(career.job.summary || career.job.tagline) && (
            <p className='mt-3 text-tl-muted italic'>
              {career.job.summary || career.job.tagline}
            </p>
          )}
          {highlighted(career.job.projects).map((project) => (
            <div key={project.name} className='mt-3 rounded-xl bg-tl-chip p-3'>
              <TlChip className='bg-tl-solid'>
                {copy.experience.keyProject}
              </TlChip>
              <h4 className='mt-1.5 text-[15px] font-bold'>{project.name}</h4>
              {project.description && (
                <p className='mt-0.5 text-[13.5px] text-tl-muted'>
                  {project.description}
                </p>
              )}
            </div>
          ))}
          {career.job.bullets.length > 0 && (
            <div className='mt-3'>
              <button
                type='button'
                aria-expanded={open}
                onClick={() => setOpen((v) => !v)}
                className='inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-extrabold tracking-[0.9px] text-tl-muted uppercase pointer-coarse:min-h-11'
              >
                {open ? (
                  <EyeOff aria-hidden='true' className='size-3.5' />
                ) : (
                  <Eye aria-hidden='true' className='size-3.5' />
                )}
                {open ? copy.experience.hide : copy.experience.show}
                <span
                  aria-hidden='true'
                  className='font-bold text-[var(--tl-pc)]'
                >
                  {' '}
                  · {words.thingsToSee}
                </span>
              </button>
              {open && (
                <ul className='m-0 mt-2 grid grid-cols-1 list-none gap-1.5 p-0'>
                  {career.job.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className='relative pl-5 text-[13.5px] before:absolute before:top-[7px] before:left-[3px] before:size-2 before:rounded-full before:bg-[var(--tl-pc)] before:content-[""]'
                    >
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <Souvenirs
            title={words.souvenirs}
            chips={skillsOf(career.job.technologies, byId).map((s) => s.name)}
            color={map.color}
          />
        </>
      ) : (
        <>
          <h3 className='mt-1 text-xl/[1.15] font-extrabold'>
            {career.school}
          </h3>
          <div className='mt-2 grid grid-cols-1 gap-3'>
            {career.degrees.map((degree) => (
              <section
                key={degree.id}
                aria-label={degree.degree}
                className='rounded-xl bg-tl-chip p-3'
              >
                <h4 className='text-[15px] font-bold'>{degree.degree}</h4>
                <p className='mt-1 inline-flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-tl-muted'>
                  <span className='inline-flex items-center gap-1.5'>
                    <CalendarDays aria-hidden='true' className='size-3.5' />
                    {formatPeriod(degree.startMonth, degree.endMonth, lang)}
                  </span>
                  {degree.major && (
                    <span className='inline-flex items-center gap-1.5'>
                      <BookOpen aria-hidden='true' className='size-3.5' />
                      {degree.major}
                    </span>
                  )}
                </p>
                {degree.logo && (
                  <div className='relative mt-2 h-24 overflow-hidden rounded-lg bg-tl-solid'>
                    <Image
                      src={degree.logo}
                      alt={`${degree.degree}, ${degree.school}`}
                      fill
                      sizes='420px'
                      className='object-cover'
                    />
                  </div>
                )}
                {degree.thesisTitle && (
                  <div className='mt-2'>
                    <TlChip className='bg-tl-solid'>
                      {copy.education.thesis}
                    </TlChip>
                    <p className='mt-1 font-bold'>{degree.thesisTitle}</p>
                    <Souvenirs
                      title={words.fieldsOfStudy}
                      chips={skillsOf(degree.technologies, byId).map(
                        (s) => s.name,
                      )}
                      color={map.color}
                    />
                    <p className='mt-1.5 flex flex-wrap gap-x-4 gap-y-1'>
                      {[
                        [degree.thesisUrl, copy.education.readThesis],
                        [degree.thesisSourceUrl, copy.education.sourceCode],
                      ].map(
                        ([href, label]) =>
                          href && (
                            <a
                              key={label}
                              href={href}
                              target='_blank'
                              rel='noopener'
                              className='inline-flex text-sm font-bold underline underline-offset-4 pointer-coarse:min-h-11 pointer-coarse:items-center'
                            >
                              {label}
                            </a>
                          ),
                      )}
                    </p>
                  </div>
                )}
              </section>
            ))}
          </div>
        </>
      )}
      <div className='mt-4 flex gap-2'>
        <TlButton
          size='sm'
          className='flex-1'
          disabled={index <= 0}
          onClick={() => onStep(-1)}
        >
          {/* the chevron is 4 units wide in a box of 16: the margins take the empty sides away, so icon and words are centred together */}
          <ChevronLeft aria-hidden='true' className='-mr-1 -ml-1.5' />
          {words.previous}
        </TlButton>
        <TlButton
          size='sm'
          variant='solid'
          className='flex-1'
          disabled={index >= total - 1}
          onClick={() => onStep(1)}
        >
          {words.next}
          <ChevronRight aria-hidden='true' className='-mr-1.5 -ml-1' />
        </TlButton>
      </div>
    </article>
  );
}

function Souvenirs({
  title,
  chips,
  color,
}: {
  title: string;
  chips: string[];
  color: number;
}) {
  if (!chips.length) return null;
  return (
    <div className='mt-3'>
      <h4 className='m-0 mb-1.5 text-[11px] font-extrabold tracking-[0.9px] text-tl-muted uppercase'>
        {title}
      </h4>
      <ul className='m-0 flex list-none flex-wrap gap-1.5 p-0'>
        {chips.map((name) => (
          <li key={name}>
            <TlChip color={color}>{name}</TlChip>
          </li>
        ))}
      </ul>
    </div>
  );
}
