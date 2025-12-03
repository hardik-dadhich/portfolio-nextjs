# Security Checklist Before Pushing to GitHub

## ⚠️ CRITICAL: Review Before Every Commit

This checklist ensures you don't accidentally commit sensitive information to your public repository.

---

## 1. Environment Variables & Secrets ✅

### Check for Exposed Secrets
- [ ] No `.env` files are being committed
- [ ] No `.env.local` or `.env.production` files in git
- [ ] All API keys are in environment variables, not hardcoded
- [ ] No `NEXTAUTH_SECRET` in code
- [ ] No email service API keys in code
- [ ] No database credentials in code

### Verify .gitignore
```bash
# Run this command to check what will be committed:
git status

# Check if sensitive files are ignored:
git check-ignore .env.local
git check-ignore database/blog.db
```

**Expected**: These files should be ignored

### Search for Hardcoded Secrets
```bash
# Search for potential secrets in your code:
grep -r "NEXTAUTH_SECRET" --exclude-dir=node_modules --exclude-dir=.next
grep -r "API_KEY" --exclude-dir=node_modules --exclude-dir=.next
grep -r "password.*=" --exclude-dir=node_modules --exclude-dir=.next
```

---

## 2. Database Files ✅

### Verify Database is Not Committed
- [ ] `database/blog.db` is NOT in git
- [ ] `database/*.db-shm` files are NOT in git
- [ ] `database/*.db-wal` files are NOT in git
- [ ] No SQL dump files with real data

### Check Database Files
```bash
# Verify database files are ignored:
git check-ignore database/blog.db
git check-ignore database/blog.db-shm
git check-ignore database/blog.db-wal

# If they're tracked, remove them:
git rm --cached database/blog.db
git rm --cached database/*.db-shm
git rm --cached database/*.db-wal
```

### Database Schema Only
- [ ] Only commit `database/schema.sql` (structure, no data)
- [ ] Only commit `database/README.md` (documentation)

---

## 3. Personal Information ✅

### Check Content Files
- [ ] Review `content/about.json` - remove sensitive personal info
- [ ] Review `content/goals.json` - ensure no private goals
- [ ] Check blog posts for personal/sensitive information
- [ ] Verify no personal email addresses (except public ones)
- [ ] No phone numbers or addresses

### Search for Email Addresses
```bash
# Find email addresses in your code:
grep -r "@gmail.com\|@yahoo.com\|@hotmail.com" --exclude-dir=node_modules --exclude-dir=.next
```

---

## 4. Authentication & Security ✅

### Admin Credentials
- [ ] No admin passwords in code
- [ ] No default/test credentials
- [ ] Admin setup script doesn't contain hardcoded passwords

### Session Security
- [ ] `NEXTAUTH_SECRET` is in `.env.local` only
- [ ] No session tokens in code
- [ ] No JWT secrets hardcoded

---

## 5. Third-Party Services ✅

### API Keys & Tokens
- [ ] No Resend API keys
- [ ] No SendGrid API keys
- [ ] No AWS credentials
- [ ] No Google API keys
- [ ] No payment gateway keys

### Service Configuration
- [ ] Email service config uses environment variables
- [ ] No hardcoded service URLs with credentials

---

## 6. Build & Deployment Files ✅

### Verify These Are Ignored
- [ ] `node_modules/` is ignored
- [ ] `.next/` build directory is ignored
- [ ] `out/` directory is ignored
- [ ] Python `venv/` is ignored
- [ ] `__pycache__/` is ignored

### Check Build Artifacts
```bash
# Ensure build files aren't tracked:
git status | grep -E "node_modules|\.next|out|venv"
```

---

## 7. Logs & Debug Files ✅

### No Sensitive Logs
- [ ] No log files with user data
- [ ] No debug files with credentials
- [ ] No error dumps with sensitive info

### Check for Log Files
```bash
# Find log files:
find . -name "*.log" -not -path "./node_modules/*"
```

---

## 8. Configuration Files ✅

### Review Config Files
- [ ] `next.config.js` - no secrets
- [ ] `tailwind.config.ts` - safe to commit
- [ ] `tsconfig.json` - safe to commit
- [ ] `package.json` - no private registry credentials

---

## 9. Code Review ✅

### Security Best Practices
- [ ] No SQL injection vulnerabilities
- [ ] Input validation is in place
- [ ] XSS protection implemented
- [ ] CSRF protection enabled
- [ ] Rate limiting configured
- [ ] Sanitization functions used

### Review Critical Files
```bash
# Review these files before committing:
git diff lib/auth.ts
git diff lib/db.ts
git diff app/api/
```

---

## 10. Git History ✅

### Check Git History for Secrets
```bash
# Search git history for potential secrets:
git log --all --full-history --source --pretty=format: -- .env
git log --all --full-history --source --pretty=format: -- database/blog.db
```

### If Secrets Were Committed
If you accidentally committed secrets:

1. **Change the secrets immediately**
2. **Remove from git history:**
   ```bash
   # Remove file from all commits:
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env.local" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (DANGEROUS - only if repo is private or new):
   git push origin --force --all
   ```

3. **Use BFG Repo-Cleaner (recommended):**
   ```bash
   # Install BFG
   brew install bfg  # macOS
   
   # Remove sensitive files
   bfg --delete-files .env.local
   bfg --delete-files blog.db
   
   # Clean up
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   ```

---

## 11. Pre-Commit Automated Checks ✅

### Install Pre-Commit Hooks (Optional)
```bash
# Install husky for git hooks:
npm install --save-dev husky

# Setup pre-commit hook:
npx husky install
npx husky add .husky/pre-commit "npm run pre-commit-check"
```

### Add Pre-Commit Script to package.json
```json
{
  "scripts": {
    "pre-commit-check": "npm run lint && npm run type-check && npm run security-check"
  }
}
```

---

## 12. Final Verification ✅

### Before `git push`
```bash
# 1. Review what will be committed:
git status
git diff --cached

# 2. Check for secrets:
git diff --cached | grep -i "password\|secret\|api_key\|token"

# 3. Verify .gitignore is working:
git ls-files | grep -E "\.env|\.db$|node_modules"

# 4. Run security audit:
npm audit

# 5. Check for known vulnerabilities:
npm audit fix
```

---

## Emergency: If You Committed Secrets

### Immediate Actions
1. **DO NOT PUSH** if you haven't already
2. **Reset the commit:**
   ```bash
   git reset HEAD~1
   ```

3. **If already pushed:**
   - Immediately rotate/change all exposed secrets
   - Remove from GitHub (see section 10)
   - Consider the secrets compromised

4. **Report to security team** (if applicable)

---

## Automated Security Tools

### Recommended Tools

1. **git-secrets** (Prevents committing secrets)
   ```bash
   brew install git-secrets
   git secrets --install
   git secrets --register-aws
   ```

2. **truffleHog** (Finds secrets in git history)
   ```bash
   pip install truffleHog
   trufflehog --regex --entropy=False .
   ```

3. **gitleaks** (Detect hardcoded secrets)
   ```bash
   brew install gitleaks
   gitleaks detect --source . --verbose
   ```

4. **npm audit** (Check dependencies)
   ```bash
   npm audit
   npm audit fix
   ```

---

## Environment Variables Template

Create `.env.example` for documentation (safe to commit):

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=http://localhost:3000

# Email Service Configuration
EMAIL_SERVICE=console
CONTACT_EMAIL=your@email.com

# For Production - Resend
# EMAIL_SERVICE=resend
# RESEND_API_KEY=your_api_key_here
# FROM_EMAIL=noreply@yourdomain.com

# Database (optional)
# DATABASE_URL=/path/to/database/blog.db
```

---

## Security Contacts

### If You Discover a Security Issue
- **DO NOT** create a public GitHub issue
- Email: [your-security-email]
- Use GitHub Security Advisories (private)

---

## Checklist Summary

Before every `git push`, verify:

- [ ] ✅ No `.env` files
- [ ] ✅ No database files
- [ ] ✅ No API keys or secrets
- [ ] ✅ No personal sensitive information
- [ ] ✅ No admin credentials
- [ ] ✅ Build artifacts ignored
- [ ] ✅ Logs ignored
- [ ] ✅ Code reviewed for vulnerabilities
- [ ] ✅ Dependencies audited
- [ ] ✅ Git history clean

---

## Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

**Remember**: Once something is pushed to GitHub, assume it's public forever, even if you delete it later!
