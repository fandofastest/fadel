"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { signOut } from "next-auth/react";

interface ProfileFormProps {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    address?: string;
  };
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Password validation
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      toast.error("Password baru dan konfirmasi password tidak sama");
      setIsLoading(false);
      return;
    }

    try {
      // Prepare data for API - only send the fields that the profile API expects
      const updateData: any = {
        name: formData.name,
        phone: formData.phone,
      };

      // Only include password fields if new password is provided
      if (formData.newPassword) {
        updateData.newPassword = formData.newPassword;
        updateData.confirmPassword = formData.confirmPassword;
        
        // Include current password if provided
        if (formData.currentPassword) {
          updateData.currentPassword = formData.currentPassword;
        }
      }

      console.log('Sending data to API:', updateData);

      // Call new API endpoint specifically for profile updates
      const response = await fetch('/api/profile/update', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      console.log('API response:', result);

      if (result.success) {
        toast.success("Profil berhasil diperbarui");
        
        // Update the form data with any returned values
        if (result.data) {
          setFormData((prev) => ({
            ...prev,
            name: result.data.name || prev.name,
            phone: result.data.phone || prev.phone,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));
        } else {
          // Just reset password fields
          setFormData((prev) => ({
            ...prev,
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));
        }
        
        // Tanyakan jika ingin sign out untuk me-refresh sesi
        if (confirm("Profil berhasil diperbarui. Untuk melihat perubahan di seluruh aplikasi, Anda perlu login ulang. Logout sekarang?")) {
          toast.success("Silakan login kembali untuk melihat perubahan");
          // Delay logout sedikit untuk memastikan toast muncul
          setTimeout(() => {
            signOut({ callbackUrl: "/signin" });
          }, 1500);
        }
      } else {
        toast.error(result.message || "Gagal memperbarui profil");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat memperbarui profil");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Edit Informasi Profil
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nama Lengkap
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                readOnly
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Email tidak dapat diubah
              </p>
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Nomor Telepon
              </label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          </div>

          {/* Ubah Password */}
          <div className="mt-8 mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Ubah Password
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Password Baru
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                  >
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tombol Simpan */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
