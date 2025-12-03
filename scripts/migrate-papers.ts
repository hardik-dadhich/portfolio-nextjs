#!/usr/bin/env node

/**
 * Papers Migration Script
 * 
 * This script migrates existing papers from content/papers.json
 * into the database. It reads the JSON file and inserts each paper
 * into the papers table.
 */

import Database from 'better-sqlite3';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DB_PATH = process.env.DATABASE_URL || join(process.cwd(), 'database', 'blog.db');
const PAPERS_JSON_PATH = join(process.cwd(), 'content', 'papers.json');

interface PaperJSON {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  summary: string;
  pdfUrl?: string;
  externalUrl?: string;
}

interface PapersData {
  papers: PaperJSON[];
}

async function migratePapers() {
  console.log('📦 Papers Migration');
  console.log('==================\n');

  try {
    // Check if database exists
    if (!existsSync(DB_PATH)) {
      console.error('❌ Database not found. Please run "npm run db:init" first.');
      process.exit(1);
    }

    // Check if papers.json exists
    if (!existsSync(PAPERS_JSON_PATH)) {
      console.error(`❌ Papers file not found at: ${PAPERS_JSON_PATH}`);
      console.log('   No papers to migrate.');
      process.exit(0);
    }

    // Connect to database
    console.log('🔌 Connecting to database...');
    const db = new Database(DB_PATH);
    console.log('✅ Database connection established');

    // Check if papers table exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='papers'
    `).get();

    if (!tableExists) {
      console.error('❌ papers table not found. Please run "npm run db:init" first.');
      db.close();
      process.exit(1);
    }

    // Read papers.json
    console.log('\n📖 Reading papers.json...');
    const papersData: PapersData = JSON.parse(readFileSync(PAPERS_JSON_PATH, 'utf-8'));
    console.log(`✅ Found ${papersData.papers.length} papers to migrate`);

    // Check if papers already exist in database
    const existingCount = db.prepare('SELECT COUNT(*) as count FROM papers').get() as { count: number };
    if (existingCount.count > 0) {
      console.log(`\n⚠️  Database already contains ${existingCount.count} paper(s).`);
      console.log('   This migration will add new papers without removing existing ones.');
    }

    // Prepare insert statement
    const insertStmt = db.prepare(`
      INSERT INTO papers (title, authors, date, url, description, type)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    // Begin transaction for better performance
    const insertMany = db.transaction((papers: PaperJSON[]) => {
      let inserted = 0;
      let skipped = 0;

      for (const paper of papers) {
        try {
          // Convert authors array to comma-separated string
          const authorsStr = paper.authors.join(', ');
          
          // Use year to create a date (assuming January 1st of that year)
          const date = `${paper.year}-01-01`;
          
          // Use externalUrl if available, otherwise pdfUrl
          const url = paper.externalUrl || paper.pdfUrl || '';
          
          if (!url) {
            console.log(`   ⚠️  Skipping "${paper.title}" - no URL available`);
            skipped++;
            continue;
          }
          
          // Use summary as description
          const description = paper.summary;
          
          // Determine type based on URL or default to 'paper'
          const type = 'paper';
          
          insertStmt.run(paper.title, authorsStr, date, url, description, type);
          inserted++;
          
        } catch (error) {
          console.error(`   ❌ Error inserting paper "${paper.title}":`, error);
          skipped++;
        }
      }

      return { inserted, skipped };
    });

    // Execute migration
    console.log('\n🔄 Migrating papers...');
    const result = insertMany(papersData.papers);

    // Close database connection
    db.close();

    // Display results
    console.log('\n✅ Migration complete!');
    console.log(`\n📊 Results:`);
    console.log(`   ✓ Inserted: ${result.inserted} papers`);
    if (result.skipped > 0) {
      console.log(`   ⚠️  Skipped: ${result.skipped} papers`);
    }

    // Verify final count
    const dbVerify = new Database(DB_PATH);
    const finalCount = dbVerify.prepare('SELECT COUNT(*) as count FROM papers').get() as { count: number };
    dbVerify.close();
    
    console.log(`   📋 Total papers in database: ${finalCount.count}`);

  } catch (error) {
    console.error('\n❌ Error migrating papers:', error);
    process.exit(1);
  }
}

// Run migration
migratePapers();
