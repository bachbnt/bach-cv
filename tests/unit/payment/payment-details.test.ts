/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import {
  paymentView,
  qrFileName,
  splitMethods,
  stepMethodId,
  summaryOf,
} from '@/components/payment/payment-details';

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

describe('paymentView', () => {
  const m = (
    id: string,
    highlight: number | null,
    kind: 'bank' | 'wallet',
    qr = '',
  ) => ({ id, highlight, kind, qr });
  const methods = [
    m('a', 1, 'bank', 'qr-a'),
    m('b', null, 'bank'),
    m('c', null, 'wallet', 'qr-c'),
    m('d', null, 'bank', 'qr-d'),
  ];

  it('lists the ones with a QR in page order, featured first', () => {
    expect(paymentView(methods, 'all').withQr.map((x) => x.id)).toEqual([
      'a',
      'c',
      'd',
    ]);
  });

  it('names the kinds the other methods have, bank before wallet, and filters them', () => {
    const view = paymentView(methods, 'all');
    expect(view.kinds).toEqual(['bank', 'wallet']);
    expect(view.shownRows.map((x) => x.id)).toEqual(['b', 'c', 'd']);
    expect(paymentView(methods, 'wallet').shownRows.map((x) => x.id)).toEqual([
      'c',
    ]);
    // a kind only the featured methods have is not a filter
    expect(
      paymentView([m('a', 1, 'wallet'), m('b', null, 'bank')], 'all').kinds,
    ).toEqual(['bank']);
  });
});

describe('stepMethodId', () => {
  const ids = ['a', 'b', 'c'];

  it('goes round at both ends', () => {
    expect(stepMethodId(ids, 'a', 1)).toBe('b');
    expect(stepMethodId(ids, 'c', 1)).toBe('a');
    expect(stepMethodId(ids, 'a', -1)).toBe('c');
  });

  it('is null for an empty list', () => {
    expect(stepMethodId([], 'a', 1)).toBeNull();
  });
});
