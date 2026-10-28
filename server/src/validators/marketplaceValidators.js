import { z } from 'zod';

/**
 * Validation schema for Freelancer Profile update
 */
export const updateFreelancerProfileSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(120),
    category: z.string().min(2, 'Category slug is required'),
    subCategory: z.string().optional(),
    bio: z.string().min(20, 'Bio must be at least 20 characters').max(2000),
    hourlyRate: z.coerce.number().min(5, 'Hourly rate must be at least $5').max(1000),
    skills: z.array(z.string().trim()).min(1, 'At least one skill is required'),
    experienceLevel: z.enum(['entry', 'intermediate', 'expert']).optional().default('intermediate'),
    availability: z.enum(['full-time', 'part-time', 'contract']).optional().default('contract'),
    location: z.string().optional().default('Remote'),
    avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
    portfolio: z.array(z.object({
      title: z.string().min(2),
      description: z.string().optional(),
      link: z.string().optional(),
      imageUrl: z.string().optional()
    })).optional().default([])
  })
});

/**
 * Validation schema for Client Job Creation
 */
export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters').max(150),
    description: z.string().min(20, 'Description must be at least 20 characters').max(5000),
    category: z.string().min(2, 'Category slug is required'),
    categoryName: z.string().optional(),
    projectType: z.enum(['Fixed-Price', 'Hourly']).default('Fixed-Price'),
    budgetMin: z.coerce.number().min(0, 'Minimum budget cannot be negative').optional().default(0),
    budgetMax: z.coerce.number().min(0, 'Maximum budget cannot be negative').optional(),
    experienceLevel: z.enum(['entry', 'intermediate', 'expert']).default('intermediate'),
    skills: z.array(z.string().trim()).min(1, 'At least one skill is required'),
    deadline: z.string().optional()
  })
});

/**
 * Validation schema for Client Job Update
 */
export const updateJobSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(150).optional(),
    description: z.string().min(20).max(5000).optional(),
    category: z.string().optional(),
    categoryName: z.string().optional(),
    projectType: z.enum(['Fixed-Price', 'Hourly']).optional(),
    budgetMin: z.coerce.number().min(0).optional(),
    budgetMax: z.coerce.number().min(0).optional(),
    experienceLevel: z.enum(['entry', 'intermediate', 'expert']).optional(),
    skills: z.array(z.string().trim()).optional(),
    status: z.enum(['open', 'in-progress', 'completed', 'cancelled']).optional(),
    deadline: z.string().optional()
  })
});

/**
 * Validation schema for Freelancer Proposal Submission
 */
export const submitProposalSchema = z.object({
  body: z.object({
    jobId: z.string().min(1, 'Job ID is required'),
    coverLetter: z.string().min(20, 'Cover letter must be at least 20 characters').max(3000),
    bidAmount: z.coerce.number().min(5, 'Bid amount must be at least $5'),
    estimatedDuration: z.string().min(1, 'Estimated timeline is required')
  })
});

/**
 * Validation schema for Milestone Deliverable Submission
 */
export const submitDeliverableSchema = z.object({
  body: z.object({
    deliverableNote: z.string().min(10, 'Deliverable description must be at least 10 characters'),
    deliverableUrl: z.string().url('Deliverable URL must be a valid link').optional().or(z.literal(''))
  })
});

export default {
  updateFreelancerProfileSchema,
  createJobSchema,
  updateJobSchema,
  submitProposalSchema,
  submitDeliverableSchema
};
