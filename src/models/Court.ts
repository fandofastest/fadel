import mongoose, { Document, Schema } from 'mongoose';

export interface ICourt extends Document {
  name: string;
  openTime: string;  // Format: "HH:MM"
  closeTime: string; // Format: "HH:MM"
  createdAt: Date;
  updatedAt: Date;
}

const courtSchema = new Schema<ICourt>({
  name: {
    type: String,
    required: [true, 'Court name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Court name must be at most 100 characters']
  },
  openTime: {
    type: String,
    required: [true, 'Open time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format. Use HH:MM']
  },
  closeTime: {
    type: String,
    required: [true, 'Close time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format. Use HH:MM'],
    validate: {
      validator: function(this: ICourt, value: string) {
        return value > this.openTime;
      },
      message: 'Close time must be after open time'
    }
  }
}, {
  timestamps: true
});

export default mongoose.models.Court || mongoose.model<ICourt>('Court', courtSchema);
