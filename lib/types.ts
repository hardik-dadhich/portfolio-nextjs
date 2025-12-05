// Blog Post Types
export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  author: string;
  summary: string;
  tags: string[];
  content: string;
  readTime: number;
  viewCount: number;
}

// Paper Types
export interface Paper {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  summary: string;
  pdfUrl?: string;
  externalUrl?: string;
}

// Goal Types
export interface Goal {
  id: number;
  text: string;
  completed: boolean;
  category?: string;
  referenceLink?: string;
  referenceLinkType?: 'youtube' | 'blog' | 'medium' | 'linkedin' | 'other';
}

// Social Link Types
export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

// Skill Category Types
export interface SkillCategory {
  category: string;
  items: string[];
}

// Work Experience Types
export interface WorkExperience {
  title: string;
  company: string;
  location: string;
  period: string;
  highlights: string[];
}

// Project Types
export interface Project {
  title: string;
  date: string;
  description: string;
  technologies: string[];
  github: string;
  category: string;
}

// About Data Types
export interface AboutData {
  name: string;
  tagline: string;
  bio: string;
  interests: string[];
  story?: string;
  photo: string;
  socialLinks: SocialLink[];
  skills?: SkillCategory[];
  workExperience?: WorkExperience[];
  projects?: Project[];
}

// Contact Form Types
export interface ContactFormData {
  name: string;
  email: string;
  message: string;
  preferredTime?: string;
}

// Admin Panel Types
export interface PaperEntry {
  id: number;
  title: string;
  authors: string;
  date: string;
  url: string;
  description: string | null;
  type: 'paper' | 'blog';
  createdAt: string;
  updatedAt: string;
}

export interface PaperFormData {
  title: string;
  authors: string;
  date: string;
  url: string;
  description?: string;
  type: 'paper' | 'blog';
}

export interface AdminUser {
  id: number;
  email: string;
  createdAt: string;
}

export interface PapersResponse {
  papers: PaperEntry[];
  total: number;
  hasMore: boolean;
}

// Weekly Reading List Types
export interface WeeklyReadEntry {
  id: number;
  title: string;
  authors: string;
  source: string | null;
  url: string;
  description: string | null;
  category: 'research' | 'article' | 'blog' | 'documentation';
  readDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyReadFormData {
  title: string;
  authors: string;
  source?: string;
  url: string;
  description?: string;
  category: 'research' | 'article' | 'blog' | 'documentation';
  readDate: string;
}

export interface WeeklyReadsResponse {
  reads: WeeklyReadEntry[];
  total: number;
  hasMore: boolean;
}
