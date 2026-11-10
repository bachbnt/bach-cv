/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { describe, expect, it } from 'vitest';
import { servicesCopy } from '@/content/copy/services';
import {
  applyTopic,
  counterText,
  invalidAnnouncement,
  invalidFields,
  toPayload,
  validateForm,
  warnAt,
} from '@/components/services/message-form';
import { fill } from '@/lib/chat/fill';

const limits = { nameMax: 100, messageMax: 1000 };
const en = servicesCopy.en;
const vi = servicesCopy.vi;
const ok = {
  name: 'Ada',
  email: 'ada@example.com',
  message: 'I need a website for my shop.',
  topic: 'Web Development',
};

describe('applyTopic', () => {
  it('fills an empty message with the starter', () => {
    expect(applyTopic('  ', '', 'Hi A: ')).toBe('Hi A: ');
  });
  it('swaps the opener and keeps what the visitor typed', () => {
    expect(applyTopic('Hi A: my shop', 'Hi A: ', 'Hi B: ')).toBe(
      'Hi B: my shop',
    );
  });
  it('removes the opener when the topic is deselected', () => {
    expect(applyTopic('Hi A: my shop', 'Hi A: ', '')).toBe('my shop');
  });
  it('leaves a message the visitor wrote themselves alone', () => {
    expect(applyTopic('My own words', 'Hi A: ', 'Hi B: ')).toBe('My own words');
    expect(applyTopic('My own words', '', 'Hi B: ')).toBe('My own words');
  });
});

describe.each([
  [
    'en',
    en,
    {
      name: 'Name is required',
      email: 'Enter a valid email so I can reply',
      message: 'Message is required',
      starterOnly: 'Add a few details about what you need',
      nameLong: 'Name is too long',
      messageLong: 'Message is too long',
    },
  ],
  [
    'vi',
    vi,
    {
      name: 'Vui lòng nhập tên',
      email: 'Nhập email hợp lệ để mình có thể trả lời bạn',
      message: 'Vui lòng nhập tin nhắn',
      starterOnly: 'Hãy thêm vài chi tiết về điều bạn cần nhé',
      nameLong: 'Tên quá dài',
      messageLong: 'Tin nhắn quá dài',
    },
  ],
] as const)('validateForm in %s', (_lang, copy, text) => {
  const errs = copy.form.errors;
  it('accepts a complete form', () => {
    expect(validateForm(ok, limits, '', errs)).toEqual({});
  });
  it('flags each missing field with friendly text', () => {
    const errors = validateForm(
      { name: ' ', email: 'nope', message: '', topic: '' },
      limits,
      '',
      errs,
    );
    expect(errors).toEqual({
      name: text.name,
      email: text.email,
      message: text.message,
    });
    expect(invalidFields(errors)).toEqual(['name', 'email', 'message']);
  });
  it('asks for details when only the starter sentence is left', () => {
    expect(
      validateForm(
        { ...ok, message: 'Hi Bach, a website: ' },
        limits,
        'Hi Bach, a website: ',
        errs,
      ).message,
    ).toBe(text.starterOnly);
  });
  it('enforces the site limits', () => {
    expect(
      validateForm(
        { ...ok, name: 'x'.repeat(11) },
        { nameMax: 10, messageMax: 1000 },
        '',
        errs,
      ).name,
    ).toBe(text.nameLong);
    expect(
      validateForm(
        { ...ok, message: 'x'.repeat(21) },
        { nameMax: 100, messageMax: 20 },
        '',
        errs,
      ).message,
    ).toBe(text.messageLong);
  });
});

describe('counter, announcements and payload', () => {
  it('warns at 90% and says so at the limit, in both languages', () => {
    expect(warnAt(1000)).toBe(900);
    expect(counterText(5, 1000, en.form.count)).toBe('5/1000');
    expect(counterText(1000, 1000, en.form.count)).toBe(
      'Limit reached, 1000/1000',
    );
    expect(counterText(1000, 1000, vi.form.count)).toBe(
      'Đã đạt giới hạn, 1000/1000',
    );
  });
  it('announces the fields that need attention', () => {
    expect(invalidAnnouncement(['name'], en)).toBe(
      '1 field needs attention: Name',
    );
    expect(invalidAnnouncement(['name', 'email', 'message'], en)).toBe(
      '3 fields need attention: Name, Email, Message',
    );
    expect(invalidAnnouncement(['email', 'message'], vi)).toBe(
      '2 trường cần chú ý: Email, Tin nhắn',
    );
  });
  it('fills placeholders', () => {
    expect(fill(vi.sent.body, { name: 'Ada', email: 'a@b.co' })).toBe(
      'Cảm ơn Ada. Mình sẽ trả lời bạn qua a@b.co.',
    );
  });
  it('trims and clamps the payload and carries the language', () => {
    const values = { ...ok, name: '  Ada  ', message: ' abcdef ' };
    const limit = { nameMax: 100, messageMax: 3 };
    expect(toPayload(values, limit, 'en')).toEqual({
      name: 'Ada',
      email: 'ada@example.com',
      topic: 'Web Development',
      message: 'abc',
      locale: 'en',
    });
    expect(toPayload(values, limit, 'vi').locale).toBe('vi');
  });
});
