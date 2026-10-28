import mongoose from 'mongoose';

const proposalSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job reference is required'],
      index: true
    },
    freelancer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Freelancer user reference is required'],
      index: true
    },
    coverLetter: {
      type: String,
      required: [true, 'Cover letter is required'],
      trim: true,
      minlength: [20, 'Cover letter must be at least 20 characters'],
      maxlength: [3000, 'Cover letter cannot exceed 3000 characters']
    },
    bidAmount: {
      type: Number,
      required: [true, 'Bid amount is required'],
      min: [5, 'Bid amount must be at least $5']
    },
    estimatedDuration: {
      type: String,
      required: [true, 'Estimated timeline is required'],
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'under-review', 'accepted', 'rejected', 'withdrawn'],
        message: '{VALUE} is not a valid proposal status'
      },
      default: 'pending',
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound index to guarantee one active proposal per freelancer per job
proposalSchema.index({ job: 1, freelancer: 1 }, { unique: true });

export const Proposal = mongoose.model('Proposal', proposalSchema);
export default Proposal;
