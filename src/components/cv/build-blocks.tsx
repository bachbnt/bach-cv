/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { ReactNode } from 'react';
import { CvHead } from '@/components/cv/cv-head';
import { CvSectionTitle } from '@/components/cv/cv-section-title';
import { CvTimelineRow } from '@/components/cv/cv-timeline-row';
import type { CvCopy } from '@/content/copy/cv';
import type { CvModel, CvRole } from '@/lib/cv/build-cv';

/** A piece of a sheet that is never split across two pages. */
export interface CvBlock {
  key: string;
  /** a heading: kept on the page of the block after it */
  keepWithNext?: boolean;
  node: ReactNode;
}

const labelled = (label: string, items: string[]) => (
  <p className='mb-1'>
    <b>{label}:</b> {items.join(', ')}
  </p>
);

const ENTRY_GAP = 14;
const ROW_GAP = 3;

/** One work entry as rows of the timeline: the head, then one row per project description and per bullet. */
function roleBlocks(role: CvRole, last: boolean, copy: CvCopy): CvBlock[] {
  const rows: ReactNode[] = [];
  const { describedProjects, bullets } = role;

  rows.push(
    <>
      <p className='mb-[5px] text-[12px] font-semibold'>{role.role}</p>
      {role.team && <p className='my-1 italic'>{role.team}</p>}
      {role.summary && <p className='mb-1'>{role.summary}</p>}
      {role.technologies.length > 0 &&
        labelled(copy.labels.technologies, role.technologies)}
      {role.plainProjects.length > 0 &&
        labelled(copy.labels.projects, role.plainProjects)}
      {describedProjects.length > 0 && (
        <p className='my-1 italic'>{copy.labels.projects}:</p>
      )}
    </>,
  );
  describedProjects.forEach((p) =>
    rows.push(
      <p className='mb-0'>
        <b>{p.name}</b>: {p.description}
      </p>,
    ),
  );
  bullets.forEach((text, i) =>
    rows.push(
      <>
        {i === 0 && (
          <p className='my-1 italic'>{copy.labels.responsibilities}:</p>
        )}
        <ul className='m-0 list-disc pl-[15px]'>
          <li>{text}</li>
        </ul>
      </>,
    ),
  );

  return rows.map((content, i) => {
    const end = i === rows.length - 1;
    const through = !end || !last;
    return {
      key: `${role.id}-${i}`,
      node: (
        <CvTimelineRow
          dot={i === 0}
          line={through}
          gap={end ? ENTRY_GAP : ROW_GAP}
          left={
            i === 0 ? (
              <>
                <p className='mb-1 text-[11.5px] font-semibold'>
                  {role.company}
                </p>
                <p className='m-0 text-muted-foreground'>{role.period}</p>
              </>
            ) : undefined
          }
        >
          {content}
        </CvTimelineRow>
      ),
    };
  });
}

const section = (title: string, key: string): CvBlock => ({
  key: `${key}-title`,
  keepWithNext: true,
  node: <CvSectionTitle title={title} />,
});

/** Turns the CV model into the pieces the sheets are filled with, in reading order. */
export function buildBlocks(cv: CvModel, copy: CvCopy): CvBlock[] {
  const blocks: CvBlock[] = [{ key: 'head', node: <CvHead cv={cv} /> }];

  if (cv.summary) {
    blocks.push(section(copy.sections.summary, 'summary'), {
      key: 'summary',
      node: <p className='mb-1'>{cv.summary}</p>,
    });
  }

  if (cv.experience.length > 0) {
    blocks.push(section(copy.sections.experience, 'experience'));
    cv.experience.forEach((role, i) =>
      blocks.push(...roleBlocks(role, i === cv.experience.length - 1, copy)),
    );
  }

  if (cv.education.length > 0) {
    blocks.push(section(copy.sections.education, 'education'), {
      key: 'education',
      node: (
        <div className='grid grid-cols-2 gap-x-7'>
          {cv.education.map((e) => (
            <div key={e.id} className='mb-2.5 min-w-0'>
              <p className='text-muted-foreground'>{e.period}</p>
              <p>
                <b>{e.degree}</b>
              </p>
              <p>
                <b>{e.school}</b>
              </p>
              {e.major && (
                <p>
                  {copy.labels.major}: {e.major}
                </p>
              )}
              {e.thesis && (
                <p>
                  {copy.labels.thesis}: {e.thesis}
                </p>
              )}
              {e.technologies.length > 0 && (
                <p>
                  {copy.labels.technologies}: {e.technologies.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      ),
    });
  }

  if (cv.certificates.length > 0) {
    blocks.push(section(copy.sections.certificates, 'certificates'), {
      key: 'certificates',
      node: (
        <div className='grid grid-cols-3 gap-x-7'>
          {cv.certificates.map((c) => (
            <div key={c.id} className='mb-2.5 min-w-0'>
              <p className='text-muted-foreground'>{c.date}</p>
              <p>
                <b>{c.name}</b>
              </p>
            </div>
          ))}
        </div>
      ),
    });
  }

  if (cv.skills.length > 0) {
    blocks.push(section(copy.sections.skills, 'skills'), {
      key: 'skills',
      node: (
        <div className='flex gap-5'>
          {cv.skills.map((group) => (
            <div key={group.id} className='mb-2.5 min-w-0 flex-1'>
              <p>
                <b>{group.title}</b>
              </p>
              <p>{group.skills.join(', ')}</p>
            </div>
          ))}
        </div>
      ),
    });
  }

  if (cv.projects.length > 0) {
    blocks.push(section(copy.sections.projects, 'projects'));
    cv.projects.forEach((p, i) =>
      blocks.push({
        key: `project-${p.id}`,
        node: (
          <CvTimelineRow
            dot
            line={i < cv.projects.length - 1}
            gap={ENTRY_GAP}
            left={
              <>
                <p className='mb-1 text-[11.5px] font-semibold'>{p.name}</p>
                {p.period && (
                  <p className='m-0 text-muted-foreground'>{p.period}</p>
                )}
              </>
            }
          >
            {p.description && <p className='mb-1'>{p.description}</p>}
            {p.technologies.length > 0 &&
              labelled(copy.labels.technologies, p.technologies)}
          </CvTimelineRow>
        ),
      }),
    );
  }

  return blocks;
}
