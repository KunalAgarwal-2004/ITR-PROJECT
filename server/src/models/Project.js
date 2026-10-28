import mongoose from 'mongoose';

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Milestone title is required'],
    trim: true,
    maxlength: 120
  },
  amount: {
    type: Number,
    required: [true, 'Milestone funding amount is required'],
    min: [0, 'Milestone amount cannot be negative']
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'submitted', 'approved', 'released'],
    default: 'pending'
  },
  deliverableNote: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  deliverableUrl: {
    type: String,
    trim: true
  },
  submittedAt: {
    type: Date
  },
  releasedAt: {
    type: Date
  }
});

const projectSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Client reference is required'],
      index: true
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer reference is required'],
      index: true
    },
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Proposal'
    },
    title: {
      type: String,
      required: [true, 'Contract project title is required'],
      trim: true
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total contract amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    escrowAmount: {
      type: Number,
      default: 0,
      min: [0, 'Escrow amount cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'milestone_review', 'completed', 'disputed', 'cancelled'],
        message: '{VALUE} is not a valid project status'
      },
      default: 'active',
      index: true
    },
    milestones: [milestoneSchema]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

projectSchema.index({ client: 1, status: 1 });
projectSchema.index({ freelancer: 1, status: 1 });

export const Project = mongoose.model('Project', projectSchema);
export default Project;
