# GitHub Preparation Guide

## Before Pushing to GitHub - Complete Checklist

This guide ensures your repository is secure and ready for public hosting on GitHub.

---

## Quick Start

Run the automated security check:

```bash
npm run security-check
```

If all checks pass, you're ready to push!

---

## Step-by-Step Preparation

### 1. Review Sensitive Files ✅

**Files that MUST NOT be committed:**
- ✅ `.env.local` - Contains secrets
- ✅ `database/blog.db` - Contains user data
- ✅ `database/*.db-shm` - Database temp files
- ✅ `database/*.db-wal` - Database write-ahead log

**Verify they're ignored:**
```bash
git check-ignore .env.local database/blog.db
```

### 2. Clean Up Personal Information ✅

**Review these files:**
- `content/about.json` - Your personal bio
- `content/goals.json` - Your goals list
- `content/blog/*.md` - Blog posts

**Remove:**
- Personal phone numbers
- Private email addresses (keep public ones)
- Home addresses
- Any sensitive personal information

### 3. Verify .gitignore ✅

Your `.gitignore` should include:
```
.env
.env.local
.env*.local
database/*.db
database/*.db-shm
database/*.db-wal
node_modules/
.next/
```

### 4. Create Environment Template ✅

Already created: `.env.example`

This file is SAFE to commit and helps others set up the project.

### 5. Run Security Checks ✅

```bash
# Automated security scan
npm run security-check

# Manual checks
git status
git diff --cached
```

### 6. Review Code for Secrets ✅

Search for potential secrets:
```bash
# Search for API keys
grep -r "API_KEY" --exclude-dir=node_modules --exclude-dir=.next

# Search for passwords
grep -r "password.*=" --exclude-dir=node_modules --exclude-dir=.next

# Search for secrets
grep -r "SECRET" --exclude-dir=node_modules --exclude-dir=.next
```

### 7. Check Dependencies ✅

```bash
# Audit for vulnerabilities
npm audit

# Fix if possible
npm audit fix
```

---

## Initialize Git Repository

If not already initialized:

```bash
cd projects/personal-blog-website

# Initialize git
git init

# Add all files (respecting .gitignore)
git add .

# Check what will be committed
git status

# Create first commit
git commit -m "Initial commit: Personal blog website"
```

---

## Create GitHub Repository

### Option 1: GitHub CLI (Recommended)

```bash
# Install GitHub CLI (if not installed)
brew install gh  # macOS
# or visit: https://cli.github.com/

# Login to GitHub
gh auth login

# Create repository
gh repo create personal-blog-website --public --source=. --remote=origin

# Push code
git push -u origin main
```

### Option 2: GitHub Web Interface

1. Go to [github.com/new](https://github.com/new)
2. Repository name: `personal-blog-website`
3. Description: "My personal blog and portfolio website built with Next.js"
4. Choose: **Public** or **Private**
5. **DO NOT** initialize with README (you already have one)
6. Click "Create repository"

7. Connect and push:
```bash
git remote add origin https://github.com/YOUR_USERNAME/personal-blog-website.git
git branch -M main
git push -u origin main
```

---

## Post-Push Verification

### 1. Check GitHub Repository

Visit: `https://github.com/YOUR_USERNAME/personal-blog-website`

**Verify:**
- [ ] No `.env` files visible
- [ ] No `database/*.db` files visible
- [ ] No `node_modules/` directory
- [ ] `.gitignore` is present
- [ ] `README.md` is displayed
- [ ] Code looks correct

### 2. Clone Test (Optional)

Test that others can clone and run:
```bash
# In a different directory
git clone https://github.com/YOUR_USERNAME/personal-blog-website.git test-clone
cd test-clone

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your values
nano .env.local

# Initialize database
npm run db:init

# Setup admin
npm run setup:admin

# Run development server
npm run dev
```

---

## README.md for GitHub

Update your `README.md` with:

```markdown
# Personal Blog Website

A modern, full-stack personal blog and portfolio website built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- 🎨 Modern, responsive design with dark mode
- 📝 Blog with markdown support
- 📚 Academic papers showcase (Papershelf)
- 🎯 Personal goals tracker
- 📧 Contact form with email integration
- 🔐 Admin panel for content management
- 🔒 Secure authentication with NextAuth.js
- 🗄️ SQLite database for data persistence

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js v5
- **Database**: SQLite (better-sqlite3)
- **Email**: Resend / SendGrid
- **Deployment**: Vercel / Hostinger VPS

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn

### Installation

1. Clone the repository:
   \`\`\`bash
   git clone https://github.com/YOUR_USERNAME/personal-blog-website.git
   cd personal-blog-website
   \`\`\`

2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Set up environment variables:
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Edit `.env.local` and add your values:
   - Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
   - Add your email service credentials

4. Initialize the database:
   \`\`\`bash
   npm run db:init
   \`\`\`

5. Create an admin user:
   \`\`\`bash
   npm run setup:admin
   \`\`\`

6. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

7. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

\`\`\`
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── admin/           # Admin panel
│   └── ...              # Pages
├── components/          # React components
├── lib/                 # Utility functions
├── content/             # Static content (JSON, MD)
├── database/            # SQLite database
├── public/              # Static assets
└── scripts/             # Utility scripts
\`\`\`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:init` - Initialize database
- `npm run setup:admin` - Create admin user
- `npm run security-check` - Run security checks

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/personal-blog-website)

## Security

- All sensitive data is stored in environment variables
- Passwords are hashed with bcrypt
- CSRF protection enabled
- Input sanitization implemented
- Rate limiting on API endpoints

See [SECURITY.md](./SECURITY.md) for more details.

## Contributing

This is a personal project, but suggestions and feedback are welcome!

## License

MIT License - feel free to use this as a template for your own blog!

## Contact

- Website: [yourdomain.com](https://yourdomain.com)
- Email: your@email.com
- GitHub: [@YOUR_USERNAME](https://github.com/YOUR_USERNAME)
\`\`\`

---

## Security Best Practices

### Never Commit:
- ❌ `.env` or `.env.local` files
- ❌ Database files (`*.db`)
- ❌ API keys or secrets
- ❌ Personal credentials
- ❌ `node_modules/`

### Always Commit:
- ✅ `.env.example` (template)
- ✅ `.gitignore`
- ✅ `database/schema.sql` (structure only)
- ✅ Source code
- ✅ Documentation

---

## Troubleshooting

### "Secrets found in git!"

If the security check fails:

1. **Don't panic!**
2. **Don't push yet!**
3. Remove the sensitive file:
   ```bash
   git rm --cached path/to/sensitive/file
   git commit -m "Remove sensitive file"
   ```
4. Add to `.gitignore`
5. Run security check again

### "Database file in git!"

```bash
git rm --cached database/blog.db
git rm --cached database/*.db-shm
git rm --cached database/*.db-wal
git commit -m "Remove database files"
```

---

## Additional Resources

- [SECURITY_CHECKLIST.md](./SECURITY_CHECKLIST.md) - Detailed security checklist
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [SECURITY.md](./SECURITY.md) - Security documentation

---

## Final Checklist Before Push

- [ ] Ran `npm run security-check` ✅
- [ ] No `.env` files in git ✅
- [ ] No database files in git ✅
- [ ] No secrets in code ✅
- [ ] `.gitignore` is correct ✅
- [ ] `README.md` is updated ✅
- [ ] Dependencies audited ✅
- [ ] Code reviewed ✅

**If all checked, you're ready to push! 🚀**

```bash
git push -u origin main
```
