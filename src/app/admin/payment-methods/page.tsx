import React from 'react';
import PaymentMethodsTable from '@/components/payment-methods/PaymentMethodsTable';

export const metadata = {
  title: 'Metode Pembayaran',
  description: 'Kelola Metode Pembayaran',
};

export default function PaymentMethodsPage() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Manajemen Metode Pembayaran
      </h1>
      <PaymentMethodsTable />
    </div>
  );
}
