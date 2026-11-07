/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useSkills } from '@/components/skills/use-skills';
import { tipText } from '@/components/skills/skill-text';
import { TooltipProvider } from '@/components/ui/tooltip';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { skillGroups } from '@/lib/derive/skill-groups';
import { DevSkillChip } from '@/skins/dev/blocks/skill-chip';
import { DevCardsSkeleton } from '@/skins/dev/ui/dev-skeleton';
import { DevDataState } from '@/skins/dev/ui/dev-data-state';
import { DevCard } from '@/skins/dev/ui/dev-card';

/** The listed skills grouped by area, each chip with a tip ("Used at FPT, MoMo. First used 2022."). */
export function DevSkillGroups() {
  const copy = useCopy(resumeCopy);
  const { skills, evidence, isPending, isError, refetch } = useSkills();

  const groups = skillGroups(skills);

  return (
    <DevDataState
      query={{ isPending, isError, refetch }}
      count={groups.length}
      empty='skills'
      subject='skills'
      level={3}
      skeleton={<DevCardsSkeleton count={4} min={200} height={260} />}
    >
      <TooltipProvider delay={0}>
        <div className='grid grid-cols-[repeat(4,1fr)] gap-4 max-[900px]:grid-cols-[1fr_1fr] max-[620px]:grid-cols-[1fr]'>
          {groups.map(({ category, items }) => (
            <DevCard
              as='article'
              key={category}
              data-slot='dev-skill-group'
              data-reveal
            >
              <div className='flex items-baseline justify-between gap-2.5'>
                <h3 className='mb-1.5 flex justify-between text-[16px]'>
                  {copy.skills.groups[category]}
                </h3>
                <span className='text-mute'>{items.length}</span>
              </div>
              <div className='mt-3 flex flex-wrap gap-[7px]'>
                {items.map((skill) => (
                  <DevSkillChip
                    key={skill.id}
                    skill={skill}
                    core={skill.highlight !== null}
                    text={tipText(evidence.get(skill.id), copy.skills.tip)}
                  />
                ))}
              </div>
            </DevCard>
          ))}
        </div>
      </TooltipProvider>
    </DevDataState>
  );
}
