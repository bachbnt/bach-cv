/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Briefcase, GraduationCap } from 'lucide-react';
import { memo } from 'react';

export interface FlagView {
  /** a job (a blue flag with a briefcase, a star for the one I am in now) or a degree (a violet flag with a graduation cap) */
  kind: 'job' | 'degree';
  id: string;
  current: boolean;
  x: number;
  y: number;
  /** the flag is inside the plot (one outside stays mounted, so its drop-in does not play again, but is hidden) */
  inside: boolean;
  /** the tip goes above the flag when there is no room under it */
  above: boolean;
  label: string;
  /** the tip: the first line is bold, the others follow it */
  tip: string[];
}

/**
 * The flags of the chart: the real jobs at the week each one started (a star for the one I am in now) and the degrees at the month they
 * ended (or began, while I am still studying), with a graduation cap and another colour. Each is a button, so the keyboard and screen
 * readers reach it; it opens that job on the Resume page, or the education there. A tip names what it is. A flag drops in with a little
 * bounce, one after another the first time the chart shows (`intro`), at once when the replay reaches it.
 */
export const FlagsLayer = memo(function FlagsLayer({
  flags,
  intro,
  onOpen,
}: {
  flags: FlagView[];
  intro: boolean;
  onOpen: (flag: FlagView) => void;
}) {
  return (
    <>
      {flags.map((flag, k) => {
        const { kind, id, current, x, y, inside, above, label, tip } = flag;
        const degree = kind === 'degree';
        const tone = degree
          ? 'bg-tv-violet before:border-b-tv-violet hover:bg-tv-violet/85'
          : 'bg-tv-accent before:border-b-tv-accent hover:bg-tv-accent-hover';
        return (
          <div
            key={`${kind}:${id}`}
            className='pointer-events-none absolute top-0 left-0 z-[3]'
            style={{
              transform: `translate(${x}px, ${y}px)`,
              visibility: inside ? 'visible' : 'hidden',
            }}
          >
            <button
              type='button'
              {...(degree ? { 'data-degree': id } : { 'data-marker': id })}
              aria-label={label}
              onClick={() => onOpen(flag)}
              style={{
                animationDelay: intro ? `${900 + k * 140}ms` : undefined,
              }}
              className={`tv-chart-flag group/marker pointer-events-auto absolute grid h-[18px] min-w-5 -translate-x-1/2 cursor-pointer place-items-center rounded-[3px] text-[11px] leading-none font-bold text-white before:absolute before:-top-1.5 before:left-1/2 before:-ml-[5px] before:border-x-[5px] before:border-b-[6px] before:border-x-transparent before:content-[""] after:absolute after:-inset-3.5 after:content-[""] ${tone}`}
            >
              {degree ? (
                <GraduationCap aria-hidden='true' className='size-3.5' />
              ) : current ? (
                <span aria-hidden='true'>★</span>
              ) : (
                <Briefcase aria-hidden='true' className='size-3.5' />
              )}
              <span
                aria-hidden='true'
                className={`pointer-events-none absolute left-1/2 hidden w-max max-w-[220px] -translate-x-1/2 rounded-md bg-tv-tip px-2.5 py-2 text-left text-xs font-normal text-white shadow-tv-menu group-hover/marker:block group-focus-visible/marker:block ${above ? 'bottom-6' : 'top-6'}`}
              >
                {tip.map((line, i) =>
                  i === 0 ? (
                    <b key={i} className='block font-semibold'>
                      {line}
                    </b>
                  ) : (
                    <span
                      key={i}
                      className={`block ${i === tip.length - 1 ? 'opacity-70' : ''}`}
                    >
                      {line}
                    </span>
                  ),
                )}
              </span>
            </button>
          </div>
        );
      })}
    </>
  );
});
