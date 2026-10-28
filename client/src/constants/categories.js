import {
  Bot,
  Code,
  Palette,
  TrendingUp,
  FileText,
  Headphones,
  DollarSign,
  Scale,
  Users,
  Compass
} from 'lucide-react';

/**
 * 10 Core Marketplace Service Categories
 * Featuring thin green line Lucide icons, slug, title, and clear description
 */
export const MARKETPLACE_CATEGORIES = [
  {
    id: 'ai-services',
    slug: 'ai-services',
    title: 'AI Services',
    icon: Bot,
    description: 'Custom AI agents, LLM integrations, fine-tuning, and machine learning pipelines.',
    sampleSkills: ['Large Language Models', 'PyTorch', 'Prompt Engineering', 'LangChain'],
    jobCount: '1,420+ jobs'
  },
  {
    id: 'development-it',
    slug: 'development-it',
    title: 'Development & IT',
    icon: Code,
    description: 'Full-stack web applications, mobile engineering, cloud infrastructure, and APIs.',
    sampleSkills: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL'],
    jobCount: '3,850+ jobs'
  },
  {
    id: 'design-creative',
    slug: 'design-creative',
    title: 'Design & Creative',
    icon: Palette,
    description: 'UI/UX design systems, brand identities, motion graphics, and product prototyping.',
    sampleSkills: ['Figma', 'Product Design', 'Brand Identity', '3D Design'],
    jobCount: '2,180+ jobs'
  },
  {
    id: 'sales-marketing',
    slug: 'sales-marketing',
    title: 'Sales & Marketing',
    icon: TrendingUp,
    description: 'Performance marketing, SEO growth, conversion optimization, and social campaigns.',
    sampleSkills: ['SEO', 'Google Ads', 'Content Strategy', 'Growth Marketing'],
    jobCount: '1,640+ jobs'
  },
  {
    id: 'writing-translation',
    slug: 'writing-translation',
    title: 'Writing & Translation',
    icon: FileText,
    description: 'Technical documentation, copywriting, editorial translation, and brand messaging.',
    sampleSkills: ['Technical Writing', 'Copywriting', 'Localization', 'Proofreading'],
    jobCount: '1,210+ jobs'
  },
  {
    id: 'admin-support',
    slug: 'admin-support',
    title: 'Admin & Support',
    icon: Headphones,
    description: 'Executive virtual assistance, customer operations, data transcription, and research.',
    sampleSkills: ['Customer Support', 'Virtual Assistance', 'Data Entry', 'CRM Management'],
    jobCount: '980+ jobs'
  },
  {
    id: 'finance-accounting',
    slug: 'finance-accounting',
    title: 'Finance & Accounting',
    icon: DollarSign,
    description: 'Financial forecasting, corporate tax, bookkeeping, and venture modeling.',
    sampleSkills: ['Financial Modeling', 'QuickBooks', 'Tax Strategy', 'Audit Support'],
    jobCount: '740+ jobs'
  },
  {
    id: 'legal',
    slug: 'legal',
    title: 'Legal',
    icon: Scale,
    description: 'Commercial contract drafting, IP protection, corporate compliance, and advisory.',
    sampleSkills: ['Contract Review', 'Privacy & GDPR', 'IP Protection', 'Compliance'],
    jobCount: '520+ jobs'
  },
  {
    id: 'hr-training',
    slug: 'hr-training',
    title: 'HR & Training',
    icon: Users,
    description: 'Technical talent acquisition, leadership coaching, HR policy, and onboarding.',
    sampleSkills: ['Talent Sourcing', 'Leadership Coaching', 'HR Frameworks', 'L&D'],
    jobCount: '460+ jobs'
  },
  {
    id: 'engineering-architecture',
    slug: 'engineering-architecture',
    title: 'Engineering & Architecture',
    icon: Compass,
    description: 'CAD drafting, structural calculations, BIM modeling, and mechanical engineering.',
    sampleSkills: ['AutoCAD', 'Revit BIM', 'Structural Engineering', '3D Modeling'],
    jobCount: '630+ jobs'
  }
];

export const CATEGORY_MAP = MARKETPLACE_CATEGORIES.reduce((acc, cat) => {
  acc[cat.slug] = cat;
  return acc;
}, {});
