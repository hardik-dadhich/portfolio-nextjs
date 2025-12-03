<<<<<<< HEAD
# portfolio-nextjs
simple blogging + Portfolio website
=======
# Personal Blog Website

A personal blogging website built with Next.js 14, React, TypeScript, and Tailwind CSS.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Build

Build the application for production:

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## Project Structure

```
personal-blog-website/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (About Me)
│   └── globals.css        # Global styles with Tailwind
├── components/            # React components
├── lib/                   # Utility functions and helpers
├── content/               # Content files
│   └── blog/             # Blog posts (markdown)
├── public/               # Static assets
│   └── images/           # Images
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── next.config.js        # Next.js configuration
```

## Technologies

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **gray-matter** - Markdown frontmatter parser
- **remark/rehype** - Markdown processing
- **nodemailer** - Email sending for contact form

## Features

- About Me page (landing page)
- Blog section with markdown posts
- Research papers showcase (Papershelf)
- Personal goals list (100 Things I Want to Do)
- Contact form
- Fully responsive design
- SEO optimized
- Performance optimized

## License

Private
>>>>>>> 03ca12c (Created nextJs setup with DB)
