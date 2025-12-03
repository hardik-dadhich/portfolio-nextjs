#!/usr/bin/env node

/**
 * Database Initialization Script
 * 
 * This script initializes the database by creating all necessary tables
 * and indexes from the schema.sql file.
 */

import Database from 'better-sqlite3';
import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

const DB_PATH = process.env.DATABASE_URL || join(process.cwd(), 'database', 'blog.db');
const SCHEMA_PATH = join(process.cwd(), 'database', 'schema.sql');

async function initializeDatabase() {
  console.log('🗄️  Database Initialization');
  console.log('==========================\n');

  try {
    // Check if schema file exists
    if (!existsSync(SCHEMA_PATH)) {
      console.error(`❌ Schema file not found at: ${SCHEMA_PATH}`);
      process.exit(1);
    }

    // Ensure database directory exists
    const dbDir = dirname(DB_PATH);
    if (!existsSync(dbDir)) {
      console.log(`📁 Creating database directory: ${dbDir}`);
      mkdirSync(dbDir, { recursive: true });
    }

    // Check if database already exists
    const dbExists = existsSync(DB_PATH);
    if (dbExists) {
      console.log(`⚠️  Database already exists at: ${DB_PATH}`);
      console.log('   Tables will be created if they don\'t exist (using IF NOT EXISTS).\n');
    } else {
      console.log(`📁 Creating new database at: ${DB_PATH}\n`);
    }

    // Connect to database
    console.log('🔌 Connecting to database...');
    const db = new Database(DB_PATH);
    
    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');
    console.log('✅ Database connection established');

    // Read schema file
    console.log('\n📖 Reading schema file...');
    const schema = readFileSync(SCHEMA_PATH, 'utf-8');
    console.log('✅ Schema file loaded');

    // Execute schema SQL
    console.log('\n🔨 Creating tables and indexes...');
    db.exec(schema);
    console.log('✅ Tables and indexes created successfully');

    // Verify tables were created
    console.log('\n🔍 Verifying database structure...');
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      ORDER BY name
    `).all() as { name: string }[];

    console.log('\n📋 Tables created:');
    tables.forEach(table => {
      if (table.name !== 'sqlite_sequence') {
        console.log(`   ✓ ${table.name}`);
      }
    });

    // Verify indexes
    const indexes = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='index' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as { name: string }[];

    if (indexes.length > 0) {
      console.log('\n📊 Indexes created:');
      indexes.forEach(index => {
        console.log(`   ✓ ${index.name}`);
      });
    }

    // Close database connection
    db.close();

    console.log('\n✅ Database initialization complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Run "npm run setup:admin" to create an admin user');
    console.log('   2. Run "npm run db:migrate" to import existing papers (if any)');

  } catch (error) {
    console.error('\n❌ Error initializing database:', error);
    process.exit(1);
  }
}

// Run initialization
initializeDatabase();
