import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_WORK_FACTOR = 10;

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address.']
  },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['customer', 'admin'],
    default: 'customer',
    required: true 
  },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
UserSchema.pre<IUser>('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    // Hash the password using our new salt
    const hash = await bcrypt.hash(this.passwordHash, salt);
    // Override the cleartext password with the hashed one
    this.passwordHash = hash;
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
