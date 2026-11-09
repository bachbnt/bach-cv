/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { initialOf, initialsOf, methodInitials } from '@/lib/derive/initials';

describe('initialsOf', () => {
  it('takes the first letters of the words', () => {
    expect(initialsOf('FinHub MCP')).toBe('FM');
    expect(initialsOf('Good Morning Coffee & Tea')).toBe('GM');
  });

  it('splits a single camel-case word', () => {
    expect(initialsOf('DevPad')).toBe('DP');
    expect(initialsOf('bachbntdev')).toBe('B');
  });

  it('is empty for an empty name', () => {
    expect(initialsOf('  ')).toBe('');
  });
});

describe('methodInitials', () => {
  it.each([
    ['Vietcombank', 'VI'],
    ['VietinBank', 'VB'],
    ['Binance', 'BI'],
    ['Viettel Money', 'VM'],
    ['ZaloPay', 'ZP'],
    ['VNPay', 'VN'],
    ['PayPal', 'PP'],
    ['ShopeePay', 'SP'],
    ['momo', 'MO'],
  ])('%s -> %s', (name, initials) => {
    expect(methodInitials(name)).toBe(initials);
  });
});

describe('initialOf', () => {
  it('is the first letter as a capital, whole for a letter with marks', () => {
    expect(initialOf('swift')).toBe('S');
    expect(initialOf('  kotlin')).toBe('K');
    expect(initialOf('đào tạo')).toBe('Đ');
    expect(initialOf('Ôn tập')).toBe('Ô');
  });

  it('is empty for an empty name', () => {
    expect(initialOf('')).toBe('');
    expect(initialOf('   ')).toBe('');
  });
});
