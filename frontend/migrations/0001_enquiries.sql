-- D1 schema for website enquiries (replaces the MongoDB "enquiries" collection).
CREATE TABLE IF NOT EXISTS enquiries (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  reference       TEXT    NOT NULL UNIQUE,
  created_at      TEXT    NOT NULL,
  full_name       TEXT    NOT NULL,
  company         TEXT    NOT NULL,
  email           TEXT    NOT NULL,
  phone           TEXT    NOT NULL,
  city            TEXT    NOT NULL DEFAULT '',
  product         TEXT    NOT NULL DEFAULT '',
  quantity        TEXT    NOT NULL DEFAULT '',
  specification   TEXT    NOT NULL DEFAULT '',
  message         TEXT    NOT NULL DEFAULT '',
  source_page     TEXT    NOT NULL DEFAULT '',
  attachment_name TEXT,
  attachment_key  TEXT,
  email_status    TEXT    NOT NULL DEFAULT 'pending'
);

CREATE INDEX IF NOT EXISTS idx_enquiries_created_at ON enquiries (created_at);
