#!/usr/bin/env tsx

/**
 * View Tracking End-to-End Tests
 * 
 * This script tests the complete view tracking functionality by:
 * 1. Verifying view count increments when visiting blog post
 * 2. Testing that tracking failures don't break page rendering
 * 3. Verifying view count updates persist in database
 * 4. Testing with multiple blog posts
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { blogViewsDB } from '../lib/db';
import { getAllPosts, getPostBySlug } from '../lib/blog';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  error?: string;
}

const results: TestResult[] = [];

function logTest(name: string, passed: boolean, message: string, error?: string) {
  const status = passed 
    ? `${colors.green}✓ PASS${colors.reset}` 
    : `${colors.red}✗ FAIL${colors.reset}`;
  
  console.log(`\n${status} ${colors.cyan}${name}${colors.reset}`);
  console.log(`  ${message}`);
  
  if (error) {
    console.log(`  ${colors.red}Error: ${error}${colors.reset}`);
  }
  
  results.push({ name, passed, message, error });
}

function logSection(title: string) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}`);
}

/**
 * Simulate the view tracking API call
 */
async function trackView(slug: string): Promise<{
  success: boolean;
  viewCount?: number;
  error?: string;
}> {
  try {
    // Validate slug
    if (!slug || typeof slug !== 'string') {
      return { success: false, error: 'Invalid slug parameter' };
    }

    // Sanitize slug
    const sanitizedSlug = slug.replace(/[^a-zA-Z0-9-_]/g, '');
    
    if (!sanitizedSlug) {
      return { success: false, error: 'Invalid slug format' };
    }

    // Verify blog post exists
    const post = await getPostBySlug(sanitizedSlug);
    if (!post) {
      return { success: false, error: 'Blog post not found' };
    }

    // Increment view count
    const newViewCount = blogViewsDB.incrementViewCount(sanitizedSlug);

    return {
      success: true,
      viewCount: newViewCount,
    };
  } catch (error) {
    console.error('Error tracking blog view:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to track view',
    };
  }
}

/**
 * Test 1: Verify view count increments when visiting blog post
 * Requirements: 2.1, 2.2
 */
async function testViewCountIncrement() {
  logSection('Test 1: View Count Increments When Visiting Blog Post');
  
  try {
    // Get a blog post
    const posts = await getAllPosts();
    
    if (posts.length === 0) {
      logTest(
        'View Count Increment',
        false,
        'No blog posts found to test'
      );
      return;
    }

    const testPost = posts[0];
    const slug = testPost.slug;
    
    // Get initial view count
    const initialViewCount = blogViewsDB.getViewCount(slug);
    console.log(`  Initial view count for "${slug}": ${initialViewCount}`);
    
    // Simulate visiting the blog post (track view)
    const trackResult = await trackView(slug);
    
    // Verify tracking succeeded
    logTest(
      'View Tracking API Call Succeeds',
      trackResult.success === true,
      trackResult.success
        ? 'View tracking API call completed successfully'
        : `View tracking failed: ${trackResult.error}`
    );
    
    // Get updated view count from database
    const updatedViewCount = blogViewsDB.getViewCount(slug);
    console.log(`  Updated view count for "${slug}": ${updatedViewCount}`);
    
    // Verify view count incremented by 1
    const incremented = updatedViewCount === initialViewCount + 1;
    
    logTest(
      'View Count Incremented by 1',
      incremented,
      incremented
        ? `View count correctly incremented from ${initialViewCount} to ${updatedViewCount}`
        : `View count incorrect: expected ${initialViewCount + 1}, got ${updatedViewCount}`
    );
    
    // Verify the returned view count matches database
    if (trackResult.viewCount !== undefined) {
      const countsMatch = trackResult.viewCount === updatedViewCount;
      
      logTest(
        'Returned View Count Matches Database',
        countsMatch,
        countsMatch
          ? `API returned view count (${trackResult.viewCount}) matches database (${updatedViewCount})`
          : `Mismatch: API returned ${trackResult.viewCount}, database has ${updatedViewCount}`
      );
    }
    
  } catch (error) {
    logTest(
      'View Count Increment Test',
      false,
      'Failed to test view count increment',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Test 2: Verify tracking failures don't break page rendering
 * Requirements: 2.3, 2.4
 */
async function testGracefulFailure() {
  logSection('Test 2: Tracking Failures Don\'t Break Page Rendering');
  
  try {
    // Test 1: Invalid slug should fail gracefully
    const invalidSlugResult = await trackView('');
    
    logTest(
      'Invalid Slug Fails Gracefully',
      invalidSlugResult.success === false && invalidSlugResult.error !== undefined,
      invalidSlugResult.success === false
        ? `Invalid slug correctly rejected: ${invalidSlugResult.error}`
        : 'Invalid slug should have been rejected'
    );
    
    // Test 2: Non-existent post should fail gracefully
    const nonExistentResult = await trackView('non-existent-post-12345');
    
    logTest(
      'Non-Existent Post Fails Gracefully',
      nonExistentResult.success === false && nonExistentResult.error !== undefined,
      nonExistentResult.success === false
        ? `Non-existent post correctly rejected: ${nonExistentResult.error}`
        : 'Non-existent post should have been rejected'
    );
    
    // Test 3: Verify we can still load blog posts even if tracking fails
    const posts = await getAllPosts();
    const canLoadPosts = posts.length > 0;
    
    logTest(
      'Blog Posts Load Despite Tracking Failures',
      canLoadPosts,
      canLoadPosts
        ? `Successfully loaded ${posts.length} blog post(s) even after tracking failures`
        : 'Failed to load blog posts'
    );
    
    // Test 4: Verify we can still get individual post even if tracking fails
    if (posts.length > 0) {
      const post = await getPostBySlug(posts[0].slug);
      const canLoadPost = post !== null;
      
      logTest(
        'Individual Post Loads Despite Tracking Failures',
        canLoadPost,
        canLoadPost
          ? `Successfully loaded post "${posts[0].slug}" even after tracking failures`
          : 'Failed to load individual post'
      );
    }
    
  } catch (error) {
    logTest(
      'Graceful Failure Test',
      false,
      'Failed to test graceful failure handling',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Test 3: Verify view count updates persist in database
 * Requirements: 2.2
 */
async function testPersistence() {
  logSection('Test 3: View Count Updates Persist in Database');
  
  try {
    const posts = await getAllPosts();
    
    if (posts.length === 0) {
      logTest(
        'Persistence Test',
        false,
        'No blog posts found to test'
      );
      return;
    }

    const testPost = posts[0];
    const slug = testPost.slug;
    
    // Get initial view count
    const initialCount = blogViewsDB.getViewCount(slug);
    
    // Track view
    await trackView(slug);
    
    // Get count immediately after tracking
    const countAfterTracking = blogViewsDB.getViewCount(slug);
    
    // Verify count increased
    const increased = countAfterTracking === initialCount + 1;
    
    logTest(
      'View Count Persists Immediately',
      increased,
      increased
        ? `View count persisted immediately: ${initialCount} → ${countAfterTracking}`
        : `View count not persisted: expected ${initialCount + 1}, got ${countAfterTracking}`
    );
    
    // Simulate "page refresh" by getting count again
    const countAfterRefresh = blogViewsDB.getViewCount(slug);
    
    // Verify count is still the same
    const persisted = countAfterRefresh === countAfterTracking;
    
    logTest(
      'View Count Persists After Refresh',
      persisted,
      persisted
        ? `View count persisted after refresh: ${countAfterRefresh}`
        : `View count changed after refresh: ${countAfterTracking} → ${countAfterRefresh}`
    );
    
    // Verify the count is included when loading all posts
    const postsWithCounts = await getAllPosts();
    const postWithCount = postsWithCounts.find(p => p.slug === slug);
    
    if (postWithCount) {
      const countInList = postWithCount.viewCount;
      const matchesDatabase = countInList === countAfterRefresh;
      
      logTest(
        'View Count Included in Post List',
        matchesDatabase,
        matchesDatabase
          ? `View count in post list (${countInList}) matches database (${countAfterRefresh})`
          : `Mismatch: post list has ${countInList}, database has ${countAfterRefresh}`
      );
    }
    
    // Verify the count is included when loading individual post
    const individualPost = await getPostBySlug(slug);
    
    if (individualPost) {
      const countInPost = individualPost.viewCount;
      const matchesDatabase = countInPost === countAfterRefresh;
      
      logTest(
        'View Count Included in Individual Post',
        matchesDatabase,
        matchesDatabase
          ? `View count in individual post (${countInPost}) matches database (${countAfterRefresh})`
          : `Mismatch: individual post has ${countInPost}, database has ${countAfterRefresh}`
      );
    }
    
  } catch (error) {
    logTest(
      'Persistence Test',
      false,
      'Failed to test view count persistence',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Test 4: Test with multiple blog posts
 * Requirements: 2.1, 2.2
 */
async function testMultiplePosts() {
  logSection('Test 4: Test with Multiple Blog Posts');
  
  try {
    const posts = await getAllPosts();
    
    if (posts.length === 0) {
      logTest(
        'Multiple Posts Test',
        false,
        'No blog posts found to test'
      );
      return;
    }

    console.log(`  Found ${posts.length} blog post(s) to test`);
    
    // Track initial counts for all posts
    const initialCounts = new Map<string, number>();
    posts.forEach(post => {
      initialCounts.set(post.slug, blogViewsDB.getViewCount(post.slug));
    });
    
    // Track views for all posts
    const trackResults = await Promise.all(
      posts.map(post => trackView(post.slug))
    );
    
    // Verify all tracking calls succeeded
    const allSucceeded = trackResults.every(result => result.success);
    
    logTest(
      'All Posts Track Views Successfully',
      allSucceeded,
      allSucceeded
        ? `Successfully tracked views for all ${posts.length} post(s)`
        : `Some tracking calls failed: ${trackResults.filter(r => !r.success).length} failures`
    );
    
    // Verify all counts incremented
    let allIncremented = true;
    const incrementResults: string[] = [];
    
    posts.forEach(post => {
      const initialCount = initialCounts.get(post.slug) || 0;
      const newCount = blogViewsDB.getViewCount(post.slug);
      const incremented = newCount === initialCount + 1;
      
      if (!incremented) {
        allIncremented = false;
      }
      
      incrementResults.push(
        `  - "${post.slug}": ${initialCount} → ${newCount} ${incremented ? '✓' : '✗'}`
      );
    });
    
    console.log('\n  View count changes:');
    incrementResults.forEach(result => console.log(result));
    
    logTest(
      'All Post View Counts Incremented',
      allIncremented,
      allIncremented
        ? `All ${posts.length} post(s) had their view counts incremented correctly`
        : 'Some posts did not increment correctly'
    );
    
    // Verify counts are independent (incrementing one doesn't affect others)
    const countsAreIndependent = posts.every(post => {
      const count = blogViewsDB.getViewCount(post.slug);
      const initialCount = initialCounts.get(post.slug) || 0;
      return count === initialCount + 1;
    });
    
    logTest(
      'View Counts Are Independent',
      countsAreIndependent,
      countsAreIndependent
        ? 'Each post maintains its own independent view count'
        : 'View counts may be interfering with each other'
    );
    
    // Test tracking the same post multiple times
    if (posts.length > 0) {
      const testPost = posts[0];
      const countBefore = blogViewsDB.getViewCount(testPost.slug);
      
      // Track 3 more views
      await trackView(testPost.slug);
      await trackView(testPost.slug);
      await trackView(testPost.slug);
      
      const countAfter = blogViewsDB.getViewCount(testPost.slug);
      const incrementedBy3 = countAfter === countBefore + 3;
      
      logTest(
        'Multiple Views on Same Post',
        incrementedBy3,
        incrementedBy3
          ? `Post "${testPost.slug}" correctly tracked 3 additional views: ${countBefore} → ${countAfter}`
          : `Expected ${countBefore + 3}, got ${countAfter}`
      );
    }
    
  } catch (error) {
    logTest(
      'Multiple Posts Test',
      false,
      'Failed to test multiple posts',
      error instanceof Error ? error.message : String(error)
    );
  }
}

/**
 * Test 5: Verify view counts default to 0 for new posts
 */
async function testDefaultViewCount() {
  logSection('Test 5: Default View Count for New Posts');
  
  try {
    // Test with a slug that doesn't exist yet
    const newSlug = 'test-new-post-' + Date.now();
    const viewCount = blogViewsDB.getViewCount(newSlug);
    
    logTest(
      'New Post Has Zero View Count',
      viewCount === 0,
      viewCount === 0
        ? 'New posts correctly default to 0 views'
        : `Expected 0, got ${viewCount}`
    );
    
    // Verify getAllPosts includes view counts
    const posts = await getAllPosts();
    const allHaveViewCount = posts.every(post => 
      typeof post.viewCount === 'number' && post.viewCount >= 0
    );
    
    logTest(
      'All Posts Have View Count Property',
      allHaveViewCount,
      allHaveViewCount
        ? `All ${posts.length} post(s) have valid viewCount property`
        : 'Some posts missing viewCount property'
    );
    
  } catch (error) {
    logTest(
      'Default View Count Test',
      false,
      'Failed to test default view count',
      error instanceof Error ? error.message : String(error)
    );
  }
}

function printSummary() {
  logSection('Test Summary');
  
  const total = results.length;
  const passed = results.filter(r => r.passed).length;
  const failed = total - passed;
  const passRate = ((passed / total) * 100).toFixed(1);
  
  console.log(`\nTotal Tests: ${total}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Pass Rate: ${passRate}%\n`);
  
  if (failed > 0) {
    console.log(`${colors.yellow}Failed Tests:${colors.reset}`);
    results
      .filter(r => !r.passed)
      .forEach(r => {
        console.log(`  - ${r.name}: ${r.message}`);
        if (r.error) {
          console.log(`    Error: ${r.error}`);
        }
      });
    console.log();
  }
  
  return failed === 0;
}

async function main() {
  console.log(`${colors.cyan}
╔═══════════════════════════════════════════════════════════╗
║      Blog View Tracking End-to-End Tests                  ║
║                                                           ║
║  Testing complete view tracking functionality             ║
╚═══════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  try {
    // Run all tests
    await testViewCountIncrement();
    await testGracefulFailure();
    await testPersistence();
    await testMultiplePosts();
    await testDefaultViewCount();
    
    // Print summary
    const allPassed = printSummary();
    
    if (allPassed) {
      console.log(`${colors.green}✓ All tests passed!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${colors.red}✗ Some tests failed${colors.reset}\n`);
      process.exit(1);
    }
    
  } catch (error) {
    console.error(`\n${colors.red}Fatal error during test execution:${colors.reset}`);
    console.error(error);
    process.exit(1);
  }
}

// Run tests
main();
