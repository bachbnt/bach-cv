/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import '@/components/services/service-art.css';

/** Two sheets with a title, a code block and a quote: technical writing. */
export function WritingArt() {
  return (
    <div className='svc-st'>
      <div className='svc-fr svc-dc svc-dc-back' />
      <div className='svc-fr svc-dc svc-dc-front'>
        <div className='svc-dc-title' />
        <div className='svc-dc-meta'>
          <b className='svc-ac' />
          <span />
        </div>
        <p>
          <span />
          <span />
          <span />
        </p>
        <div className='svc-dc-code'>
          <span />
          <span />
        </div>
        <div className='svc-dc-quote'>
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}
