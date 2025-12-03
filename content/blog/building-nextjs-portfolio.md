---
title: How I Built My Next.js Portfolio in Simple Steps
date: '2025-11-23'
author: Hardik Dadhich
summary: How i build this portfolio with 50% Vibe coding with my favorite LLM tool.
tags:
  - Next.js
  - TypeScript
  - Portfolio
  - Web Development
slug: building-nextjs-portfolio
---

# How I Built My Next.js Portfolio in Simple Steps

Building a personal portfolio doesn't have to be complicated. Here's how I created mine using Next.js 14, TypeScript, and SQLite in a weekend.

## Why Next.js?

I chose Next.js because it offers:
- **Server-side rendering** for better SEO
- **File-based routing** - no complex configuration
- **API routes** - backend and frontend in one project
- **Built-in optimization** for images and performance

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with better-sqlite3
- **Authentication**: NextAuth.js v5
- **Deployment**: Vercel (or any Node.js host)

## Step 1: Project Setup

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest my-portfolio --typescript --tailwind --app

# Install additional dependencies
npm install next-auth@beta better-sqlite3 zod
npm install --save-dev @types/better-sqlite3
```

## Step 2: Database Setup

I used SQLite for simplicity - no external database server needed!

### Create Database Schema

```sql
-- database/schema.sql
CREATE TABLE IF NOT EXISTS papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    authors TEXT NOT NULL,
    publication_date TEXT,
    type TEXT DEFAULT 'paper',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Database Wrapper

```typescript
// lib/db.ts
import Database from 'better-sqlite3';

const db = new Database('./database/blog.db');

export class PapersDB {
  getAllPapers() {
    return db.prepare('SELECT * FROM papers ORDER BY created_at DESC').all();
  }
  
  createPaper(data) {
    const stmt = db.prepare(`
      INSERT INTO papers (title, authors, publication_date, type)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(data.title, data.authors, data.date, data.type);
  }
}

export const papersDB = new PapersDB();
```

## Step 3: Authentication

Used NextAuth.js v5 for secure admin access:

```typescript
// lib/auth.ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const user = getUserByEmail(credentials.email);
        if (!user) return null;
        
        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );
        
        return isValid ? { id: user.id, email: user.email } : null;
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  }
});
```

## Step 4: Project Structure

```
app/
├── api/              # API routes
│   ├── papers/      # CRUD operations
│   └── contact/     # Contact form
├── admin/           # Admin panel
│   ├── login/       # Login page
│   └── dashboard/   # Content management
├── blog/            # Blog pages
├── contact/         # Contact page
└── page.tsx         # Homepage

components/          # Reusable components
lib/                # Utilities & database
content/            # Static content (JSON, MD)
database/           # SQLite database
```

## Step 5: Key Features

### 1. Dynamic Blog with Markdown

```typescript
// lib/blog.ts
import fs from 'fs';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export async function getBlogPost(slug: string) {
  const fileContents = fs.readFileSync(`content/blog/${slug}.md`, 'utf8');
  const { data, content } = matter(fileContents);
  
  const processedContent = await remark()
    .use(html)
    .process(content);
    
  return {
    ...data,
    content: processedContent.toString()
  };
}
```

### 2. Admin Panel with CRUD

Protected routes with middleware:

```typescript
// middleware.ts
export function middleware(request) {
  const isOnAdminDashboard = request.nextUrl.pathname.startsWith('/admin/dashboard');
  
  if (isOnAdminDashboard) {
    const sessionCookie = request.cookies.get('next-auth.session-token');
    if (!sessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}
```

### 3. Contact Form with Email

```typescript
// app/api/contact/route.ts
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  const data = await request.json();
  
  // Validate input
  const validated = contactSchema.parse(data);
  
  // Send email
  await sendEmail({
    to: process.env.CONTACT_EMAIL,
    subject: `Contact from ${validated.name}`,
    text: validated.message
  });
  
  return Response.json({ success: true });
}
```

## Step 6: Styling with Tailwind

Tailwind made styling fast and consistent:

```tsx
// components/BlogCard.tsx
export default function BlogCard({ post }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow p-6">
      <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
        {post.title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-4">
        {post.excerpt}
      </p>
      <Link href={`/blog/${post.slug}`} className="text-blue-600 hover:text-blue-700">
        Read more →
      </Link>
    </div>
  );
}
```

## Step 7: Dark Mode

Added dark mode with next-themes:

```tsx
// components/ThemeProvider.tsx
'use client';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system">
      {children}
    </NextThemesProvider>
  );
}
```

## Step 8: Deployment

### Option 1: Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: VPS (More Control)

```bash
# Build for production
npm run build

# Start with PM2
pm2 start npm --name "portfolio" -- start

# Setup Nginx reverse proxy
# Configure SSL with Let's Encrypt
```

## Database Considerations

**For Vercel**: SQLite won't work (serverless). Use:
- Vercel Postgres
- PlanetScale (MySQL)
- Turso (SQLite-compatible)

**For VPS**: SQLite works perfectly!

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Password Hashing**: Use bcrypt for passwords
3. **Input Validation**: Use Zod for all user inputs
4. **CSRF Protection**: NextAuth handles this
5. **Rate Limiting**: Implement on API routes

## Performance Optimizations

- Used Next.js Image component for automatic optimization
- Implemented lazy loading for components
- Added caching headers for static content
- Minimized bundle size with tree shaking

## Lessons Learned

1. **Start Simple**: Don't over-engineer from the start
2. **TypeScript is Worth It**: Catches bugs early
3. **SQLite is Great**: Perfect for small to medium projects
4. **Tailwind Speeds Development**: No context switching
5. **Next.js App Router**: Takes time to learn but powerful

## What's Next?

- Add blog search functionality
- Implement analytics
- Add RSS feed
- Create a newsletter signup
- Add more interactive elements

## Conclusion

Building a portfolio with Next.js is straightforward and rewarding. The combination of Next.js, TypeScript, and SQLite provides a solid foundation that's easy to maintain and scale.

**Total Development Time**: ~2 weekends  
**Lines of Code**: ~3,000  
**Cost**: $0 (using free tiers)

The best part? You own your content and can customize everything!

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Guide](https://next-auth.js.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Better SQLite3](https://github.com/WiseLibs/better-sqlite3)

---

**Questions?** Feel free to reach out via the contact form!

*Happy coding! 🚀*
