/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Award,
  Briefcase,
  CircleUser,
  Film,
  House,
  Radio,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { PageKey } from '@/lib/content/schema';

const ICONS: Record<PageKey, LucideIcon> = {
  home: House,
  projects: Film,
  resume: Radio,
  about: CircleUser,
  services: Briefcase,
  payment: Wallet,
  certificates: Award,
};

/** The icon of a page in the navigation: a house, a clip for the projects, a broadcast mark for the resume. */
export function PageIcon({
  page,
  className,
}: {
  page: PageKey;
  className?: string;
}) {
  const Icon = ICONS[page];
  return <Icon aria-hidden='true' className={className} />;
}
