# Deployment Guide for Personal Blog Website

## Overview
This guide covers deploying your Next.js personal blog to production hosting (Hostinger VPS or Vercel).

---

## Pre-Deployment Checklist

### 1. Environment Variables
Create a `.env.production` file with production values:

```bash
# NextAuth Configuration
NEXTAUTH_SECRET=<generate-new-secret-for-production>
NEXTAUTH_URL=https://yourdomain.com

# Email Service Configuration
EMAIL_SERVICE=resend  # or sendgrid
RESEND_API_KEY=your_production_api_key
FROM_EMAIL=noreply@yourdomain.com
CONTACT_EMAIL=your@email.com

# Database Configuration (for production)
DATABASE_URL=/var/www/html/database/blog.db  # Adjust path for your server
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. Database Migration Strategy

#### Current Setup:
- SQLite database at `./database/blog.db`
- Contains: admin users, papers/blogs

#### Migration Options:

**Option A: Keep SQLite (Simple)**
- Upload your local `database/blog.db` to the server
- Ensure proper file permissions (readable/writable by Node.js process)
- Set correct `DATABASE_URL` path in production

**Option B: Migrate to MySQL (Recommended for Production)**
- Hostinger provides MySQL databases
- Better for concurrent access and scalability
- Requires code changes to use MySQL instead of SQLite

---

## Deployment Option 1: Vercel (Recommended)

### Why Vercel?
- Built specifically for Next.js
- Automatic deployments from Git
- Free SSL certificates
- Global CDN
- Serverless functions
- Zero configuration

### Steps:

1. **Push to GitHub**
   ```bash
   cd projects/personal-blog-website
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import your repository
   - Configure environment variables
   - Click "Deploy"

3. **Database Considerations for Vercel**
   - SQLite won't work on Vercel (serverless environment)
   - Options:
     - Use Vercel Postgres (recommended)
     - Use PlanetScale (MySQL)
     - Use Supabase (PostgreSQL)
     - Use Turso (SQLite-compatible, serverless)

---

## Deployment Option 2: Hostinger VPS

### Prerequisites:
- Hostinger VPS or Cloud Hosting plan
- SSH access to your server
- Domain name configured

### Step 1: Server Setup

1. **Connect via SSH**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install Node.js (v20.x)**
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   node --version  # Verify installation
   ```

3. **Install PM2 (Process Manager)**
   ```bash
   sudo npm install -g pm2
   ```

4. **Install Nginx (Reverse Proxy)**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

### Step 2: Upload Your Application

1. **Create application directory**
   ```bash
   sudo mkdir -p /var/www/personal-blog
   sudo chown -R $USER:$USER /var/www/personal-blog
   ```

2. **Upload files (from your local machine)**
   ```bash
   # Option A: Using rsync
   rsync -avz --exclude 'node_modules' --exclude '.next' \
     projects/personal-blog-website/ \
     root@your-server-ip:/var/www/personal-blog/

   # Option B: Using Git
   # On server:
   cd /var/www/personal-blog
   git clone https://github.com/yourusername/your-repo.git .
   ```

3. **Install dependencies on server**
   ```bash
   cd /var/www/personal-blog
   npm install --production
   ```

4. **Build the application**
   ```bash
   npm run build
   ```

### Step 3: Database Migration

#### Option A: Upload SQLite Database

1. **Create database directory on server**
   ```bash
   mkdir -p /var/www/personal-blog/database
   ```

2. **Upload your local database**
   ```bash
   # From your local machine
   scp projects/personal-blog-website/database/blog.db \
     root@your-server-ip:/var/www/personal-blog/database/
   ```

3. **Set permissions**
   ```bash
   # On server
   chmod 644 /var/www/personal-blog/database/blog.db
   chown www-data:www-data /var/www/personal-blog/database/blog.db
   ```

4. **Update DATABASE_URL in .env.production**
   ```bash
   DATABASE_URL=/var/www/personal-blog/database/blog.db
   ```

#### Option B: Migrate to MySQL (Recommended)

1. **Export SQLite data**
   ```bash
   # On your local machine
   sqlite3 projects/personal-blog-website/database/blog.db .dump > backup.sql
   ```

2. **Create MySQL database in Hostinger**
   - Log into Hostinger control panel
   - Create new MySQL database
   - Note: database name, username, password, host

3. **Convert SQLite schema to MySQL**
   - Modify `scripts/init-db.ts` to use MySQL
   - Update `lib/db.ts` to use `mysql2` instead of `better-sqlite3`

4. **Update dependencies**
   ```bash
   npm uninstall better-sqlite3
   npm install mysql2
   ```

### Step 4: Configure Environment Variables

```bash
# On server
cd /var/www/personal-blog
nano .env.production
```

Add all production environment variables (see Pre-Deployment Checklist above).

### Step 5: Start Application with PM2

```bash
# Start the application
pm2 start npm --name "personal-blog" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Step 6: Configure Nginx

1. **Create Nginx configuration**
   ```bash
   sudo nano /etc/nginx/sites-available/personal-blog
   ```

2. **Add configuration**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

3. **Enable site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/personal-blog /etc/nginx/sites-enabled/
   sudo nginx -t  # Test configuration
   sudo systemctl restart nginx
   ```

### Step 7: Setup SSL Certificate (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
```

---

## Database Backup Strategy

### Automated Backups

Create a backup script:

```bash
# /var/www/personal-blog/scripts/backup-db.sh
#!/bin/bash

BACKUP_DIR="/var/www/personal-blog/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/var/www/personal-blog/database/blog.db"

mkdir -p $BACKUP_DIR

# Create backup
cp $DB_PATH $BACKUP_DIR/blog_backup_$DATE.db

# Keep only last 7 days of backups
find $BACKUP_DIR -name "blog_backup_*.db" -mtime +7 -delete

echo "Backup completed: blog_backup_$DATE.db"
```

Make it executable and add to cron:
```bash
chmod +x /var/www/personal-blog/scripts/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add line:
0 2 * * * /var/www/personal-blog/scripts/backup-db.sh
```

---

## Post-Deployment

### 1. Test Your Site
- Visit https://yourdomain.com
- Test all pages and functionality
- Test admin login
- Test blog/paper creation
- Test contact form

### 2. Monitor Application
```bash
# View logs
pm2 logs personal-blog

# Monitor status
pm2 status

# Restart if needed
pm2 restart personal-blog
```

### 3. Setup Monitoring
- Use PM2 Plus for monitoring (optional)
- Setup uptime monitoring (UptimeRobot, etc.)
- Configure error logging

---

## Updating Your Site

### Method 1: Git Pull
```bash
cd /var/www/personal-blog
git pull origin main
npm install
npm run build
pm2 restart personal-blog
```

### Method 2: Manual Upload
```bash
# From local machine
rsync -avz --exclude 'node_modules' --exclude '.next' \
  projects/personal-blog-website/ \
  root@your-server-ip:/var/www/personal-blog/

# On server
cd /var/www/personal-blog
npm install
npm run build
pm2 restart personal-blog
```

---

## Troubleshooting

### Application won't start
```bash
# Check logs
pm2 logs personal-blog

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart personal-blog
```

### Database permission errors
```bash
# Fix permissions
sudo chown -R www-data:www-data /var/www/personal-blog/database
sudo chmod 755 /var/www/personal-blog/database
sudo chmod 644 /var/www/personal-blog/database/blog.db
```

### Nginx errors
```bash
# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

---

## Performance Optimization

1. **Enable Gzip in Nginx**
   ```nginx
   gzip on;
   gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   ```

2. **Setup Caching**
   - Configure Next.js caching headers
   - Use Nginx caching for static assets

3. **Database Optimization**
   - Regular VACUUM for SQLite
   - Add indexes for frequently queried fields

---

## Security Checklist

- [ ] Change default SSH port
- [ ] Setup firewall (UFW)
- [ ] Disable root SSH login
- [ ] Keep system updated
- [ ] Use strong passwords
- [ ] Enable fail2ban
- [ ] Regular backups
- [ ] Monitor logs
- [ ] Keep Node.js and dependencies updated

---

## Cost Estimate

### Vercel (Recommended)
- **Free tier**: Sufficient for personal blog
- **Pro tier**: $20/month (if needed)

### Hostinger VPS
- **VPS 1**: ~$4-8/month
- **VPS 2**: ~$8-15/month (recommended)
- **Cloud Hosting**: ~$10-20/month

---

## Support Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Hostinger Knowledge Base](https://support.hostinger.com)
- [PM2 Documentation](https://pm2.keymetrics.io/docs)
- [Nginx Documentation](https://nginx.org/en/docs/)
