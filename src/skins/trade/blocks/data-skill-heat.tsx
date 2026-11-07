/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { SkillTip } from '@/components/skills/skill-tip';
import { SKILL_TIP_ID } from '@/components/skills/skill-tip';
import { resumeCopy } from '@/content/copy/resume';
import { tradeDataCopy } from '@/content/copy/trade-data';
import { tradeShellCopy } from '@/content/copy/trade-shell';
import type { Doc } from '@/lib/content/schema';
import { formatPeriod } from '@/lib/format';
import { fill } from '@/lib/chat/fill';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { cn } from '@/lib/utils';
import { DataCurrentMark } from '@/skins/trade/blocks/data-current-mark';
import {
  fitScale,
  groupHeight,
  layoutGroup,
  nextTile,
  skillHeat,
  type HeatGroup,
  type HeatTile,
  type TileKey,
} from '@/skins/trade/blocks/data-skill-heat-model';
import { useBox } from '@/skins/trade/blocks/data-use-box';
import { useSkillTip } from '@/skins/trade/blocks/data-use-skill-tip';
import { useTipEvents } from '@/skins/trade/blocks/data-use-tip-taps';
import { formatUsed } from '@/lib/derive/duration-label';
import { isCurrent } from '@/lib/derive/current-job';

type Job = Doc<'experience'>;
type Category = Doc<'skills'>['category'];

/** Each area in a colour of the terminal mixed into the background, so the ink keeps its contrast in both themes. */
const AREA: Record<Category, string> = {
  ai: 'border-tv-violet bg-[color-mix(in_srgb,var(--tv-violet)_30%,var(--tv-bg))]',
  mobile: 'border-tv-up bg-[color-mix(in_srgb,var(--tv-up)_30%,var(--tv-bg))]',
  web: 'border-tv-sky bg-[color-mix(in_srgb,var(--tv-sky)_30%,var(--tv-bg))]',
  tools:
    'border-tv-gold bg-[color-mix(in_srgb,var(--tv-gold)_30%,var(--tv-bg))]',
};
const DOT: Record<Category, string> = {
  ai: 'bg-tv-violet',
  mobile: 'bg-tv-up',
  web: 'bg-tv-sky',
  tools: 'bg-tv-gold',
};

const TIP_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]);

/**
 * A heatmap of the skills like the one of a stock site: a map for each area, a tile for each listed skill, its area the months the
 * skill was used and its colour the area. The months and the roles are the ones of the watchlist (`skillHeat` reads them from
 * `shell-career.ts`), so nothing is derived twice. Pointing at, focusing or tapping a tile shows the Standard tip; a click or Enter pins
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
    if (!TIP_KEYS.has(event.key)) return;
    const all = [
      ...(root.current?.querySelectorAll<HTMLElement>('[data-heat-tile]') ??
        []),
    ];
    const from = all.indexOf(document.activeElement as HTMLElement);
    if (from < 0) return;
    const to = nextTile(
      all.map((el) => el.getBoundingClientRect()),
      from,
      event.key as TileKey,
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
            <div
              key={pinnedTile.skill.id}
              className='animate-[tv-fade-up_0.25s_ease-out_both]'
            >
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

function HeatMap({
  group,
  width,
  scale,
  title,
  pinned,
  tabbable,
  tipId,
  usedText,
  labelOf,
  onTip,
  onHide,
  onFocusTile,
  onPin,
}: {
  group: HeatGroup;
  /** the width of the maps and the area of a month, the same for all of them */
  width: number;
  scale: number;
  title: string;
  pinned: string | null;
  tabbable: string | undefined;
  tipId: string | undefined;
  usedText: (tile: HeatTile) => string;
  labelOf: (tile: HeatTile) => string;
  onTip: (tile: HeatTile, element: HTMLElement) => void;
  onHide: () => void;
  onFocusTile: (id: string) => void;
  onPin: (id: string) => void;
}) {
  const height = groupHeight(group, width, scale);
  const rects = new Map(layoutGroup(group, width, scale).map((r) => [r.id, r]));
  return (
    <section aria-label={title}>
      <h4 className='mb-1.5 flex items-center gap-2 text-[13px] font-semibold'>
        <span
          aria-hidden='true'
          className={cn('size-2 rounded-sm', DOT[group.category])}
        />
        {title}
        <span className='text-xs font-normal text-tv-mute tabular-nums'>
          {group.tiles.length}
        </span>
      </h4>
      <div data-heat-map='' className='relative w-full' style={{ height }}>
        {group.tiles.map((tile, index) => {
          const rect = rects.get(tile.skill.id);
          if (!rect) return null;
          return (
            <Tile
              key={tile.skill.id}
              tile={tile}
              area={group.category}
              rect={rect}
              box={{ width, height }}
              index={index}
              pinned={pinned === tile.skill.id}
              tabbable={tabbable === tile.skill.id}
              active={tipId === tile.skill.id}
              used={usedText(tile)}
              label={labelOf(tile)}
              onTip={onTip}
              onHide={onHide}
              onFocusTile={onFocusTile}
              onPin={onPin}
            />
          );
        })}
      </div>
    </section>
  );
}

function Tile({
  tile,
  area,
  rect,
  box,
  index,
  pinned,
  tabbable,
  active,
  used,
  label,
  onTip,
  onHide,
  onFocusTile,
  onPin,
}: {
  tile: HeatTile;
  area: Category;
  rect: { x: number; y: number; w: number; h: number };
  box: { width: number; height: number };
  index: number;
  pinned: boolean;
  tabbable: boolean;
  active: boolean;
  used: string;
  label: string;
  onTip: (tile: HeatTile, element: HTMLElement) => void;
  onHide: () => void;
  onFocusTile: (id: string) => void;
  onPin: (id: string) => void;
}) {
  const events = useTipEvents({
    active,
    onShow: (element) => onTip(tile, element),
    onHide,
    onPress: () => onPin(tile.skill.id),
  });
  const small = rect.w < 84 || rect.h < 56;
  const none = tile.roles.length === 0;
  return (
    <div
      className='absolute animate-[tv-pop_0.38s_cubic-bezier(0.2,0.7,0.2,1)_both] p-px [animation-delay:calc(var(--i)*25ms)]'
      style={
        {
          left: `${(rect.x / box.width) * 100}%`,
          top: `${(rect.y / box.height) * 100}%`,
          width: `${(rect.w / box.width) * 100}%`,
          height: `${(rect.h / box.height) * 100}%`,
          '--i': Math.min(index, 24),
        } as CSSProperties
      }
    >
      <button
        type='button'
        data-heat-tile={tile.skill.id}
        aria-label={label}
        aria-pressed={pinned}
        aria-describedby={active ? SKILL_TIP_ID : undefined}
        tabIndex={tabbable ? 0 : -1}
        {...events}
        onFocus={(e) => {
          onFocusTile(tile.skill.id);
          events.onFocus(e);
        }}
        className={cn(
          'flex size-full cursor-pointer flex-col items-start justify-between gap-0.5 overflow-hidden rounded-sm border border-l-[3px] p-1.5 text-left transition-[filter,scale,box-shadow] duration-200 outline-offset-[-2px] hover:z-10 hover:scale-[1.03] hover:brightness-125 focus-visible:z-10 focus-visible:brightness-125 active:scale-[0.98] aria-pressed:shadow-[inset_0_0_0_2px_var(--tv-ink)]',
          AREA[area],
          none && 'border-dashed opacity-70',
        )}
      >
        <span
          className={cn(
            'w-full leading-tight font-semibold text-tv-ink',
            small ? 'truncate text-[11px]' : 'line-clamp-2 text-xs',
          )}
        >
          {tile.skill.name}
        </span>
        {!small && !none && (
          <span className='text-[11px] text-tv-mute tabular-nums'>{used}</span>
        )}
      </button>
    </div>
  );
}
