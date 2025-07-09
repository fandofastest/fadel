"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import LogoutButtonClient from '@/app/member/LogoutButtonClient';

type MemberHeaderProps = {
  title?: string;
  showBackButton?: boolean;
};

export default function MemberHeader({ title, showBackButton = false }: MemberHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Determine default title based on pathname if not provided
  const getDefaultTitle = () => {
    if (pathname === '/member') return 'Member Dashboard';
    if (pathname?.includes('/member/reservasi')) return 'Reservasi';
    if (pathname?.includes('/member/bookings')) return 'Riwayat Booking';
    if (pathname?.includes('/member/profile')) return 'Profil Saya';
    if (pathname?.includes('/member/checkout')) return 'Checkout';
    if (pathname?.includes('/member/booking/')) return 'Detail Booking';
    return 'Member Area';
  };

  const displayTitle = title || getDefaultTitle();

  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <div className="flex items-center gap-3">
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="Back"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
          </button>
        )}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{displayTitle}</h1>
      </div>
      <LogoutButtonClient />
    </div>
  );
}
