/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { SkillTip } from '@/components/skills/skill-tip';
import { evidenceLine, tipText } from '@/components/skills/skill-text';
import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { tradeDataCopy } from '@/content/copy/trade-data';
import { useState } from 'react';
import { useNow } from '@/hooks/use-now';
import type { Doc, Skill } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { skillGroups } from '@/lib/derive/skill-groups';
import { DataSegmented } from '@/skins/trade/blocks/data-segmented';
import { DataSkillHeat } from '@/skins/trade/blocks/data-skill-heat';
import { DataSkillTile } from '@/skins/trade/blocks/data-skill-tile';
import { useSkillTip } from '@/skins/trade/blocks/data-use-skill-tip';
import { TvDataState } from '@/skins/trade/ui/tv-data-state';
import { TvSkeleton } from '@/skins/trade/ui/tv-skeleton';
import { coreStack } from '@/lib/derive/core-stack';

const DOT: Record<Skill['category'], string> = {
  ai: 'bg-ai-foreground',
  mobile: 'bg-mobile-foreground',
  web: 'bg-web-foreground',
  tools: 'bg-tools-foreground',
};

/**
 * The Skills section: the core stack as large tiles with where each was used, then every listed skill by area as small tiles. All of
 * them show the Standard tip ("Used at FPT, MoMo. First used 2022.") on hover, focus or tap.
 */
export function DataSkills({
  jobs,
  reveal,
}: {
  jobs: Doc<'experience'>[];
  /** opens the note of a role (a role of the heatmap) */
  reveal: (id: string) => void;
}) {
  const { skills: copy } = useCopy(resumeCopy);
  const { resume } = useCopy(tradeDataCopy);
  const [view, setView] = useState<'list' | 'heatmap'>('list');
  const now = useNow();
  const { skills, evidence, isPending, isError, refetch } = useSkills();
  const { tip, setTip, hide } = useSkillTip();
  const query = { isPending, isError, refetch };
  const core = coreStack(skills);
  const groups = skillGroups(skills);

  const tileProps = (skill: Skill & { id: string }) => ({
    skill,
    core: skill.highlight !== null,
    active: tip?.id === skill.id,
    onHide: hide,
    onShow: (element: HTMLElement) => {
      const r = element.getBoundingClientRect();
      setTip({
        id: skill.id,
        text: tipText(evidence.get(skill.id), copy.tip),
        rect: { left: r.left, top: r.top, width: r.width, bottom: r.bottom },
      });
    },
  });

  return (
    <section id='skills' aria-labelledby='skills-h' className='scroll-mt-4'>
      <div className='flex flex-wrap items-center justify-between gap-x-3 gap-y-1 pr-3.5'>
        <h2 id='skills-h' className='px-3.5 pt-5 pb-2 text-[13px] font-bold'>
          {copy.title}
        </h2>
        <DataSegmented
          label={resume.skillsView.label}
          value={view}
          onChange={setView}
          options={[
            { value: 'list', label: resume.skillsView.list },
            { value: 'heatmap', label: resume.skillsView.heatmap },
          ]}
        />
      </div>
      <div className='px-3.5 pb-4'>
        <p className='max-w-[620px] text-xs/[1.5] text-tv-mute'>{copy.lead}</p>
        <div className='mt-4 flex flex-wrap items-baseline gap-x-3'>
          <h3 className='text-[13px] font-semibold'>{copy.core.title}</h3>
          <p className='text-xs text-tv-mute'>{copy.core.lead}</p>
        </div>
        <TvDataState
          query={query}
          count={core.length}
          empty='coreStack'
          subject='coreStack'
          level={3}
          className='mt-2'
          skeleton={
            <div className='mt-2 grid grid-cols-[repeat(auto-fill,minmax(170px,1fr))] gap-2'>
              {Array.from({ length: 4 }, (_, i) => (
                <TvSkeleton key={i} className='h-20' />
              ))}
            </div>
          }
        >
          <ul className='m-0 mt-2 grid list-none grid-cols-[repeat(auto-fill,minmax(min(100%,190px),1fr))] gap-2 p-0'>
            {core.map((skill, index) => (
              <li key={skill.id} className='flex *:flex-1'>
                <DataSkillTile
                  {...tileProps(skill)}
                  index={index}
                  line={evidenceLine(evidence.get(skill.id), copy.evidence)}
                />
              </li>
            ))}
          </ul>
        </TvDataState>
        <div className='mt-5 mb-2 flex flex-wrap items-baseline gap-x-3'>
          <h3 className='text-[13px] font-semibold'>
            {view === 'list' ? copy.all.title : resume.heat.label}
          </h3>
          <p className='text-xs text-tv-mute'>
            {view === 'list' ? copy.all.lead : resume.heat.lead}
          </p>
        </div>
        <TvDataState
          query={query}
          count={groups.length}
          empty='skills'
          subject='skills'
          level={3}
          skeleton={
            <div className='grid gap-2'>
              {Array.from({ length: 3 }, (_, i) => (
                <TvSkeleton key={i} className='h-16' />
              ))}
            </div>
          }
        >
          {view === 'heatmap' ? (
            <DataSkillHeat
              jobs={jobs}
              skills={skills}
              now={now}
              onOpen={reveal}
            />
          ) : (
            <div className='grid gap-2.5'>
              {groups.map(({ category, items }) => (
                <section
                  key={category}
                  aria-labelledby={`tv-skills-${category}`}
                  className='rounded border border-tv-line bg-tv-panel p-3'
                >
                  <h4
                    id={`tv-skills-${category}`}
                    className='mb-2 flex items-center gap-2 text-[13px] font-semibold'
                  >
                    <span
                      aria-hidden='true'
                      className={`size-2 rounded-sm ${DOT[category]}`}
                    />
                    {copy.groups[category]}
                    <span className='text-xs font-normal text-tv-mute tabular-nums'>
                      {items.length}
                    </span>
                  </h4>
                  <div className='flex flex-wrap gap-1.5'>
                    {items.map((skill, index) => (
                      <DataSkillTile
                        key={skill.id}
                        {...tileProps(skill)}
                        index={index}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </TvDataState>
        {tip && <SkillTip tip={tip} />}
      </div>
    </section>
  );
}
