import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { FreelancerProfile } from '../models/FreelancerProfile.js';
import { Job } from '../models/Job.js';
import { Proposal } from '../models/Proposal.js';
import { Project } from '../models/Project.js';
import { MARKETPLACE_CATEGORIES } from '../constants/categories.js';

export const seedMarketplace = async () => {
  console.log('[Seed] Starting Marketplace Data Seeding...');

  // Helper to securely upsert a user with properly hashed password
  const upsertUser = async (userData) => {
    const existing = await User.findOne({ email: userData.email.toLowerCase() });

    if (existing) {
      existing.name = userData.name;
      existing.password = userData.password;
      existing.role = userData.role;
      existing.company = userData.company || existing.company;
      existing.bio = userData.bio || existing.bio;
      existing.avatar = userData.avatar || existing.avatar;
      existing.isVerified = userData.isVerified !== undefined ? userData.isVerified : true;
      existing.accountStatus = 'active';
      return await existing.save();
    } else {
      const newUser = new User({
        ...userData,
        password: userData.password,
        isVerified: userData.isVerified !== undefined ? userData.isVerified : true,
        accountStatus: 'active'
      });
      return await newUser.save();
    }
  };

  // 1. Seed Verified Clients
  const client1 = await upsertUser({
    name: 'Acuity Tech Solutions',
    email: 'client@workbridge.com',
    password: 'clientpassword123',
    role: 'client',
    company: 'Acuity Solutions Inc.',
    bio: 'Enterprise AI & cloud platform consultancy hiring top specialized talent.',
    isVerified: true
  });

  const clientDemo = await upsertUser({
    name: 'WorkBridge Demo Client',
    email: 'client.demo@example.com',
    password: 'demopassword',
    role: 'client',
    company: 'HyperGrowth Ventures',
    bio: 'Demo client workspace showcasing automated escrow, talent discovery, and proposal workflows.',
    isVerified: true
  });

  const client2 = await upsertUser({
    name: 'OmniMetrics Corp',
    email: 'innovate@workbridge.com',
    password: 'clientpassword123',
    role: 'client',
    company: 'OmniMetrics B2B Analytics',
    bio: 'Building next-generation real-time analytics for global enterprises.',
    isVerified: true
  });

  // 2. Seed Verified Freelancers with Full Profiles
  const freelancersData = [
    {
      user: {
        name: 'Elena Rostova',
        email: 'elena@workbridge.com',
        password: 'freelancerpassword123',
        role: 'freelancer',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        bio: 'Senior AI Engineer & LLM Specialist with 7+ years building enterprise RAG systems.',
        isVerified: true
      },
      profile: {
        title: 'Senior AI Engineer & LLM Specialist',
        category: 'ai-services',
        hourlyRate: 95,
        skills: ['Python', 'LangChain', 'LlamaIndex', 'FastAPI', 'PyTorch'],
        experienceLevel: 'expert',
        availability: 'contract',
        location: 'San Francisco, CA (Remote)',
        rating: 4.96,
        reviewsCount: 42,
        totalJobsCompleted: 38,
        bio: 'Specializing in enterprise LLM integration, agentic workflows, and fine-tuning open source models.',
        portfolio: [
          {
            title: 'Enterprise Document Q&A (RAG)',
            description: 'Reduced information retrieval latency by 80% for 5,000 internal documents.',
            link: 'https://github.com'
          }
        ]
      }
    },
    {
      user: {
        name: 'Alex Rivera (Demo Freelancer)',
        email: 'freelancer.demo@example.com',
        password: 'demopassword',
        role: 'freelancer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        bio: 'Senior Full Stack & AI Specialist available for fast client engagements.',
        isVerified: true
      },
      profile: {
        title: 'Senior Full Stack & AI Engineer',
        category: 'development-it',
        hourlyRate: 80,
        skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'OpenAI API'],
        experienceLevel: 'expert',
        availability: 'contract',
        location: 'New York, NY (Remote)',
        rating: 4.95,
        reviewsCount: 28,
        totalJobsCompleted: 24,
        bio: 'Demonstration freelancer workspace. Ready to submit proposals and deliver milestones.',
        portfolio: [
          {
            title: 'Real-Time Freelance Marketplace',
            description: 'Scalable MERN platform with JWT authentication and escrow milestone tracking.',
            link: 'https://workbridge.dev'
          }
        ]
      }
    },
    {
      user: {
        name: 'Marcus Vance',
        email: 'marcus@workbridge.com',
        password: 'freelancerpassword123',
        role: 'freelancer',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        bio: 'Full Stack Cloud Architect specializing in scalable Node.js and React architectures.',
        isVerified: true
      },
      profile: {
        title: 'Full Stack Cloud Architect',
        category: 'development-it',
        hourlyRate: 85,
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'MongoDB'],
        experienceLevel: 'expert',
        availability: 'contract',
        location: 'Austin, TX (Remote)',
        rating: 4.94,
        reviewsCount: 36,
        totalJobsCompleted: 29,
        bio: 'Full Stack Engineer with 8+ years architecting multi-tenant web applications and microservices.',
        portfolio: [
          {
            title: 'High-Volume SaaS Billing Engine',
            description: 'Engineered idempotent payment orchestration handling $10M+ GMV monthly.',
            link: 'https://github.com'
          }
        ]
      }
    },
    {
      user: {
        name: 'Sofia Chen',
        email: 'sofia@workbridge.com',
        password: 'freelancerpassword123',
        role: 'freelancer',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        bio: 'Lead Product & UX Designer passionate about design systems and intuitive user interfaces.',
        isVerified: true
      },
      profile: {
        title: 'Lead Product & UI/UX Designer',
        category: 'design-creative',
        hourlyRate: 75,
        skills: ['Figma', 'Design Systems', 'UI/UX', 'Prototyping', 'User Research'],
        experienceLevel: 'expert',
        availability: 'contract',
        location: 'Vancouver, Canada (Remote)',
        rating: 4.98,
        reviewsCount: 51,
        totalJobsCompleted: 45,
        bio: 'Designing accessible, beautiful digital products that convert. Trusted by YC startups and scale-ups.',
        portfolio: [
          {
            title: 'Fintech Mobile App Redesign',
            description: 'Redesigned core wealth management flows, increasing user activation by 35%.',
            link: 'https://figma.com'
          }
        ]
      }
    },
    {
      user: {
        name: 'Tariq Al-Mansoor',
        email: 'tariq@workbridge.com',
        password: 'freelancerpassword123',
        role: 'freelancer',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        bio: 'Growth Marketing & Technical SEO Specialist with proven track record scaling organic traffic.',
        isVerified: true
      },
      profile: {
        title: 'Growth Marketing & SEO Specialist',
        category: 'sales-marketing',
        hourlyRate: 70,
        skills: ['SEO Strategy', 'Google Ads', 'Content Strategy', 'HubSpot', 'Conversion Optimization'],
        experienceLevel: 'expert',
        availability: 'contract',
        location: 'London, UK (Remote)',
        rating: 4.92,
        reviewsCount: 30,
        totalJobsCompleted: 26,
        bio: 'Helped 15+ SaaS startups scale from seed to Series A through organic content flywheels and programmatic SEO.',
        portfolio: [
          {
            title: '300% Organic Traffic Growth',
            description: 'Executed technical SEO audit and content hub restructuring for B2B developer tool.',
            link: 'https://ahrefs.com'
          }
        ]
      }
    },
    {
      user: {
        name: 'Chloe Dubois',
        email: 'chloe@workbridge.com',
        password: 'freelancerpassword123',
        role: 'freelancer',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        bio: 'Senior Technical Writer & API Documentation Specialist.',
        isVerified: true
      },
      profile: {
        title: 'Senior Technical Writer & Documentation Specialist',
        category: 'writing-translation',
        hourlyRate: 65,
        skills: ['Technical Documentation', 'API Docs', 'Markdown', 'Developer Portals', 'Copywriting'],
        experienceLevel: 'expert',
        availability: 'contract',
        location: 'Montreal, Canada (Remote)',
        rating: 4.97,
        reviewsCount: 34,
        totalJobsCompleted: 31,
        bio: 'Authoring clean, comprehensive SDK documentation and tutorials for developer-first platforms.',
        portfolio: [
          {
            title: 'REST & GraphQL API Documentation',
            description: 'Authored complete API reference guide with OpenAPI specs and interactive code samples.',
            link: 'https://readme.com'
          }
        ]
      }
    }
  ];

  for (const item of freelancersData) {
    const user = await upsertUser(item.user);

    await FreelancerProfile.findOneAndUpdate(
      { user: user._id },
      { ...item.profile, user: user._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  // 3. Seed Realistic Job Postings Across Marketplace Categories
  const jobsData = [
    {
      client: client1._id,
      title: 'Senior LLM & Prompt Pipeline Engineer',
      description: 'We are seeking an experienced LLM Specialist to architect and deploy production RAG pipelines, optimize retrieval context, and benchmark model responses.',
      category: 'ai-services',
      categoryName: 'AI Services',
      projectType: 'Fixed-Price',
      budgetMin: 4500,
      budgetMax: 6500,
      experienceLevel: 'expert',
      skills: ['Python', 'LangChain', 'LlamaIndex', 'FastAPI'],
      status: 'open',
      deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000)
    },
    {
      client: client1._id,
      title: 'Full Stack React & Node.js Platform Refactor',
      description: 'Modernize our core client dashboard into modular React components, implement clean REST API endpoints, and optimize MongoDB indexing.',
      category: 'development-it',
      categoryName: 'Development & IT',
      projectType: 'Hourly',
      budgetMin: 65,
      budgetMax: 90,
      experienceLevel: 'expert',
      skills: ['React', 'Node.js', 'MongoDB', 'Tailwind CSS'],
      status: 'open',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    },
    {
      client: client2._id,
      title: 'B2B SaaS Design System in Figma',
      description: 'Create a comprehensive Figma design system and component library with dark/light themes, token variables, and detailed component documentation.',
      category: 'design-creative',
      categoryName: 'Design & Creative',
      projectType: 'Fixed-Price',
      budgetMin: 3000,
      budgetMax: 4500,
      experienceLevel: 'intermediate',
      skills: ['Figma', 'Design Systems', 'UI/UX'],
      status: 'open',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    },
    {
      client: client2._id,
      title: 'Technical Content & Product Guide Author',
      description: 'Author high-impact developer tutorials, architectural whitepapers, and getting-started guides for our distributed analytics engine.',
      category: 'writing-translation',
      categoryName: 'Writing & Translation',
      projectType: 'Fixed-Price',
      budgetMin: 2000,
      budgetMax: 3200,
      experienceLevel: 'expert',
      skills: ['Technical Documentation', 'Copywriting', 'Developer Portals'],
      status: 'open',
      deadline: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000)
    },
    {
      client: clientDemo._id,
      title: 'Full-Funnel Organic Growth & Technical SEO Audit',
      description: 'Conduct complete audit of our web properties, identify indexing bottlenecks, restructure content silos, and develop keyword roadmap.',
      category: 'sales-marketing',
      categoryName: 'Sales & Marketing',
      projectType: 'Hourly',
      budgetMin: 55,
      budgetMax: 75,
      experienceLevel: 'expert',
      skills: ['SEO Strategy', 'Google Ads', 'Content Strategy'],
      status: 'open',
      deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000)
    },
    {
      client: clientDemo._id,
      title: 'Financial Forecasting & Multi-Tier Unit Economics Model',
      description: 'Build comprehensive 3-statement financial model, sensitivity analysis, and investor-ready unit economic projections for our upcoming funding round.',
      category: 'finance-accounting',
      categoryName: 'Finance & Accounting',
      projectType: 'Fixed-Price',
      budgetMin: 2500,
      budgetMax: 4000,
      experienceLevel: 'expert',
      skills: ['Financial Analysis', 'Valuation Modeling', 'Forecasting'],
      status: 'open',
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const job of jobsData) {
    await Job.findOneAndUpdate(
      { title: job.title },
      job,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('[Seed] Marketplace seed data successfully inserted/updated with hashed credentials.');
};

// If run directly: node src/utils/seedData.js
if (process.argv[1] && process.argv[1].endsWith('seedData.js')) {
  (async () => {
    await connectDB();
    await seedMarketplace();
    await mongoose.connection.close();
    process.exit(0);
  })();
}

export default seedMarketplace;
