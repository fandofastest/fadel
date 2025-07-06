"use client";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import React, { useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from "next/link";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
};

const CustomButton: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  disabled = false,
  onClick
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type="submit"
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Ambil URL callback dari parameter atau gunakan /admin sebagai default
      const callbackUrl = searchParams.get('callbackUrl') || '/admin';
      
      // Gunakan NextAuth signIn untuk autentikasi dengan credentials provider
      const result = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password
      });
      
      if (result?.error) {
        console.error('Login error:', result.error);
        // Tampilkan pesan error yang lebih informatif
        if (result.error === 'CredentialsSignin') {
          setError('Email atau password salah. Silakan coba lagi.');
        } else {
          setError(`Gagal login: ${result.error}`);
        }
        return;
      }
      
      // Login berhasil - redirect ke callback URL
      console.log('Login berhasil, redirect ke:', callbackUrl);
      router.push(callbackUrl);
    } catch (err) {
      console.error('Login gagal:', err);
      setError('Terjadi kesalahan saat mencoba masuk. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
          {error}
        </div>
      )}
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="Masukkan alamat email Anda"
          defaultValue={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-3 text-sm border rounded-lg border-stroke bg-transparent outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <Label htmlFor="password">Password</Label>
          <Link 
            href="/forgot-password" 
            className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-500"
          >
            Lupa password?
          </Link>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Masukkan password Anda"
            defaultValue={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 text-sm border rounded-lg border-stroke bg-transparent outline-none focus:border-primary focus-visible:shadow-none dark:border-strokedark dark:bg-meta-4 dark:focus:border-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <EyeCloseIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <div className="flex items-center">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="remember-me" className="block ml-2 text-sm text-gray-700 dark:text-gray-300">
            Ingat saya
          </label>
        </div>
      </div>

      <div>
        <CustomButton
          className="w-full px-4 py-3 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 focus:ring-4 focus:outline-none focus:ring-brand-300 dark:bg-brand-600 dark:hover:bg-brand-700 dark:focus:ring-brand-800"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </CustomButton>
      </div>

      <div className="text-sm text-center text-gray-600 dark:text-gray-400">
        Belum punya akun?{' '}
        <Link
          href="/signup"
          className="font-medium text-brand-600 hover:underline dark:text-brand-500"
        >
          Daftar sekarang
        </Link>
      </div>
    </form>
  );
}
