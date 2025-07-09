import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  userId: mongoose.Types.ObjectId;
  courtId: mongoose.Types.ObjectId;
  date: Date;
  slots: number[]; // array of jam yang dipesan
  // startHour: number;
  // endHour: number; // deprecated, untuk data lama
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
    slots: {
      type: [Number],
      required: true,
      validate: [(arr: number[]) => Array.isArray(arr) && arr.length > 0, 'Minimal satu slot waktu'],
    },
    // startHour: {
    //   type: Number,
    //   required: false,
    //   min: 0,
    //   max: 23
    // },
    // endHour: {
    //   type: Number,
    //   required: false,
    //   min: 1,
    //   max: 24,
    //   validate: {
    //     validator: function(this: IReservation, value: number) {
    //       return value > this.startHour;
    //     },
    //     message: 'End hour must be greater than start hour'
    //   }
    // }, // Sudah tidak digunakan, pastikan tidak required
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
  // Validasi overlap untuk slot baru
  if (this.isNew || this.isModified('date') || this.isModified('courtId') || this.isModified('slots')) {
    const Reservation = mongoose.model('Reservation');
    const existing = await Reservation.findOne({
      courtId: this.courtId,
      date: {
        $gte: new Date(this.date.setHours(0, 0, 0, 0)),
        $lt: new Date(this.date.setHours(23, 59, 59, 999))
      },
      status: { $nin: ['CANCELLED', 'EXPIRED'] },
      _id: { $ne: this._id },
      // Cek overlap slot
      slots: { $in: this.slots }
    });
    if (existing) {
      throw new Error('Lapangan sudah dipesan untuk salah satu jam yang dipilih');
    }
  }
  next();
});

// Ekspor model jika tidak sudah ada
export default mongoose.models.Reservation || mongoose.model<IReservation>('Reservation', ReservationSchema);
