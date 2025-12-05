import { executeQuery, executeQueryOne, executeUpdate } from './db-client';

const MAX_SUBMISSIONS = 3;
const WINDOW_HOURS = 24;

interface RateLimitRecord {
  email: string;
  submission_count: number;
  first_submission_at: string;
  last_submission_at: string;
  window_reset_at: string;
}

export class ContactRateLimiter {
  /**
   * Check if an email has exceeded the rate limit
   * @param email - Email address to check
   * @returns Object with allowed status and remaining submissions
   */
  async checkRateLimit(email: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: Date | null;
    message?: string;
  }> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const now = new Date();

      // Get existing rate limit record
      const record = await executeQueryOne<RateLimitRecord>(
        'SELECT * FROM contact_rate_limit WHERE email = ?',
        [normalizedEmail]
      );

      // No record exists - first submission
      if (!record) {
        return {
          allowed: true,
          remaining: MAX_SUBMISSIONS - 1,
          resetAt: new Date(now.getTime() + WINDOW_HOURS * 60 * 60 * 1000),
        };
      }

      const windowResetAt = new Date(record.window_reset_at);

      // Window has expired - reset the counter
      if (now >= windowResetAt) {
        return {
          allowed: true,
          remaining: MAX_SUBMISSIONS - 1,
          resetAt: new Date(now.getTime() + WINDOW_HOURS * 60 * 60 * 1000),
        };
      }

      // Check if limit exceeded
      if (record.submission_count >= MAX_SUBMISSIONS) {
        const hoursRemaining = Math.ceil((windowResetAt.getTime() - now.getTime()) / (1000 * 60 * 60));
        return {
          allowed: false,
          remaining: 0,
          resetAt: windowResetAt,
          message: `Rate limit exceeded. You can send ${MAX_SUBMISSIONS} messages per ${WINDOW_HOURS} hours. Please try again in ${hoursRemaining} hour${hoursRemaining !== 1 ? 's' : ''}.`,
        };
      }

      // Within limit
      return {
        allowed: true,
        remaining: MAX_SUBMISSIONS - record.submission_count - 1,
        resetAt: windowResetAt,
      };
    } catch (error) {
      console.error('Error checking rate limit:', error);
      // On error, allow the submission (fail open)
      return {
        allowed: true,
        remaining: MAX_SUBMISSIONS - 1,
        resetAt: null,
      };
    }
  }

  /**
   * Record a submission for an email
   * @param email - Email address
   */
  async recordSubmission(email: string): Promise<void> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const now = new Date();
      const windowResetAt = new Date(now.getTime() + WINDOW_HOURS * 60 * 60 * 1000);

      // Get existing record
      const record = await executeQueryOne<RateLimitRecord>(
        'SELECT * FROM contact_rate_limit WHERE email = ?',
        [normalizedEmail]
      );

      if (!record) {
        // Create new record
        await executeUpdate(
          `INSERT INTO contact_rate_limit 
           (email, submission_count, first_submission_at, last_submission_at, window_reset_at)
           VALUES (?, 1, ?, ?, ?)`,
          [normalizedEmail, now.toISOString(), now.toISOString(), windowResetAt.toISOString()]
        );
      } else {
        const recordWindowResetAt = new Date(record.window_reset_at);

        // Window expired - reset counter
        if (now >= recordWindowResetAt) {
          await executeUpdate(
            `UPDATE contact_rate_limit 
             SET submission_count = 1, 
                 first_submission_at = ?, 
                 last_submission_at = ?, 
                 window_reset_at = ?
             WHERE email = ?`,
            [now.toISOString(), now.toISOString(), windowResetAt.toISOString(), normalizedEmail]
          );
        } else {
          // Increment counter
          await executeUpdate(
            `UPDATE contact_rate_limit 
             SET submission_count = submission_count + 1, 
                 last_submission_at = ?
             WHERE email = ?`,
            [now.toISOString(), normalizedEmail]
          );
        }
      }
    } catch (error) {
      console.error('Error recording submission:', error);
      // Don't throw - we don't want to block the submission if rate limit tracking fails
    }
  }

  /**
   * Clean up expired rate limit records (optional maintenance)
   */
  async cleanupExpiredRecords(): Promise<number> {
    try {
      const now = new Date().toISOString();
      const result = await executeUpdate(
        'DELETE FROM contact_rate_limit WHERE window_reset_at < ?',
        [now]
      );
      return result.changes;
    } catch (error) {
      console.error('Error cleaning up expired records:', error);
      return 0;
    }
  }

  /**
   * Get rate limit info for an email (for admin/debugging)
   */
  async getRateLimitInfo(email: string): Promise<RateLimitRecord | null> {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      return await executeQueryOne<RateLimitRecord>(
        'SELECT * FROM contact_rate_limit WHERE email = ?',
        [normalizedEmail]
      );
    } catch (error) {
      console.error('Error getting rate limit info:', error);
      return null;
    }
  }
}

// Export singleton instance
export const contactRateLimiter = new ContactRateLimiter();
