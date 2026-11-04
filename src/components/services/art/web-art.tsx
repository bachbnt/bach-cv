/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import '@/components/services/service-art.css';

/** A browser window with a page layout: a website. */
export function WebArt() {
  return (
    <div className='svc-st'>
      <div className='svc-fr svc-br'>
        <div className='svc-br-top'>
          <i />
          <i />
          <i />
          <span className='svc-br-url' />
        </div>
        <div className='svc-br-body'>
          <div className='svc-br-nav'>
            <b className='svc-ac' />
            <span className='svc-sk' />
            <span className='svc-sk' />
            <span className='svc-sk' />
          </div>
          <div className='svc-br-hero'>
            <div className='svc-br-h'>
              <span className='svc-ac' />
              <span className='svc-sk' />
              <u className='svc-ac' />
            </div>
            <div className='svc-br-img' />
          </div>
          <div className='svc-br-row'>
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
    </div>
  );
}
