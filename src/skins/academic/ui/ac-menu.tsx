/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { AC_FONT_VARS } from '@/skins/academic/ui/ac-fonts';
import { AcIcon } from '@/skins/academic/ui/ac-icon';

interface AcMenuItem {
  value: string;
  label: string;
  /** a few words under the name */
  hint?: string;
  /** the language of the name when it is not the language of the page (the name of Vietnamese in an English page): it takes that language's fonts */
  lang?: string;
}

/**
 * A menu of the header (language, skin, theme): a handwritten tag with the current choice that opens a slip of paper with the choices, the one
 * in use marked with a highlighter. Built on the shadcn dropdown, so the keys, the focus and Esc are the same as everywhere.
 */
export function AcMenu({
  label,
  current,
  value,
  items,
  onSelect,
  onPreview,
}: {
  /** the accessible name of the menu (`Language`) */
  label: string;
  /** the words on the tag (`EN`, `Academic`) */
  current: string;
  value: string;
  items: AcMenuItem[];
  onSelect: (value: string) => void;
  /** pointer over or focus on a choice (the skin menu starts loading it) */
  onPreview?: (value: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${label}: ${current}`}
        className='inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-[8px_4px_9px_5px/5px_9px_4px_8px] border-2 border-ac-rule bg-transparent px-3 font-ac-note text-[17px]/none whitespace-nowrap text-ac-ink transition-colors outline-none hover:border-ac-mute hover:bg-ac-faint data-popup-open:border-ac-mute data-popup-open:bg-ac-faint pointer-coarse:min-h-11'
      >
        {current}
        <AcIcon name='chevronDown' className='size-4' />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={8}
        className={cn(
          'ac-scope ac-paper min-w-[184px] rotate-[0.6deg] rounded-[2px] p-1.5 ring-0',
          AC_FONT_VARS,
        )}
      >
        <DropdownMenuRadioGroup value={value} onValueChange={onSelect}>
          {items.map((item) => (
            <DropdownMenuRadioItem
              key={item.value}
              value={item.value}
              closeOnClick
              onPointerEnter={() => onPreview?.(item.value)}
              onFocus={() => onPreview?.(item.value)}
              className='group/item min-h-9 rounded-[2px] py-1.5 pr-9 pl-2.5 [&>[data-slot=dropdown-menu-radio-item-indicator]]:hidden font-ac-note text-[18px]/[1.2] text-ac-ink focus:bg-ac-link/10 data-checked:bg-[linear-gradient(180deg,transparent_38%,rgb(255_207_51/0.55)_38%_76%,transparent_76%)]'
            >
              <AcIcon
                name='check'
                className='absolute top-1/2 right-2.5 hidden size-5 -translate-y-1/2 text-ac-accent group-data-checked/item:block'
              />
              <span lang={item.lang} className='flex flex-col font-ac-note'>
                {item.label}
                {item.hint && (
                  <small className='font-ac-serif text-[14px] text-ac-mute'>
                    {item.hint}
                  </small>
                )}
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
