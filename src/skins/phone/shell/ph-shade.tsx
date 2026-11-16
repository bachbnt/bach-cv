/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
import { Languages, Palette, SunMoon } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { commonCopy } from '@/content/copy/common';
import { phoneCopy } from '@/content/copy/phone';
import { skinsCopy } from '@/content/copy/skins';
import { offeredLanguages } from '@/lib/derive/offered-languages';
import type { Lang } from '@/lib/content/schema';
import { useCopy } from '@/lib/i18n/copy';
import { useLang } from '@/lib/i18n/language';
import { useSkin } from '@/lib/skin/skin';
import { isSkinId } from '@/lib/skin/skins';
import { useTheme, type Theme } from '@/lib/theme/theme';
import { isUpDrag } from '@/skins/phone/shell/gestures';
import { usePhOverlays } from '@/skins/phone/shell/overlay-context';
import { PhAction } from '@/skins/phone/shell/ph-action';
import { PhShadeChoices } from '@/skins/phone/shell/ph-shade-choices';
import { PhShadeTile } from '@/skins/phone/shell/ph-shade-tile';
import { usePhScreen } from '@/skins/phone/shell/screen-context';
import { StatusGlyphs } from '@/skins/phone/shell/status-glyphs';
import { StatusSummary } from '@/skins/phone/shell/status-summary';
import { useClockText } from '@/skins/phone/shell/use-clock-text';
import { preloadSkin } from '@/skins/registry';

type Key = 'language' | 'skin' | 'theme';

/**
 * The quick settings, a shade that pulls down from the top of the screen (a card at the right of a wide one, hanging from the top edge; on an open device it is the whole right half, from the crease to the right edge of the display, flush at the top and rounded at the foot, as wide as the shade of the cover screen is): the three menus of Standard's
 * header in this order, Language, Skin and Theme, as tiles (each one hidden when the owner has fixed it in `site/live`, `locked`), the
 * choices of the one that is open below them, and Ask BB Bot, Connect and Download CV. Esc, a tap outside the shade and a drag up on its
 * handle close it, and the focus goes back to the status bar. The skin tile is how a visitor leaves this skin, so it is always here unless
 * the owner forces one. Its top row stands in for the status bar it covers.
 */
export function PhShade() {
  const { settingsOpen, closeSettings } = usePhOverlays();
  const common = useCopy(commonCopy);
  const phone = useCopy(phoneCopy);
  const skins = useCopy(skinsCopy);
  const { root } = usePhScreen();
  const time = useClockText();
  const { lang, setLang, options: offered, locked: langLocked } = useLang();
  const { theme, setTheme, options: themes, locked: themeLocked } = useTheme();
  const { skin, setSkin, options: skinOptions, locked: skinLocked } = useSkin();
  const [open, setOpen] = useState<Key | null>(null);
  const panel = useId();
  const from = useRef<{ x: number; y: number } | null>(null);
  const toggle = (key: Key) => setOpen((now) => (now === key ? null : key));

  const languages = offeredLanguages(offered);
  const names: Record<Lang, string> = {
    en: common.language.english,
    vi: common.language.vietnamese,
  };
  const themeNames: Record<Theme, string> = {
    system: common.theme.system,
    light: common.theme.light,
    dark: common.theme.dark,
  };
  const showLanguage = !langLocked && languages.length > 1;
  const showSkin = !skinLocked;
  const showTheme = !themeLocked;

  const choices =
    open === 'language'
      ? {
          title: common.language.label,
          value: lang,
          choices: languages.map((code) => ({
            value: code,
            label: names[code],
            hint: code.toUpperCase(),
            lang: code,
          })),
          onChoose: (value: string) => {
            const next = languages.find((code) => code === value);
            if (next) setLang(next);
          },
        }
      : open === 'skin'
        ? {
            title: skins.label,
            value: skin,
            choices: skinOptions.map((id) => ({
              value: id,
              label: skins.names[id].name,
              hint: skins.names[id].hint,
            })),
            onChoose: (value: string) => isSkinId(value) && setSkin(value),
            onPreview: (value: string) => isSkinId(value) && preloadSkin(value),
          }
        : open === 'theme'
          ? {
              title: common.theme.label,
              value: theme,
              choices: themes.map((value) => ({
                value,
                label: themeNames[value],
              })),
              onChoose: (value: string) => {
                const next = themes.find((option) => option === value);
                if (next) setTheme(next);
              },
            }
          : null;

  return (
    <Dialog
      open={settingsOpen}
      onOpenChange={(next) => !next && closeSettings()}
    >
      <DialogPortal container={root}>
        <DialogOverlay className='bg-ph-scrim supports-backdrop-filter:backdrop-blur-none' />
        <DialogPrimitive.Popup
          aria-modal='true'
          className='fixed inset-x-0 top-0 z-50 flex max-h-[94%] animate-ph-drop flex-col overflow-y-auto rounded-b-ph-sheet bg-ph-sheet text-ph-ink shadow-ph-float outline-none @min-[900px]:inset-x-auto @min-[900px]:right-3 @min-[900px]:w-[400px] group-data-[hinge]/ph:@min-[900px]:inset-x-auto group-data-[hinge]/ph:@min-[900px]:right-0 group-data-[hinge]/ph:@min-[900px]:left-1/2 group-data-[hinge]/ph:@min-[900px]:w-auto'
        >
          <DialogTitle className='sr-only'>{phone.settings}</DialogTitle>
          <DialogDescription className='sr-only'>
            {phone.settings}
          </DialogDescription>
          {/* what the status bar shows, drawn again on the shade that covers it */}
          <div
            aria-hidden='true'
            className='box-border flex h-[calc(2.5rem+env(safe-area-inset-top,0px))] shrink-0 items-center justify-between px-5 pt-[env(safe-area-inset-top,0px)] text-[15px] font-semibold'
          >
            <span className='flex items-center gap-2.5'>
              <span className='tabular-nums'>{time}</span>
              <span className='font-medium opacity-70'>{phone.os}</span>
            </span>
            <StatusGlyphs />
          </div>
          <StatusSummary />
          <div className='flex flex-col gap-3 px-4 pt-1 pb-3'>
            {(showLanguage || showSkin || showTheme) && (
              <div className='grid auto-cols-fr grid-flow-col gap-2.5'>
                {showLanguage && (
                  <PhShadeTile
                    name={`${common.language.label}: ${names[lang]}`}
                    icon={Languages}
                    title={common.language.label}
                    current={names[lang]}
                    open={open === 'language'}
                    controls={panel}
                    onToggle={() => toggle('language')}
                  />
                )}
                {showSkin && (
                  <PhShadeTile
                    name={`${skins.label}: ${skins.names[skin].name}`}
                    icon={Palette}
                    title={skins.label}
                    current={skins.names[skin].name}
                    open={open === 'skin'}
                    controls={panel}
                    onToggle={() => toggle('skin')}
                  />
                )}
                {showTheme && (
                  <PhShadeTile
                    name={common.theme.label}
                    icon={SunMoon}
                    title={common.theme.label}
                    current={themeNames[theme]}
                    open={open === 'theme'}
                    controls={panel}
                    onToggle={() => toggle('theme')}
                  />
                )}
              </div>
            )}
            {choices && <PhShadeChoices id={panel} {...choices} />}
            <div className='grid auto-cols-fr grid-flow-col gap-2.5'>
              <PhAction kind='chat' layout='quick' />
              <PhAction kind='connect' layout='quick' />
              <PhAction kind='cv' layout='quick' />
            </div>
          </div>
          {/* the handle: a drag up closes the shade, and so does a click (which also serves a keyboard) */}
          <button
            type='button'
            aria-label={phone.closeQuick}
            onClick={closeSettings}
            onPointerDown={(event) => {
              from.current = { x: event.clientX, y: event.clientY };
              event.currentTarget.setPointerCapture(event.pointerId);
            }}
            onPointerUp={(event) => {
              const start = from.current;
              from.current = null;
              if (
                start &&
                isUpDrag(event.clientX - start.x, event.clientY - start.y)
              )
                closeSettings();
            }}
            onPointerCancel={() => {
              from.current = null;
            }}
            className='mx-auto grid h-9 w-32 shrink-0 cursor-pointer touch-none place-items-center pointer-coarse:h-11'
          >
            <span
              aria-hidden='true'
              className='block h-1.5 w-10 rounded-full bg-ph-line'
            />
          </button>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </Dialog>
  );
}
