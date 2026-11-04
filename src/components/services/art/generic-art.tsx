/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import '@/components/services/service-art.css';

/** A plain card, for a service whose `art` has no drawing of its own. */
export function GenericArt() {
  return (
    <div className='svc-st'>
      <div className='svc-fr svc-gn'>
        <b className='svc-ac' />
        <span className='svc-sk' />
        <span className='svc-sk' />
        <div className='svc-gn-img' />
      </div>
    </div>
  );
}
