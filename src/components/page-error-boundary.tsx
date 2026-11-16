/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  /** what shows in place of the page that threw */
  fallback: ReactNode;
  /** another value (the path) puts the page back: going to another page leaves the error behind */
  resetKey: string;
  children: ReactNode;
}

/**
 * Catches a page of a skin that throws while it renders, so the frame of the skin stays and the screen for an error shows in its place.
 * A page of Standard has Next's `app/error.tsx` for this; a skin draws its own page, outside of it. An error of the screen itself, or of the
 * frame, goes up to `app/global-error.tsx`.
 */
export class PageErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.failed && prev.resetKey !== this.props.resetKey)
      this.setState({ failed: false });
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
