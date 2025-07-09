/**
 * Central registry for all Mongoose models
 * This file ensures all models are properly registered before use in Next.js API routes
 */
import Court from '@/models/Court';
import Payment from '@/models/Payment';
import Reservation from '@/models/Reservation';
import PricingRule from '@/models/PricingRule';
import PaymentMethod from '@/models/PaymentMethod';
import User from '@/models/User';

// Add any other models here

// Export models to ensure they're all registered
export {
  Court,
  Payment,
  Reservation,
  PricingRule,
  PaymentMethod,
  User
};

// This function doesn't do anything directly but forces all models to be registered
export function registerAllModels() {
  // The imports above handle the registration
  return {
    Court,
    Payment,
    Reservation,
    PricingRule,
    PaymentMethod,
    User
  };
}

export default registerAllModels;
