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
    hourlyRate: z.coerce.number().min(5, 'Hourly rate must be at least 5 (USD)').max(1000, 'Hourly rate cannot exceed 1000 (USD)'),
    skills: z.array(z.string().trim()).min(1, 'At least one skill is required'),
    // No defaults here: a PUT that omits a field must leave the stored value unchanged
    experienceLevel: z.enum(['entry', 'intermediate', 'expert']).optional(),
    availability: z.enum(['full-time', 'part-time', 'contract']).optional(),
    location: z.string().optional(),
    avatar: z.string().url('Avatar must be a valid URL').optional().or(z.literal('')),
    portfolio: z.array(z.object({
      title: z.string().min(2),
      description: z.string().optional(),
      link: z.string().optional(),
      imageUrl: z.string().optional()
    })).optional()
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
    // Owners may only close (cancel) or re-open a posting; other states come from the contract flow
    status: z.enum(['open', 'cancelled']).optional(),
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
    bidAmount: z.coerce.number().min(5, 'Bid amount must be at least 5 (USD)'),
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
