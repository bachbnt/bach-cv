/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useRef, useState, type KeyboardEvent } from 'react';
import { SkillTip } from '@/components/skills/skill-tip';
import { resumeCopy } from '@/content/copy/resume';
import { tradeDataCopy } from '@/content/copy/trade-data';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { DataCurrentMark } from '@/skins/trade/blocks/data-current-mark';
import {
  fitScale,
  isTileKey,
  nextTile,
  skillHeat,
  type HeatTile,
} from '@/skins/trade/blocks/data-skill-heat-model';
import { useBox } from '@/hooks/use-box';
import { useSkillTip } from '@/skins/trade/blocks/data-use-skill-tip';
import { formatUsed } from '@/lib/derive/duration-label';
import { isCurrent } from '@/lib/derive/current-job';
import { HeatMap } from '@/skins/trade/blocks/data-skill-heat-map';

type Job = Doc<'experience'>;

/**
 * A heatmap of the skills like the one of a stock site: a map for each area, a tile for each listed skill, its area the months the
 * skill was used and its colour the area. The months and the roles are the ones of the watchlist (`skillHeat` reads them from
 * `lib/derive/skill-use.ts`), so nothing is derived twice. Pointing at, focusing or tapping a tile shows the Standard tip; a click or Enter pins
 * it and the list beside the map names its roles, each of which opens its note. The arrow keys move between tiles.
 */
export function DataSkillHeat({
  jobs,
  skills,
  now,
  onOpen,
}: {
  jobs: Job[];
  skills: Doc<'skills'>[];
  now: Date;
  onOpen: (id: string) => void;
}) {
  const { resume } = useCopy(tradeDataCopy);
  const words = resume.heat;
  const { skills: skillCopy } = useCopy(resumeCopy);
  const { tape } = useCopy(tradeShellCopy);
  const { lang } = useLang();
  const { tip, setTip, hide } = useSkillTip();
  const [pinned, setPinned] = useState<string | null>(null);
  const [lastFocus, setLastFocus] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const groups = skillHeat(skills, jobs, now);
  const { width } = useBox(root);
  const scale = fitScale(groups, width);
  const tiles = groups.flatMap((group) => group.tiles);
  const byId = new Map(tiles.map((tile) => [tile.skill.id, tile]));
  const jobById = new Map(jobs.map((job) => [job.id, job]));
  const tabbable = byId.has(lastFocus ?? '')
    ? lastFocus
    : byId.has(pinned ?? '')
      ? pinned
      : tiles[0]?.skill.id;
  const tabbableId = tabbable ?? undefined;
  const pinnedTile = pinned ? byId.get(pinned) : undefined;
  if (groups.length === 0) return null;

  const used = (tile: HeatTile) => formatUsed(tile.months, tape);
  const periodOf = (job: Job) =>
    formatPeriod(job.startMonth, job.endMonth, lang);
  const tipOf = (tile: HeatTile) => {
    if (tile.roles.length === 0)
      return fill(words.tipNone, { name: tile.skill.name });
    const names = tile.roles
      .flatMap((id) => jobById.get(id) ?? [])
      .map((job) => `${job.shortName || job.company}, ${periodOf(job)}`)
      .join('; ');
    return fill(tile.roles.length === 1 ? words.tipUsedOne : words.tipUsed, {
      name: tile.skill.name,
      used: used(tile),
      count: tile.roles.length,
      roles: names,
    });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const key = event.key;
    if (!isTileKey(key)) return;
    const all = [
      ...(root.current?.querySelectorAll<HTMLElement>('[data-heat-tile]') ??
        []),
    ];
    const from = all.indexOf(document.activeElement as HTMLElement);
    if (from < 0) return;
    const to = nextTile(
      all.map((el) => el.getBoundingClientRect()),
      from,
      key,
    );
    event.preventDefault();
    all[to]?.focus();
  };

  return (
    <div>
      <div className='grid gap-4 min-[900px]:grid-cols-[minmax(0,1fr)_260px]'>
        <div
          ref={root}
          role='group'
          aria-label={words.label}
          onKeyDown={onKeyDown}
          className='grid min-w-0 content-start gap-4'
        >
          {groups.map((group) => (
            <HeatMap
              key={group.category}
              group={group}
              width={width}
              scale={scale}
              title={skillCopy.groups[group.category]}
              pinned={pinned}
              tabbable={tabbableId}
              tipId={tip?.id}
              usedText={used}
              labelOf={(tile) =>
                tile.roles.length === 0
                  ? fill(words.tileNone, { name: tile.skill.name })
                  : fill(words.tile, {
                      name: tile.skill.name,
                      used: used(tile),
                    })
              }
              onTip={(tile, element) => {
                const r = element.getBoundingClientRect();
                setTip({
                  id: tile.skill.id,
                  text: tipOf(tile),
                  rect: {
                    left: r.left,
                    top: r.top,
                    width: r.width,
                    bottom: r.bottom,
                  },
                });
              }}
              onHide={hide}
              onFocusTile={setLastFocus}
              onPin={(id) => setPinned((old) => (old === id ? null : id))}
            />
          ))}
        </div>
        <aside
          aria-label={words.aside}
          className='min-w-0 self-start rounded-md border border-tv-line bg-tv-panel p-3 max-[899px]:order-first min-[900px]:sticky min-[900px]:top-2'
        >
          {pinnedTile ? (
            <div key={pinnedTile.skill.id} className='animate-tv-fade-up'>
              <h4 className='text-[13px] font-semibold'>
                {fill(words.roles, { name: pinnedTile.skill.name })}
              </h4>
              <p className='mt-0.5 text-xs text-tv-mute tabular-nums'>
                {used(pinnedTile)}
              </p>
              {pinnedTile.roles.length === 0 ? (
                <p className='mt-2 text-xs text-tv-mute'>{words.noRole}</p>
              ) : (
                <ul className='m-0 mt-2 grid list-none gap-1 p-0'>
                  {pinnedTile.roles.flatMap((id) => {
                    const job = jobById.get(id);
                    return job
                      ? [
                          <li key={id}>
                            <button
                              type='button'
                              aria-label={fill(words.openRole, {
                                role: job.role,
                                company: job.company,
                              })}
                              onClick={() => onOpen(id)}
                              className='block w-full cursor-pointer rounded px-2 py-1.5 text-left transition-colors hover:bg-tv-hover active:bg-tv-hover pointer-coarse:min-h-11'
                            >
                              <span className='flex items-center gap-1.5 text-[13px] font-semibold'>
                                <span className='truncate'>{job.company}</span>
                                {isCurrent(job) && <DataCurrentMark />}
                              </span>
                              <span className='block truncate text-xs'>
                                {job.role}
                              </span>
                              <span className='block text-xs text-tv-mute tabular-nums'>
                                {periodOf(job)}
                              </span>
                            </button>
                          </li>,
                        ]
                      : [];
                  })}
                </ul>
              )}
            </div>
          ) : (
            <p className='text-xs text-tv-mute'>{words.hint}</p>
          )}
        </aside>
      </div>
      {tip && <SkillTip tip={tip} />}
    </div>
  );
}
