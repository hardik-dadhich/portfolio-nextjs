import { readFileSync } from 'fs';
import { join } from 'path';
import type { PaperEntry, PaperFormData, AdminUser } from './types';
import { executeQuery, executeQueryOne, executeUpdate, localDb, db as tursoDb } from './db-client';

// Initialize database schema
async function initializeDatabase() {
  const schemaPath = join(process.cwd(), 'database', 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  
  // Split schema into individual statements
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  for (const statement of statements) {
    await executeUpdate(statement + ';');
  }
}

// Initialize on first import
let initialized = false;
async function ensureInitialized() {
  if (!initialized) {
    await initializeDatabase();
    initialized = true;
  }
}

// Papers Database Access Layer
export class PapersDB {
  constructor() {
    ensureInitialized();
  }

  /**
   * Get all papers with optional filtering and pagination
   * @param limit - Maximum number of papers to return
   * @param offset - Number of papers to skip
   * @param type - Filter by paper type ('paper' or 'blog')
   * @returns Array of paper entries
   */
  async getAllPapers(limit?: number, offset: number = 0, type?: string): Promise<PaperEntry[]> {
    try {
      await ensureInitialized();
      
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

      const rows = await executeQuery<any>(query, params);

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
  async getPaperById(id: number): Promise<PaperEntry | null> {
    try {
      await ensureInitialized();
      
      const row = await executeQueryOne<any>('SELECT * FROM papers WHERE id = ?', [id]);

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
  async createPaper(data: PaperFormData): Promise<PaperEntry> {
    try {
      await ensureInitialized();
      
      const result = await executeUpdate(
        `INSERT INTO papers (title, authors, date, url, description, type)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [data.title, data.authors, data.date, data.url, data.description || null, data.type]
      );

      const paper = await this.getPaperById(result.lastInsertRowid!);
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
  async updatePaper(id: number, data: PaperFormData): Promise<PaperEntry> {
    try {
      await ensureInitialized();
      
      const result = await executeUpdate(
        `UPDATE papers
         SET title = ?, authors = ?, date = ?, url = ?, description = ?, type = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [data.title, data.authors, data.date, data.url, data.description || null, data.type, id]
      );

      if (result.changes === 0) {
        throw new Error('Paper not found');
      }

      const paper = await this.getPaperById(id);
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
  async deletePaper(id: number): Promise<boolean> {
    try {
      await ensureInitialized();
      
      const result = await executeUpdate('DELETE FROM papers WHERE id = ?', [id]);
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
  async getTotalCount(type?: string): Promise<number> {
    try {
      await ensureInitialized();
      
      let query = 'SELECT COUNT(*) as count FROM papers';
      const params: any[] = [];

      if (type && (type === 'paper' || type === 'blog')) {
        query += ' WHERE type = ?';
        params.push(type);
      }

      const result = await executeQueryOne<{ count: number }>(query, params);
      return result?.count || 0;
    } catch (error) {
      console.error('Error getting paper count:', error);
      throw new Error('Failed to get paper count from database');
    }
  }
}

// Admin Database Access Layer
export class AdminDB {
  constructor() {
    ensureInitialized();
  }

  /**
   * Get admin user by email address
   * @param email - Admin user email
   * @returns Admin user with password hash or null if not found
   */
  async getUserByEmail(email: string): Promise<(AdminUser & { passwordHash: string }) | null> {
    try {
      await ensureInitialized();
      
      const row = await executeQueryOne<any>('SELECT * FROM admin_users WHERE email = ?', [email]);

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
  async createUser(email: string, passwordHash: string): Promise<AdminUser> {
    try {
      await ensureInitialized();
      
      const result = await executeUpdate(
        `INSERT INTO admin_users (email, password_hash) VALUES (?, ?)`,
        [email, passwordHash]
      );

      return {
        id: result.lastInsertRowid!,
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
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      await ensureInitialized();
      
      const rows = await executeQuery<any>('SELECT id, email, created_at FROM admin_users');

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
  constructor() {
    ensureInitialized();
  }

  /**
   * Get view count for a specific blog post
   * @param slug - Blog post slug
   * @returns View count (0 if not found)
   */
  async getViewCount(slug: string): Promise<number> {
    try {
      await ensureInitialized();
      
      const row = await executeQueryOne<{ view_count: number }>(
        'SELECT view_count FROM blog_views WHERE slug = ?',
        [slug]
      );
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
  async incrementViewCount(slug: string): Promise<number> {
    try {
      await ensureInitialized();
      
      // Use INSERT OR REPLACE for atomic upsert
      await executeUpdate(
        `INSERT INTO blog_views (slug, view_count, last_viewed_at)
         VALUES (?, 1, CURRENT_TIMESTAMP)
         ON CONFLICT(slug) DO UPDATE SET
           view_count = view_count + 1,
           last_viewed_at = CURRENT_TIMESTAMP`,
        [slug]
      );
      
      return await this.getViewCount(slug);
    } catch (error) {
      console.error(`Error incrementing view count for slug ${slug}:`, error);
      throw new Error('Failed to increment view count in database');
    }
  }

  /**
   * Get view counts for all blog posts
   * @returns Map of slug to view count
   */
  async getAllViewCounts(): Promise<Map<string, number>> {
    try {
      await ensureInitialized();
      
      const rows = await executeQuery<{ slug: string; view_count: number }>(
        'SELECT slug, view_count FROM blog_views'
      );
      
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
  async getTopViewedPosts(limit: number = 10): Promise<Array<{ slug: string; viewCount: number }>> {
    try {
      await ensureInitialized();
      
      const rows = await executeQuery<{ slug: string; view_count: number }>(
        `SELECT slug, view_count FROM blog_views ORDER BY view_count DESC LIMIT ?`,
        [limit]
      );
      
      return rows.map(row => ({ slug: row.slug, viewCount: row.view_count }));
    } catch (error) {
      console.error('Error fetching top viewed posts:', error);
      return [];
    }
  }
}

// Weekly Reads Database Access Layer
export class WeeklyReadsDB {
  constructor() {
    ensureInitialized();
  }

  /**
   * Get all weekly reads with optional pagination
   */
  async getAllReads(limit?: number, offset: number = 0): Promise<import('./types').WeeklyReadEntry[]> {
    try {
      await ensureInitialized();
      
      let query = 'SELECT * FROM weekly_reads ORDER BY read_date DESC, updated_at DESC';
      const params: any[] = [];

      if (limit) {
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);
      }

      const rows = await executeQuery<any>(query, params);

      return rows.map(row => ({
        id: row.id,
        title: row.title,
        authors: row.authors,
        source: row.source,
        url: row.url,
        description: row.description,
        category: row.category,
        readDate: row.read_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      }));
    } catch (error) {
      console.error('Error fetching weekly reads:', error);
      throw new Error('Failed to fetch weekly reads from database');
    }
  }

  /**
   * Get a single weekly read by ID
   */
  async getReadById(id: number): Promise<import('./types').WeeklyReadEntry | null> {
    try {
      await ensureInitialized();
      
      const row = await executeQueryOne<any>('SELECT * FROM weekly_reads WHERE id = ?', [id]);

      if (!row) return null;

      return {
        id: row.id,
        title: row.title,
        authors: row.authors,
        source: row.source,
        url: row.url,
        description: row.description,
        category: row.category,
        readDate: row.read_date,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    } catch (error) {
      console.error(`Error fetching weekly read with id ${id}:`, error);
      throw new Error('Failed to fetch weekly read from database');
    }
  }

  /**
   * Create a new weekly read entry
   */
  async createRead(data: import('./types').WeeklyReadFormData): Promise<import('./types').WeeklyReadEntry> {
    try {
      await ensureInitialized();
      
      const result = await executeUpdate(
        `INSERT INTO weekly_reads (title, authors, source, url, description, category, read_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [data.title, data.authors, data.source || null, data.url, data.description || null, data.category, data.readDate]
      );

      const read = await this.getReadById(result.lastInsertRowid!);
      if (!read) {
        throw new Error('Failed to retrieve created weekly read');
      }

      return read;
    } catch (error) {
      console.error('Error creating weekly read:', error);
      throw new Error('Failed to create weekly read in database');
    }
  }

  /**
   * Update an existing weekly read entry
   */
  async updateRead(id: number, data: import('./types').WeeklyReadFormData): Promise<import('./types').WeeklyReadEntry> {
    try {
      await ensureInitialized();
      
      const result = await executeUpdate(
        `UPDATE weekly_reads
         SET title = ?, authors = ?, source = ?, url = ?, description = ?, category = ?, read_date = ?, updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [data.title, data.authors, data.source || null, data.url, data.description || null, data.category, data.readDate, id]
      );

      if (result.changes === 0) {
        throw new Error('Weekly read not found');
      }

      const read = await this.getReadById(id);
      if (!read) {
        throw new Error('Failed to retrieve updated weekly read');
      }

      return read;
    } catch (error) {
      console.error(`Error updating weekly read with id ${id}:`, error);
      if (error instanceof Error && error.message === 'Weekly read not found') {
        throw error;
      }
      throw new Error('Failed to update weekly read in database');
    }
  }

  /**
   * Delete a weekly read entry
   */
  async deleteRead(id: number): Promise<boolean> {
    try {
      await ensureInitialized();
      
      const result = await executeUpdate('DELETE FROM weekly_reads WHERE id = ?', [id]);
      return result.changes > 0;
    } catch (error) {
      console.error(`Error deleting weekly read with id ${id}:`, error);
      throw new Error('Failed to delete weekly read from database');
    }
  }

  /**
   * Get total count of weekly reads
   */
  async getTotalCount(): Promise<number> {
    try {
      await ensureInitialized();
      
      const result = await executeQueryOne<{ count: number }>('SELECT COUNT(*) as count FROM weekly_reads');
      return result?.count || 0;
    } catch (error) {
      console.error('Error getting weekly reads count:', error);
      throw new Error('Failed to get weekly reads count from database');
    }
  }
}

// Export singleton instances
export const papersDB = new PapersDB();
export const adminDB = new AdminDB();
export const blogViewsDB = new BlogViewsDB();
export const weeklyReadsDB = new WeeklyReadsDB();
