-- Papers table for storing research papers and blog links
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

-- Admin users table for authentication
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Blog views table for tracking view counts
CREATE TABLE IF NOT EXISTS blog_views (
  slug TEXT PRIMARY KEY,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for optimized queries
CREATE INDEX IF NOT EXISTS idx_papers_date ON papers(date DESC);
CREATE INDEX IF NOT EXISTS idx_papers_type ON papers(type);
CREATE INDEX IF NOT EXISTS idx_papers_created_at ON papers(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_views_count ON blog_views(view_count DESC);
