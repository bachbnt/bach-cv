/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import type { ReactNode } from 'react';
import { shell } from '@/lib/content/shell';
import { useContentQuery } from '@/lib/query/use-content';
import { CodeWindow } from '@/skins/dev/blocks/code-window';
import { shortDegree } from '@/skins/dev/blocks/short-degree';
import { yearsSince } from '@/skins/dev/blocks/years-since';
import { FileIcon } from '@/skins/dev/icons/file-icon';

/** The areas of the stack, as the Resume groups its skills; the names are words of the trade, the same in both languages. */
const STACK = [
  ['mobile', 'Mobile'],
  ['web', 'Web'],
  ['ai', 'AI'],
] as const;

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

/** The `Profile.tsx` window beside the title: every value is read from the data, and a value that is not there is left out. */
export function HomeProfileWindow() {
  const { data: experience = [] } = useContentQuery('experience');
  const { data: skills = [] } = useContentQuery('skills');
  const { data: education = [] } = useContentQuery('education');
  const current = experience.find((j) => !j.endMonth);
  const job = current ?? experience[0];
  // the first role on the site to now (the roles the owner keeps hidden do not count)
  const first = experience.map((j) => j.startMonth).sort()[0];
  // `now` only has to be right to the year
  const years = first ? yearsSince(first, new Date()) : 0;
  // the latest degree (the same one the photo card shows)
  const degree = [...education].sort((a, b) =>
    b.startMonth.localeCompare(a.startMonth),
  )[0];
  const stack = STACK.filter(([category]) =>
    skills.some((s) => s.listed && s.category === category),
  ).map(([, name]) => name);

  const props: ReactNode[] = [
    attr('name', str(shell.name)),
    job && attr('role', str(job.role)),
    job && attr('company', str(job.company)),
    // since when I have been in the current role (a past role has no "since")
    current && attr('since', num(Number(current.startMonth.slice(0, 4)))),
    years > 0 && attr('experience', num(years), 'years of experience'),
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
