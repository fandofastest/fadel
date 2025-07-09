import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Masuk | Malay Futsal",
  description: "Masuk ke akun Malay Futsal Anda",
};

export default function SignIn() {
  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Selamat Datang Kembali
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Silakan masuk untuk mengakses akun Anda
        </p>
      </div>
      
      <Suspense fallback={<div className="flex items-center justify-center py-6">Loading...</div>}>
        <SignInForm />
      </Suspense>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Lupa password?{' '}
          <Link 
            href="/forgot-password" 
            className="font-medium text-brand-600 hover:underline dark:text-brand-400"
          >
            Reset password
          </Link>
        </p>
      </div>
    </div>
  );
}
