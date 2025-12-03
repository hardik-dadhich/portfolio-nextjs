#!/usr/bin/env tsx

/**
 * Database Migration: Add Views Column
 * 
 * Adds a 'views' column to the papers table to track blog post views
 */

import { getDatabase } from '../lib/db';

function addViewsColumn() {
  const db = getDatabase();
  
  try {
    console.log('🔄 Adding views column to papers table...');
    
    // Check if column already exists
    const tableInfo = db.prepare("PRAGMA table_info(papers)").all() as any[];
    const hasViewsColumn = tableInfo.some(col => col.name === 'views');
    
    if (hasViewsColumn) {
      console.log('✅ Views column already exists');
      return;
    }
    
    // Add views column
    db.prepare('ALTER TABLE papers ADD COLUMN views INTEGER DEFAULT 0').run();
    
    console.log('✅ Successfully added views column');
    console.log('📊 All existing papers now have views = 0');
    
  } catch (error) {
    console.error('❌ Error adding views column:', error);
    throw error;
  } finally {
    db.close();
  }
}

// Run migration
addViewsColumn();
