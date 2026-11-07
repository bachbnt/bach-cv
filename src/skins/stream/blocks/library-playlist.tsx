/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import { useMemo, useState } from 'react';
import { LibraryCertificateViewer } from '@/skins/stream/blocks/library-certificate-viewer';
import { LibraryPlaylistCard } from '@/skins/stream/blocks/library-playlist-card';
import { LibraryPlaylistRow } from '@/skins/stream/blocks/library-playlist-row';
import { useContentQuery } from '@/lib/query/use-content';
import { StreamDataState } from '@/skins/stream/ui/stream-data-state';
import { StreamSkeleton } from '@/skins/stream/ui/stream-skeleton';

/**
 * The certificates as a playlist page: the card with the latest one on the left, the numbered rows on the right (with the loading,
 * empty and error states of every data block) and Standard's viewer, which steps through all of them.
 */
export function LibraryPlaylist() {
  const certificates = useContentQuery('certificates');
  const { data: skills = [] } = useContentQuery('skills');
  const items = certificates.data ?? [];
  const [index, setIndex] = useState<number | null>(null);

  const skillById = useMemo(
    () => new Map(skills.map((s) => [s.id, s])),
    [skills],
  );
  const skillsOf = (ids: string[]) =>
    ids.flatMap((id) => {
      const s = skillById.get(id);
      return s ? [{ id, name: s.name }] : [];
    });

  return (
    <div className='grid items-start gap-6 px-3 min-[701px]:px-0 min-[901px]:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] min-[901px]:gap-8'>
      <LibraryPlaylistCard
        latest={items[0]}
        count={items.length}
        onOpen={() => setIndex(0)}
      />
      <StreamDataState
        query={certificates}
        count={items.length}
        empty='certificates'
        subject='certificates'
        skeleton={
          <div className='flex flex-col gap-3'>
            {[0, 1, 2].map((i) => (
              <div key={i} className='flex gap-3 p-2 min-[701px]:p-3'>
                <StreamSkeleton className='aspect-video w-[132px] flex-none min-[701px]:w-[240px]' />
                <div className='flex flex-1 flex-col gap-2'>
                  <StreamSkeleton className='h-4 w-4/5 rounded-md' />
                  <StreamSkeleton className='h-3.5 w-1/2 rounded-md' />
                  <StreamSkeleton className='h-3.5 w-2/3 rounded-md' />
                </div>
              </div>
            ))}
          </div>
        }
      >
        <ol className='m-0 flex list-none flex-col gap-1 p-0'>
          {items.map((c, i) => (
            <LibraryPlaylistRow
              key={c.id}
              certificate={c}
              position={i + 1}
              skills={skillsOf(c.skills)}
              onOpen={() => setIndex(i)}
            />
          ))}
        </ol>
      </StreamDataState>
      <LibraryCertificateViewer
        items={items}
        index={index}
        onIndex={setIndex}
      />
    </div>
  );
}
