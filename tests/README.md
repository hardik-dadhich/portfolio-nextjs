# Authentication Flow Testing

This directory contains comprehensive tests for the authentication flow of the admin panel.

## Test Files

### 1. `auth-flow-automated.ts`
Automated tests that validate the authentication system components:
- Database connectivity
- Admin user management
- Password hashing and verification
- Input validation schemas
- Authentication configuration
- Session management settings

**Run automated tests:**
```bash
npm run test:auth
```

### 2. `view-tracking-api.ts`
Automated tests that validate the blog view tracking API endpoint:
- Successful view increment with valid slug
- Invalid slug parameter handling (400 response)
- Non-existent blog post handling (404 response)
- Database error handling (500 response)
- Slug sanitization and SQL injection prevention
- Multiple view increments
- Response structure validation

**Run view tracking API tests:**
```bash
npm run test:view-tracking
```

### 3. `view-tracking-e2e.ts`
End-to-end tests that validate the complete view tracking functionality:
- View count increments when visiting blog post
- Tracking failures don't break page rendering
- View count updates persist in database
- Testing with multiple blog posts
- Default view count for new posts
- Independent view counts per post

**Run view tracking end-to-end tests:**
```bash
npm run test:view-tracking-e2e
```

### 4. `auth-flow-test.md`
Manual test cases for end-to-end authentication flow testing:
- Login with valid/invalid credentials
- Session persistence and expiration
- Protected route access
- Logout functionality
- CSRF protection
- Cookie security

## Test Coverage

### Authentication Tests
The authentication tests cover the following requirements:
- **4.1**: Admin login page with credentials
- **4.2**: Valid credential authentication
- **4.3**: Invalid credential rejection
- **4.4**: Protected route access control
- **4.5**: Session expiration (24 hours)
- **10.1**: Session management
- **10.2**: Session extension on activity
- **10.3**: Redirect on session expiration

### View Tracking API Tests
The view tracking tests cover the following requirements:
- **4.1**: POST API endpoint at `/api/blog/[slug]/view`
- **4.2**: Valid slug increments view count
- **4.3**: Invalid slug returns 404
- **4.4**: API returns updated view count
- **SQL Injection Prevention**: Slug sanitization
- **Error Handling**: Database error responses

## Automated Test Results

### Current Status: ✅ ALL TESTS PASSING

#### Authentication Tests
```
Total Tests: 17
Passed: 17
Failed: 0
Pass Rate: 100.0%
```

**Test Categories:**

1. Database Connection (1 test)
   - ✅ Database connectivity

2. Admin User Management (1 test)
   - ✅ Admin user existence verification

3. Password Security (3 tests)
   - ✅ Password hashing with bcrypt
   - ✅ Valid password verification
   - ✅ Invalid password rejection

4. Input Validation (3 tests)
   - ✅ Valid credentials validation
   - ✅ Invalid email format rejection
   - ✅ Short password rejection

5. Configuration (3 tests)
   - ✅ NEXTAUTH_SECRET environment variable
   - ✅ NEXTAUTH_URL environment variable
   - ✅ DATABASE_URL environment variable

6. Authentication Logic (3 tests)
   - ✅ Correct password authentication
   - ✅ Incorrect password rejection
   - ✅ User lookup by email

7. Session Configuration (3 tests)
   - ✅ 24-hour session max age
   - ✅ JWT session strategy
   - ✅ Custom sign-in page

#### View Tracking API Tests
```
Total Tests: 19
Passed: 19
Failed: 0
Pass Rate: 100.0%
```

#### View Tracking End-to-End Tests
```
Total Tests: 17
Passed: 17
Failed: 0
Pass Rate: 100.0%
```

**Test Categories:**

1. Successful View Increment (4 tests)
   - ✅ Response status 200
   - ✅ Response structure validation
   - ✅ View count incremented
   - ✅ Response includes updated view count

2. Invalid Slug Parameter (5 tests)
   - ✅ Null slug returns 400
   - ✅ Undefined slug returns 400
   - ✅ Empty string slug returns 400
   - ✅ Special characters only slug returns 400
   - ✅ Error message included

3. Non-Existent Blog Post (3 tests)
   - ✅ Non-existent post returns 404
   - ✅ Correct error message
   - ✅ No view count created

4. Database Error Handling (3 tests)
   - ✅ Error handling structure
   - ✅ Database operations work normally
   - ✅ Error response structure

5. Slug Sanitization (3 tests)
   - ✅ SQL injection characters removed
   - ✅ Path traversal characters removed
   - ✅ Valid characters preserved

6. Multiple Increments (1 test)
   - ✅ Multiple increments work correctly

**End-to-End Test Categories:**

1. View Count Increment (3 tests)
   - ✅ View tracking API call succeeds
   - ✅ View count incremented by 1
   - ✅ Returned view count matches database

2. Graceful Failure Handling (4 tests)
   - ✅ Invalid slug fails gracefully
   - ✅ Non-existent post fails gracefully
   - ✅ Blog posts load despite tracking failures
   - ✅ Individual post loads despite tracking failures

3. Persistence (4 tests)
   - ✅ View count persists immediately
   - ✅ View count persists after refresh
   - ✅ View count included in post list
   - ✅ View count included in individual post

4. Multiple Posts (4 tests)
   - ✅ All posts track views successfully
   - ✅ All post view counts incremented
   - ✅ View counts are independent
   - ✅ Multiple views on same post

5. Default Behavior (2 tests)
   - ✅ New post has zero view count
   - ✅ All posts have view count property

## Manual Testing

For comprehensive end-to-end testing, follow the manual test cases in `auth-flow-test.md`.

### Prerequisites for Manual Testing

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Ensure admin user exists:**
   ```bash
   npm run setup:admin
   ```

3. **Open browser to:**
   ```
   http://localhost:3000
   ```

### Manual Test Checklist

- [ ] Test 1: Login with valid credentials
- [ ] Test 2: Login with invalid email
- [ ] Test 3: Login with invalid password
- [ ] Test 4: Login with invalid email format
- [ ] Test 5: Login with short password
- [ ] Test 6: Protected route access without authentication
- [ ] Test 7: Session persistence across page refreshes
- [ ] Test 8: Logout functionality
- [ ] Test 9: Session expiration (24 hours)
- [ ] Test 10: Callback URL redirect after login
- [ ] Test 11: Concurrent session handling
- [ ] Test 12: CSRF protection
- [ ] Test 13: Cookie security flags
- [ ] Test 14: Rate limiting (if implemented)

## Testing Best Practices

### Before Running Tests

1. Ensure database is initialized:
   ```bash
   npm run db:init
   ```

2. Create admin user if needed:
   ```bash
   npm run setup:admin
   ```

3. Verify environment variables in `.env.local`:
   ```
   NEXTAUTH_SECRET=<your-secret>
   NEXTAUTH_URL=http://localhost:3000
   ```

### Interpreting Test Results

- **Green (✓ PASS)**: Test passed successfully
- **Red (✗ FAIL)**: Test failed - review error message
- **Yellow (⏳ PENDING)**: Manual test not yet executed

### Debugging Failed Tests

1. Check server logs for errors
2. Verify database file exists: `database/blog.db`
3. Confirm admin user exists in database
4. Check environment variables are loaded
5. Review browser console for client-side errors

## CI/CD Integration

To integrate these tests into your CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Authentication Tests
  run: npm run test:auth
```

## Future Enhancements

### Recommended Testing Additions

1. **Integration Tests**
   - API endpoint testing with Supertest
   - Database transaction testing
   - Session cookie validation

2. **E2E Tests**
   - Playwright or Cypress tests
   - Full user flow automation
   - Cross-browser testing

3. **Security Tests**
   - Rate limiting validation
   - SQL injection prevention
   - XSS attack prevention
   - CSRF token validation

4. **Performance Tests**
   - Login response time
   - Database query performance
   - Session lookup speed

## Troubleshooting

### Common Issues

**Issue**: Tests fail with "Database not found"
**Solution**: Run `npm run db:init` to create database

**Issue**: Tests fail with "No admin users found"
**Solution**: Run `npm run setup:admin` to create admin user

**Issue**: Environment variables not loaded
**Solution**: Ensure `.env.local` exists and contains required variables

**Issue**: bcrypt errors on Apple Silicon
**Solution**: Rebuild bcrypt: `npm rebuild bcrypt`

## Contributing

When adding new authentication features:

1. Add automated tests to `auth-flow-automated.ts`
2. Add manual test cases to `auth-flow-test.md`
3. Update this README with new test coverage
4. Ensure all tests pass before submitting PR

## References

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [bcrypt Documentation](https://github.com/kelektiv/node.bcrypt.js)
- [Zod Validation](https://zod.dev/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
