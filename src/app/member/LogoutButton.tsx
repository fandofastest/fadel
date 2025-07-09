'use client';

import { signOut } from 'next-auth/react';
import React from 'react';

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/signin' })}
      className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold shadow transition-all"
    >
      Logout
    </button>
  );
}
