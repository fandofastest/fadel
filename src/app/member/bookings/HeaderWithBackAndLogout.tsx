"use client";

import React from "react";
import LogoutButtonClient from '@/app/member/LogoutButtonClient';
import { useRouter } from 'next/navigation';

export default function HeaderWithBackAndLogout() {
  const router = useRouter();
  return (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={() => router.push('/member')}
        className="text-primary dark:text-yellow-400 hover:underline text-sm py-1"
      >
        &larr; Kembali ke Dashboard
      </button>
      <LogoutButtonClient />
    </div>
  );
}
