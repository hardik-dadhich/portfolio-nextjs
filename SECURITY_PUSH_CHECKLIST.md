# 🔒 Security Checklist Before Pushing to GitHub

## ⚠️ CRITICAL: Files That Must NEVER Be Pushed

### 🚫 Environment Files (Contain Secrets)
- ❌ `.env.local` - Your actual environment variables
- ❌ `.env` - Any environment file without .example
- ❌ `.env.development.local`
- ❌ `.env.production.local`
- ❌ `.env.backup`
- ✅ `.env.example` - Template only (safe to push)

### 🚫 Database Files (Contain User Data)
- ❌ `database/blog.db` - SQLite database with data
- ❌ `database/*.db-shm` - Shared memory files
- ❌ `database/*.db-wal` - Write-ahead log files
- ❌ `database/*.db-journal` - Journal files
- ✅ `database/schema.sql` - Schema only (safe to push)
- ✅ `database/README.md` - Documentation (safe to push)

### 🚫 Keys & Certificates
- ❌ `*.key` - Private keys
- ❌ `*.pem` - Certificate files
- ❌ `*.p12` - PKCS12 files
- ❌ `*.pfx` - Personal Information Exchange
- ❌ `id_rsa` - SSH private keys
- ❌ `*.ppk` - PuTTY private keys

### 🚫 Deployment Packages
- ❌ `*.zip` - Deployment archives
- ❌ `*.tar.gz` - Compressed archives
- ❌ `personal-blog-deployment.zip`

### 🚫 Build & Dependencies
- ❌ `node_modules/` - Dependencies (huge, reinstall on server)
- ❌ `.next/` - Build output (regenerated on deployment)
- ❌ `out/` - Static export output

### 🚫 IDE & OS Files
- ❌ `.vscode/` - VS Code settings (may contain paths)
- ❌ `.idea/` - IntelliJ settings
- ❌ `.DS_Store` - macOS metadata
- ❌ `Thumbs.db` - Windows thumbnails

### 🚫 Logs & Temporary Files
- ❌ `*.log` - Log files (may contain sensitive data)
- ❌ `*.tmp` - Temporary files
- ❌ `.cache/` - Cache directories

### 🚫 Personal Notes
- ❌ `NOTES.md` - Personal notes
- ❌ `TODO_PRIVATE.md` - Private todos
- ❌ `CREDENTIALS.md` - Credentials file
- ❌ `SECRETS.md` - Secrets documentation

---

## ✅ Files That Are SAFE to Push

### ✅ Source Code
- ✅ `app/` - Application code
- ✅ `components/` - React components
- ✅ `lib/` - Utility functions
- ✅ `middleware.ts` - Middleware (no secrets)
- ✅ `scripts/` - Utility scripts

### ✅ Configuration (No Secrets)
- ✅ `package.json` - Dependencies list
- ✅ `tsconfig.json` - TypeScript config
- ✅ `next.config.js` - Next.js config
- ✅ `tailwind.config.ts` - Tailwind config
- ✅ `.eslintrc.json` - ESLint config
- ✅ `.gitignore` - Git ignore rules

### ✅ Documentation
- ✅ `README.md` - Project documentation
- ✅ `LICENSE` - License file
- ✅ `DEPLOYMENT.md` - Deployment guide
- ✅ `SECURITY.md` - Security documentation
- ✅ `EMAIL_SETUP_GUIDE.md` - Setup instructions

### ✅ Content
- ✅ `content/blog/*.md` - Blog posts
- ✅ `content/about.json` - About page data
- ✅ `content/goals.json` - Goals data

### ✅ Public Assets
- ✅ `public/` - Static files
- ✅ `public/assets/images/` - Images (including profile pic)

### ✅ Database Schema (No Data)
- ✅ `database/schema.sql` - Database structure only
- ✅ `database/README.md` - Database documentation

---

## 🔍 Pre-Push Security Scan

Run these commands to check for sensitive data:

### 1. Check for .env files
```bash
find . -name "*.env*" -not -name "*.example" | grep -v node_modules
```
**Expected**: Should only show `.env.example` or nothing

### 2. Check for database files
```bash
find . -name "*.db" -o -name "*.sqlite*" | grep -v node_modules
```
**Expected**: Should show nothing (all excluded)

### 3. Check for keys
```bash
find . -name "*.key" -o -name "*.pem" | grep -v node_modules
```
**Expected**: Should show nothing

### 4. Check git status
```bash
git status
```
**Expected**: Should NOT show `.env.local`, `*.db`, or `node_modules/`

### 5. Verify .gitignore is working
```bash
git check-ignore .env.local database/blog.db node_modules
```
**Expected**: All three should be listed (means they're ignored)

### 6. Search for hardcoded secrets in code
```bash
grep -r "password.*=" --include="*.ts" --include="*.tsx" --include="*.js" . | grep -v node_modules | grep -v ".next"
```
**Expected**: Should only show variable names, not actual passwords

### 7. Search for API keys
```bash
grep -r "api.*key.*=" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```
**Expected**: Should only show variable references like `process.env.API_KEY`

---

## 🛡️ What's in Your .env.local (NEVER PUSH THIS)

Your `.env.local` contains these secrets:
```env
NEXTAUTH_SECRET=<secret-key>           # ⚠️ NEVER PUSH
ADMIN_PASSWORD_HASH=<bcrypt-hash>      # ⚠️ NEVER PUSH
SMTP_PASSWORD=<email-password>         # ⚠️ NEVER PUSH
SMTP_USER=<email-address>              # ⚠️ SENSITIVE
```

---

## ✅ Final Security Checklist

Before running `git push`, verify:

- [ ] `.env.local` is NOT in `git status`
- [ ] `database/*.db` files are NOT in `git status`
- [ ] `node_modules/` is NOT in `git status`
- [ ] No `*.key` or `*.pem` files in `git status`
- [ ] `.gitignore` file is committed
- [ ] `.env.example` has placeholder values only
- [ ] No hardcoded passwords in source code
- [ ] No API keys in source code
- [ ] No personal email addresses in code (use env vars)
- [ ] Database schema is safe (no actual data)
- [ ] README doesn't contain real credentials

---

## 🚨 If You Accidentally Push Secrets

### Immediate Actions:

1. **Rotate ALL credentials immediately**
   - Change admin password
   - Generate new NEXTAUTH_SECRET
   - Change email password
   - Update all API keys

2. **Remove from Git history**
   ```bash
   # Install BFG Repo Cleaner
   brew install bfg  # or download from https://rtyley.github.io/bfg-repo-cleaner/
   
   # Remove sensitive file from history
   bfg --delete-files .env.local
   
   # Clean up
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   
   # Force push (⚠️ this rewrites history)
   git push --force
   ```

3. **Check GitHub for cached versions**
   - Go to repository settings
   - Check "Security" tab
   - Review any alerts

4. **Monitor for unauthorized access**
   - Check email for suspicious logins
   - Review admin panel access logs
   - Monitor database for unusual activity

---

## 📋 Safe Push Command Sequence

```bash
# 1. Verify .gitignore is working
git check-ignore .env.local database/blog.db

# 2. Check what will be committed
git status

# 3. Review changes
git diff

# 4. Add files (respects .gitignore)
git add .

# 5. Verify again
git status

# 6. Commit
git commit -m "Initial commit: Personal portfolio website"

# 7. Push
git push -u origin main
```

---

## 🔐 Environment Variables for Production

When deploying to Vercel/production, set these in the platform's dashboard:

```env
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-new-secret>
ADMIN_USERNAME=<your-admin-username>
ADMIN_PASSWORD_HASH=<generate-new-hash>
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email>
SMTP_PASSWORD=<your-app-password>
SMTP_FROM=<your-email>
CONTACT_EMAIL=<where-to-receive>
```

**Generate new secrets for production:**
```bash
# New NEXTAUTH_SECRET
openssl rand -base64 32

# New password hash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('new-password', 10));"
```

---

## 📞 Questions?

- **Q: Is .env.example safe to push?**
  - ✅ Yes! It contains only placeholders, no real secrets

- **Q: Can I push database/schema.sql?**
  - ✅ Yes! It's just the structure, no actual data

- **Q: What about my profile picture?**
  - ✅ Yes! Public images are safe to push

- **Q: Should I push node_modules/?**
  - ❌ No! It's huge and will be installed on the server

---

**🔒 Security is not optional. Double-check before pushing! 🔒**
