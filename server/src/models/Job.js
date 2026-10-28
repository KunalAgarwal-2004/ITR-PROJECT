import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client user reference is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      minlength: [5, 'Job title must be at least 5 characters'],
      maxlength: [150, 'Job title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
      trim: true,
      minlength: [20, 'Job description must be at least 20 characters'],
      maxlength: [5000, 'Job description cannot exceed 5000 characters']
    },
    category: {
      type: String,
      required: [true, 'Category slug is required'],
      index: true
    },
    categoryName: {
      type: String,
      trim: true
    },
    projectType: {
      type: String,
      enum: {
        values: ['Fixed-Price', 'Hourly'],
        message: '{VALUE} must be either Fixed-Price or Hourly'
      },
      default: 'Fixed-Price',
      index: true
    },
    budgetMin: {
      type: Number,
      min: [0, 'Minimum budget cannot be negative'],
      default: 0
    },
    budgetMax: {
      type: Number,
      min: [0, 'Maximum budget cannot be negative']
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      default: 'intermediate',
      index: true
    },
    skills: {
      type: [String],
      required: [true, 'At least one required skill must be specified'],
      index: true
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'completed', 'cancelled'],
      default: 'open',
      index: true
    },
    proposalsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    deadline: {
      type: Date
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for job listing filter and search queries
jobSchema.index({ category: 1, status: 1, createdAt: -1 });
jobSchema.index({ projectType: 1, experienceLevel: 1 });

export const Job = mongoose.model('Job', jobSchema);
export default Job;
