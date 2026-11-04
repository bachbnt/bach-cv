-- bach-cv v2: the same model as schema.ts, as tables. Not used yet; it proves the migration path
-- and is loaded by tools/to-sql.ts (SQLite syntax, but only types that Postgres also has).
--
-- Mechanical mapping from a Firestore document:
--   camelCase field            -> snake_case column
--   boolean                    -> INTEGER 0/1   (BOOLEAN in Postgres)
--   skill id array             -> <entity>_skill(<entity>_id, skill_id, pos)
--   string array               -> child table with `pos`
--   object array               -> child table with `pos`
--   l10n overlay               -> l10n rows (JSON text when the field is an array or object array)
--   site/profile, settings, live -> one JSON row each in site_doc (never joined)
-- Visibility moves to the server: there are no rules in SQL, so only the repository reads the tables
-- and it always filters `visible = 1`.

PRAGMA foreign_keys = ON;

CREATE TABLE skills (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  category  TEXT NOT NULL DEFAULT 'tools' CHECK (category IN ('ai', 'mobile', 'web', 'tools')),
  icon      TEXT NOT NULL DEFAULT '',
  url       TEXT NOT NULL DEFAULT '',
  listed    INTEGER NOT NULL DEFAULT 1,
  visible   INTEGER NOT NULL DEFAULT 1,
  highlight INTEGER,
  sort      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE experience (
  id          TEXT PRIMARY KEY,
  company     TEXT NOT NULL DEFAULT '',
  short_name  TEXT NOT NULL DEFAULT '',
  role        TEXT NOT NULL DEFAULT '',
  kind        TEXT NOT NULL DEFAULT 'full-time' CHECK (kind IN ('full-time', 'part-time', 'freelance', 'internship')),
  start_month TEXT NOT NULL,
  end_month   TEXT,
  summary     TEXT NOT NULL DEFAULT '',
  tagline     TEXT NOT NULL DEFAULT '',
  team        TEXT NOT NULL DEFAULT '',
  logo        TEXT NOT NULL DEFAULT '',
  cv          TEXT NOT NULL DEFAULT 'full' CHECK (cv IN ('full', 'compact', 'off')),
  visible     INTEGER NOT NULL DEFAULT 1,
  highlight   INTEGER
);
CREATE TABLE experience_bullet (
  experience_id TEXT NOT NULL REFERENCES experience (id) ON DELETE CASCADE,
  pos           INTEGER NOT NULL,
  text          TEXT NOT NULL,
  PRIMARY KEY (experience_id, pos)
);
CREATE TABLE experience_skill (
  experience_id TEXT NOT NULL REFERENCES experience (id) ON DELETE CASCADE,
  skill_id      TEXT NOT NULL REFERENCES skills (id),
  pos INTEGER NOT NULL,
  PRIMARY KEY (experience_id, skill_id)
);
CREATE TABLE experience_project (
  experience_id TEXT NOT NULL REFERENCES experience (id) ON DELETE CASCADE,
  pos           INTEGER NOT NULL,
  name          TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL DEFAULT '',
  highlight     INTEGER,
  project_id    TEXT REFERENCES projects (id),
  PRIMARY KEY (experience_id, pos)
);
CREATE TABLE experience_project_skill (
  experience_id TEXT NOT NULL,
  project_pos   INTEGER NOT NULL,
  skill_id      TEXT NOT NULL REFERENCES skills (id),
  pos           INTEGER NOT NULL,
  PRIMARY KEY (experience_id, project_pos, skill_id),
  FOREIGN KEY (experience_id, project_pos) REFERENCES experience_project (experience_id, pos) ON DELETE CASCADE
);

CREATE TABLE education (
  id           TEXT PRIMARY KEY,
  degree       TEXT NOT NULL DEFAULT '',
  school       TEXT NOT NULL DEFAULT '',
  major        TEXT NOT NULL DEFAULT '',
  start_month  TEXT NOT NULL,
  end_month    TEXT,
  logo         TEXT NOT NULL DEFAULT '',
  thesis_title TEXT NOT NULL DEFAULT '',
  thesis_url   TEXT NOT NULL DEFAULT '',
  thesis_source_url TEXT NOT NULL DEFAULT '',
  cv           TEXT NOT NULL DEFAULT 'full' CHECK (cv IN ('full', 'compact', 'off')),
  visible      INTEGER NOT NULL DEFAULT 1,
  highlight    INTEGER
);
CREATE TABLE education_skill (
  education_id TEXT NOT NULL REFERENCES education (id) ON DELETE CASCADE,
  skill_id     TEXT NOT NULL REFERENCES skills (id),
  pos INTEGER NOT NULL,
  PRIMARY KEY (education_id, skill_id)
);

CREATE TABLE projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT '',
  kind        TEXT NOT NULL DEFAULT 'personal' CHECK (kind IN ('personal', 'freelance', 'company', 'academic')),
  summary     TEXT NOT NULL DEFAULT '',
  cover       TEXT NOT NULL DEFAULT '',
  start_month TEXT,
  end_month   TEXT,
  visible     INTEGER NOT NULL DEFAULT 1,
  highlight   INTEGER,
  sort        INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE project_image (
  project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  pos        INTEGER NOT NULL,
  url        TEXT NOT NULL,
  PRIMARY KEY (project_id, pos)
);
CREATE TABLE project_link (
  project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  pos        INTEGER NOT NULL,
  label      TEXT NOT NULL DEFAULT '',
  url        TEXT NOT NULL DEFAULT '',
  kind       TEXT NOT NULL DEFAULT 'other',
  PRIMARY KEY (project_id, pos)
);
CREATE TABLE project_skill (
  project_id TEXT NOT NULL REFERENCES projects (id) ON DELETE CASCADE,
  skill_id   TEXT NOT NULL REFERENCES skills (id),
  pos INTEGER NOT NULL,
  PRIMARY KEY (project_id, skill_id)
);

CREATE TABLE certificates (
  id             TEXT PRIMARY KEY,
  name           TEXT NOT NULL DEFAULT '',
  issuer         TEXT NOT NULL DEFAULT '',
  issued_at      TEXT NOT NULL,
  image          TEXT NOT NULL DEFAULT '',
  pdf_url        TEXT NOT NULL DEFAULT '',
  credential_url TEXT NOT NULL DEFAULT '',
  visible        INTEGER NOT NULL DEFAULT 1,
  highlight      INTEGER
);
CREATE TABLE certificate_skill (
  certificate_id TEXT NOT NULL REFERENCES certificates (id) ON DELETE CASCADE,
  skill_id       TEXT NOT NULL REFERENCES skills (id),
  pos INTEGER NOT NULL,
  PRIMARY KEY (certificate_id, skill_id)
);

CREATE TABLE services (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  art         TEXT NOT NULL DEFAULT 'generic' CHECK (art IN ('app', 'web', 'oss', 'teaching', 'writing', 'generic')),
  starter     TEXT NOT NULL DEFAULT '',
  visible     INTEGER NOT NULL DEFAULT 1,
  highlight   INTEGER,
  sort        INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE payments (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL DEFAULT '',
  kind      TEXT NOT NULL DEFAULT 'bank' CHECK (kind IN ('bank', 'wallet')),
  holder    TEXT NOT NULL DEFAULT '',
  account   TEXT NOT NULL DEFAULT '',
  qr        TEXT NOT NULL DEFAULT '',
  logo      TEXT NOT NULL DEFAULT '',
  visible   INTEGER NOT NULL DEFAULT 1,
  highlight INTEGER,
  sort      INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE contacts (
  id        TEXT PRIMARY KEY,
  kind      TEXT NOT NULL DEFAULT 'social' CHECK (kind IN ('email', 'phone', 'address', 'social')),
  platform  TEXT NOT NULL DEFAULT '',
  label     TEXT NOT NULL DEFAULT '',
  url       TEXT NOT NULL DEFAULT '',
  menu_group TEXT NOT NULL DEFAULT '' CHECK (menu_group IN ('', 'professional', 'messaging', 'social')),
  visible   INTEGER NOT NULL DEFAULT 1,
  highlight INTEGER,
  sort      INTEGER NOT NULL DEFAULT 0
);

-- translations: one row per (document, language, field). Arrays are stored as JSON text.
CREATE TABLE l10n (
  collection TEXT NOT NULL,
  id         TEXT NOT NULL,
  lang       TEXT NOT NULL,
  field      TEXT NOT NULL,
  value      TEXT NOT NULL,
  PRIMARY KEY (collection, id, lang, field)
);

-- single documents: profile, settings, live. Not joined with anything, so JSON is fine.
CREATE TABLE site_doc (
  id   TEXT PRIMARY KEY,
  data TEXT NOT NULL
);

CREATE TABLE messages (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  topic      TEXT NOT NULL DEFAULT '',
  message    TEXT NOT NULL,
  locale     TEXT NOT NULL DEFAULT 'en',
  created_at TEXT NOT NULL
);

CREATE INDEX experience_skill_by_skill ON experience_skill (skill_id);
CREATE INDEX experience_project_skill_by_skill ON experience_project_skill (skill_id);
CREATE INDEX project_skill_by_skill ON project_skill (skill_id);
CREATE INDEX certificate_skill_by_skill ON certificate_skill (skill_id);

-- "Used at FPT · MoMo": the same rows skillEvidence() builds in schema.ts. Hidden items do not count.
CREATE VIEW skill_usage AS
  SELECT u.skill_id, COALESCE(NULLIF(e.short_name, ''), e.company) AS label, e.start_month AS month
  FROM (
    SELECT experience_id, skill_id FROM experience_skill
    UNION
    SELECT experience_id, skill_id FROM experience_project_skill
  ) u
  JOIN experience e ON e.id = u.experience_id AND e.visible = 1
  JOIN skills s ON s.id = u.skill_id AND s.visible = 1
  UNION ALL
  SELECT ps.skill_id, 'Side projects', p.start_month
  FROM project_skill ps
  JOIN projects p ON p.id = ps.project_id AND p.visible = 1 AND p.kind = 'personal'
  JOIN skills s ON s.id = ps.skill_id AND s.visible = 1;
