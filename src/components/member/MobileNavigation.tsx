"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  GridIcon,
  CalenderIcon,
  ListIcon,
  UserCircleIcon
} from '../../icons';

export default function MobileNavigation() {
  const pathname = usePathname();

  // Function to check if a link is active
  const isActive = (path: string) => {
    if (path === '/member' && pathname === '/member') {
      return true;
    }
    if (path !== '/member' && pathname?.startsWith(path)) {
      return true;
    }
    return false;
  };
  
  // Get active text color
  const getActiveTextClass = (path: string) => {
    return isActive(path) 
      ? 'text-primary font-medium dark:text-blue-400' 
      : 'text-gray-500 dark:text-gray-400';
  };
  
  // Get active icon color
  const getActiveIconClass = (path: string) => {
    return isActive(path) 
      ? 'text-primary dark:text-blue-400' 
      : 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg p-2 md:hidden">
      <div className="flex justify-around">
        <Link href="/member" className="flex flex-col items-center p-2">
          <GridIcon className={`h-5 w-5 ${getActiveIconClass('/member')}`} />
          <span className={`text-xs mt-1 ${getActiveTextClass('/member')}`}>Home</span>
        </Link>
        
        <Link href="/member/reservasi" className="flex flex-col items-center p-2">
          <CalenderIcon className={`h-5 w-5 ${getActiveIconClass('/member/reservasi')}`} />
          <span className={`text-xs mt-1 ${getActiveTextClass('/member/reservasi')}`}>
            Reservasi
          </span>
        </Link>
        
        <Link href="/member/bookings" className="flex flex-col items-center p-2">
          <ListIcon className={`h-5 w-5 ${getActiveIconClass('/member/bookings')}`} />
          <span className={`text-xs mt-1 ${getActiveTextClass('/member/bookings')}`}>
            Booking
          </span>
        </Link>
        
        <Link href="/member/profile" className="flex flex-col items-center p-2">
          <UserCircleIcon className={`h-5 w-5 ${getActiveIconClass('/member/profile')}`} />
          <span className={`text-xs mt-1 ${getActiveTextClass('/member/profile')}`}>
            Profil
          </span>
        </Link>
      </div>
    </div>
  );
}
