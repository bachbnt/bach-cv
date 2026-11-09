/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useState } from 'react';
import { academicResumeCopy } from '@/content/copy/academic-resume';
import { resumeCopy } from '@/content/copy/resume';
import { evidenceLine } from '@/components/skills/skill-text';
import { fill } from '@/lib/chat/fill';
import { tallyYears } from '@/lib/derive/tally';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { AcTally } from '@/skins/academic/blocks/ac-tally';
import { AREA_INK } from '@/skins/academic/blocks/resume-tags';
import {
  areasOf,
  filterRows,
  sortRows,
  type AreaFilter,
  type SkillRow,
  type SortDir,
  type SortKey,
} from '@/skins/academic/blocks/resume-skills-model';
import { AcChip } from '@/skins/academic/ui/ac-chip';
import { AcNoteBig, AcNoteCap, AcRow } from '@/skins/academic/ui/ac-note';

const cell =
  'border-b-[1.5px] border-dashed border-ac-faint py-[7px] pr-2.5 align-baseline max-[760px]:block max-[760px]:border-0 max-[760px]:p-0';

/**
 * The skills as a table of the manuscript: one row for each listed skill with its area, the months it was in use (with a tally of the
 * years) and where it was used. The columns sort, the area chips filter; on a phone each row is a short stack. The note in the margin
 * says how to read the tally.
 */
export function ResumeSkillsTable({ rows }: { rows: SkillRow[] }) {
  const { skills } = useCopy(resumeCopy);
  const words = useCopy(academicResumeCopy).skills;
  const { lang } = useLang();
  const [area, setArea] = useState<AreaFilter>('all');
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({
    key: 'area',
    dir: 1,
  });

  const shown = sortRows(filterRows(rows, area), sort.key, sort.dir, lang);
  const toggle = (key: SortKey) =>
    setSort((now) =>
      now.key === key
        ? { key, dir: now.dir === 1 ? -1 : 1 }
        : { key, dir: key === 'months' ? -1 : 1 },
    );
  const ariaSort = (key: SortKey) =>
    sort.key !== key
      ? 'none'
      : sort.dir === 1
        ? ('ascending' as const)
        : ('descending' as const);

  const th = (key: SortKey, label: string, className?: string) => (
    <th
      scope='col'
      aria-sort={ariaSort(key)}
      className={cn(
        'py-2 pr-2.5 text-left font-ac-note text-[18px] font-normal whitespace-nowrap',
        className,
      )}
    >
      <button
        type='button'
        onClick={() => toggle(key)}
        className='inline-flex cursor-pointer items-baseline gap-1 border-0 bg-transparent p-0 font-[inherit] text-[1em] text-ac-ink underline-offset-4 hover:underline pointer-coarse:min-h-11'
      >
        {label}
        <span aria-hidden='true' className='text-[10px] text-ac-accent'>
          {sort.key === key ? (sort.dir === 1 ? '▲' : '▼') : ''}
        </span>
      </button>
    </th>
  );

  const note = (
    <>
      <AcNoteBig>{words.tally.title}</AcNoteBig>
      <AcNoteCap>{words.tally.text}</AcNoteCap>
      <span className='mt-2 block'>
        <AcTally years={7} />
      </span>
    </>
  );

  return (
    <AcRow note={note} tone='a' sticky>
      <div
        role='group'
        aria-label={words.filter}
        className='mb-3.5 flex flex-wrap items-center gap-2'
      >
        <AcChip aria-pressed={area === 'all'} onClick={() => setArea('all')}>
          {words.all}
        </AcChip>
        {areasOf(rows).map((value) => (
          <AcChip
            key={value}
            aria-pressed={area === value}
            onClick={() => setArea(value)}
          >
            {skills.groups[value]}
          </AcChip>
        ))}
      </div>
      <table className='w-full border-collapse border-y-[2.5px] border-ac-ink/70 text-[0.93em] tabular-nums max-[760px]:block'>
        <caption className='pb-3 text-left text-[0.94em]/[1.45] caption-top max-[760px]:block'>
          {words.caption}
        </caption>
        <thead className='max-[760px]:block'>
          <tr className='border-b-2 border-dashed border-ac-rule max-[760px]:flex max-[760px]:flex-wrap max-[760px]:gap-x-4'>
            {th('name', words.columns.skill)}
            {th('area', words.columns.area)}
            {th(
              'months',
              words.columns.months,
              'text-right pr-[18px] max-[760px]:text-left',
            )}
            <th scope='col' aria-hidden='true' className='max-[760px]:hidden' />
            <th
              scope='col'
              className='py-2 text-left font-ac-note text-[18px] font-normal whitespace-nowrap max-[760px]:hidden'
            >
              {skills.evidence.usedAt}
            </th>
          </tr>
        </thead>
        <tbody className='max-[760px]:block'>
          {shown.map(({ skill, months, evidence }) => {
            const line = evidenceLine(evidence, skills.evidence);
            return (
              <tr
                key={skill.id}
                className='max-[760px]:grid max-[760px]:grid-cols-[1fr_auto] max-[760px]:items-baseline max-[760px]:gap-x-3 max-[760px]:border-b-[1.5px] max-[760px]:border-dashed max-[760px]:border-ac-faint max-[760px]:py-2'
              >
                <td
                  className={cn(
                    cell,
                    'font-semibold max-[760px]:col-start-1 max-[760px]:row-start-1',
                  )}
                >
                  {skill.name}
                  {skill.highlight !== null && (
                    <>
                      <span aria-hidden='true' className='ml-1 text-ac-md'>
                        †
                      </span>
                      <span className='sr-only'> ({words.coreMark})</span>
                    </>
                  )}
                </td>
                <td
                  className={cn(
                    cell,
                    AREA_INK[skill.category],
                    'font-ac-note max-[760px]:col-span-2 max-[760px]:row-start-3 max-[760px]:text-[0.86em]',
                  )}
                >
                  {skills.groups[skill.category]}
                </td>
                <td
                  className={cn(
                    cell,
                    'pr-[18px] text-right max-[760px]:col-start-2 max-[760px]:row-start-1 max-[760px]:p-0',
                  )}
                >
                  {months > 0
                    ? fill(words.monthsOf, { n: months })
                    : words.none}
                </td>
                <td
                  aria-hidden='true'
                  className={cn(cell, 'min-w-24 text-ac-ma max-[760px]:hidden')}
                >
                  <AcTally years={tallyYears(months)} />
                </td>
                <td
                  className={cn(
                    cell,
                    'text-ac-mute max-[760px]:col-span-2 max-[760px]:row-start-2 max-[760px]:text-[0.86em]',
                  )}
                >
                  {line ? (
                    <>
                      {line.replace(`${skills.evidence.usedAt} `, '')}
                      {evidence?.since ? (
                        <span className='block text-[0.88em]'>
                          {skills.tip.firstUsed.replace(
                            '{year}',
                            String(evidence.since),
                          )}
                        </span>
                      ) : null}
                    </>
                  ) : (
                    <span aria-label={skills.tip.none}>{words.none}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </AcRow>
  );
}
