/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { shortDegree } from '@/lib/derive/short-degree';
import { monthStart } from '@/skins/trade/blocks/build-candles';

const DAY_MS = 24 * 60 * 60 * 1000;

/** What the chart needs of an education document (the content hook has already chosen the language). */
export interface Degree {
  id: string;
  degree: string;
  school: string;
  major: string;
  /** `YYYY-MM` */
  startMonth: string;
  /** `YYYY-MM`, or `null` for a degree I am still studying for */
  endMonth: string | null;
}

/** A degree on the chart: the time it covers and where its flag goes. */
export interface Study extends Degree {
  /** the short name of the degree (`MSc`) */
  label: string;
  /** the first day of the first month, in milliseconds */
  start: number;
  /** the first day after the last month, or `null` while it goes on */
  end: number | null;
  /** the time of its graduation flag: the last day of the end month, or the start of a degree that is not finished */
  flagAt: number;
}

/** The school without what follows its name ("University of Science - Vietnam National University ..." is "University of Science"). */
export function shortSchool(school: string): string {
  return school.split(/\s[-–—]\s|,/u)[0].trim();
}

/** The degrees as the chart draws them, the earliest first. A document with a month that is not a month is left out. */
export function studiesOf(degrees: Degree[]): Study[] {
  return degrees
    .flatMap((d) => {
      const start = monthStart(d.startMonth);
      if (!Number.isFinite(start)) return [];
      const last = d.endMonth ? monthStart(d.endMonth) : Number.NaN;
      const end = Number.isFinite(last)
        ? new Date(
            new Date(last).getFullYear(),
            new Date(last).getMonth() + 1,
            1,
          ).getTime()
        : null;
      return [
        {
          ...d,
          label: shortDegree(d.degree),
          start,
          end,
          flagAt: end === null ? start : end - DAY_MS,
        },
      ];
    })
    .sort((a, b) => a.start - b.start);
}

/** The degree being studied for at a time (the newest when two overlap), or `null`. */
export function studyAt(studies: Study[], t: number): Study | null {
  let found: Study | null = null;
  for (const s of studies)
    if (
      t >= s.start &&
      (s.end === null || t < s.end) &&
      (!found || s.start > found.start)
    )
      found = s;
  return found;
}

/** The legend's words for a degree in progress: `MSc · University of Science`. */
export const studyText = (study: Study | null): string =>
  study ? `${study.label} · ${shortSchool(study.school)}` : '';

/** Whether a time is inside the chart, from the start of its first candle to the end of its last. */
export const onChart = (t: number, first: number, last: number): boolean =>
  t >= first && t < last;
