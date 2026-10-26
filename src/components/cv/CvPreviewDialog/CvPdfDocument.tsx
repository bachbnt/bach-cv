/**
 * Copyright (c) 2026 bachbnt. All rights reserved.
 */

import {
  Document,
  Font,
  Link,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from '@react-pdf/renderer';
import { Cv, CvEducation, CvExperience, CvProject } from '@models/cv';
import type { ReactNode } from 'react';

Font.register({
  family: 'NotoSans',
  fonts: [
    { src: '/fonts/NotoSans-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/NotoSans-Bold.ttf', fontWeight: 700 },
    { src: '/fonts/NotoSans-Italic.ttf', fontStyle: 'italic' },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

const styles = StyleSheet.create({
  page: {
    paddingTop: 22,
    paddingRight: 23,
    paddingBottom: 22,
    paddingLeft: 23,
    fontFamily: 'NotoSans',
    fontSize: 8.4,
    lineHeight: 1.32,
    color: '#111111',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  headerLeft: {
    width: '58%',
  },
  name: {
    fontSize: 22,
    lineHeight: 1.12,
    fontWeight: 700,
    marginBottom: 9,
  },
  headline: {
    fontSize: 10.8,
  },
  contacts: {
    width: '40%',
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#000000',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  contactIcon: {
    width: 11,
    height: 11,
    marginRight: 9,
  },
  contactValue: {
    flex: 1,
  },
  section: {
    marginBottom: 17,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitleBox: {
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 12.4,
    lineHeight: 1,
    fontWeight: 700,
    textTransform: 'uppercase',
  },
  sectionTitleUnderline: {
    width: 36,
    height: 3,
    marginTop: 6,
    backgroundColor: '#000000',
  },
  sectionRule: {
    flexGrow: 1,
    height: 1,
    backgroundColor: '#555555',
  },
  subheading: {
    fontSize: 9.1,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 2.2,
    paddingLeft: 8,
  },
  bullet: {
    width: 8,
  },
  bulletText: {
    flex: 1,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineSpacer: {
    height: 9,
  },
  timelineLeft: {
    width: 138,
    paddingRight: 14,
  },
  company: {
    fontSize: 8.8,
    fontWeight: 700,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  period: {
    fontSize: 8.5,
  },
  timelineRail: {
    width: 16,
    alignItems: 'center',
  },
  railLine: {
    position: 'absolute',
    top: 4,
    bottom: -16,
    left: 7,
    width: 0,
    borderLeftWidth: 1,
    borderLeftStyle: 'dashed',
    borderLeftColor: '#555555',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  timelineRight: {
    flex: 1,
    paddingLeft: 9,
  },
  roleTitle: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    marginBottom: 7,
  },
  italic: {
    fontStyle: 'italic',
  },
  bold: {
    fontWeight: 700,
  },
  paragraph: {
    marginBottom: 3,
  },
  contentColumns: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 17,
  },
  leftColumn: {
    width: '49%',
  },
  rightColumn: {
    width: '49%',
  },
  educationItem: {
    marginBottom: 11,
  },
  educationPeriod: {
    fontSize: 8.3,
    marginBottom: 8,
  },
  educationDegree: {
    fontWeight: 700,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  educationSchool: {
    fontWeight: 700,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  certificationRow: {
    marginBottom: 11,
  },
  certificationTime: {
    marginBottom: 6,
  },
  skillGroup: {
    marginBottom: 8,
  },
  skillGroupTitle: {
    fontWeight: 700,
    marginBottom: 4,
  },
  projectItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  projectLeft: {
    width: 138,
    paddingRight: 14,
  },
  projectRight: {
    flex: 1,
    paddingLeft: 9,
  },
  projectName: {
    fontSize: 8.8,
    fontWeight: 700,
  },
  link: {
    color: '#111111',
    textDecoration: 'none',
  },
});

const iconPaths: Record<string, string> = {
  phone:
    'M6.62 10.79C8.06 13.62 10.38 15.93 13.21 17.38L15.41 15.18C15.68 14.91 16.08 14.82 16.43 14.94C17.55 15.31 18.75 15.5 20 15.5C20.55 15.5 21 15.95 21 16.5V20C21 20.55 20.55 21 20 21C10.61 21 3 13.39 3 4C3 3.45 3.45 3 4 3H7.5C8.05 3 8.5 3.45 8.5 4C8.5 5.25 8.69 6.45 9.06 7.57C9.17 7.92 9.09 8.31 8.81 8.59L6.62 10.79Z',
  email:
    'M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z',
  location:
    'M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9S10.62 6.5 12 6.5S14.5 7.62 14.5 9S13.38 11.5 12 11.5Z',
};

const formatPeriod = (period: { start: string; end: string }) =>
  [period.start, period.end].filter(Boolean).join(' - ');

const ContactIcon = ({ type }: { type: string }) => (
  <Svg style={styles.contactIcon} viewBox='0 0 24 24'>
    <Path d={iconPaths[type] ?? ''} fill='#000000' />
  </Svg>
);

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader} wrap={false} minPresenceAhead={95}>
    <View style={styles.sectionTitleBox}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionTitleUnderline} />
    </View>
    <View style={styles.sectionRule} />
  </View>
);

const BulletList = ({ items }: { items: string[] }) => (
  <>
    {items.map((item) => (
      <View key={item} style={styles.bulletRow} wrap={false}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletText}>{item}</Text>
      </View>
    ))}
  </>
);

const TimelineTextRow = ({ children }: { children: ReactNode }) => (
  <View style={styles.timelineItem} wrap={false}>
    <View style={styles.timelineLeft} />
    <View style={styles.timelineRail}>
      <View style={styles.railLine} />
    </View>
    <View style={styles.timelineRight}>
      <View style={styles.bulletRow}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletText}>{children}</Text>
      </View>
    </View>
  </View>
);

const TimelineSectionLabel = ({ children }: { children: ReactNode }) => (
  <View style={styles.timelineItem} wrap={false}>
    <View style={styles.timelineLeft} />
    <View style={styles.timelineRail}>
      <View style={styles.railLine} />
    </View>
    <View style={styles.timelineRight}>
      <Text style={[styles.paragraph, styles.italic]}>{children}</Text>
    </View>
  </View>
);

const ExperienceItem = ({ item }: { item: CvExperience }) => {
  if (!item.pdf.visible) return null;

  const describedProjects = item.projects.filter(
    (project) => project.description,
  );
  const simpleProjects = item.projects.filter(
    (project) => !project.description,
  );

  return (
    <>
      <View style={styles.timelineItem} wrap={false} minPresenceAhead={90}>
        <View style={styles.timelineLeft}>
          <Text style={styles.company}>{item.company}</Text>
          <Text style={styles.period}>{formatPeriod(item.period)}</Text>
        </View>
        <View style={styles.timelineRail}>
          <View style={styles.railLine} />
          <View style={styles.dot} />
        </View>
        <View style={styles.timelineRight}>
          <Text style={styles.roleTitle}>{item.title}</Text>
          {item.pdf.showProjects &&
            simpleProjects.map((project) => (
              <Text
                key={project.name}
                style={[styles.paragraph, styles.italic]}
              >
                {project.technologies?.length
                  ? `${project.name}: ${project.technologies.join(', ')}`
                  : `Projects: ${project.name}`}
              </Text>
            ))}
          {item.team && <Text style={styles.paragraph}>{item.team}</Text>}
          {item.pdf.showRoleDetails && <BulletList items={item.roleDetails} />}
          {item.pdf.showTechnologies && item.technologies.length > 0 && (
            <Text style={[styles.paragraph, styles.italic]}>
              Technologies: {item.technologies.join(', ')}
            </Text>
          )}
          {item.pdf.showProjects && describedProjects.length > 0 && (
            <Text style={[styles.paragraph, styles.italic]}>Projects:</Text>
          )}
          {item.pdf.showResponsibilities &&
            item.responsibilities.length > 0 &&
            describedProjects.length === 0 && (
              <Text style={[styles.paragraph, styles.italic]}>
                Responsibilities:
              </Text>
            )}
        </View>
      </View>
      {item.pdf.showProjects &&
        describedProjects.map((project) => (
          <TimelineTextRow key={project.name}>
            <Text style={styles.bold}>{project.name}: </Text>
            {project.description}
          </TimelineTextRow>
        ))}
      {item.pdf.showProjects &&
        describedProjects.length > 0 &&
        item.pdf.showResponsibilities &&
        item.responsibilities.length > 0 && (
          <TimelineSectionLabel>Responsibilities:</TimelineSectionLabel>
        )}
      {item.pdf.showResponsibilities &&
        item.responsibilities.map((responsibility) => (
          <TimelineTextRow key={responsibility}>
            {responsibility}
          </TimelineTextRow>
        ))}
      <View style={styles.timelineSpacer} />
    </>
  );
};

const EducationItem = ({ item }: { item: CvEducation }) => (
  <View style={styles.educationItem} wrap={false}>
    <Text style={styles.educationPeriod}>{formatPeriod(item.period)}</Text>
    <Text style={styles.educationDegree}>
      {item.degree}
      {item.major ? ` - ${item.major}` : ''}
    </Text>
    <Text style={styles.educationSchool}>{item.school}</Text>
    {item.thesis && <Text>• Thesis: {item.thesis}</Text>}
    {item.technologies.length > 0 && (
      <Text>• Technologies: {item.technologies.join(', ')}</Text>
    )}
    {item.references.map((reference) => (
      <Link key={reference.url} style={styles.link} src={reference.url}>
        • {reference.label}: {reference.url}
      </Link>
    ))}
  </View>
);

const ProjectItem = ({ item }: { item: CvProject }) => (
  <View style={styles.projectItem} wrap={false}>
    <View style={styles.projectLeft}>
      <Text style={styles.projectName}>{item.name}</Text>
      <Text>{formatPeriod(item.period)}</Text>
    </View>
    <View style={styles.timelineRail}>
      <View style={styles.railLine} />
      <View style={styles.dot} />
    </View>
    <View style={styles.projectRight}>
      <Text style={styles.roleTitle}>{item.role}</Text>
      <Text>• {item.description}</Text>
      {item.technologies.length > 0 && (
        <Text>• Technologies: {item.technologies.join(', ')}</Text>
      )}
      {item.links.map((link) => (
        <Link key={link.url} style={styles.link} src={link.url}>
          • {link.label}: {link.url}
        </Link>
      ))}
    </View>
  </View>
);

const CvPdfDocument = ({ cv }: { cv: Cv }) => {
  const { candidate, sections } = cv;
  const previewTitle = cv.metadata.previewTitle || `${candidate.name} CV`;

  return (
    <Document title={previewTitle} author={candidate.name}>
      <Page size='A4' style={styles.page} wrap>
        <View style={styles.header} wrap={false}>
          <View style={styles.headerLeft}>
            <Text style={styles.name}>{candidate.name}</Text>
            <Text style={styles.headline}>{candidate.headline}</Text>
          </View>
          <View style={styles.contacts}>
            {candidate.contacts.map((contact) => (
              <View
                key={`${contact.type}-${contact.value}`}
                style={styles.contactRow}
              >
                <ContactIcon type={contact.type} />
                <Text style={styles.contactValue}>{contact.value}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <SectionHeader title='Summary & Objective' />
          <Text style={styles.subheading}>Summary</Text>
          <BulletList items={sections.summaryAndObjective.summary} />
          <Text style={[styles.subheading, { marginTop: 13 }]}>Objective</Text>
          <BulletList items={sections.summaryAndObjective.objective} />
        </View>

        <View style={styles.section}>
          <SectionHeader title='Work Experience' />
          {sections.workExperience.map((item) => (
            <ExperienceItem
              key={`${item.company}-${item.period.start}-${item.period.end}`}
              item={item}
            />
          ))}
        </View>

        <View style={styles.contentColumns} wrap={false}>
          <View style={styles.leftColumn}>
            <View style={styles.section}>
              <SectionHeader title='Education' />
              {sections.education.map((item) => (
                <EducationItem
                  key={`${item.degree}-${item.period.start}-${item.period.end}`}
                  item={item}
                />
              ))}
            </View>
            <View style={styles.section}>
              <SectionHeader title='Certifications' />
              {sections.certifications.map((item) => (
                <View
                  key={`${item.time}-${item.name}`}
                  style={styles.certificationRow}
                >
                  <Text style={styles.certificationTime}>{item.time}</Text>
                  <Text>{item.name}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.rightColumn}>
            <View style={styles.section}>
              <SectionHeader title='Skills' />
              {sections.skills.map((group) => (
                <View key={group.group} style={styles.skillGroup} wrap={false}>
                  <Text style={styles.skillGroupTitle}>{group.group}</Text>
                  <BulletList items={group.items} />
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Keep the final timeline away from low page space so the header does not orphan. */}
        <View style={styles.section} break>
          <SectionHeader title='Projects & Research' />
          {sections.projectsAndResearch.map((item) => (
            <ProjectItem
              key={`${item.name}-${item.period.start}-${item.period.end}`}
              item={item}
            />
          ))}
        </View>
      </Page>
    </Document>
  );
};

export default CvPdfDocument;
