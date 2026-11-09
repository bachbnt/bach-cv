/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { commonCopy } from '@/content/copy/common';
import { mobaCopy } from '@/content/copy/moba';
import { useCopy } from '@/lib/i18n/copy';
import {
  ABILITY_KEYS,
  PING_KEY,
  PLACE,
  PLACE_ORDER,
  SPELL_KEYS,
} from '@/skins/moba/config';
import { pageName } from '@/skins/moba/map/page-name';
import { MbDialog } from '@/skins/moba/shell/mb-dialog';
import { useOverlays } from '@/skins/moba/shell/overlay-context';
import { MbKbd } from '@/skins/moba/ui/mb-kbd';

/** The keys of the arena, as a list. Every page is also a link in the list of places, so the keys are a shortcut and never the only way. */
export function KeysDialog() {
  const copy = useCopy(mobaCopy);
  const common = useCopy(commonCopy);
  const { keysOpen, setKeysOpen } = useOverlays();
  const rows: { keys: string[]; label: string }[] = [
    { keys: ['↑', '↓', '←', '→'], label: copy.keys.move },
    { keys: ['?'], label: copy.keys.keysList },
    { keys: ABILITY_KEYS.slice(), label: copy.keys.skills },
    { keys: [PING_KEY], label: copy.keys.ping },
    { keys: ['Alt'], label: copy.keys.altClick },
    { keys: [SPELL_KEYS.connect], label: copy.keys.connect },
    { keys: [SPELL_KEYS.chat], label: copy.keys.chat },
    { keys: [SPELL_KEYS.cv], label: copy.keys.cv },
    { keys: ['1', '–', '6'], label: copy.keys.certificates },
    { keys: ['M'], label: copy.keys.minimap },
    { keys: ['Esc'], label: copy.keys.fold },
    ...PLACE_ORDER.map((page) => ({
      keys: [PLACE[page].key],
      label: pageName(page, common, copy),
    })),
  ];
  return (
    <MbDialog
      open={keysOpen}
      onOpenChange={setKeysOpen}
      title={copy.keys.title}
      description={copy.keys.description}
      closeLabel={copy.keys.close}
      className='w-[min(560px,calc(100vw-24px))]'
    >
      <div className='min-h-0 flex-1 overflow-y-auto p-5 max-[719px]:p-3'>
        <p className='mb-4 text-[14px] leading-relaxed text-mb-mute'>
          {copy.keys.click}: {copy.keys.clickDo}.
        </p>
        <dl className='grid grid-cols-[1fr_auto] gap-x-4 gap-y-2'>
          {rows.map((row) => (
            <div key={`${row.keys.join('')}${row.label}`} className='contents'>
              <dt className='text-[14px] text-mb-ink'>{row.label}</dt>
              <dd className='flex justify-end gap-1'>
                {row.keys.map((key, i) => (
                  <MbKbd key={`${key}${i}`}>{key}</MbKbd>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </MbDialog>
  );
}
