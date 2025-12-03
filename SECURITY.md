# Security Enhancements

This document outlines the security measures implemented in the personal blog website admin panel.

## Overview

The following security enhancements have been implemented to protect the application from common web vulnerabilities:

1. **Rate Limiting on Login Attempts**
2. **CSRF Protection**
3. **Input Sanitization**

---

## 1. Rate Limiting on Login Attempts

### Implementation
- **File**: `lib/rate-limit.ts`
- **Applied to**: `/api/auth/[...nextauth]/route.ts`

### Features
- Limits login attempts to **5 per 15 minutes per IP address**
- Returns HTTP 429 (Too Many Requests) when limit is exceeded
- Automatically cleans up expired entries to prevent memory leaks
- Resets rate limit after successful authentication
- Includes rate limit headers in responses:
  - `X-RateLimit-Limit`: Maximum attempts allowed
  - `X-RateLimit-Remaining`: Remaining attempts
  - `X-RateLimit-Reset`: Time when limit resets
  - `Retry-After`: Minutes until retry is allowed

### Usage
```typescript
import { checkRateLimit, getClientIp, resetRateLimit } from '@/lib/rate-limit';

const clientIp = getClientIp(request.headers);
const { isLimited, remaining, resetTime } = checkRateLimit(clientIp);

if (isLimited) {
  // Return 429 error
}

// On successful login:
resetRateLimit(clientIp);
```

### Configuration
- `MAX_ATTEMPTS`: 5 attempts
- `WINDOW_MS`: 15 minutes (900,000 ms)

---

## 2. CSRF Protection

### Implementation
- **File**: `lib/csrf-verification.ts`
- **Applied to**: All authenticated API routes

### Features
- NextAuth.js built-in CSRF protection using double-submit cookie pattern
- Automatic CSRF token generation and validation
- Token rotation after successful authentication
- SameSite cookie attribute set to 'Lax'
- Secure cookie flag enabled in production
- HTTP-only cookies for session tokens
- Origin/Referer header validation for API requests

### Protected Routes
- `POST /api/papers` - Create paper
- `PUT /api/papers/[id]` - Update paper
- `DELETE /api/papers/[id]` - Delete paper

### Cookie Configuration
```typescript
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
}
```

### Validation
The `validateCSRFHeaders()` function checks:
1. Origin header matches the request host
2. Referer header matches the request host (fallback)
3. Relies on SameSite cookie protection for same-origin requests

---

## 3. Input Sanitization

### Implementation
- **File**: `lib/sanitize.ts`
- **Applied to**: All user input fields via `lib/validations.ts`

### Features

#### HTML Escaping
Converts special characters to HTML entities:
- `&` → `&amp;`
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#x27;`
- `/` → `&#x2F;`

#### Text Sanitization
- Removes null bytes
- Normalizes line breaks
- Trims whitespace
- Escapes HTML special characters

#### URL Sanitization
- Validates URL format
- Blocks dangerous protocols (javascript:, data:, vbscript:, file:)
- Only allows http: and https: protocols
- Returns normalized URL or null if invalid

#### Description Sanitization
- Applies text sanitization
- Enforces maximum length (2000 characters)
- Prevents XSS attacks

### Protected Fields

#### Paper Form
- **Title**: Text sanitization
- **Authors**: Text sanitization
- **Date**: Trimmed
- **URL**: URL sanitization with protocol validation
- **Description**: Description sanitization with length limit
- **Type**: Enum validation (no sanitization needed)

#### Login Form
- **Email**: Trimmed and lowercased
- **Password**: Trimmed

#### Contact Form
- **Name**: HTML tags stripped
- **Email**: Trimmed and lowercased
- **Message**: HTML tags stripped
- **Preferred Time**: HTML tags stripped

### Usage
```typescript
import { sanitizeText, sanitizeUrl, sanitizeDescription } from '@/lib/sanitize';

// Sanitize text input
const cleanTitle = sanitizeText(userInput);

// Sanitize URL
const cleanUrl = sanitizeUrl(userUrl);

// Sanitize description
const cleanDescription = sanitizeDescription(userDescription);
```

### Validation Integration
Sanitization is automatically applied through Zod schema transformations:

```typescript
export const paperFormSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(500, 'Title must be 500 characters or less')
    .transform(sanitizeText),
  
  url: z.string()
    .url('Must be a valid URL')
    .refine((url) => sanitizeUrl(url) !== null)
    .transform((url) => sanitizeUrl(url) || url),
  
  // ... other fields
});
```

---

## Security Best Practices

### Environment Variables
Ensure the following environment variables are set:

```env
# NextAuth Configuration
NEXTAUTH_SECRET=<random-secret-key>
NEXTAUTH_URL=https://yourdomain.com

# Database
DATABASE_URL=file:./database/blog.db
```

### Production Checklist
- [ ] Set `NEXTAUTH_SECRET` to a strong random value
- [ ] Set `NEXTAUTH_URL` to your production domain
- [ ] Enable HTTPS in production
- [ ] Configure secure cookie flags
- [ ] Set up proper CORS policies
- [ ] Enable rate limiting on all sensitive endpoints
- [ ] Regularly update dependencies
- [ ] Monitor for security vulnerabilities
- [ ] Implement logging and monitoring
- [ ] Set up database backups

### Additional Recommendations
1. **Rate Limiting**: Consider using Redis for distributed rate limiting in production
2. **Input Validation**: Always validate on both client and server side
3. **Error Messages**: Don't expose sensitive information in error messages
4. **Logging**: Log security events (failed login attempts, rate limit hits)
5. **Monitoring**: Set up alerts for suspicious activity
6. **Updates**: Keep all dependencies up to date
7. **Audits**: Regularly run security audits (`npm audit`)

---

## Testing Security Features

### Rate Limiting
```bash
# Test rate limiting by making multiple login attempts
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/callback/credentials \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"wrongpassword"}'
done
```

### CSRF Protection
```bash
# Test CSRF protection by making a request without proper origin
curl -X POST http://localhost:3000/api/papers \
  -H "Content-Type: application/json" \
  -H "Origin: https://malicious-site.com" \
  -d '{"title":"Test","authors":"Test","date":"2024-01-01","url":"https://example.com","type":"paper"}'
```

### Input Sanitization
Test by submitting forms with:
- HTML tags: `<script>alert('XSS')</script>`
- Special characters: `& < > " ' /`
- Dangerous URLs: `javascript:alert('XSS')`
- Long strings exceeding limits

---

## Compliance

These security measures help comply with:
- **OWASP Top 10**: Protection against common vulnerabilities
- **CWE-79**: Cross-site Scripting (XSS) prevention
- **CWE-352**: Cross-Site Request Forgery (CSRF) prevention
- **CWE-307**: Improper Restriction of Excessive Authentication Attempts

---

## Support

For security concerns or to report vulnerabilities, please contact the development team.

**Last Updated**: November 25, 2025
