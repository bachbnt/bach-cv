/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';
import { DevIcon } from '@/skins/dev/icons/dev-icon';
import type { CodiconName } from '@/skins/dev/icons/codicons';

interface DevMenuItem {
  value: string;
  label: string;
  /** a short note after the label (`default look`) */
  hint?: string;
  /** an item that goes to another page is a link; the others are buttons */
  href?: string;
}

/** An item of the menu (a button, or a link to another page): a row with a tick on the one that is chosen. */
const ITEM =
  'flex w-full cursor-pointer items-center gap-2.5 rounded-[6px] bg-transparent px-2.5 py-[7px] text-left font-sans text-[13px] leading-[normal] font-normal text-ink hover:bg-hov aria-checked:text-head aria-checked:after:ml-auto aria-checked:after:text-signal aria-checked:after:content-["✓"/""]';

/** A drop-down of the title bar (language, style, theme): an icon, the current value and a menu of radio items. */
export function DevMenu({
  icon,
  current,
  label,
  items,
  value,
  onSelect,
  onPreview,
}: {
  icon: CodiconName;
  /** what the button shows for the current choice */
  current: string;
  /** the accessible name of the button and the heading of the menu */
  label: string;
  items: DevMenuItem[];
  value: string;
  onSelect: (value: string) => void;
  /** called when an item is pointed at or focused (the style menu starts loading that style) */
  onPreview?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const focusOnOpen = useRef(false);
  const menuId = `${useId()}-menu`;

  const menuItems = () =>
    Array.from(
      root.current?.querySelectorAll<HTMLElement>('[role=menuitemradio]') ?? [],
    );

  useEffect(() => {
    if (!open) return;
    if (focusOnOpen.current) {
      focusOnOpen.current = false;
      const all = menuItems();
      (
        all.find((el) => el.getAttribute('aria-checked') === 'true') ?? all[0]
      )?.focus();
    }
    const onPointer = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target))
        setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const choose = (next: string) => {
    onSelect(next);
    setOpen(false);
    trigger.current?.focus();
  };

  const onTriggerKey = (event: ReactKeyboardEvent) => {
    if (event.key !== 'ArrowDown' || open) return;
    event.preventDefault();
    focusOnOpen.current = true;
    setOpen(true);
  };

  const onMenuKey = (event: ReactKeyboardEvent) => {
    const all = menuItems();
    const at = all.findIndex((el) => el === document.activeElement);
    const next = {
      ArrowDown: (at + 1) % all.length,
      ArrowUp: (at - 1 + all.length) % all.length,
      Home: 0,
      End: all.length - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    all[next]?.focus();
  };

  return (
    <div className='relative' ref={root}>
      <button
        type='button'
        data-slot='dev-menu-trigger'
        className='group/dd pointer-coarse:relative pointer-coarse:after:absolute pointer-coarse:after:-inset-x-1.5 pointer-coarse:after:-inset-y-2.5 pointer-coarse:after:content-[""] inline-flex cursor-pointer items-center gap-1.5 rounded-[5px] bg-transparent px-[7px] py-0.5 font-code text-[12px] leading-[normal] font-normal whitespace-nowrap text-inherit aria-expanded:bg-hov aria-expanded:text-ink hover:bg-hov hover:text-ink max-[620px]:h-7 max-[620px]:px-[9px] max-[620px]:py-0'
        aria-haspopup='menu'
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        ref={trigger}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onTriggerKey}
      >
        <DevIcon name={icon} className='size-[15px] max-[620px]:size-[17px]' />
        <span className='max-[620px]:hidden'>{current}</span>
        <DevIcon
          name='chevron-down'
          className='size-3 opacity-70 transition-transform duration-200 group-aria-expanded/dd:rotate-180 max-[620px]:hidden'
        />
      </button>
      <div
        className='absolute top-[calc(100%+6px)] right-0 z-90 min-w-[200px] rounded-[8px] border border-line-2 bg-chrome p-[5px] shadow-[0_14px_34px_rgba(0,0,0,0.45)]'
        id={menuId}
        role='menu'
        hidden={!open}
        onKeyDown={onMenuKey}
      >
        <div className='px-2.5 pt-[5px] pb-[3px] font-code text-[10.5px] leading-[normal] font-semibold tracking-[0.06em] text-dim uppercase'>
          {label}
        </div>
        {items.map((item) => {
          const checked = item.value === value;
          const body = (
            <>
              {item.label}
              {item.hint && (
                <small className='ml-1.5 font-code text-[11px] leading-[normal] text-dim'>
                  {item.hint}
                </small>
              )}
            </>
          );
          return item.href ? (
            <Link
              key={item.value}
              href={item.href}
              role='menuitemradio'
              data-slot='dev-menu-item'
              className={ITEM}
              aria-checked={checked}
              onClick={() => choose(item.value)}
              onPointerEnter={() => onPreview?.(item.value)}
            >
              {body}
            </Link>
          ) : (
            <button
              key={item.value}
              type='button'
              role='menuitemradio'
              data-slot='dev-menu-item'
              className={ITEM}
              aria-checked={checked}
              onClick={() => choose(item.value)}
              onPointerEnter={() => onPreview?.(item.value)}
              onFocus={() => onPreview?.(item.value)}
            >
              {body}
            </button>
          );
        })}
      </div>
    </div>
  );
}
