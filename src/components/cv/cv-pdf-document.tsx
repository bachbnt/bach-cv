/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Document,
  Font,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer';
import type { ReactNode } from 'react';
import type { CvCopy } from '@/content/copy/cv';
import type { CvModel, CvRole } from '@/lib/cv/build-cv';
import { CONTACT_ICON_PATHS } from '@/lib/cv/icon-paths';

// Loaded by URL from /public/fonts, only when the PDF is created. NotoSans covers Vietnamese.
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: '/fonts/NotoSans-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/NotoSans-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/NotoSans-Italic.ttf', fontStyle: 'italic' },
  ],
});
Font.registerHyphenationCallback((word) => [word]);

const INK = '#1b1f27';
const MUTED = '#566070';
const ACCENT = '#b3301f';
const DASH = '#9aa1ae';

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingRight: 32,
    paddingBottom: 28,
    paddingLeft: 32,
    fontFamily: 'NotoSans',
    fontSize: 8.4,
    lineHeight: 1.32,
    color: INK,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  headerLeft: { width: '58%' },
  name: { fontSize: 22, lineHeight: 1.12, fontWeight: 700, marginBottom: 6 },
  headline: { fontSize: 10.8, color: '#3a404c' },
  contacts: {
    width: '38%',
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: ACCENT,
  },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  contactIcon: { width: 10, height: 10, marginRight: 8 },
  contactValue: { flex: 1 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 10,
  },
  sectionTitleBox: { marginRight: 12 },
  sectionTitle: { fontSize: 12, lineHeight: 1, fontWeight: 700 },
  sectionUnderline: {
    width: 28,
    height: 2.5,
    marginTop: 5,
    backgroundColor: ACCENT,
  },
  sectionRule: { flexGrow: 1, height: 1, backgroundColor: '#c9cdd6' },
  paragraph: { marginBottom: 3 },
  italic: { fontStyle: 'italic' },
  bold: { fontWeight: 700 },
  muted: { color: MUTED },
  row: { flexDirection: 'row' },
  left: { width: 112, paddingRight: 10 },
  rail: { width: 14, alignItems: 'center' },
  line: {
    position: 'absolute',
    top: 0,
    bottom: -12,
    left: 6.5,
    width: 0,
    borderLeftWidth: 0.8,
    borderLeftStyle: 'dashed',
    borderLeftColor: DASH,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginTop: 2,
    backgroundColor: ACCENT,
  },
  right: { flex: 1, paddingLeft: 8 },
  company: { fontSize: 9, fontWeight: 700, marginBottom: 3 },
  roleTitle: { fontSize: 9.4, fontWeight: 700, marginBottom: 4 },
  bulletRow: { flexDirection: 'row', paddingLeft: 4, marginBottom: 2 },
  bullet: { width: 8 },
  bulletText: { flex: 1 },
  columns: { flexDirection: 'row', gap: 20 },
  column: { flex: 1 },
  item: { marginBottom: 8 },
});

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader} wrap={false} minPresenceAhead={80}>
    <View style={styles.sectionTitleBox}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionUnderline} />
    </View>
    <View style={styles.sectionRule} />
  </View>
);

/** A row of the dashed timeline. Rows that continue an entry have no `left` and no dot. */
const TimelineRow = ({
  left,
  dot = false,
  line,
  gap,
  children,
  minPresenceAhead,
}: {
  left?: ReactNode;
  dot?: boolean;
  line: boolean;
  gap: number;
  children: ReactNode;
  minPresenceAhead?: number;
}) => (
  <View
    style={[styles.row, { marginBottom: gap }]}
    wrap={false}
    minPresenceAhead={minPresenceAhead}
  >
    <View style={styles.left}>{left}</View>
    <View style={styles.rail}>
      {line && (
        <View style={[styles.line, { top: dot ? 5 : 0, bottom: -gap }]} />
      )}
      {dot && <View style={styles.dot} />}
    </View>
    <View style={styles.right}>{children}</View>
  </View>
);

const Bullet = ({ children }: { children: ReactNode }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bullet}>•</Text>
    <Text style={styles.bulletText}>{children}</Text>
  </View>
);

const RoleItem = ({
  role,
  last,
  copy,
}: {
  role: CvRole;
  last: boolean;
  copy: CvCopy;
}) => {
  const { describedProjects, bullets } = role;
  const rows: ReactNode[] = [
    <>
      <Text style={styles.roleTitle}>{role.role}</Text>
      {role.team ? (
        <Text style={[styles.paragraph, styles.italic]}>{role.team}</Text>
      ) : null}
      {role.summary ? (
        <Text style={styles.paragraph}>{role.summary}</Text>
      ) : null}
      {role.technologies.length > 0 && (
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{copy.labels.technologies}: </Text>
          {role.technologies.join(', ')}
        </Text>
      )}
      {role.plainProjects.length > 0 && (
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>{copy.labels.projects}: </Text>
          {role.plainProjects.join(', ')}
        </Text>
      )}
      {describedProjects.length > 0 && (
        <Text style={[styles.paragraph, styles.italic]}>
          {copy.labels.projects}:
        </Text>
      )}
    </>,
    ...describedProjects.map((p) => (
      <Bullet key={p.name}>
        <Text style={styles.bold}>{p.name}: </Text>
        {p.description}
      </Bullet>
    )),
    ...bullets.map((text, i) => (
      <>
        {i === 0 && (
          <Text style={[styles.paragraph, styles.italic]}>
            {copy.labels.responsibilities}:
          </Text>
        )}
        <Bullet>{text}</Bullet>
      </>
    )),
  ];

  return (
    <>
      {rows.map((content, i) => {
        const end = i === rows.length - 1;
        return (
          <TimelineRow
            key={i}
            dot={i === 0}
            line={!end || !last}
            gap={end ? 10 : 0}
            minPresenceAhead={i === 0 && rows.length > 1 ? 60 : undefined}
            left={
              i === 0 ? (
                <>
                  <Text style={styles.company}>{role.company}</Text>
                  <Text style={styles.muted}>{role.period}</Text>
                </>
              ) : undefined
            }
          >
            {content}
          </TimelineRow>
        );
      })}
    </>
  );
};

/** The CV as an A4 PDF. Renders the same model as the preview sheets. */
export function CvPdfDocument({ cv, copy }: { cv: CvModel; copy: CvCopy }) {
  return (
    <Document title={`${cv.name} ${copy.titleSuffix}`} author={cv.name}>
      <Page size='A4' style={styles.page} wrap>
        <View style={styles.header} wrap={false}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{cv.name}</Text>
            <Text style={styles.headline}>{cv.headline}</Text>
          </View>
          {cv.contacts.length > 0 && (
            <View style={styles.contacts}>
              {cv.contacts.map((contact) => (
                <View key={contact.kind} style={styles.contactRow}>
                  <Svg style={styles.contactIcon} viewBox='0 0 24 24'>
                    <Path d={CONTACT_ICON_PATHS[contact.kind]} fill={ACCENT} />
                  </Svg>
                  <Text style={styles.contactValue}>{contact.value}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {cv.summary ? (
          <View>
            <SectionHeader title={copy.sections.summary} />
            <Text>{cv.summary}</Text>
          </View>
        ) : null}

        {cv.experience.length > 0 && (
          <View>
            <SectionHeader title={copy.sections.experience} />
            {cv.experience.map((role, i) => (
              <RoleItem
                key={role.id}
                role={role}
                copy={copy}
                last={i === cv.experience.length - 1}
              />
            ))}
          </View>
        )}

        {cv.education.length > 0 && (
          <View>
            <SectionHeader title={copy.sections.education} />
            <View style={styles.columns}>
              {cv.education.map((e) => (
                <View
                  key={e.id}
                  style={[styles.column, styles.item]}
                  wrap={false}
                >
                  <Text style={styles.muted}>{e.period}</Text>
                  <Text style={styles.bold}>{e.degree}</Text>
                  <Text style={styles.bold}>{e.school}</Text>
                  {e.major ? (
                    <Text>
                      {copy.labels.major}: {e.major}
                    </Text>
                  ) : null}
                  {e.thesis ? (
                    <Text>
                      {copy.labels.thesis}: {e.thesis}
                    </Text>
                  ) : null}
                  {e.technologies.length > 0 && (
                    <Text>
                      {copy.labels.technologies}: {e.technologies.join(', ')}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        )}

        {cv.certificates.length > 0 && (
          <View>
            <SectionHeader title={copy.sections.certificates} />
            <View style={styles.columns}>
              {cv.certificates.map((c) => (
                <View
                  key={c.id}
                  style={[styles.column, styles.item]}
                  wrap={false}
                >
                  <Text style={styles.muted}>{c.date}</Text>
                  <Text style={styles.bold}>{c.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {cv.skills.length > 0 && (
          <View>
            <SectionHeader title={copy.sections.skills} />
            <View style={styles.columns}>
              {cv.skills.map((group) => (
                <View
                  key={group.id}
                  style={[styles.column, styles.item]}
                  wrap={false}
                >
                  <Text style={styles.bold}>{group.title}</Text>
                  <Text>{group.skills.join(', ')}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {cv.projects.length > 0 && (
          <View>
            <SectionHeader title={copy.sections.projects} />
            {cv.projects.map((p, i) => (
              <TimelineRow
                key={p.id}
                dot
                line={i < cv.projects.length - 1}
                gap={10}
                left={
                  <>
                    <Text style={styles.company}>{p.name}</Text>
                    {p.period ? (
                      <Text style={styles.muted}>{p.period}</Text>
                    ) : null}
                  </>
                }
              >
                {p.description ? (
                  <Text style={styles.paragraph}>{p.description}</Text>
                ) : null}
                {p.technologies.length > 0 && (
                  <Text style={styles.paragraph}>
                    <Text style={styles.bold}>
                      {copy.labels.technologies}:{' '}
                    </Text>
                    {p.technologies.join(', ')}
                  </Text>
                )}
              </TimelineRow>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
