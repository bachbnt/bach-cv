/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useContactForm } from '@/components/services/use-contact-form';
import { settingsSchema } from '@/lib/content/schema';
import { settingsQueryOptions } from '@/lib/query/options';
import { ServicesContact } from '@/skins/moba/blocks/services-contact';
import { ServicesShop } from '@/skins/moba/blocks/services-shop';

/** Until the settings arrive the form uses the schema defaults, as on Standard. */
const DEFAULT_LIMITS = settingsSchema.parse({}).contactForm;

/** The shop and the order desk share one form, so choosing an item in the shop fills the message of the desk. */
export function ServicesBoard() {
  const { data: settings } = useQuery(settingsQueryOptions());
  const limits = settings?.contactForm ?? DEFAULT_LIMITS;
  const form = useContactForm(limits);
  return (
    <>
      <ServicesShop form={form} />
      <ServicesContact form={form} limits={limits} />
    </>
  );
}
