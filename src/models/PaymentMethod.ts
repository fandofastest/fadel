import mongoose, { Schema, Document, models, model } from 'mongoose';

export interface IPaymentMethod extends Document {
  name: string;
  code?: string;
  keterangan?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    name: {
      type: String,
      required: [true, 'Payment method name is required'],
      trim: true,
      unique: true,
      minlength: 2,
    },
    code: {
      type: String,
      trim: true,
      default: '',
    },
    keterangan: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

export default models.PaymentMethod || model<IPaymentMethod>('PaymentMethod', PaymentMethodSchema);
