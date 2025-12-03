/**
 * Input Sanitization Utilities
 * 
 * Provides functions to sanitize user inputs and prevent XSS attacks
 * - Escapes HTML special characters
 * - Validates and sanitizes URLs
 * - Removes potentially dangerous content
 * 
 * Requirements: 5.3, 6.3
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * 
 * Converts characters that have special meaning in HTML to their
 * HTML entity equivalents:
 * - & becomes &amp;
 * - < becomes &lt;
 * - > becomes &gt;
 * - " becomes &quot;
 * - ' becomes &#x27;
 * - / becomes &#x2F;
 * 
 * @param text - Text to escape
 * @returns Escaped text safe for HTML rendering
 */
export function escapeHtml(text: string): string {
  const htmlEscapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char] || char);
}

/**
 * Sanitize text input by removing or escaping dangerous content
 * 
 * This function:
 * - Trims whitespace
 * - Escapes HTML special characters
 * - Removes null bytes
 * - Normalizes line breaks
 * 
 * @param text - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(text: string): string {
  if (!text) return '';

  // Remove null bytes
  let sanitized = text.replace(/\0/g, '');

  // Normalize line breaks
  sanitized = sanitized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Trim whitespace
  sanitized = sanitized.trim();

  // Escape HTML special characters
  sanitized = escapeHtml(sanitized);

  return sanitized;
}

/**
 * Sanitize description field with additional length limits
 * 
 * @param description - Description text to sanitize
 * @param maxLength - Maximum allowed length (default: 2000)
 * @returns Sanitized description
 */
export function sanitizeDescription(description: string, maxLength: number = 2000): string {
  if (!description) return '';

  let sanitized = sanitizeText(description);

  // Enforce maximum length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate and sanitize URL
 * 
 * Ensures the URL:
 * - Has a valid protocol (http or https)
 * - Doesn't contain javascript: or data: protocols
 * - Is properly formatted
 * 
 * @param url - URL to validate and sanitize
 * @returns Sanitized URL or null if invalid
 */
export function sanitizeUrl(url: string): string | null {
  if (!url) return null;

  // Trim whitespace
  const trimmedUrl = url.trim();

  // Check for dangerous protocols
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = trimmedUrl.toLowerCase();

  for (const protocol of dangerousProtocols) {
    if (lowerUrl.startsWith(protocol)) {
      return null;
    }
  }

  // Validate URL format
  try {
    const urlObj = new URL(trimmedUrl);

    // Only allow http and https protocols
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return null;
    }

    // Return the normalized URL
    return urlObj.toString();
  } catch {
    // Invalid URL format
    return null;
  }
}

/**
 * Sanitize all fields in a paper form data object
 * 
 * @param data - Paper form data to sanitize
 * @returns Sanitized paper form data
 */
export function sanitizePaperFormData(data: {
  title: string;
  authors: string;
  date: string;
  url: string;
  description?: string;
  type: 'paper' | 'blog';
}): {
  title: string;
  authors: string;
  date: string;
  url: string;
  description?: string;
  type: 'paper' | 'blog';
} {
  return {
    title: sanitizeText(data.title),
    authors: sanitizeText(data.authors),
    date: data.date.trim(), // Date is validated by schema, just trim
    url: sanitizeUrl(data.url) || data.url, // Keep original if sanitization fails (will be caught by validation)
    description: data.description ? sanitizeDescription(data.description) : undefined,
    type: data.type,
  };
}

/**
 * Remove script tags and event handlers from HTML content
 * 
 * This is a basic sanitizer for HTML content. For production use with
 * rich text content, consider using a library like DOMPurify.
 * 
 * @param html - HTML content to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';

  let sanitized = html;

  // Remove script tags and their content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

  // Remove javascript: protocol from href and src attributes
  sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"');
  sanitized = sanitized.replace(/src\s*=\s*["']javascript:[^"']*["']/gi, 'src=""');

  // Remove data: protocol from src attributes (can be used for XSS)
  sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, 'src=""');

  return sanitized;
}

/**
 * Validate that a string contains only safe characters
 * 
 * @param text - Text to validate
 * @param allowedPattern - Regex pattern for allowed characters
 * @returns true if text contains only allowed characters
 */
export function containsOnlySafeCharacters(
  text: string,
  allowedPattern: RegExp = /^[a-zA-Z0-9\s\-_.,!?@#$%&*()\[\]{}:;'"+=\/\\|`~]*$/
): boolean {
  return allowedPattern.test(text);
}

/**
 * Strip all HTML tags from text
 * 
 * @param text - Text with potential HTML tags
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(text: string): string {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '');
}
