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
/**
 * The invisible hit area of a flag is 24px wide and 46px tall: flags are never closer than 24px (`spreadFlags`), so a wider area would lie
 * over the centre of the neighbour (it did, at 14px: a tap on a job opened the degree next to it).
 */
/** How far a flag must be from the edge of the plot for its tip to be centred on it (the tip is at most 220px wide). */
const TIP_EDGE = 112;

export const FlagsLayer = memo(function FlagsLayer({
  flags,
  intro,
  width,
  onOpen,
}: {
  flags: FlagView[];
  intro: boolean;
  /** the width of the plot: a tip of a flag near either edge grows inward instead of being cut off */
  width: number;
  onOpen: (flag: FlagView) => void;
}) {
  return (
    <>
      {flags.map((flag, k) => {
        const { kind, id, current, x, y, inside, above, label, tip } = flag;
        const degree = kind === 'degree';
        const tone = degree
          ? 'bg-tv-violet before:border-b-tv-violet hover:bg-tv-violet/85 active:bg-tv-violet/85'
          : 'bg-tv-accent before:border-b-tv-accent hover:bg-tv-accent-hover active:bg-tv-accent-hover';
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
              className={`tv-chart-flag group/marker pointer-events-auto absolute grid h-[18px] min-w-5 -translate-x-1/2 cursor-pointer place-items-center rounded-[3px] text-[11px] transition-[background-color,scale] duration-100 active:scale-90 leading-none font-bold text-white before:absolute before:-top-1.5 before:left-1/2 before:-ml-[5px] before:border-x-[5px] before:border-b-[6px] before:border-x-transparent before:content-[""] after:absolute after:-inset-x-0.5 after:-inset-y-3.5 after:content-[""] ${tone}`}
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
                className={`pointer-events-none invisible absolute w-max max-w-[220px] rounded-md bg-tv-tip px-2.5 py-2 text-left text-xs font-normal text-white opacity-0 shadow-tv-menu transition-[opacity,translate,visibility] duration-160 ease-tv-out group-hover/marker:visible group-hover/marker:translate-y-0 group-hover/marker:opacity-100 group-focus-visible/marker:visible group-focus-visible/marker:translate-y-0 group-focus-visible/marker:opacity-100 ${above ? 'bottom-6 translate-y-1' : 'top-6 -translate-y-1'} ${x < TIP_EDGE ? 'left-0' : x > width - TIP_EDGE ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}
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
