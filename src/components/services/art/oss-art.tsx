/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import '@/components/services/service-art.css';

/** A terminal that opens a pull request: open source. */
export function OssArt() {
  return (
    <div className='svc-st'>
      <div className='svc-tm'>
        <div className='svc-tm-top'>
          <i />
          <i />
          <i />
          <span>~/dev-cmd</span>
        </div>
        <pre className='svc-tm-body'>
          <span className='svc-p'>$</span> git checkout -b feat/scaffold{'\n'}
          <span className='svc-p'>$</span> npm test{'\n'}
          <span className='svc-o'>✓ 42 passed</span>
          {'\n'}
          <span className='svc-p'>$</span> gh pr create{'\n'}
          <span className='svc-o'>✓ PR #128 opened</span>{' '}
          <em className='svc-tm-cur' />
        </pre>
      </div>
    </div>
  );
}
