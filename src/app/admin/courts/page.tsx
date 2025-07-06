import React from 'react';
import CourtsTable from '@/components/courts/CourtsTable';

export const metadata = {
  title: 'Manajemen Lapangan',
  description: 'Kelola Lapangan',
};

export default function CourtsPage() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Manajemen Lapangan
      </h1>
      <CourtsTable />
    </div>
  );
}
