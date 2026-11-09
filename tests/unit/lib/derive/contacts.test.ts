/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  emailContact,
  phoneContact,
  socialByGroup,
  socialContacts,
} from '@/lib/derive/contacts';

type Kind = 'email' | 'phone' | 'address' | 'social';
type Group = 'professional' | 'messaging' | 'social' | '';

const contact = (
  id: string,
  kind: Kind,
  url = `https://example.com/${id}`,
  menuGroup: Group = '',
) => ({ id, kind, url, menuGroup });

const contacts = [
  contact('addr', 'address', ''),
  contact('github', 'social', 'https://github.com/x', 'professional'),
  contact('mail', 'email', 'mailto:a@b.c'),
  contact('zalo', 'social', 'https://zalo.me/x', 'messaging'),
  contact('phone', 'phone', 'tel:+84'),
  contact('linkedin', 'social', 'https://linkedin.com/in/x', 'professional'),
  contact('broken', 'social', '', 'social'),
  contact('x', 'social', 'https://x.com/x', 'social'),
];

describe('emailContact and phoneContact', () => {
  it('find the first of their kind', () => {
    expect(emailContact(contacts)?.id).toBe('mail');
    expect(phoneContact(contacts)?.id).toBe('phone');
  });

  it('are undefined when there is none', () => {
    expect(emailContact([contact('x', 'social')])).toBeUndefined();
    expect(phoneContact([])).toBeUndefined();
  });
});

describe('socialContacts', () => {
  it('keeps the social accounts that have a link, in the given order', () => {
    expect(socialContacts(contacts).map((c) => c.id)).toEqual([
      'github',
      'zalo',
      'linkedin',
      'x',
    ]);
  });
});

describe('socialByGroup', () => {
  it('lists the groups in the order of the menu with the accounts of each in the given order', () => {
    expect(
      socialByGroup(socialContacts(contacts)).map(({ group, items }) => [
        group,
        items.map((c) => c.id),
      ]),
    ).toEqual([
      ['professional', ['github', 'linkedin']],
      ['messaging', ['zalo']],
      ['social', ['x']],
    ]);
  });

  it('leaves out an empty group and an account that has no group', () => {
    const only = [
      contact('a', 'social', 'https://a.b', 'messaging'),
      contact('b', 'social', 'https://c.d', ''),
    ];
    expect(socialByGroup(only).map((g) => g.group)).toEqual(['messaging']);
    expect(socialByGroup([])).toEqual([]);
  });
});
