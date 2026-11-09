/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

// The contacts the pages and the Connect menus show: the email, the phone, the social accounts and how they are grouped.

import { CONTACT_GROUPS, type Contact } from '@/lib/content/schema';

type Kinded = Pick<Contact, 'kind'>;

/** The first contact that is an email address. */
export const emailContact = <T extends Kinded>(contacts: T[]): T | undefined =>
  contacts.find((contact) => contact.kind === 'email');

/** The first contact that is a phone number. */
export const phoneContact = <T extends Kinded>(contacts: T[]): T | undefined =>
  contacts.find((contact) => contact.kind === 'phone');

/** The social accounts that have a link, in the order they were given. */
export const socialContacts = <T extends Kinded & Pick<Contact, 'url'>>(
  contacts: T[],
): T[] =>
  contacts.filter((contact) => contact.kind === 'social' && contact.url);

/**
 * The social accounts under their group (Professional, Messaging, Social), in the order of `CONTACT_GROUPS`, the order of the accounts kept
 * inside a group. A group with no account is left out, and so is an account that belongs to no group.
 */
export function socialByGroup<T extends Pick<Contact, 'menuGroup'>>(
  social: T[],
): { group: (typeof CONTACT_GROUPS)[number]; items: T[] }[] {
  return CONTACT_GROUPS.map((group) => ({
    group,
    items: social.filter((contact) => contact.menuGroup === group),
  })).filter(({ items }) => items.length > 0);
}
