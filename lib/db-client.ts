import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';

// Determine if we're using Turso or local SQLite
const useTurso = !!(process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN);

// Create appropriate client
export const db = useTurso
  ? createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    })
  : null;

// For local development, use better-sqlite3
export const localDb = !useTurso
  ? new Database(process.env.DATABASE_URL || './database/blog.db')
  : null;

if (localDb) {
  localDb.pragma('journal_mode = WAL');
}

// Unified query interface
export async function executeQuery<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  if (useTurso && db) {
    const result = await db.execute({ sql, args: params });
    return result.rows as T[];
  } else if (localDb) {
    const stmt = localDb.prepare(sql);
    return stmt.all(...params) as T[];
  }
  throw new Error('No database connection available');
}

export async function executeQueryOne<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  if (useTurso && db) {
    const result = await db.execute({ sql, args: params });
    return (result.rows[0] as T) || null;
  } else if (localDb) {
    const stmt = localDb.prepare(sql);
    return (stmt.get(...params) as T) || null;
  }
  throw new Error('No database connection available');
}

export async function executeUpdate(
  sql: string,
  params: any[] = []
): Promise<{ changes: number; lastInsertRowid?: number }> {
  if (useTurso && db) {
    const result = await db.execute({ sql, args: params });
    return {
      changes: result.rowsAffected,
      lastInsertRowid: result.lastInsertRowid ? Number(result.lastInsertRowid) : undefined,
    };
  } else if (localDb) {
    const stmt = localDb.prepare(sql);
    const result = stmt.run(...params);
    return {
      changes: result.changes,
      lastInsertRowid: Number(result.lastInsertRowid),
    };
  }
  throw new Error('No database connection available');
}

export async function executeBatch(statements: Array<{ sql: string; params?: any[] }>) {
  if (useTurso && db) {
    await db.batch(
      statements.map(stmt => ({
        sql: stmt.sql,
        args: stmt.params || [],
      }))
    );
  } else if (localDb) {
    const transaction = localDb.transaction((stmts: typeof statements) => {
      for (const stmt of stmts) {
        localDb.prepare(stmt.sql).run(...(stmt.params || []));
      }
    });
    transaction(statements);
  } else {
    throw new Error('No database connection available');
  }
}
