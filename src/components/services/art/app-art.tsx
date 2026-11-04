/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import '@/components/services/service-art.css';

/** Two phones: a mobile app. */
export function AppArt() {
  return (
    <div className='svc-st'>
      <div className='svc-fr svc-ph svc-ph-back'>
        <div className='svc-ac' />
      </div>
      <div className='svc-fr svc-ph svc-ph-front'>
        <i className='svc-ph-notch' />
        <div className='svc-ph-bar svc-sk' />
        <div className='svc-ph-card'>
          <b className='svc-ac' />
          <em>
            <span className='svc-sk' />
            <span className='svc-sk' />
          </em>
        </div>
        <div className='svc-ph-img' />
        <div className='svc-ph-btn svc-ac' />
        <div className='svc-ph-tabs'>
          <i />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}
