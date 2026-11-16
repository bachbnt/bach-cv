/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { shell } from '@/lib/content/shell';
import { latestDegree } from '@/lib/derive/latest-degree';
import { currentJob, latestJob } from '@/lib/derive/current-job';
import { areasWithSkills, type Area } from '@/lib/derive/skill-groups';
import { shortDegree } from '@/lib/derive/short-degree';
import { useCareerYears } from '@/lib/query/use-career-years';
import { useContentQuery } from '@/lib/query/use-content';
import { CodeWindow } from '@/skins/dev/blocks/code-window';
import { FileIcon } from '@/skins/dev/icons/file-icon';
import { DevSkeletonCode } from '@/skins/dev/ui/dev-skeleton-bar';

/** The names of the areas of the stack, as the Resume groups its skills; they are words of the trade, the same in both languages. */
const AREA_NAMES: Record<Area, string> = {
  mobile: 'Mobile',
  web: 'Web',
  ai: 'AI',
};

const str = (value: string) => <span className='dv-str'>{`"${value}"`}</span>;
const num = (value: number) => (
  <>
    {'{'}
    <span className='dv-num'>{value}</span>
    {'}'}
  </>
);
const attr = (name: string, value: ReactNode, note?: string) => (
  <>
    <span className='dv-at'>{name}</span>={value}
    {note && (
      <>
        {' '}
        <span className='dv-cmt'>{`// ${note}`}</span>
      </>
    )}
  </>
);

/**
 * The width, in letters, of the values of a typical profile (`"Team Lead"`, `"FPT Software"`, `{2026}`, `{7}`, `{['Mobile', 'Web', 'AI']}`, `"MSc"`),
 * which stand blank while the data loads so the window has the lines, and the wraps, it will have.
 */
const BLANK_VALUES: [name: string, chars: number, note?: string][] = [
  ['role', 11],
  ['company', 14],
  ['since', 6],
  ['experience', 3, 'years of experience'],
  ['stack', 25],
  ['degree', 5],
];

/** The `Profile.tsx` window beside the title: every value is read from the data, and a value that is not there is left out. */
export function HomeProfileWindow() {
  const experienceQuery = useContentQuery('experience');
  const skillsQuery = useContentQuery('skills');
  const educationQuery = useContentQuery('education');
  const { data: experience = [] } = experienceQuery;
  const { data: skills = [] } = skillsQuery;
  const { data: education = [] } = educationQuery;
  // one state for the whole window: the blank lines stay until every value can be read, so the lines are not added one by one
  const pending =
    experienceQuery.isPending ||
    skillsQuery.isPending ||
    educationQuery.isPending;
  const current = currentJob(experience);
  const job = latestJob(experience);
  // the same number every page and skin states (the roles the owner keeps hidden do not count)
  const years = useCareerYears();
  // the latest degree (the same one the photo card shows)
  const degree = latestDegree(education);
  const stack = areasWithSkills(skills).map((area) => AREA_NAMES[area]);

  const props: ReactNode[] = pending
    ? [
        attr('name', str(shell.name)),
        ...BLANK_VALUES.map(([name, chars, note]) =>
          attr(name, <DevSkeletonCode chars={chars} />, note),
        ),
      ]
    : [
        attr('name', str(shell.name)),
        job && attr('role', str(job.role)),
        job && attr('company', str(job.company)),
        // since when I have been in the current role (a past role has no "since")
        current && attr('since', num(Number(current.startMonth.slice(0, 4)))),
        years !== null &&
          years > 0 &&
          attr('experience', num(years), 'years of experience'),
        stack.length > 0 &&
          attr(
            'stack',
            <>
              {'{['}
              {stack.map((name, i) => (
                <span key={name}>
                  {i > 0 && ', '}
                  <span className='dv-str'>{`'${name}'`}</span>
                </span>
              ))}
              {']}'}
            </>,
          ),
        degree && attr('degree', str(shortDegree(degree.degree))),
      ].filter(Boolean);

  const lines: ReactNode[] = [
    <>
      <span className='dv-kw'>import</span> {'{'}{' '}
      <span className='dv-fn'>Engineer</span> {'}'}{' '}
      <span className='dv-kw'>from</span>{' '}
      <span className='dv-str'>{"'./Engineer'"}</span>;
    </>,
    '',
    <>
      <span className='dv-kw'>export function</span>{' '}
      <span className='dv-fn'>Profile</span>() {'{'}
    </>,
    <>
      {'  '}
      <span className='dv-kw'>return</span> (
    </>,
    <>
      {'    '}&lt;<span className='dv-tg'>Engineer</span>
    </>,
    ...props.map((prop) => (
      <>
        {'      '}
        {prop}
      </>
    )),
    <>{'    '}/&gt;</>,
    '  );',
    '}',
  ];

  return (
    <CodeWindow
      icon={<FileIcon kind='tsx' />}
      file='Profile.tsx'
      language='TypeScript React'
      lines={lines}
    />
  );
}
