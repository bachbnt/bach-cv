/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

/**
 * A thin line along the top edge, in the colour of the page, that grows with the scroll. Pure CSS (a scroll-driven animation, see
 * `.scroll-progress` in globals.css): where the browser cannot do that, or for "reduce motion", it stays hidden.
 */
export function ScrollProgress() {
  return <div aria-hidden='true' className='scroll-progress' />;
}
