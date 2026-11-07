/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { SkillIcon } from '@/components/skills/skill-icon';
import { SKILL_COLORS } from '@/components/skills/skill-icons';
import { tipText } from '@/components/skills/skill-text';
import { mobaCopy } from '@/content/copy/moba';
import { resumeCopy } from '@/content/copy/resume';
import { fill } from '@/lib/chat/fill';
import { careerShare } from '@/lib/derive/career-length';
import { jobBadge } from '@/lib/derive/job-badge';
import { monthsUsed } from '@/lib/derive/skill-use';
import { useCopy } from '@/lib/i18n/copy';
import { ABILITY_KEYS } from '@/skins/moba/config';
import { useGame } from '@/skins/moba/shell/game-context';
import type { useHudData } from '@/skins/moba/shell/use-hud-data';
import { MbButton } from '@/skins/moba/ui/mb-button';
import { MbKbd } from '@/skins/moba/ui/mb-kbd';

type Data = ReturnType<typeof useHudData>;

/** The card that opens above a key skill: what Standard says of it (where it was used, since when) and how much of the career it covers. */
function AbilityCard({ data, index }: { data: Data; index: number }) {
  const copy = useCopy(mobaCopy).hud;
  const resume = useCopy(resumeCopy).skills;
  const { goToPage, setAbility } = useGame();
  const skill = data.key[index];
  if (!skill) return null;
  const share = careerShare(
    monthsUsed(skill.id, data.jobs, data.now),
    data.careerMonths,
  );
  return (
    <div
      role='group'
      aria-label={fill(copy.ability, {
        key: ABILITY_KEYS[index],
        name: skill.name,
      })}
      className='mb-card absolute bottom-[calc(100%+12px)] left-1/2 z-40 w-[250px] -translate-x-1/2 p-3.5 text-left'
    >
      <p className='font-mb-display text-xl leading-none font-bold text-mb-title'>
        {skill.name}
      </p>
      <p className='mt-2 text-[13px] leading-snug text-mb-ink'>
        {tipText(data.evidence.get(skill.id), resume.tip)}
      </p>
      <div className='mt-3 flex items-center justify-between gap-2'>
        <span className='text-[10px] font-bold tracking-[0.14em] text-mb-mute uppercase'>
          {Math.round(share * 100)}%
        </span>
        <MbButton
          size='sm'
          onClick={() => {
            setAbility(null);
            goToPage('resume');
          }}
        >
          {resume.title}
        </MbButton>
      </div>
    </div>
  );
}

/**
 * The passive and the four key skills (Q W E R): the current role and the core stack. A ring around a key skill is the share of the
 * career that the roles using it cover, so it is a real measure; the card that opens says where it was used.
 */
export function HudAbilities({ data }: { data: Data }) {
  const copy = useCopy(mobaCopy).hud;
  const { ability, setAbility, showJob } = useGame();
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ability === null) return;
    const close = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setAbility(null);
    };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, [ability, setAbility]);

  const current = data.current;
  return (
    <div
      ref={root}
      className='flex items-end gap-1.5 max-[719px]:gap-1'
      role='group'
      aria-label={copy.abilities}
    >
      <div className='relative'>
        <button
          type='button'
          className='mb-slot size-[52px] max-[1099px]:size-[44px] max-[899px]:size-[40px] max-[719px]:size-11'
          data-tone='teal'
          aria-label={
            current
              ? `${copy.passive}: ${current.role}, ${current.company}`
              : copy.passive
          }
          disabled={!current}
          onClick={() => current && showJob(current.id)}
        >
          <span className='mb-slot-in font-mb-display text-[15px] font-bold text-mb-teal-ink'>
            {current ? jobBadge(current) : '–'}
          </span>
        </button>
      </div>
      {ABILITY_KEYS.map((key, i) => {
        const skill = data.key[i];
        const open = ability === i;
        const color = skill ? SKILL_COLORS[skill.icon] : undefined;
        const share = skill
          ? careerShare(
              monthsUsed(skill.id, data.jobs, data.now),
              data.careerMonths,
            )
          : 0;
        return (
          <div key={key} className='relative'>
            {open && <AbilityCard data={data} index={i} />}
            <button
              type='button'
              className='mb-slot size-[52px] max-[1099px]:size-[44px] max-[899px]:size-[40px] max-[719px]:size-11'
              data-empty={skill ? undefined : ''}
              disabled={!skill}
              aria-expanded={open}
              aria-keyshortcuts={key}
              aria-label={
                skill
                  ? fill(copy.ability, { key, name: skill.name })
                  : `${copy.abilities} ${key}`
              }
              style={color ? ({ '--c': color } as CSSProperties) : undefined}
              onClick={() => setAbility(open ? null : i)}
            >
              <span className='mb-slot-in text-[color-mix(in_srgb,var(--c,var(--mb-gold-hi))_55%,#fff)]'>
                {skill && (
                  <SkillIcon
                    icon={skill.icon}
                    name={skill.name}
                    className='size-7 max-[719px]:size-5'
                  />
                )}
              </span>
              <span
                className='mb-ring'
                style={{ '--p': Math.round(share * 100) } as CSSProperties}
                aria-hidden='true'
              />
              <MbKbd className='mb-slot-key'>{key}</MbKbd>
            </button>
          </div>
        );
      })}
    </div>
  );
}
