/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { SKILL_ICONS } from '@/components/skills/skill-icons';
import { cn } from 'cn';

/** The mark of a skill. An unknown key falls back to the first letter of the skill, in a neutral tile. */
export function SkillIcon({
  icon,
  name,
  className,
}: {
  icon: string;
  name: string;
  className?: string;
}) {
  const svg = SKILL_ICONS[icon];
  if (!svg) {
    return (
      <span
        aria-hidden='true'
        className={cn(
          'inline-flex items-center justify-center text-[10px] font-bold opacity-70',
          className,
        )}
      >
        {name.charAt(0)}
      </span>
    );
  }
  return (
    <span
      aria-hidden='true'
      className={cn('inline-flex [&>svg]:size-full', className)}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
