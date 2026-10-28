/**
 * Mock Job Listings Data
 * Realistic project requirements across all 10 categories
 */
export const MOCK_JOBS = [
  {
    id: 'job-1',
    title: 'Senior LLM & Prompt Pipeline Engineer',
    category: 'ai-services',
    categoryName: 'AI Services',
    projectType: 'Fixed-Price',
    budgetMin: 5000,
    budgetMax: 7000,
    experienceLevel: 'Expert',
    estimatedDuration: '1 to 3 months',
    postedTime: '2 hours ago',
    postedDate: '2025-02-14',
    description: 'We are seeking an experienced machine learning engineer to architect an evaluation framework, fine-tuning pipeline, and RAG retrieval mechanism for our medical legal research assistant. The ideal candidate has deep expertise with LangChain, PyTorch, and Qdrant.',
    skills: ['Large Language Models', 'LangChain', 'Python', 'PyTorch', 'Vector Databases'],
    proposalsCount: 8,
    client: {
      name: 'Acuity Research Labs',
      location: 'San Francisco, CA, USA',
      rating: 4.9,
      reviewsCount: 19,
      totalSpent: 64000,
      verifiedPayment: true
    },
    milestones: [
      { id: 'm-1', title: 'Data Pipeline & Chunking Strategy', amount: 2000, status: 'Pending' },
      { id: 'm-2', title: 'Vector Indexing & Evaluation Benchmark', amount: 2500, status: 'Pending' },
      { id: 'm-3', title: 'Production API & Documentation', amount: 1500, status: 'Pending' }
    ]
  },
  {
    id: 'job-2',
    title: 'Full Stack React & Node.js Platform Refactor',
    category: 'development-it',
    categoryName: 'Development & IT',
    projectType: 'Hourly',
    budgetMin: 65,
    budgetMax: 85,
    experienceLevel: 'Intermediate',
    estimatedDuration: '3 to 6 months',
    postedTime: '4 hours ago',
    postedDate: '2025-02-14',
    description: 'Looking for a seasoned full-stack engineer to help migrate several critical monolith Express controllers into microservices, optimize PostgreSQL query bottlenecks, and modernize our React 18 client portal components with Tailwind CSS.',
    skills: ['React', 'Node.js', 'Express', 'PostgreSQL', 'Docker', 'Tailwind CSS'],
    proposalsCount: 14,
    client: {
      name: 'Veloce Logistics Inc.',
      location: 'Chicago, IL, USA',
      rating: 5.0,
      reviewsCount: 32,
      totalSpent: 120000,
      verifiedPayment: true
    },
    milestones: []
  },
  {
    id: 'job-3',
    title: 'B2B SaaS Design System & UI Kit in Figma',
    category: 'design-creative',
    categoryName: 'Design & Creative',
    projectType: 'Fixed-Price',
    budgetMin: 3500,
    budgetMax: 3500,
    experienceLevel: 'Expert',
    estimatedDuration: 'Less than 1 month',
    postedTime: '1 day ago',
    postedDate: '2025-02-13',
    description: 'We need a senior product designer to audit our existing web app and build a modular, accessible Figma design system with clear color tokens, typography scales, table patterns, and responsive navigation variants.',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Accessibility'],
    proposalsCount: 11,
    client: {
      name: 'OmniMetrics Corp',
      location: 'Seattle, WA, USA',
      rating: 4.8,
      reviewsCount: 12,
      totalSpent: 28000,
      verifiedPayment: true
    },
    milestones: [
      { id: 'm-4', title: 'Design Audit & Color/Type Tokens', amount: 1200, status: 'Pending' },
      { id: 'm-5', title: 'Component Library & Auto-Layout Kit', amount: 2300, status: 'Pending' }
    ]
  },
  {
    id: 'job-4',
    title: 'International Technical SEO Audit & Hreflang Configuration',
    category: 'sales-marketing',
    categoryName: 'Sales & Marketing',
    projectType: 'Fixed-Price',
    budgetMin: 2800,
    budgetMax: 2800,
    experienceLevel: 'Expert',
    estimatedDuration: 'Less than 1 month',
    postedTime: '1 day ago',
    postedDate: '2025-02-13',
    description: 'We operate a multi-language eCommerce portal and recently expanded into Spanish, French, and German markets. We need an SEO specialist to perform a crawl budget audit, fix hreflang tag conflicts, and resolve duplicate content issues.',
    skills: ['Technical SEO', 'Google Search Console', 'Hreflang', 'Semrush'],
    proposalsCount: 6,
    client: {
      name: 'Lumina Home Goods',
      location: 'London, UK',
      rating: 4.95,
      reviewsCount: 8,
      totalSpent: 15000,
      verifiedPayment: true
    },
    milestones: [
      { id: 'm-6', title: 'Site Crawl & Defect Report', amount: 1000, status: 'Pending' },
      { id: 'm-7', title: 'Implementation Verification & Validation', amount: 1800, status: 'Pending' }
    ]
  },
  {
    id: 'job-5',
    title: 'Developer Documentation & REST API Guide',
    category: 'writing-translation',
    categoryName: 'Writing & Translation',
    projectType: 'Hourly',
    budgetMin: 50,
    budgetMax: 70,
    experienceLevel: 'Intermediate',
    estimatedDuration: '1 to 3 months',
    postedTime: '2 days ago',
    postedDate: '2025-02-12',
    description: 'Looking for a technical writer who can read TypeScript backend definitions and generate comprehensive markdown guides, curl code examples, and OpenAPI schemas for our third-party payments webhook integration.',
    skills: ['Technical Writing', 'OpenAPI / Swagger', 'Markdown / MDX', 'REST APIs'],
    proposalsCount: 9,
    client: {
      name: 'PayFlow Technologies',
      location: 'Boston, MA, USA',
      rating: 4.9,
      reviewsCount: 22,
      totalSpent: 45000,
      verifiedPayment: true
    },
    milestones: []
  },
  {
    id: 'job-6',
    title: 'Customer Operations & Zendesk Help Desk Manager',
    category: 'admin-support',
    categoryName: 'Admin & Support',
    projectType: 'Hourly',
    budgetMin: 30,
    budgetMax: 45,
    experienceLevel: 'Intermediate',
    estimatedDuration: 'More than 6 months',
    postedTime: '2 days ago',
    postedDate: '2025-02-12',
    description: 'We are expanding our B2B customer support team and need an experienced administrator to build our Zendesk automation triggers, tag hierarchy, and help center macros to support 2,000+ weekly customer tickets.',
    skills: ['Customer Support', 'Zendesk', 'Workflow Automation', 'Help Center'],
    proposalsCount: 18,
    client: {
      name: 'Elevate Cloud',
      location: 'Austin, TX, USA',
      rating: 4.75,
      reviewsCount: 15,
      totalSpent: 32000,
      verifiedPayment: true
    },
    milestones: []
  },
  {
    id: 'job-7',
    title: 'Series A Financial Model & Cap Table Audit',
    category: 'finance-accounting',
    categoryName: 'Finance & Accounting',
    projectType: 'Fixed-Price',
    budgetMin: 4000,
    budgetMax: 4000,
    experienceLevel: 'Expert',
    estimatedDuration: 'Less than 1 month',
    postedTime: '3 days ago',
    postedDate: '2025-02-11',
    description: 'Pre-Series A climate tech startup seeking a CPA or experienced financial analyst to review our historical P&L, construct dynamic 5-year operating forecast models, and sanitize our Carta cap table for institutional VCs.',
    skills: ['Financial Modeling', 'SaaS Metrics', 'QuickBooks Online', 'Venture Capital'],
    proposalsCount: 5,
    client: {
      name: 'TerraVentures Inc.',
      location: 'Denver, CO, USA',
      rating: 5.0,
      reviewsCount: 6,
      totalSpent: 19000,
      verifiedPayment: true
    },
    milestones: [
      { id: 'm-8', title: 'Historical Financials Reconciliation', amount: 1500, status: 'Pending' },
      { id: 'm-9', title: '5-Year Operating Model & VC Summary', amount: 2500, status: 'Pending' }
    ]
  },
  {
    id: 'job-8',
    title: 'Master Services Agreement & SaaS Terms Review',
    category: 'legal',
    categoryName: 'Legal',
    projectType: 'Fixed-Price',
    budgetMin: 2500,
    budgetMax: 2500,
    experienceLevel: 'Expert',
    estimatedDuration: 'Less than 1 month',
    postedTime: '3 days ago',
    postedDate: '2025-02-11',
    description: 'We need a licensed technology attorney to revise our enterprise master service agreement (MSA), service level agreement (SLA), and GDPR/CCPA data processing addendum (DPA) ahead of enterprise customer renewals.',
    skills: ['Commercial Contracts', 'SaaS Agreements', 'Privacy Policies & GDPR', 'IP Protection'],
    proposalsCount: 4,
    client: {
      name: 'SyncForge Software',
      location: 'New York, NY, USA',
      rating: 4.88,
      reviewsCount: 14,
      totalSpent: 52000,
      verifiedPayment: true
    },
    milestones: [
      { id: 'm-10', title: 'MSA & SLA Revision with Redlines', amount: 1500, status: 'Pending' },
      { id: 'm-11', title: 'Final Clean Documents & Execution Formats', amount: 1000, status: 'Pending' }
    ]
  },
  {
    id: 'job-9',
    title: 'Engineering Competency Framework & Interview Rubric',
    category: 'hr-training',
    categoryName: 'HR & Training',
    projectType: 'Fixed-Price',
    budgetMin: 3000,
    budgetMax: 3000,
    experienceLevel: 'Intermediate',
    estimatedDuration: '1 to 2 months',
    postedTime: '4 days ago',
    postedDate: '2025-02-10',
    description: 'We are scaling our engineering organization from 20 to 60 developers. We need a People/HR consultant to build an engineering leveling matrix (Junior to Staff), structured interview evaluation scorecards, and salary band benchmarks.',
    skills: ['Technical Recruiting', 'Interview Rubrics', 'Compensation Benchmarking', 'Leveling Matrix'],
    proposalsCount: 7,
    client: {
      name: 'Nexis Cloud Labs',
      location: 'Toronto, Canada',
      rating: 4.95,
      reviewsCount: 11,
      totalSpent: 38000,
      verifiedPayment: true
    },
    milestones: [
      { id: 'm-12', title: 'Leveling Matrix & Expectations Guide', amount: 1500, status: 'Pending' },
      { id: 'm-13', title: 'Interview Rubrics & Interviewer Training Deck', amount: 1500, status: 'Pending' }
    ]
  },
  {
    id: 'job-10',
    title: 'Parametric BIM Revit Model for Retail Renovation',
    category: 'engineering-architecture',
    categoryName: 'Engineering & Architecture',
    projectType: 'Fixed-Price',
    budgetMin: 4200,
    budgetMax: 4200,
    experienceLevel: 'Expert',
    estimatedDuration: '1 to 2 months',
    postedTime: '5 days ago',
    postedDate: '2025-02-09',
    description: 'Need a licensed CAD/BIM engineer to convert 2D architectural DWG surveys into an LOD 300 Revit building information model for a 12,000 sq ft commercial retail remodel, including structural columns and MEP rough-in clearances.',
    skills: ['AutoCAD', 'Revit BIM', 'LOD 300', 'MEP Coordination', 'Permit Sets'],
    proposalsCount: 5,
    client: {
      name: 'Keystone Properties',
      location: 'Atlanta, GA, USA',
      rating: 5.0,
      reviewsCount: 9,
      totalSpent: 41000,
      verifiedPayment: true
    },
    milestones: [
      { id: 'm-14', title: 'Architectural Shell & Core in Revit', amount: 2200, status: 'Pending' },
      { id: 'm-15', title: 'MEP Integration & Clash Detection Report', amount: 2000, status: 'Pending' }
    ]
  }
];

export const getJobsByCategory = (categorySlug) => {
  if (!categorySlug || categorySlug === 'all') return MOCK_JOBS;
  return MOCK_JOBS.filter(j => j.category === categorySlug);
};

export const getJobById = (id) => {
  return MOCK_JOBS.find(j => j.id === id);
};
