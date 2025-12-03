import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { PaperEntry, PaperFormData, AdminUser } from './types';

const DB_PATH = process.env.DATABASE_URL || join(process.cwd(), 'database', 'blog.db');

// Initialize database connection
let db: Database.Database | null = null;

function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    initializeDatabase();
  }
  return db;
}

// Initialize database schema
function initializeDatabase() {
  if (!db) return;
  
  const schemaPath = join(process.cwd(), 'database', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  
  // Execute schema SQL
  db.exec(schema);
}

// Papers Database Access Layer
export class PapersDB {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Get all papers with optional filtering and pagination
   * @param limit - Maximum number of papers to return
   * @param offset - Number of papers to skip
   * @param type - Filter by paper type ('paper' or 'blog')
   * @returns Array of paper entries
   */
  getAllPapers(limit?: number, offset: number = 0, type?: string): PaperEntry[] {
    try {
      let query = 'SELECT * FROM papers';
      const params: any[] = [];

      if (type && (type === 'paper' || type === 'blog')) {
        query += ' WHERE type = ?';
        params.push(type);
      }

      query += ' ORDER BY date DESC';

      if (limit) {
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
      }

      const stmt = this.db.prepare(query);
      const rows = stmt.all(...params) as any[];

      return rows.map(row => ({
        id: row.id,
        title: row.title,
        authors: row.authors,
        date: row.date,
        url: row.url,
        description: row.description,
        type: row.type,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching papers:', error);
      throw new Error('Failed to fetch papers from database');
    }
  }

  /**
   * Get a single paper by ID
   * @param id - Paper ID
   * @returns Paper entry or null if not found
   */
  getPaperById(id: number): PaperEntry | null {
    try {
      const stmt = this.db.prepare('SELECT * FROM papers WHERE id = ?');
      const row = stmt.get(id) as any;

      if (!row) return null;

      return {
        id: row.id,
        title: row.title,
        authors: row.authors,
        date: row.date,
        url: row.url,
        description: row.description,
        type: row.type,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      console.error(`Error fetching paper with id ${id}:`, error);
      throw new Error('Failed to fetch paper from database');
    }
  }

  /**
   * Create a new paper entry
   * @param data - Paper form data
   * @returns Created paper entry
   */
  createPaper(data: PaperFormData): PaperEntry {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO papers (title, authors, date, url, description, type)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      const result = stmt.run(
        data.title,
        data.authors,
        data.date,
        data.url,
        data.description || null,
        data.type
      );

      const paper = this.getPaperById(result.lastInsertRowid as number);
      if (!paper) {
        throw new Error('Failed to retrieve created paper');
      }

      return paper;
    } catch (error) {
      console.error('Error creating paper:', error);
      throw new Error('Failed to create paper in database');
    }
  }

  /**
   * Update an existing paper entry
   * @param id - Paper ID
   * @param data - Updated paper form data
   * @returns Updated paper entry
   */
  updatePaper(id: number, data: PaperFormData): PaperEntry {
    try {
      const stmt = this.db.prepare(`
        UPDATE papers
        SET title = ?, authors = ?, date = ?, url = ?, description = ?, type = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `);

      const result = stmt.run(
        data.title,
        data.authors,
        data.date,
        data.url,
        data.description || null,
        data.type,
        id
      );

      if (result.changes === 0) {
        throw new Error('Paper not found');
      }

      const paper = this.getPaperById(id);
      if (!paper) {
        throw new Error('Failed to retrieve updated paper');
      }

      return paper;
    } catch (error) {
      console.error(`Error updating paper with id ${id}:`, error);
      if (error instanceof Error && error.message === 'Paper not found') {
        throw error;
      }
      throw new Error('Failed to update paper in database');
    }
  }

  /**
   * Delete a paper entry
   * @param id - Paper ID
   * @returns True if deleted, false if not found
   */
  deletePaper(id: number): boolean {
    try {
      const stmt = this.db.prepare('DELETE FROM papers WHERE id = ?');
      const result = stmt.run(id);
      return result.changes > 0;
    } catch (error) {
      console.error(`Error deleting paper with id ${id}:`, error);
      throw new Error('Failed to delete paper from database');
    }
  }

  /**
   * Get total count of papers with optional type filter
   * @param type - Filter by paper type ('paper' or 'blog')
   * @returns Total count of papers
   */
  getTotalCount(type?: string): number {
    try {
      let query = 'SELECT COUNT(*) as count FROM papers';
      const params: any[] = [];

      if (type && (type === 'paper' || type === 'blog')) {
        query += ' WHERE type = ?';
        params.push(type);
      }

      const stmt = this.db.prepare(query);
      const result = stmt.get(...params) as { count: number };
      return result.count;
    } catch (error) {
      console.error('Error getting paper count:', error);
      throw new Error('Failed to get paper count from database');
    }
  }
}

// Admin Database Access Layer
export class AdminDB {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Get admin user by email address
   * @param email - Admin user email
   * @returns Admin user with password hash or null if not found
   */
  getUserByEmail(email: string): (AdminUser & { passwordHash: string }) | null {
    try {
      const stmt = this.db.prepare('SELECT * FROM admin_users WHERE email = ?');
      const row = stmt.get(email) as any;

      if (!row) return null;

      return {
        id: row.id,
        email: row.email,
        passwordHash: row.password_hash,
        createdAt: row.created_at,
      };
    } catch (error) {
      console.error(`Error fetching admin user with email ${email}:`, error);
      throw new Error('Failed to fetch admin user from database');
    }
  }

  /**
   * Create a new admin user
   * @param email - Admin user email
   * @param passwordHash - Hashed password
   * @returns Created admin user
   */
  createUser(email: string, passwordHash: string): AdminUser {
    try {
      const stmt = this.db.prepare(`
        INSERT INTO admin_users (email, password_hash)
        VALUES (?, ?)
      `);

      const result = stmt.run(email, passwordHash);

      return {
        id: result.lastInsertRowid as number,
        email,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error creating admin user:', error);
      // Check for unique constraint violation
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Admin user with this email already exists');
      }
      throw new Error('Failed to create admin user in database');
    }
  }

  /**
   * Get all admin users (for testing purposes)
   * @returns Array of all admin users
   */
  getAllUsers(): AdminUser[] {
    try {
      const stmt = this.db.prepare('SELECT id, email, created_at FROM admin_users');
      const rows = stmt.all() as any[];

      return rows.map(row => ({
        id: row.id,
        email: row.email,
        createdAt: row.created_at,
      }));
    } catch (error) {
      console.error('Error fetching all admin users:', error);
      throw new Error('Failed to fetch admin users from database');
    }
  }
}

// Blog Views Database Access Layer
export class BlogViewsDB {
  private db: Database.Database;

  constructor() {
    this.db = getDatabase();
  }

  /**
   * Get view count for a specific blog post
   * @param slug - Blog post slug
   * @returns View count (0 if not found)
   */
  getViewCount(slug: string): number {
    try {
      const stmt = this.db.prepare('SELECT view_count FROM blog_views WHERE slug = ?');
      const row = stmt.get(slug) as { view_count: number } | undefined;
      return row?.view_count || 0;
    } catch (error) {
      console.error(`Error fetching view count for slug ${slug}:`, error);
      return 0;
    }
  }

  /**
   * Increment view count for a blog post
   * Creates record if it doesn't exist
   * @param slug - Blog post slug
   * @returns Updated view count
   */
  incrementViewCount(slug: string): number {
    try {
      // Use INSERT OR REPLACE for atomic upsert
      const stmt = this.db.prepare(`
        INSERT INTO blog_views (slug, view_count, last_viewed_at)
        VALUES (?, 1, CURRENT_TIMESTAMP)
        ON CONFLICT(slug) DO UPDATE SET
          view_count = view_count + 1,
          last_viewed_at = CURRENT_TIMESTAMP
      `);
      
      stmt.run(slug);
      return this.getViewCount(slug);
    } catch (error) {
      console.error(`Error incrementing view count for slug ${slug}:`, error);
      throw new Error('Failed to increment view count in database');
    }
  }

  /**
   * Get view counts for all blog posts
   * @returns Map of slug to view count
   */
  getAllViewCounts(): Map<string, number> {
    try {
      const stmt = this.db.prepare('SELECT slug, view_count FROM blog_views');
      const rows = stmt.all() as Array<{ slug: string; view_count: number }>;
      
      const viewCounts = new Map<string, number>();
      rows.forEach(row => {
        viewCounts.set(row.slug, row.view_count);
      });
      
      return viewCounts;
    } catch (error) {
      console.error('Error fetching all view counts:', error);
      return new Map();
    }
  }

  /**
   * Get top N most viewed blog posts
   * @param limit - Number of posts to return
   * @returns Array of slugs and view counts
   */
  getTopViewedPosts(limit: number = 10): Array<{ slug: string; viewCount: number }> {
    try {
      const stmt = this.db.prepare(`
        SELECT slug, view_count
        FROM blog_views
        ORDER BY view_count DESC
        LIMIT ?
      `);
      
      const rows = stmt.all(limit) as Array<{ slug: string; view_count: number }>;
      return rows.map(row => ({ slug: row.slug, viewCount: row.view_count }));
    } catch (error) {
      console.error('Error fetching top viewed posts:', error);
      return [];
    }
  }
}

// Export singleton instances
export const papersDB = new PapersDB();
export const adminDB = new AdminDB();
export const blogViewsDB = new BlogViewsDB();

// Export getDatabase for migration scripts
export { getDatabase };
