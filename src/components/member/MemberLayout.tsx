"use client";

import React, { ReactNode } from 'react';
import MemberHeader from './MemberHeader';
import MobileNavigation from './MobileNavigation';

type MemberLayoutProps = {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
};

export default function MemberLayout({ children, title, showBackButton }: MemberLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 pt-8">
        <MemberHeader title={title} showBackButton={showBackButton} />
        {children}
        
        {/* Mobile navigation */}
        <MobileNavigation />
      </div>
    </div>
  );
}
