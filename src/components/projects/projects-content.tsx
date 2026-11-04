/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { FeaturedProject } from '@/components/projects/featured-project';
import { ProjectGrid } from '@/components/projects/project-grid';
import { ProjectsNotice } from '@/components/projects/projects-notice';
import { ScreenshotsDialog } from '@/components/projects/screenshots-dialog';
import { buttonVariants } from '@/components/ui/button';
import { projectsCopy } from '@/content/copy/projects';
import { useCopy } from '@/lib/i18n/copy';
import type { Doc } from '@/lib/content/schema';
import { cn } from 'cn';
import { useContentQuery } from '@/lib/query/use-content';

const heading = 'text-[30px] min-[721px]:text-[40px]';

/** Featured projects (by rank), then every project with the kind filter. */
export function ProjectsContent() {
  const copy = useCopy(projectsCopy);
  const projectsQuery = useContentQuery('projects');
  const { data: skillList = [] } = useContentQuery('skills');
  const skills = useMemo(
    () => new Map(skillList.map((s) => [s.id, s])),
    [skillList],
  );
  const [active, setActive] = useState<Doc<'projects'> | null>(null);
  const [open, setOpen] = useState(false);

  const projects = projectsQuery.data ?? [];
  const featured = projects
    .filter((p) => p.highlight !== null)
    .sort((a, b) => (a.highlight ?? 0) - (b.highlight ?? 0));

  return (
    <section className='mx-auto w-full max-w-[1200px] px-5 pt-14 pb-24 min-[721px]:px-12'>
      {projectsQuery.isPending ? (
        <p className='py-6 text-muted-foreground'>{copy.loading}</p>
      ) : projectsQuery.isError ? (
        <ProjectsNotice title={copy.error.title} body={copy.error.body} />
      ) : projects.length === 0 ? (
        <ProjectsNotice title={copy.empty.title} body={copy.empty.body}>
          <Link
            href='/resume'
            className={cn(buttonVariants({ variant: 'default' }))}
          >
            {copy.empty.resume}
          </Link>
        </ProjectsNotice>
      ) : (
        <>
          {featured.length > 0 && (
            <>
              <h2 className={heading}>{copy.featured}</h2>
              <div className='mt-6 flex flex-col gap-6'>
                {featured.map((project) => (
                  <FeaturedProject
                    key={project.id}
                    project={project}
                    skills={skills}
                    onOpenScreenshots={(p) => {
                      setActive(p);
                      setOpen(true);
                    }}
                  />
                ))}
              </div>
            </>
          )}
          <h2 className={cn(heading, featured.length > 0 && 'mt-20')}>
            {copy.all}
          </h2>
          <ProjectGrid projects={projects} skills={skills} />
        </>
      )}
      {active && (
        <ScreenshotsDialog
          name={active.name}
          images={active.images}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </section>
  );
}
