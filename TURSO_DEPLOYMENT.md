# Turso + Vercel Deployment Guide

Your app has been migrated to support Turso (serverless SQLite) for Vercel deployment!

## What Changed

- ✅ Added `@libsql/client` for Turso support
- ✅ Created unified database client (`lib/db-client.ts`)
- ✅ Updated all database methods to async/await
- ✅ Works with both local SQLite (dev) and Turso (production)

## Step 1: Get Turso Credentials

1. Go to https://turso.tech/app
2. Create a new database (or use existing one)
3. Click on your database
4. Copy the **Database URL** (looks like: `libsql://your-db.turso.io`)
5. Click "Create Token" and copy the **Auth Token**

## Step 2: Configure Local Environment

Add to your `.env.local`:

```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-auth-token-here
```

## Step 3: Migrate Your Data to Turso

Run the migration script to push your local SQLite data to Turso:

```bash
npm run db:migrate-turso
```

This will:
- Create the schema in Turso
- Migrate all admin users
- Migrate all papers
- Migrate blog view counts

## Step 4: Test Locally with Turso

Once you've added the Turso credentials to `.env.local`, your local dev will use Turso:

```bash
npm run dev
```

Visit http://localhost:3000/accomplishment to verify papershelf works!

## Step 5: Deploy to Vercel

### Option A: Via Vercel Dashboard

1. Go to https://vercel.com
2. Import your GitHub repository
3. Add environment variables:
   - `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
   - `NEXTAUTH_URL` (your production URL, e.g., `https://yourdomain.vercel.app`)
   - `TURSO_DATABASE_URL` (from Step 1)
   - `TURSO_AUTH_TOKEN` (from Step 1)
   - `RESEND_API_KEY` (your Resend API key)
   - `FROM_EMAIL` (your from email)
   - `CONTACT_EMAIL` (your contact email)
   - `EMAIL_SERVICE=resend`
4. Click "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
vercel env add RESEND_API_KEY
vercel env add FROM_EMAIL
vercel env add CONTACT_EMAIL
vercel env add EMAIL_SERVICE

# Deploy to production
vercel --prod
```

## Step 6: Verify Deployment

1. Visit your Vercel URL
2. Go to `/accomplishment` - papershelf should load!
3. Login to admin at `/admin/login`
4. Test creating/editing papers

## How It Works

### Development (Local)
- When `TURSO_DATABASE_URL` is **not set**: Uses local SQLite (`./database/blog.db`)
- When `TURSO_DATABASE_URL` **is set**: Uses Turso

### Production (Vercel)
- Always uses Turso (via environment variables)
- No file system access needed
- Works perfectly with serverless functions

## Troubleshooting

### "Failed to load papers" on Vercel

Check Vercel logs:
```bash
vercel logs
```

Common issues:
- Missing `TURSO_DATABASE_URL` or `TURSO_AUTH_TOKEN` in Vercel env vars
- Incorrect Turso credentials
- Database not migrated (run `npm run db:migrate-turso`)

### Local development not working

1. Check `.env.local` has correct Turso credentials
2. Try removing Turso vars to use local SQLite:
   ```bash
   # Comment out in .env.local:
   # TURSO_DATABASE_URL=
   # TURSO_AUTH_TOKEN=
   ```

### Need to re-migrate data

Just run the migration script again:
```bash
npm run db:migrate-turso
```

It uses `INSERT OR REPLACE` so it's safe to run multiple times.

## Database Management

### View Turso Database

Use the Turso CLI:
```bash
# Install Turso CLI
brew install tursodatabase/tap/turso  # macOS
# or
curl -sSfL https://get.tur.so/install.sh | bash  # Linux

# Login
turso auth login

# List databases
turso db list

# Connect to your database
turso db shell your-database-name

# Run SQL queries
SELECT * FROM papers;
```

### Backup Turso Database

Turso automatically backs up your data. You can also export:

```bash
turso db shell your-database-name .dump > backup.sql
```

## Cost

Turso Free Tier:
- ✅ 9 GB total storage
- ✅ 500 databases
- ✅ 1 billion row reads/month
- ✅ 25 million row writes/month

Perfect for personal blogs!

## Need Help?

- Turso Docs: https://docs.turso.tech
- Vercel Docs: https://vercel.com/docs
- Check Vercel deployment logs for errors
