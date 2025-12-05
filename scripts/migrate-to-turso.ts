#!/usr/bin/env tsx

/**
 * Migration script to push local SQLite data to Turso
 * 
 * Usage:
 * 1. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in .env.local
 * 2. Run: npm run db:migrate-turso
 */

import { createClient } from '@libsql/client';
import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const TURSO_URL = process.env.TURSO_DATABASE_URL;
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN;
const LOCAL_DB_PATH = process.env.DATABASE_URL || join(process.cwd(), 'database', 'blog.db');

async function migrateToTurso() {
  console.log('🚀 Starting migration to Turso...\n');

  // Validate Turso credentials
  if (!TURSO_URL || !TURSO_TOKEN) {
    console.error('❌ Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env.local');
    console.error('\nGet your credentials from: https://turso.tech/app');
    process.exit(1);
  }

  console.log(`📦 Local database: ${LOCAL_DB_PATH}`);
  console.log(`☁️  Turso database: ${TURSO_URL}\n`);

  try {
    // Connect to local SQLite database
    const localDb = new Database(LOCAL_DB_PATH);
    console.log('✅ Connected to local SQLite database');

    // Connect to Turso
    const tursoDb = createClient({
      url: TURSO_URL,
      authToken: TURSO_TOKEN,
    });
    console.log('✅ Connected to Turso database\n');

    // Step 1: Create schema in Turso
    console.log('📋 Creating schema in Turso...');
    const schemaPath = join(process.cwd(), 'database', 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    
    const statements = schema
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    for (const statement of statements) {
      try {
        await tursoDb.execute(statement + ';');
      } catch (error: any) {
        // Ignore "already exists" errors
        if (!error.message?.includes('already exists')) {
          console.error(`Warning: ${error.message}`);
        }
      }
    }
    console.log('✅ Schema created\n');

    // Step 2: Migrate admin users
    console.log('👤 Migrating admin users...');
    const adminUsers = localDb.prepare('SELECT * FROM admin_users').all();
    
    for (const user of adminUsers as any[]) {
      await tursoDb.execute({
        sql: 'INSERT OR REPLACE INTO admin_users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
        args: [user.id, user.email, user.password_hash, user.created_at],
      });
    }
    console.log(`✅ Migrated ${adminUsers.length} admin user(s)\n`);

    // Step 3: Migrate papers
    console.log('📄 Migrating papers...');
    const papers = localDb.prepare('SELECT * FROM papers').all();
    
    for (const paper of papers as any[]) {
      await tursoDb.execute({
        sql: `INSERT OR REPLACE INTO papers 
              (id, title, authors, date, url, description, type, created_at, updated_at) 
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          paper.id,
          paper.title,
          paper.authors,
          paper.date,
          paper.url,
          paper.description,
          paper.type,
          paper.created_at,
          paper.updated_at,
        ],
      });
    }
    console.log(`✅ Migrated ${papers.length} paper(s)\n`);

    // Step 4: Migrate blog views
    console.log('👁️  Migrating blog views...');
    const blogViews = localDb.prepare('SELECT * FROM blog_views').all();
    
    for (const view of blogViews as any[]) {
      await tursoDb.execute({
        sql: `INSERT OR REPLACE INTO blog_views 
              (slug, view_count, last_viewed_at) 
              VALUES (?, ?, ?)`,
        args: [view.slug, view.view_count, view.last_viewed_at],
      });
    }
    console.log(`✅ Migrated ${blogViews.length} blog view record(s)\n`);

    // Step 5: Migrate weekly reads
    console.log('📚 Migrating weekly reads...');
    let weeklyReads = [];
    try {
      weeklyReads = localDb.prepare('SELECT * FROM weekly_reads').all();
    } catch (error) {
      console.log('⚠️  weekly_reads table not found in local database (skipping)');
    }
    
    if (weeklyReads.length > 0) {
      for (const read of weeklyReads as any[]) {
        await tursoDb.execute({
          sql: `INSERT OR REPLACE INTO weekly_reads 
                (id, title, authors, source, url, description, category, read_date, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          args: [
            read.id,
            read.title,
            read.authors,
            read.source,
            read.url,
            read.description,
            read.category,
            read.read_date,
            read.created_at,
            read.updated_at,
          ],
        });
      }
      console.log(`✅ Migrated ${weeklyReads.length} weekly read(s)\n`);
    } else {
      console.log(`✅ No weekly reads to migrate\n`);
    }

    // Close connections
    localDb.close();

    console.log('🎉 Migration completed successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Add TURSO_DATABASE_URL and TURSO_AUTH_TOKEN to Vercel environment variables');
    console.log('2. Deploy to Vercel');
    console.log('3. Your papershelf will now work on Vercel!\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateToTurso();
