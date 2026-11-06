/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import type { CSSProperties } from 'react';

/**
 * An answer that appears word by word. The whole text is in the DOM from the first frame (a screen reader or a test finds it at
 * once, the live region announces it complete); each word is a span that fades in after a delay of its own (`--w`),
 * and nothing animates for visitors who prefer reduced motion.
 */
export function DevChatTypewriter({ text }: { text: string }) {
  return text.split(/(\s+)/).map((part, i) =>
    i % 2 === 1 ? (
      part
    ) : part ? (
      <span
        key={i}
        data-word=''
        className='animate-[dv-bbword_0.2s_ease-out_both] [animation-delay:min(calc(var(--w)*14ms),4s)]'
        style={{ '--w': i / 2 } as CSSProperties}
      >
        {part}
      </span>
    ) : null,
  );
}
