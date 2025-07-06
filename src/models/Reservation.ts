import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  userId: mongoose.Types.ObjectId;
  courtId: mongoose.Types.ObjectId;
  date: Date;
  startHour: number;
  endHour: number;
  status: 'UNPAID' | 'PAID' | 'EXPIRED' | 'CHECKED_IN' | 'CANCELLED';
  totalAmount: number;
  paymentId?: mongoose.Types.ObjectId;
  qrCodeId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReservationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    courtId: {
      type: Schema.Types.ObjectId,
      ref: 'Court',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    startHour: {
      type: Number,
      required: true,
      min: 0,
      max: 23
    },
    endHour: {
      type: Number,
      required: true,
      min: 1,
      max: 24,
      validate: {
        validator: function(this: IReservation, value: number) {
          return value > this.startHour;
        },
        message: 'End hour must be greater than start hour'
      }
    },
    status: {
      type: String,
      enum: ['UNPAID', 'PAID', 'EXPIRED', 'CHECKED_IN', 'CANCELLED'],
      default: 'UNPAID',
      required: true
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      default: null
    },
    qrCodeId: {
      type: Schema.Types.ObjectId,
      ref: 'QRCode',
      default: null
    }
  },
  { 
    timestamps: true 
  }
);

// Composite index untuk memeriksa ketersediaan lapangan
ReservationSchema.index({ date: 1, courtId: 1, startHour: 1, endHour: 1 });

// Mencegah pembuatan reservasi duplikat atau tumpang tindih
ReservationSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('date') || this.isModified('courtId') ||
      this.isModified('startHour') || this.isModified('endHour')) {
    
    const overlappingReservation = await mongoose.model('Reservation').findOne({
      courtId: this.courtId,
      date: {
        $gte: new Date(this.date.setHours(0, 0, 0, 0)),
        $lt: new Date(this.date.setHours(23, 59, 59, 999))
      },
      status: { $nin: ['CANCELLED', 'EXPIRED'] },
      $or: [
        // Cek apakah ada reservasi yang overlap
        { startHour: { $lt: this.endHour, $gte: this.startHour } },
        { endHour: { $gt: this.startHour, $lte: this.endHour } },
        { $and: [{ startHour: { $lte: this.startHour } }, { endHour: { $gte: this.endHour } }] }
      ],
      _id: { $ne: this._id } // Mengecualikan dokumen ini sendiri untuk kasus update
    });

    if (overlappingReservation) {
      throw new Error('Lapangan sudah dipesan untuk waktu tersebut');
    }
  }

  next();
});

// Ekspor model jika tidak sudah ada
export default mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);
