import fs from 'fs';
import path from 'path';
import { Paper, Goal, AboutData } from './types';

const contentDirectory = path.join(process.cwd(), 'content');

/**
 * Load papers from papers.json
 * Returns empty array if file is missing or malformed
 */
export function loadPapers(): Paper[] {
  try {
    const filePath = path.join(contentDirectory, 'papers.json');

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`Papers file not found: ${filePath}`);
      return [];
    }

    // Read and parse JSON file
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    // Validate structure
    if (!data.papers || !Array.isArray(data.papers)) {
      console.error('Invalid papers.json structure: expected { papers: [] }');
      return [];
    }

    return data.papers as Paper[];
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Malformed JSON in papers.json:', error.message);
    } else {
      console.error('Error loading papers:', error);
    }
    return [];
  }
}

/**
 * Load goals from goals.json
 * Returns empty array if file is missing or malformed
 */
export function loadGoals(): Goal[] {
  try {
    const filePath = path.join(contentDirectory, 'goals.json');

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`Goals file not found: ${filePath}`);
      return [];
    }

    // Read and parse JSON file
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    // Validate structure
    if (!data.goals || !Array.isArray(data.goals)) {
      console.error('Invalid goals.json structure: expected { goals: [] }');
      return [];
    }

    return data.goals as Goal[];
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Malformed JSON in goals.json:', error.message);
    } else {
      console.error('Error loading goals:', error);
    }
    return [];
  }
}

/**
 * Load about data from about.json
 * Returns default data if file is missing or malformed
 */
export function loadAbout(): AboutData {
  const defaultAbout: AboutData = {
    name: 'Your Name',
    tagline: 'Professional Title',
    bio: 'Add your professional summary here.',
    interests: [],
    story: 'Add your personal story here.',
    photo: '/images/profile_pic.jpeg',
    socialLinks: [],
  };

  try {
    const filePath = path.join(contentDirectory, 'about.json');

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.warn(`About file not found: ${filePath}`);
      return defaultAbout;
    }

    // Read and parse JSON file
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);

    // Merge with defaults to ensure all required fields exist
    return {
      ...defaultAbout,
      ...data,
    } as AboutData;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Malformed JSON in about.json:', error.message);
    } else {
      console.error('Error loading about data:', error);
    }
    return defaultAbout;
  }
}
