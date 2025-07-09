import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface IPricingRule extends Document {
  courtId: Types.ObjectId;
  startDayOfWeek: number; // 0=Sunday ... 6=Saturday
  endDayOfWeek: number;   // 0=Sunday ... 6=Saturday
  startHour: number; // 0-24
  endHour: number;   // 0-24
  rate: number;      // per hour
  createdAt?: Date;
  updatedAt?: Date;
}

const PricingRuleSchema = new Schema<IPricingRule>({
  courtId: { type: Schema.Types.ObjectId, ref: "Court", required: true, index: true },
  startDayOfWeek: { type: Number, required: true, min: 0, max: 6, index: true },
  endDayOfWeek: { type: Number, required: true, min: 0, max: 6, index: true },
  startHour: { type: Number, required: true, min: 0, max: 24 },
  endHour: { type: Number, required: true, min: 0, max: 24 },
  rate: { type: Number, required: true, min: 0 },
}, {
  timestamps: true
});

PricingRuleSchema.index({ courtId: 1, startDayOfWeek: 1, endDayOfWeek: 1, startHour: 1, endHour: 1 });

/**
 * Pola singleton untuk model Mongoose
 * Mencegah error "Schema hasn't been registered for model" di Next.js
 */
let PricingRuleModel: Model<IPricingRule>;

try {
  // Coba dapatkan model yang sudah ada
  PricingRuleModel = mongoose.model<IPricingRule>("PricingRule");
} catch (e) {
  // Jika model belum ada, buat model baru
  PricingRuleModel = mongoose.model<IPricingRule>("PricingRule", PricingRuleSchema);
}

export default PricingRuleModel;
