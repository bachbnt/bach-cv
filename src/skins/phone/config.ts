/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Download,
  MessageCircle,
  Settings,
  Share2,
  type LucideIcon,
} from 'lucide-react';
import type { PageKey } from '@/lib/content/schema';
import {
  AboutGlyph,
  CertificatesGlyph,
  ChatGlyph,
  ConnectGlyph,
  CvGlyph,
  HomeGlyph,
  PaymentGlyph,
  ProjectsGlyph,
  ResumeGlyph,
  ServicesGlyph,
  SettingsGlyph,
} from '@/skins/phone/ui/ph-app-glyphs';
import type { PhGlyph } from '@/skins/phone/ui/ph-glyph-frame';

/** What an icon tile stands for: a page, or one of the actions of the dock and the status bar. */
export type TileName = PageKey | 'settings' | 'chat' | 'connect' | 'cv';

/** The glyph of each page, drawn for its app icon (the tile of the home screen and of the rail of the tablet). */
export const PAGE_ICONS: Record<PageKey, PhGlyph> = {
  home: HomeGlyph,
  about: AboutGlyph,
  resume: ResumeGlyph,
  projects: ProjectsGlyph,
  certificates: CertificatesGlyph,
  services: ServicesGlyph,
  payment: PaymentGlyph,
};

/** The glyph of each action, drawn for its app icon (the dock and the quick settings). */
export const ACTION_GLYPHS: Record<
  'settings' | 'chat' | 'connect' | 'cv',
  PhGlyph
> = {
  settings: SettingsGlyph,
  chat: ChatGlyph,
  connect: ConnectGlyph,
  cv: CvGlyph,
};

/** The glyph of an icon tile, by name: what a tile draws unless it is given another. */
export const TILE_GLYPHS: Record<TileName, PhGlyph> = {
  ...PAGE_ICONS,
  ...ACTION_GLYPHS,
};

/**
 * The line icon of each action, for the small round buttons of the app bar (a quiet fill with a thin icon on it, not an app icon). The
 * drawn glyphs are white and made for a coloured tile, so they are not used on a button.
 */
export const ACTION_ICONS = {
  settings: Settings,
  chat: MessageCircle,
  connect: Share2,
  cv: Download,
} as const satisfies Record<'settings' | 'chat' | 'connect' | 'cv', LucideIcon>;

/** The gradient of each tile, spelled out so that the class names are found by the build. */
export const TILE_GRADIENTS: Record<TileName, string> = {
  home: 'from-ph-tile-home-a to-ph-tile-home-b',
  about: 'from-ph-tile-about-a to-ph-tile-about-b',
  resume: 'from-ph-tile-resume-a to-ph-tile-resume-b',
  projects: 'from-ph-tile-projects-a to-ph-tile-projects-b',
  certificates: 'from-ph-tile-certificates-a to-ph-tile-certificates-b',
  services: 'from-ph-tile-services-a to-ph-tile-services-b',
  payment: 'from-ph-tile-payment-a to-ph-tile-payment-b',
  settings: 'from-ph-tile-settings-a to-ph-tile-settings-b',
  chat: 'from-ph-tile-chat-a to-ph-tile-chat-b',
  connect: 'from-ph-tile-connect-a to-ph-tile-connect-b',
  cv: 'from-ph-tile-cv-a to-ph-tile-cv-b',
};
