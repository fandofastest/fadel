"use client";
import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

interface User {
  _id?: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  role: "customer" | "admin";
}

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (user: User) => void;
  initialUser: User | null;
  loading: boolean;
}

export default function UserFormModal({
  open,
  onClose,
  onSubmit,
  initialUser,
  loading,
}: UserFormModalProps) {
  const [user, setUser] = useState<User>({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "customer",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialUser) {
      setUser({
        ...initialUser,
        password: "", // Clear password field when editing
      });
    } else {
      // Reset form when adding new user
      setUser({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "customer",
      });
    }
    setErrors({});
  }, [initialUser, open]);

  function validateForm() {
    const newErrors: Record<string, string> = {};
    if (!user.name?.trim()) newErrors.name = "Nama wajib diisi";
    if (!user.email?.trim()) newErrors.email = "Email wajib diisi";
    else if (!/^\S+@\S+\.\S+$/.test(user.email))
      newErrors.email = "Format email tidak valid";
      
    if (!user.phone?.trim()) newErrors.phone = "Nomor telepon wajib diisi";
    else if (!/^[0-9\-\+]{6,15}$/.test(user.phone))
      newErrors.phone = "Format nomor telepon tidak valid";

    if (!initialUser && !user.password?.trim())
      newErrors.password = "Password wajib diisi";
    else if (
      user.password &&
      user.password.trim() &&
      user.password.length < 6
    )
      newErrors.password = "Password minimal 6 karakter";

    if (!user.role) newErrors.role = "Role wajib dipilih";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(user);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 overflow-y-auto p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {initialUser ? "Edit Pengguna" : "Tambah Pengguna"}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-bold text-xl z-10"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto max-h-[80vh]">
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nama
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={user.name}
              onChange={handleChange}
              disabled={loading}
              className={`w-full rounded border ${
                errors.name
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-white dark:bg-gray-800 py-3 px-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-none focus:border-primary focus-visible:shadow-none`}
              placeholder="Masukkan nama lengkap"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={user.email}
              onChange={handleChange}
              disabled={loading}
              className={`w-full rounded border ${
                errors.email
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-white dark:bg-gray-800 py-3 px-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-none focus:border-primary focus-visible:shadow-none`}
              placeholder="Masukkan email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nomor Telepon
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={user.phone}
              onChange={handleChange}
              disabled={loading}
              className={`w-full rounded border ${
                errors.phone
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-white dark:bg-gray-800 py-3 px-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-none focus:border-primary focus-visible:shadow-none`}
              placeholder="Masukkan nomor telepon"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Password {initialUser && "(Biarkan kosong jika tidak diubah)"}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={user.password || ""}
              onChange={handleChange}
              disabled={loading}
              className={`w-full rounded border ${
                errors.password
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-white dark:bg-gray-800 py-3 px-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-none focus:border-primary focus-visible:shadow-none`}
              placeholder={initialUser ? "••••••••" : "Masukkan password"}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="mb-6">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={user.role}
              onChange={handleChange}
              disabled={loading}
              className={`w-full rounded border ${
                errors.role
                  ? "border-red-500"
                  : "border-gray-300 dark:border-gray-700"
              } bg-white dark:bg-gray-800 py-3 px-4 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 outline-none focus:border-primary focus-visible:shadow-none`}
            >
              <option value="customer">Pelanggan</option>
              <option value="admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="py-2 px-4 rounded bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 flex items-center"
            >
              {loading && (
                <div className="h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
              {initialUser ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
