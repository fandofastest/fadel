export enum ReservationStatus {
  UNPAID = 'UNPAID',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  CHECKED_IN = 'CHECKED_IN',
  CANCELLED = 'CANCELLED',
}

export interface Reservation {
  _id: string;
  userId: { name?: string; email?: string; phone?: string } | any;
  courtId: { name?: string; type?: string; price?: number } | any;
  date: string;
  slots: number[];
  status: ReservationStatus;
  totalAmount: number;
  paymentId?: any;
  paymentData?: any;
}
