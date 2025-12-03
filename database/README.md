# Database Directory

This directory contains the SQLite database and schema for the personal blog website.

## Files

- `schema.sql` - Database schema definition with tables and indexes
- `blog.db` - SQLite database file (auto-generated, not committed to git)

## Database Schema

### Tables

#### papers
Stores research papers and blog links displayed on the Papershelf page.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| title | TEXT | Paper/article title |
| authors | TEXT | Author names |
| date | TEXT | Publication date (YYYY-MM-DD) |
| url | TEXT | Link to paper/article |
| description | TEXT | Optional description |
| type | TEXT | Type: 'paper' or 'blog' |
| created_at | DATETIME | Record creation timestamp |
| updated_at | DATETIME | Record update timestamp |

**Indexes:**
- `idx_papers_date` - Optimizes queries sorted by date
- `idx_papers_type` - Optimizes queries filtered by type
- `idx_papers_created_at` - Optimizes queries sorted by creation date

#### admin_users
Stores admin user credentials for authentication.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key (auto-increment) |
| email | TEXT | Admin email (unique) |
| password_hash | TEXT | Bcrypt hashed password |
| created_at | DATETIME | Account creation timestamp |

## Setup

### Initialize Database

Run the initialization script to create the database and tables:

```bash
npm run db:init
```

This will:
1. Create the `database` directory if it doesn't exist
2. Create the `blog.db` SQLite database file
3. Execute the schema.sql to create tables and indexes
4. Enable WAL mode for better concurrency

### Environment Variables

Set the database path in your `.env.local` file (optional):

```
DATABASE_URL=file:./database/blog.db
```

If not set, the default path is `./database/blog.db` relative to the project root.

## Usage

The database is accessed through the `PapersDB` and `AdminDB` classes in `lib/db.ts`:

```typescript
import { papersDB, adminDB } from '@/lib/db';

// Get all papers
const papers = papersDB.getAllPapers();

// Get papers with pagination
const recentPapers = papersDB.getAllPapers(10, 0);

// Create a new paper
const newPaper = papersDB.createPaper({
  title: 'My Paper',
  authors: 'John Doe',
  date: '2024-01-15',
  url: 'https://example.com/paper.pdf',
  description: 'A great paper',
  type: 'paper'
});
```

## Backup

The database file (`blog.db`) should be backed up regularly. The file is excluded from git via `.gitignore`.

To backup:
```bash
cp database/blog.db database/blog.db.backup
```

## Migration

To migrate existing papers from `content/papers.json`, use the migration script (to be created in task 14.2).
