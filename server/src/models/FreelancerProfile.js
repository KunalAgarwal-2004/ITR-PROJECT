import mongoose from 'mongoose';

const portfolioItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  link: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String,
    trim: true
  }
});

const freelancerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      unique: true,
      index: true
    },
    title: {
      type: String,
      required: [true, 'Professional title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    category: {
      type: String,
      required: [true, 'Primary category slug is required'],
      index: true
    },
    subCategory: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      required: [true, 'Professional summary bio is required'],
      trim: true,
      maxlength: [2000, 'Bio cannot exceed 2000 characters']
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate is required'],
      min: [5, 'Hourly rate must be at least $5'],
      max: [1000, 'Hourly rate cannot exceed $1000']
    },
    skills: {
      type: [String],
      required: [true, 'At least one skill is required'],
      index: true
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'intermediate', 'expert'],
      default: 'intermediate'
    },
    availability: {
      type: String,
      enum: ['full-time', 'part-time', 'contract'],
      default: 'contract'
    },
    location: {
      type: String,
      trim: true,
      default: 'Remote'
    },
    rating: {
      type: Number,
      default: 5.0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5.0'],
      index: true
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0
    },
    totalJobsCompleted: {
      type: Number,
      default: 0,
      min: 0
    },
    portfolio: [portfolioItemSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound indexes for performant marketplace search and filter queries
freelancerProfileSchema.index({ category: 1, hourlyRate: 1 });
freelancerProfileSchema.index({ skills: 1, rating: -1 });

export const FreelancerProfile = mongoose.model('FreelancerProfile', freelancerProfileSchema);
export default FreelancerProfile;
