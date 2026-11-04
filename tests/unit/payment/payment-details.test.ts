/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  initialsOf,
  qrFileName,
  splitMethods,
  summaryOf,
} from '@/components/payment/payment-details';

describe('initialsOf', () => {
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
    expect(initialsOf(name)).toBe(initials);
  });
});

describe('summaryOf', () => {
  const labels = {
    accountName: 'Account name',
    accountNumber: 'Account number',
  };

  it('lists name, holder and number', () => {
    expect(
      summaryOf({ name: 'BIDV', holder: 'A B', account: '123' }, labels),
    ).toBe('BIDV\nAccount name: A B\nAccount number: 123');
  });

  it('leaves out an empty account name', () => {
    expect(
      summaryOf({ name: 'BIDV', holder: '', account: '123' }, labels),
    ).toBe('BIDV\nAccount number: 123');
  });
});

describe('qrFileName', () => {
  it('uses the image type, then the url, then png', () => {
    expect(qrFileName('Viettel Money', 'image/jpeg', 'x')).toBe(
      'viettel-money-qr.jpg',
    );
    expect(qrFileName('BIDV', '', 'https://a/b/qr.png?x=1')).toBe(
      'bidv-qr.png',
    );
    expect(qrFileName('BIDV', 'application/octet-stream', 'https://a/b')).toBe(
      'bidv-qr.png',
    );
  });
});

describe('splitMethods', () => {
  const m = (id: string, highlight: number | null) => ({ id, highlight });

  it('features the highlighted ones and keeps the order', () => {
    const { featured, rest } = splitMethods([
      m('a', 1),
      m('b', null),
      m('c', 2),
    ]);
    expect(featured.map((x) => x.id)).toEqual(['a', 'c']);
    expect(rest.map((x) => x.id)).toEqual(['b']);
  });

  it('features a single method that is not highlighted', () => {
    expect(splitMethods([m('a', null)]).featured).toHaveLength(1);
  });

  it('lists several methods that are not highlighted as rows', () => {
    const { featured, rest } = splitMethods([m('a', null), m('b', null)]);
    expect(featured).toHaveLength(0);
    expect(rest).toHaveLength(2);
  });
});
