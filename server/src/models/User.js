import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { USER_ROLES } from '../constants/roles.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address'
      ],
      index: true
    },
    password: {
      type: String,
      required: function () {
        // Password is only required for local authentication
        return this.authProvider === 'local';
      },
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Exclude from query results by default
    },
    role: {
      type: String,
      enum: {
        values: [USER_ROLES.CLIENT, USER_ROLES.FREELANCER, USER_ROLES.ADMIN],
        message: '{VALUE} is not a supported role'
      },
      default: USER_ROLES.CLIENT,
      required: true
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'pending'],
      default: 'active',
      index: true
    },
    avatar: {
      type: String,
      default: null
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    company: {
      type: String,
      trim: true,
      maxlength: [150, 'Company name cannot exceed 150 characters']
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    googleId: {
      type: String,
      sparse: true,
      default: null,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
      }
    }
  }
);

/**
 * Pre-save hook: Hash password before saving if modified
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  // Guard: if already a valid bcrypt hash, do not hash again
  if (/^\$2[abxy]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(this.password)) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Helper method to compare entered password with hashed password
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
