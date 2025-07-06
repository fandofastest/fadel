'use client';

import React from 'react';
import SignUpForm from "@/components/auth/SignUpForm";
import { AuthProvider } from '@/context/AuthContext';
import Link from "next/link";

export default function SignUpWrapper() {
  return (
    <AuthProvider>
      <div className="w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Daftar Akun Baru
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Daftar untuk mulai memesan lapangan futsal
          </p>
        </div>
        
        <SignUpForm />
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sudah punya akun?{' '}
            <Link 
              href="/signin" 
              className="font-medium text-brand-600 hover:underline dark:text-brand-400"
            >
              Masuk disini
            </Link>
          </p>
        </div>
      </div>
    </AuthProvider>
  );
}
