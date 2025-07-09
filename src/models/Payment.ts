import mongoose, { Schema, Document, Model, models } from 'mongoose';
import { IPaymentMethod } from './PaymentMethod';

export interface IPayment extends Document {
  reservationId: mongoose.Types.ObjectId;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  method?: mongoose.Types.ObjectId | IPaymentMethod;
  reference?: string; // Nomor referensi pembayaran
  notes?: string;
  receiptUrl?: string;
  tripay_reference?: any; // Data callback Tripay
  createdAt: Date;
  updatedAt: Date;
}

// Solusi untuk mengatasi masalah hot reload di Next.js
// https://github.com/vercel/next.js/issues/7328
const PaymentSchema = new Schema<IPayment>(
  {
    reservationId: {
      type: Schema.Types.ObjectId,
      ref: 'Reservation',
      required: [true, 'Reservation ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: 0,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    method: {
      type: Schema.Types.ObjectId,
      ref: 'PaymentMethod',
    },
    reference: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },
    tripay_reference: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pola singleton untuk model Mongoose
 * Mencegah error "Schema hasn't been registered for model" di Next.js
 */
let PaymentModel: Model<IPayment>;

try {
  // Coba dapatkan model yang sudah ada
  PaymentModel = mongoose.model<IPayment>('Payment');
} catch (e) {
  // Jika model belum ada, buat model baru
  PaymentModel = mongoose.model<IPayment>('Payment', PaymentSchema);
}

export default PaymentModel;
