# Turso Database Setup Guide

Complete SQL commands to set up your database in Turso.

## Quick Setup (Automated)

The easiest way is to use the migration script:

```bash
# 1. Add Turso credentials to .env.local
# 2. Run migration
npm run db:migrate-turso
```

This automatically creates all tables, indexes, and migrates your data.

---

## Manual Setup (If Needed)

If you prefer to set up manually or need to recreate tables:

### Step 1: Connect to Turso

```bash
# Install Turso CLI
brew install tursodatabase/tap/turso  # macOS
# or
curl -sSfL https://get.tur.so/install.sh | bash  # Linux/WSL

# Login
turso auth login

# Create a new database (or use existing)
turso db create my-blog-db

# Get database URL and create token
turso db show my-blog-db
turso db tokens create my-blog-db

# Connect to database shell
turso db shell my-blog-db
```

### Step 2: Create Tables

Copy and paste these SQL commands in the Turso shell:

```sql
-- ============================================
-- Papers Table
-- ============================================
-- Stores research papers and blog links
CREATE TABLE IF NOT EXISTS papers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  authors TEXT NOT NULL,
  date TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK(type IN ('paper', 'blog')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Admin Users Table
-- ============================================
-- Stores admin credentials for authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- Blog Views Table
-- ============================================
-- Tracks view counts for blog posts
CREATE TABLE IF NOT EXISTS blog_views (
  slug TEXT PRIMARY KEY,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: Create Indexes for Performance

```sql
-- ============================================
-- Performance Indexes
-- ============================================

-- Papers table indexes
CREATE INDEX IF NOT EXISTS idx_papers_date 
  ON papers(date DESC);

CREATE INDEX IF NOT EXISTS idx_papers_type 
  ON papers(type);

CREATE INDEX IF NOT EXISTS idx_papers_created_at 
  ON papers(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_papers_type_date 
  ON papers(type, date DESC);

-- Blog views index
CREATE INDEX IF NOT EXISTS idx_blog_views_count 
  ON blog_views(view_count DESC);

-- Admin users index (email lookups)
CREATE INDEX IF NOT EXISTS idx_admin_users_email 
  ON admin_users(email);
```

### Step 4: Verify Tables

```sql
-- List all tables
.tables

-- Check papers table structure
.schema papers

-- Check admin_users table structure
.schema admin_users

-- Check blog_views table structure
.schema blog_views

-- List all indexes
SELECT name, tbl_name, sql 
FROM sqlite_master 
WHERE type = 'index' 
ORDER BY tbl_name, name;
```

---

## Table Descriptions

### 1. `papers` Table

Stores research papers and blog articles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique paper ID |
| `title` | TEXT | NOT NULL | Paper/blog title |
| `authors` | TEXT | NOT NULL | Author names (comma-separated) |
| `date` | TEXT | NOT NULL | Publication date (YYYY-MM-DD) |
| `url` | TEXT | NOT NULL | Link to paper/blog |
| `description` | TEXT | NULL | Optional description |
| `type` | TEXT | NOT NULL, CHECK | Either 'paper' or 'blog' |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Record creation time |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update time |

**Indexes:**
- `idx_papers_date` - Fast sorting by date (DESC)
- `idx_papers_type` - Fast filtering by type
- `idx_papers_created_at` - Fast sorting by creation date
- `idx_papers_type_date` - Composite index for type + date queries

### 2. `admin_users` Table

Stores admin user credentials for authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user ID |
| `email` | TEXT | UNIQUE, NOT NULL | Admin email (login) |
| `password_hash` | TEXT | NOT NULL | Bcrypt hashed password |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Account creation time |

**Indexes:**
- `idx_admin_users_email` - Fast email lookups for login

### 3. `blog_views` Table

Tracks view counts for blog posts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `slug` | TEXT | PRIMARY KEY | Blog post slug (unique identifier) |
| `view_count` | INTEGER | NOT NULL, DEFAULT 0 | Total view count |
| `last_viewed_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last view timestamp |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | First view timestamp |

**Indexes:**
- `idx_blog_views_count` - Fast sorting by popularity

---

## Sample Data Insertion

### Insert Admin User

```sql
-- Note: Use the setup-admin.ts script instead for proper password hashing
-- This is just for reference

INSERT INTO admin_users (email, password_hash) 
VALUES ('admin@example.com', '$2a$10$...');
```

### Insert Papers

```sql
INSERT INTO papers (title, authors, date, url, description, type) 
VALUES (
  'Attention Is All You Need',
  'Vaswani et al.',
  '2017-06-12',
  'https://arxiv.org/abs/1706.03762',
  'Introducing the Transformer architecture',
  'paper'
);

INSERT INTO papers (title, authors, date, url, description, type) 
VALUES (
  'Building Scalable Web Apps',
  'John Doe',
  '2024-01-15',
  'https://example.com/blog/scalable-apps',
  'Best practices for web development',
  'blog'
);
```

### Insert Blog Views

```sql
INSERT INTO blog_views (slug, view_count) 
VALUES ('my-first-post', 42);
```

---

## Useful Queries

### View All Papers

```sql
SELECT id, title, type, date 
FROM papers 
ORDER BY date DESC;
```

### Count Papers by Type

```sql
SELECT type, COUNT(*) as count 
FROM papers 
GROUP BY type;
```

### Top 10 Most Viewed Blog Posts

```sql
SELECT slug, view_count 
FROM blog_views 
ORDER BY view_count DESC 
LIMIT 10;
```

### Recent Papers (Last 30 Days)

```sql
SELECT title, authors, date 
FROM papers 
WHERE date >= date('now', '-30 days')
ORDER BY date DESC;
```

### Search Papers by Title

```sql
SELECT id, title, authors, type 
FROM papers 
WHERE title LIKE '%transformer%' 
ORDER BY date DESC;
```

---

## Performance Tips

### 1. Use Prepared Statements
The app already uses prepared statements via `@libsql/client`.

### 2. Batch Operations
For bulk inserts, use transactions:

```sql
BEGIN TRANSACTION;
INSERT INTO papers (...) VALUES (...);
INSERT INTO papers (...) VALUES (...);
INSERT INTO papers (...) VALUES (...);
COMMIT;
```

### 3. Analyze Query Performance

```sql
-- Check query execution plan
EXPLAIN QUERY PLAN 
SELECT * FROM papers WHERE type = 'paper' ORDER BY date DESC;
```

### 4. Index Usage

The indexes are automatically used when:
- Filtering by `type`: Uses `idx_papers_type`
- Sorting by `date`: Uses `idx_papers_date`
- Filtering by type AND sorting by date: Uses `idx_papers_type_date`

---

## Backup & Restore

### Backup Database

```bash
# Export entire database
turso db shell my-blog-db .dump > backup.sql

# Or use the migration script to backup to local SQLite
npm run db:migrate-turso
```

### Restore from Backup

```bash
# Import SQL file
turso db shell my-blog-db < backup.sql
```

---

## Monitoring

### Check Database Size

```sql
SELECT 
  page_count * page_size / 1024.0 / 1024.0 as size_mb 
FROM pragma_page_count(), pragma_page_size();
```

### Table Row Counts

```sql
SELECT 
  'papers' as table_name, 
  COUNT(*) as row_count 
FROM papers
UNION ALL
SELECT 
  'admin_users', 
  COUNT(*) 
FROM admin_users
UNION ALL
SELECT 
  'blog_views', 
  COUNT(*) 
FROM blog_views;
```

---

## Troubleshooting

### Reset Database

If you need to start fresh:

```sql
-- Drop all tables
DROP TABLE IF EXISTS papers;
DROP TABLE IF EXISTS admin_users;
DROP TABLE IF EXISTS blog_views;

-- Drop all indexes
DROP INDEX IF EXISTS idx_papers_date;
DROP INDEX IF EXISTS idx_papers_type;
DROP INDEX IF EXISTS idx_papers_created_at;
DROP INDEX IF EXISTS idx_papers_type_date;
DROP INDEX IF EXISTS idx_blog_views_count;
DROP INDEX IF EXISTS idx_admin_users_email;

-- Then recreate using the commands above
```

### Check for Errors

```sql
-- Verify table integrity
PRAGMA integrity_check;

-- Check foreign key constraints (if any)
PRAGMA foreign_key_check;
```

---

## Resources

- **Turso Docs**: https://docs.turso.tech
- **SQLite Docs**: https://www.sqlite.org/docs.html
- **Turso Dashboard**: https://turso.tech/app
- **Turso CLI Reference**: https://docs.turso.tech/reference/turso-cli
