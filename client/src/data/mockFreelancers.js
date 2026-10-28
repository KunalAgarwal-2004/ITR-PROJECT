/**
 * Mock Freelancer Directory Data
 * Note: These are simulated professional profiles for demonstration and testing.
 */
export const MOCK_FREELANCERS = [
  {
    id: 'fl-1',
    name: 'Elena Rostova',
    title: 'Senior AI Engineer & LLM Specialist',
    category: 'ai-services',
    categoryName: 'AI Services',
    hourlyRate: 95,
    rating: 4.95,
    reviewsCount: 38,
    totalJobsCompleted: 44,
    availability: 'Available Now',
    location: 'Berlin, Germany',
    avatarInitials: 'ER',
    bio: '8+ years architecting scalable machine learning pipelines, RAG systems, and production LLM integrations for FinTech and Healthcare platforms.',
    overview: 'I help tech companies integrate state-of-the-art AI into their software. From fine-tuning Llama-3 models to building enterprise knowledge-retrieval systems using LangChain, pgvector, and PyTorch. Previously Senior ML Engineer at Datamind Labs.',
    skills: ['Large Language Models', 'LangChain', 'Python', 'PyTorch', 'Vector Databases', 'Prompt Engineering', 'FastAPI'],
    languages: ['English (Fluent)', 'German (Conversational)'],
    education: 'M.S. in Computer Science, Technical University of Munich',
    portfolio: [
      {
        id: 'port-1',
        title: 'Enterprise Document Q&A Engine',
        description: 'Multi-tenant RAG platform indexing 500k+ legal filings with sub-second hybrid semantic search and strict citation tracing.',
        skills: ['LangChain', 'Python', 'Qdrant']
      },
      {
        id: 'port-2',
        title: 'Automated Financial Report Summarizer',
        description: 'Fine-tuned LLM pipeline extracting key balance sheet ratios and summarization into structured JSON schemas.',
        skills: ['PyTorch', 'FastAPI', 'Hugging Face']
      }
    ],
    workHistory: [
      {
        id: 'wh-1',
        jobTitle: 'LLM Agent Pipeline Implementation',
        clientName: 'Novus Analytics Inc.',
        rating: 5.0,
        feedback: 'Elena delivered extraordinary work on our LLM pipeline. Her knowledge of prompt engineering and vector caching saved us weeks of latency testing.',
        date: 'October 2024',
        budget: '$8,200',
        projectType: 'Fixed-Price'
      },
      {
        id: 'wh-2',
        jobTitle: 'RAG Architecture Consultation & Setup',
        clientName: 'ScaleBridge Health',
        rating: 4.9,
        feedback: 'Highly reliable and deeply technical. Addressed our HIPAA compliance requirements for vector data seamlessly.',
        date: 'August 2024',
        budget: '$4,500',
        projectType: 'Fixed-Price'
      }
    ]
  },
  {
    id: 'fl-2',
    name: 'Marcus Vance',
    title: 'Principal Full Stack React & Node Architect',
    category: 'development-it',
    categoryName: 'Development & IT',
    hourlyRate: 85,
    rating: 5.0,
    reviewsCount: 54,
    totalJobsCompleted: 62,
    availability: 'Available Now',
    location: 'Austin, TX, USA',
    avatarInitials: 'MV',
    bio: 'Full-stack software architect specializing in scalable React 18 frontends, Node/Express microservices, TypeScript, and high-throughput PostgreSQL databases.',
    overview: 'With over a decade building web applications, I specialize in transforming complex business workflows into fast, accessible, and clean software. I emphasize clean architecture, comprehensive test coverage, and strict performance metrics.',
    skills: ['React', 'Node.js', 'Express', 'TypeScript', 'PostgreSQL', 'Docker', 'AWS', 'GraphQL'],
    languages: ['English (Native)'],
    education: 'B.S. in Software Engineering, UT Austin',
    portfolio: [
      {
        id: 'port-3',
        title: 'Real-Time Inventory Trading Platform',
        description: 'High-volume trading dashboard processing 12,000 updates/sec with WebSockets, React, and Redis cache clusters.',
        skills: ['React', 'WebSockets', 'Redis', 'Node.js']
      },
      {
        id: 'port-4',
        title: 'HIPAA Compliant Telehealth Portal',
        description: 'Video consultation and medical records management portal with end-to-end encryption.',
        skills: ['TypeScript', 'Express', 'Docker']
      }
    ],
    workHistory: [
      {
        id: 'wh-3',
        jobTitle: 'React & Node.js Platform Refactor',
        clientName: 'OmniFlow SaaS',
        rating: 5.0,
        feedback: 'Marcus is easily one of the best full-stack engineers we have hired. He diagnosed bottleneck queries in our PostgreSQL database and improved page load times by 65%.',
        date: 'November 2024',
        budget: '$14,500',
        projectType: 'Hourly'
      }
    ]
  },
  {
    id: 'fl-3',
    name: 'Sofia Chen',
    title: 'Staff Product & UI/UX Designer',
    category: 'design-creative',
    categoryName: 'Design & Creative',
    hourlyRate: 90,
    rating: 4.98,
    reviewsCount: 42,
    totalJobsCompleted: 48,
    availability: 'Part-time Available',
    location: 'Toronto, Canada',
    avatarInitials: 'SC',
    bio: 'Crafting thoughtful B2B SaaS design systems, accessible design tokens, desktop applications, and user journeys that drive measurable conversions.',
    overview: 'I partner directly with founders and product teams to turn ambiguous requirements into polished, production-ready Figma design systems. My work focuses on simplicity, typographic hierarchy, and WCAG AAA compliance.',
    skills: ['Figma', 'UI/UX Design', 'Design Systems', 'Prototyping', 'User Research', 'Information Architecture'],
    languages: ['English (Fluent)', 'Mandarin (Native)'],
    education: 'B.Des. in Interaction Design, OCAD University',
    portfolio: [
      {
        id: 'port-5',
        title: 'Aurora Design System (500+ Components)',
        description: 'Multi-brand Figma library with tokenized themes, auto-layout 5.0 specifications, and documentation.',
        skills: ['Figma', 'Design Systems', 'Accessibility']
      }
    ],
    workHistory: [
      {
        id: 'wh-4',
        jobTitle: 'Enterprise Analytics Redesign',
        clientName: 'Veloce Data',
        rating: 5.0,
        feedback: 'Sofia has a brilliant eye for information density and typographic balance. Our users immediately praised the new dashboard clarity.',
        date: 'September 2024',
        budget: '$6,800',
        projectType: 'Fixed-Price'
      }
    ]
  },
  {
    id: 'fl-4',
    name: 'David Okafor',
    title: 'Growth Marketing & Performance SEO Lead',
    category: 'sales-marketing',
    categoryName: 'Sales & Marketing',
    hourlyRate: 75,
    rating: 4.92,
    reviewsCount: 31,
    totalJobsCompleted: 35,
    availability: 'Available Now',
    location: 'London, UK',
    avatarInitials: 'DO',
    bio: 'Driving organic search dominance, technical SEO audits, Google Ads ROAS optimization, and high-converting acquisition funnels for B2B and D2C.',
    overview: 'Proven track record scaling organic traffic from zero to 250k monthly visits. I combine technical site health, programmatic keyword strategies, and data-backed CRO experiments.',
    skills: ['SEO Strategy', 'Google Ads', 'Content Strategy', 'CRO', 'Google Analytics 4', 'Semrush'],
    languages: ['English (Native)'],
    education: 'B.A. in Marketing & Communications, King’s College London',
    portfolio: [
      {
        id: 'port-6',
        title: 'International SEO Migration for Fintech SaaS',
        description: 'Migrated 1,200 URLs to localized subdirectories with zero loss in search equity and 40% uptick in non-brand rankings.',
        skills: ['Technical SEO', 'Hreflang', 'GA4']
      }
    ],
    workHistory: [
      {
        id: 'wh-5',
        jobTitle: 'SEO Architecture & Core Web Vitals Audit',
        clientName: 'FinPulse Media',
        rating: 4.9,
        feedback: 'Super tactical, data-driven, and prompt. David provided a step-by-step engineering roadmap that solved all our indexing blocks.',
        date: 'October 2024',
        budget: '$3,800',
        projectType: 'Fixed-Price'
      }
    ]
  },
  {
    id: 'fl-5',
    name: 'Claire Beauchamp',
    title: 'Technical Writer & Developer Documentation Lead',
    category: 'writing-translation',
    categoryName: 'Writing & Translation',
    hourlyRate: 70,
    rating: 4.97,
    reviewsCount: 29,
    totalJobsCompleted: 34,
    availability: 'Available Now',
    location: 'Montreal, Canada',
    avatarInitials: 'CB',
    bio: 'Bridging complex software engineering concepts and clear developer documentation. OpenAPI specs, SDK guides, and architectural whitepapers.',
    overview: 'I write technical content developers actually enjoy reading. From generating Stripe-grade REST API references to authored whitepapers on distributed systems.',
    skills: ['Technical Documentation', 'OpenAPI / Swagger', 'Markdown / MDX', 'API Reference', 'Developer Portals'],
    languages: ['English (Native)', 'French (Bilingual)'],
    education: 'B.S. in Computer Science & English, McGill University',
    portfolio: [
      {
        id: 'port-7',
        title: 'Developer Portal Documentation Overhaul',
        description: 'Restructured SDK guides and interactive API references for a Series B payment gateway.',
        skills: ['OpenAPI', 'Nextra', 'Technical Writing']
      }
    ],
    workHistory: [
      {
        id: 'wh-6',
        jobTitle: 'Cloud SDK Quickstart & Migration Guide',
        clientName: 'CloudVertex',
        rating: 5.0,
        feedback: 'Exceptional technical clarity. Claire tested our code snippets herself and uncovered two undocumented edge cases before publishing.',
        date: 'August 2024',
        budget: '$4,200',
        projectType: 'Fixed-Price'
      }
    ]
  },
  {
    id: 'fl-6',
    name: 'Arjun Patel',
    title: 'Customer Operations & Executive Virtual Director',
    category: 'admin-support',
    categoryName: 'Admin & Support',
    hourlyRate: 45,
    rating: 4.94,
    reviewsCount: 47,
    totalJobsCompleted: 53,
    availability: 'Available Now',
    location: 'Bengaluru, India',
    avatarInitials: 'AP',
    bio: 'Specialist in 24/7 customer support team setup, Zendesk/Intercom automation, executive calendar coordination, and workflow SOP design.',
    overview: 'I manage operational bandwidth for busy founders and growing service companies. Expert in designing support ticket workflows, managing CRMs, and overseeing asynchronous remote teams.',
    skills: ['Customer Support', 'Zendesk', 'Intercom', 'Workflow Automation', 'Executive Assistance', 'Notion SOPs'],
    languages: ['English (Fluent)', 'Hindi (Native)'],
    education: 'B.Com., University of Delhi',
    portfolio: [
      {
        id: 'port-8',
        title: 'Tier-1 Support Automation Framework',
        description: 'Designed macro hierarchy and AI triage reducing average response time from 4h to 12 minutes.',
        skills: ['Zendesk', 'Macros', 'Help Center']
      }
    ],
    workHistory: [
      {
        id: 'wh-7',
        jobTitle: 'Customer Operations Manager for Launch',
        clientName: 'KiteHQ',
        rating: 4.9,
        feedback: 'Arjun handled our product launch support flawlessly. Calm, organized, and meticulous with communication.',
        date: 'July 2024',
        budget: '$3,100',
        projectType: 'Hourly'
      }
    ]
  },
  {
    id: 'fl-7',
    name: 'Rebecca Sterling, CPA',
    title: 'Fractional CFO & Venture Financial Modeler',
    category: 'finance-accounting',
    categoryName: 'Finance & Accounting',
    hourlyRate: 110,
    rating: 5.0,
    reviewsCount: 36,
    totalJobsCompleted: 39,
    availability: 'Part-time Available',
    location: 'Chicago, IL, USA',
    avatarInitials: 'RS',
    bio: '12+ years preparing dynamic 3-statement financial models, SaaS cohort retention metrics, cap table structuring, and audit-ready books.',
    overview: 'Former Big 4 auditor turned fractional CFO for early-stage and growth startups. I help leadership teams forecast cash runway, prepare for Series A/B fundraising, and streamline monthly accounting.',
    skills: ['Financial Modeling', 'SaaS Metrics', 'QuickBooks Online', 'Venture Capital Due Diligence', 'Cap Table Management'],
    languages: ['English (Native)'],
    education: 'M.S. in Accountancy, University of Illinois Urbana-Champaign; Certified Public Accountant (CPA)',
    portfolio: [
      {
        id: 'port-9',
        title: 'Series A Financial Operating Model',
        description: 'Comprehensive 5-year forecast with customizable hiring plan, marketing CAC curves, and unit economics.',
        skills: ['Financial Modeling', 'Excel', 'Cap Table']
      }
    ],
    workHistory: [
      {
        id: 'wh-8',
        jobTitle: 'Fundraising Deck Financial Projections',
        clientName: 'Prism Health Tech',
        rating: 5.0,
        feedback: 'Rebecca built an institutional-grade financial model that impressed our lead investors during due diligence. Worth every dollar.',
        date: 'September 2024',
        budget: '$5,500',
        projectType: 'Fixed-Price'
      }
    ]
  },
  {
    id: 'fl-8',
    name: 'Jonathan Meyer, Esq.',
    title: 'Technology Transactions & Corporate Legal Counsel',
    category: 'legal',
    categoryName: 'Legal',
    hourlyRate: 135,
    rating: 4.96,
    reviewsCount: 27,
    totalJobsCompleted: 30,
    availability: 'Available Now',
    location: 'New York, NY, USA',
    avatarInitials: 'JM',
    bio: 'Specialist in commercial SaaS agreements, master service contracts (MSA), GDPR/CCPA data processing addendums, and software licensing.',
    overview: 'Practicing attorney focusing on contracts and regulatory compliance for internet businesses. I draft protective, balanced agreements designed to close enterprise procurement without months of redlines.',
    skills: ['Commercial Contracts', 'SaaS Agreements', 'Privacy Policies & GDPR', 'IP Protection', 'Software Licensing'],
    languages: ['English (Native)'],
    education: 'J.D., Columbia Law School; Member, New York State Bar',
    portfolio: [
      {
        id: 'port-10',
        title: 'Enterprise Master Services Agreement Suite',
        description: 'Drafted tailored enterprise MSAs, SLAs, and DPAs for high-ticket B2B software vendors.',
        skills: ['Commercial Law', 'SLA', 'DPA']
      }
    ],
    workHistory: [
      {
        id: 'wh-9',
        jobTitle: 'Terms of Service & Enterprise DPA Review',
        clientName: 'AeroCloud Systems',
        rating: 5.0,
        feedback: 'Jonathan identified key indemnification risks that two previous counsels overlooked. Pragmatic, fast, and highly professional.',
        date: 'October 2024',
        budget: '$3,600',
        projectType: 'Fixed-Price'
      }
    ]
  },
  {
    id: 'fl-9',
    name: 'Kavita Sundaram',
    title: 'Senior Technical Talent Partner & HR Strategist',
    category: 'hr-training',
    categoryName: 'HR & Training',
    hourlyRate: 65,
    rating: 4.93,
    reviewsCount: 33,
    totalJobsCompleted: 38,
    availability: 'Available Now',
    location: 'Singapore',
    avatarInitials: 'KS',
    bio: 'End-to-end tech recruiting leader, compensation benchmarking consultant, structured interview design, and remote cultural onboarding frameworks.',
    overview: 'I help tech companies scale engineering, product, and leadership teams without agency overhead. Expert at sourcing passive senior candidates across APAC, North America, and Europe.',
    skills: ['Technical Recruiting', 'Executive Search', 'Compensation Benchmarking', 'Interview Rubrics', 'Remote Onboarding'],
    languages: ['English (Fluent)', 'Tamil (Native)'],
    education: 'M.A. in Human Resource Management, National University of Singapore',
    portfolio: [
      {
        id: 'port-11',
        title: 'Engineering Hiring Pipeline Playbook',
        description: 'Developed structured behavioral rubrics and take-home evaluations reducing time-to-hire by 3 weeks.',
        skills: ['Interview Rubrics', 'Talent Ops']
      }
    ],
    workHistory: [
      {
        id: 'wh-10',
        jobTitle: 'Hiring Sprint: 4 Senior Staff Engineers',
        clientName: 'BitMesh Labs',
        rating: 5.0,
        feedback: 'Kavita filled four critical senior engineering roles within 45 days. Her candidate vetting was top notch.',
        date: 'August 2024',
        budget: '$7,200',
        projectType: 'Fixed-Price'
      }
    ]
  },
  {
    id: 'fl-10',
    name: 'Henrik Lindqvist, PE',
    title: 'Structural & Mechanical CAD/BIM Systems Engineer',
    category: 'engineering-architecture',
    categoryName: 'Engineering & Architecture',
    hourlyRate: 100,
    rating: 4.97,
    reviewsCount: 25,
    totalJobsCompleted: 28,
    availability: 'Available Now',
    location: 'Stockholm, Sweden',
    avatarInitials: 'HL',
    bio: 'Licensed structural engineer specializing in Revit BIM modeling, finite element analysis (FEA), MEP clash detection, and construction permit drawings.',
    overview: '14 years delivering technical architectural drafts, seismic calculations, and complex parametric models. Certified professional in Autodesk Revit and SolidWorks.',
    skills: ['AutoCAD', 'Revit BIM', 'SolidWorks', 'Structural FEA', 'MEP Coordination', 'Permit Sets'],
    languages: ['English (Fluent)', 'Swedish (Native)'],
    education: 'M.S. in Civil Engineering, KTH Royal Institute of Technology',
    portfolio: [
      {
        id: 'port-12',
        title: '3-Story Commercial Timber Structure BIM Model',
        description: 'Full architectural and structural coordination model with integrated bill of materials and MEP penetrations.',
        skills: ['Revit BIM', 'Timber Engineering']
      }
    ],
    workHistory: [
      {
        id: 'wh-11',
        jobTitle: 'Structural Load Calculation & Review',
        clientName: 'Nordic Habitat Group',
        rating: 5.0,
        feedback: 'Henrik provided clear, stamped engineering calculations ahead of schedule. City inspectors approved the permit set on first submission.',
        date: 'September 2024',
        budget: '$4,800',
        projectType: 'Fixed-Price'
      }
    ]
  }
];

export const getFreelancersByCategory = (categorySlug) => {
  if (!categorySlug || categorySlug === 'all') return MOCK_FREELANCERS;
  return MOCK_FREELANCERS.filter(f => f.category === categorySlug);
};

export const getFreelancerById = (id) => {
  return MOCK_FREELANCERS.find(f => f.id === id);
};
