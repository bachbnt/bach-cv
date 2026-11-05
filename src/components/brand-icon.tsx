/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { Link2, MapPin, Phone } from 'lucide-react';
import { BRAND_ICONS } from '@/lib/brand-icons';

/** Icon for a contact platform. Brand marks come from the mockup; the rest fall back to a neutral glyph. */
export function BrandIcon({
  platform,
  className,
}: {
  platform: string;
  className?: string;
}) {
  const icon = BRAND_ICONS[platform];
  if (icon) {
    return (
      <span
        aria-hidden='true'
        className={className}
        dangerouslySetInnerHTML={{ __html: icon.svg }}
      />
    );
  }
  const Fallback =
    platform === 'phone' ? Phone : platform === 'address' ? MapPin : Link2;
  return <Fallback aria-hidden='true' className={className} />;
}

export const brandColor = (platform: string) =>
  BRAND_ICONS[platform]?.color ?? 'var(--night)';

export const brandName = (platform: string) =>
  BRAND_ICONS[platform]?.name ?? platform;
