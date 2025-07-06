import React from 'react';
import UsersTable from '@/components/users/UsersTable';

export const metadata = {
  title: 'Manajemen Pengguna',
  description: 'Kelola Pengguna',
};

export default function UsersPage() {
  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Manajemen Pengguna
      </h1>
      <UsersTable />
    </div>
  );
}
