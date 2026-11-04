/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import '@/components/services/service-art.css';

/** A lesson slide with a code sample: teaching. */
export function TeachingArt() {
  return (
    <div className='svc-st'>
      <div className='svc-fr svc-sl'>
        <div className='svc-sl-top'>
          <b>Lesson 3</b>
          <span>State management</span>
        </div>
        <div className='svc-sl-body'>
          <ul>
            <li>
              <span />
            </li>
            <li>
              <span />
            </li>
            <li>
              <span />
            </li>
          </ul>
          <div className='svc-sl-code'>
            <span className='svc-p'>setState</span>
            {'(() {\n  count++;\n});'}
          </div>
        </div>
        <div className='svc-sl-foot'>
          <i />
          <i />
          <i className='svc-on' />
          <i />
          <i />
        </div>
      </div>
    </div>
  );
}
