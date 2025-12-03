#!/usr/bin/env node

/**
 * Admin User Setup Script
 * 
 * This script creates an initial admin user for the admin panel.
 * It prompts for email and password, hashes the password with bcrypt,
 * and inserts the user into the admin_users table.
 */

import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { createInterface } from 'readline';
import { join } from 'path';
import { existsSync } from 'fs';

const DB_PATH = process.env.DATABASE_URL || join(process.cwd(), 'database', 'blog.db');
const SALT_ROUNDS = 10;

interface AdminUser {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

// Create readline interface for user input
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password: string): boolean {
  return password.length >= 8;
}

async function setupAdmin() {
  console.log('🔐 Admin User Setup');
  console.log('==================\n');

  // Check if database exists
  if (!existsSync(DB_PATH)) {
    console.error('❌ Database not found. Please run "npm run db:init" first.');
    process.exit(1);
  }

  // Connect to database
  const db = new Database(DB_PATH);

  try {
    // Check if admin_users table exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='admin_users'
    `).get();

    if (!tableExists) {
      console.error('❌ admin_users table not found. Please run "npm run db:init" first.');
      process.exit(1);
    }

    // Get email
    let email = '';
    while (!email) {
      const input = await question('Enter admin email: ');
      if (!validateEmail(input.trim())) {
        console.log('❌ Invalid email format. Please try again.\n');
        continue;
      }
      email = input.trim();
    }

    // Check if user already exists
    const existingUser = db.prepare('SELECT id FROM admin_users WHERE email = ?').get(email) as AdminUser | undefined;
    if (existingUser) {
      console.log(`\n⚠️  Admin user with email "${email}" already exists.`);
      const overwrite = await question('Do you want to update the password? (yes/no): ');
      if (overwrite.toLowerCase() !== 'yes' && overwrite.toLowerCase() !== 'y') {
        console.log('❌ Setup cancelled.');
        rl.close();
        db.close();
        process.exit(0);
      }
    }

    // Get password
    let password = '';
    while (!password) {
      const input = await question('Enter admin password (min 8 characters): ');
      if (!validatePassword(input)) {
        console.log('❌ Password must be at least 8 characters. Please try again.\n');
        continue;
      }
      password = input;
    }

    // Confirm password
    const confirmPassword = await question('Confirm password: ');
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match. Setup cancelled.');
      rl.close();
      db.close();
      process.exit(1);
    }

    console.log('\n🔄 Hashing password...');
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    console.log('💾 Saving admin user...');
    
    if (existingUser) {
      // Update existing user
      db.prepare('UPDATE admin_users SET password_hash = ? WHERE email = ?')
        .run(passwordHash, email);
      console.log('✅ Admin user password updated successfully!');
    } else {
      // Insert new user
      const result = db.prepare(`
        INSERT INTO admin_users (email, password_hash)
        VALUES (?, ?)
      `).run(email, passwordHash);
      console.log('✅ Admin user created successfully!');
    }

    console.log(`\n📧 Email: ${email}`);
    console.log('🔑 Password: [hidden]');
    console.log('\n🎉 You can now log in to the admin panel!');

  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
    process.exit(1);
  } finally {
    rl.close();
    db.close();
  }
}

// Run setup
setupAdmin();
