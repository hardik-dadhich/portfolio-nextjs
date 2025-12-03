# GitHub Push Guide

## ✅ Repository Configured

Your local repository is now configured to push to:
**https://github.com/hardik-dadhich/portfolio-nextjs.git**

## 📋 Next Steps (Manual)

### 1. Review Files to Commit

Check what will be committed:
```bash
git status
```

### 2. Add All Files

Add all files to staging:
```bash
git add .
```

Or add specific files:
```bash
git add README.md
git add app/
git add components/
# etc...
```

### 3. Commit Your Changes

Create your first commit:
```bash
git commit -m "Initial commit: Personal portfolio and blog website

- Next.js 14 with TypeScript
- Blog system with view tracking
- Admin panel with authentication
- Contact form with email integration
- Dark/light mode theme
- Responsive design
- SEO optimized"
```

### 4. Push to GitHub

Push to the main branch:
```bash
git push -u origin main
```

If the repository already has content and you get an error, you may need to force push (⚠️ this will overwrite remote):
```bash
git push -u origin main --force
```

Or merge with existing content:
```bash
git pull origin main --allow-unrelated-histories
git push -u origin main
```

### 5. Verify on GitHub

Go to https://github.com/hardik-dadhich/portfolio-nextjs and verify your code is there.

---

## 🚀 Deploy to Vercel (After Pushing to GitHub)

### Option 1: Via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import from GitHub: `hardik-dadhich/portfolio-nextjs`
4. Configure environment variables:
   - `NEXTAUTH_URL` = `https://your-domain.vercel.app`
   - `NEXTAUTH_SECRET` = (generate with: `openssl rand -base64 32`)
   - `ADMIN_USERNAME` = your admin username
   - `ADMIN_PASSWORD_HASH` = your bcrypt hash
   - `SMTP_HOST` = smtp.gmail.com
   - `SMTP_PORT` = 587
   - `SMTP_USER` = your email
   - `SMTP_PASSWORD` = your app password
   - `SMTP_FROM` = your email
   - `CONTACT_EMAIL` = where to receive messages
5. Click "Deploy"
6. Wait 2-3 minutes
7. Your site is live! 🎉

### Option 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow the prompts
# Add environment variables when prompted
```

---

## 📝 Important Notes

### Files NOT Committed (in .gitignore)

These files are excluded from Git:
- `.env.local` - Your local environment variables (KEEP SECRET!)
- `node_modules/` - Dependencies (will be installed on server)
- `.next/` - Build output (generated on deployment)
- `database/*.db` - Local database (use production DB on server)

### Security Checklist Before Pushing

- [ ] `.env.local` is in `.gitignore` ✅
- [ ] No sensitive data in code ✅
- [ ] `.gitignore` is properly configured ✅
- [ ] README.md is updated ✅
- [ ] LICENSE file is included ✅

---

## 🔄 Future Updates

After your initial push, to update your code:

```bash
# Make your changes
# ...

# Check what changed
git status

# Add changes
git add .

# Commit with a message
git commit -m "Description of your changes"

# Push to GitHub
git push

# Vercel will automatically deploy the changes!
```

---

## 🆘 Troubleshooting

### Error: "remote: Repository not found"
**Solution**: Check your GitHub repository exists and you have access

### Error: "failed to push some refs"
**Solution**: Pull first, then push:
```bash
git pull origin main --rebase
git push origin main
```

### Error: "Authentication failed"
**Solution**: 
- Use GitHub Personal Access Token instead of password
- Or set up SSH keys

### Large Files Warning
**Solution**: 
- Check `.gitignore` includes `node_modules/`
- Remove any large files from staging

---

## 📞 Need Help?

- GitHub Docs: https://docs.github.com
- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment

---

**Ready to push? Run the commands above! 🚀**
