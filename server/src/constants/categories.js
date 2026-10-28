/**
 * Central Marketplace Categories Configuration
 * 10 Core Professional Categories
 */
export const MARKETPLACE_CATEGORIES = [
  {
    id: 'ai-services',
    slug: 'ai-services',
    title: 'AI Services',
    iconName: 'Bot',
    description: 'Machine learning, custom GPTs, AI agent engineering, LLM integration, and automation.',
    skills: ['Large Language Models', 'PyTorch', 'Prompt Engineering', 'LangChain', 'Computer Vision']
  },
  {
    id: 'development-it',
    slug: 'development-it',
    title: 'Development & IT',
    iconName: 'Code',
    description: 'Full-stack web, mobile apps, DevOps, cloud architecture, and database engineering.',
    skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker', 'PostgreSQL', 'TypeScript']
  },
  {
    id: 'design-creative',
    slug: 'design-creative',
    title: 'Design & Creative',
    iconName: 'Palette',
    description: 'UI/UX product design, brand identity, graphic design, illustration, and 3D modeling.',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Brand Strategy', 'Adobe Creative Suite']
  },
  {
    id: 'sales-marketing',
    slug: 'sales-marketing',
    title: 'Sales & Marketing',
    iconName: 'TrendingUp',
    description: 'Performance marketing, SEO/SEM, email campaigns, growth marketing, and social media.',
    skills: ['Search Engine Optimization', 'Google Ads', 'Content Strategy', 'CRM', 'Copywriting']
  },
  {
    id: 'writing-translation',
    slug: 'writing-translation',
    title: 'Writing & Translation',
    iconName: 'FileText',
    description: 'Technical writing, content creation, copywriting, editing, localization, and translation.',
    skills: ['Technical Documentation', 'Copywriting', 'Localization', 'Proofreading', 'SEO Articles']
  },
  {
    id: 'admin-support',
    slug: 'admin-support',
    title: 'Admin & Support',
    iconName: 'Headphones',
    description: 'Virtual assistance, customer operations, data entry, research, and project support.',
    skills: ['Customer Support', 'Virtual Assistance', 'Data Management', 'Zendesk', 'Schedule Coordination']
  },
  {
    id: 'finance-accounting',
    slug: 'finance-accounting',
    title: 'Finance & Accounting',
    iconName: 'DollarSign',
    description: 'Bookkeeping, financial modeling, tax advisory, audit preparation, and payroll operations.',
    skills: ['Financial Analysis', 'QuickBooks', 'Tax Preparation', 'Valuation Modeling', 'Forecasting']
  },
  {
    id: 'legal',
    slug: 'legal',
    title: 'Legal',
    iconName: 'Scale',
    description: 'Contract drafting, intellectual property, corporate compliance, and legal consulting.',
    skills: ['Commercial Contracts', 'Privacy Policy & GDPR', 'IP Protection', 'Compliance', 'Terms of Service']
  },
  {
    id: 'hr-training',
    slug: 'hr-training',
    title: 'HR & Training',
    iconName: 'Users',
    description: 'Talent recruitment, corporate coaching, HR policy, onboarding frameworks, and L&D.',
    skills: ['Technical Recruiting', 'Employee Onboarding', 'Leadership Coaching', 'HR Policy', 'Performance Systems']
  },
  {
    id: 'engineering-architecture',
    slug: 'engineering-architecture',
    title: 'Engineering & Architecture',
    iconName: 'DraftingCompass',
    description: 'CAD drafting, structural analysis, electrical engineering, BIM, and architectural planning.',
    skills: ['AutoCAD', 'Revit', 'BIM Modeling', 'Mechanical Engineering', 'Structural Analysis']
  }
];

export const CATEGORY_SLUGS = MARKETPLACE_CATEGORIES.map(c => c.slug);
