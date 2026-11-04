/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { SkillChip } from '@/components/skills/skill-chip';
import { SkillTip, type ActiveTip } from '@/components/skills/skill-tip';
import { tipText } from '@/components/skills/skill-text';
import { useSkills } from '@/components/skills/use-skills';
import { resumeCopy } from '@/content/copy/resume';
import { useCopy } from '@/lib/i18n/copy';
import { SKILL_CATEGORIES } from '@/lib/content/schema';
import { cn } from 'cn';

/** AI first, as in the design mockup; the rest follows the mockup order. */
const ORDER = [
  'ai',
  'mobile',
  'web',
  'tools',
] as const satisfies readonly (typeof SKILL_CATEGORIES)[number][];

const DOT: Record<(typeof ORDER)[number], string> = {
  ai: 'bg-ai-foreground',
  mobile: 'bg-mobile-foreground',
  web: 'bg-web-foreground',
  tools: 'bg-tools-foreground',
};

/**
 * The listed skills grouped by area, each chip with a tip ("Used at FPT, MoMo. First used 2022.").
 * One tip is shown at a time, owned here so a tap outside, Escape or a scroll can close it.
 */
export function SkillGroups({ className }: { className?: string }) {
  const copy = useCopy(resumeCopy);
  const { skills, evidence, isPending, isError } = useSkills();
  const [tip, setTip] = useState<ActiveTip | null>(null);

  const hide = useCallback(() => setTip(null), []);

  useEffect(() => {
    if (!tip) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hide();
    };
    const onClick = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-skill-chip]')) hide();
    };
    addEventListener('keydown', onKey);
    addEventListener('scroll', hide, { passive: true });
    addEventListener('resize', hide);
    document.addEventListener('click', onClick);
    return () => {
      removeEventListener('keydown', onKey);
      removeEventListener('scroll', hide);
      removeEventListener('resize', hide);
      document.removeEventListener('click', onClick);
    };
  }, [tip, hide]);

  if (isPending) return <p className='text-muted-foreground'>{copy.loading}</p>;
  if (isError) return <p className='text-muted-foreground'>{copy.error}</p>;

  const groups = ORDER.map((category) => ({
    category,
    items: skills.filter((s) => s.listed && s.category === category),
  })).filter((group) => group.items.length);
  if (!groups.length)
    return <p className='text-muted-foreground'>{copy.skills.empty}</p>;

  return (
    <>
      <div
        className={cn(
          'grid grid-cols-[repeat(auto-fit,minmax(min(100%,250px),1fr))] gap-5',
          className,
        )}
      >
        {groups.map(({ category, items }) => (
          <article
            key={category}
            className={cn(
              'flex flex-col gap-5 rounded-2xl border bg-white px-6 pt-7 pb-6',
              category === 'ai' &&
                'border-[#cdbfef] bg-[linear-gradient(180deg,#fbf9ff,#fff_70%)]',
            )}
          >
            <div className='flex items-center gap-2.5'>
              <span
                aria-hidden='true'
                className={cn('size-2.5 flex-none rounded-full', DOT[category])}
              />
              <h3 className='text-xl leading-[1.2]'>
                {copy.skills.groups[category]}
              </h3>
              <span className='ml-auto text-[13px] text-muted-foreground'>
                {items.length}
              </span>
            </div>
            <div className='flex flex-wrap gap-2'>
              {items.map((skill) => (
                <SkillChip
                  key={skill.id}
                  skill={skill}
                  core={skill.highlight !== null}
                  active={tip?.id === skill.id}
                  onShow={(element) => {
                    const r = element.getBoundingClientRect();
                    setTip({
                      id: skill.id,
                      text: tipText(evidence.get(skill.id), copy.skills.tip),
                      rect: {
                        left: r.left,
                        top: r.top,
                        width: r.width,
                        bottom: r.bottom,
                      },
                    });
                  }}
                  onHide={hide}
                />
              ))}
            </div>
          </article>
        ))}
      </div>
      {tip && <SkillTip tip={tip} />}
    </>
  );
}
