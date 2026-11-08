/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { isTyping } from '@/lib/is-typing';

class FakeElement {
  constructor(
    public tagName: string,
    public isContentEditable = false,
  ) {}
}

afterEach(() => vi.unstubAllGlobals());

describe('isTyping', () => {
  it('is true for a field and for editable content', () => {
    vi.stubGlobal('HTMLElement', FakeElement);
    for (const tag of ['INPUT', 'TEXTAREA', 'SELECT'])
      expect(isTyping(new FakeElement(tag) as unknown as EventTarget)).toBe(
        true,
      );
    expect(
      isTyping(new FakeElement('DIV', true) as unknown as EventTarget),
    ).toBe(true);
  });

  it('is false for other elements and for no target', () => {
    vi.stubGlobal('HTMLElement', FakeElement);
    expect(isTyping(new FakeElement('BUTTON') as unknown as EventTarget)).toBe(
      false,
    );
    expect(isTyping(null)).toBe(false);
  });
});
