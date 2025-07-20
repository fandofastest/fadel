"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaSave, FaSpinner, FaTimes } from "react-icons/fa";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!session) {
      router.push("/signin");
      return;
    }
    
    fetchProfile();
  }, [session]);
  
  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to fetch profile");
      }
      
      setProfile(data.data);
      setName(data.data.name || "");
      setEmail(data.data.email || "");
      setPhone(data.data.phone || "");
    } catch (err: any) {
      setError(err.message || "Error loading profile");
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!name || !email || !phone) {
      setError("Name, email and phone are required");
      return;
    }
    
    if (newPassword && newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      const payload: any = {
        name,
        email,
        phone,
      };
      
      // Only include password fields if updating password
      if (newPassword) {
        if (!currentPassword) {
          setError("Current password is required to set a new password");
          setSaving(false);
          return;
        }
        
        payload.currentPassword = currentPassword;
        payload.newPassword = newPassword;
      }
      
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || "Failed to update profile");
      }
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Update session data if name changed
      if (name !== profile?.name && session) {
        await update({ name });
      }
      
      setProfile(data.data);
      setSuccess("Profile updated successfully");
      
    } catch (err: any) {
      setError(err.message || "Error updating profile");
      console.error("Failed to update profile:", err);
    } finally {
      setSaving(false);
    }
  };
  
  const handleCancel = () => {
    // Reset form to current profile values
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    }
    
    // Clear password fields
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[400px]">
        <FaSpinner className="animate-spin text-indigo-600" size={24} />
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Profile Settings</h1>
      
      <div className="bg-white rounded-md shadow-sm p-4 max-w-2xl">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info Section */}
          <div className="space-y-3">
            <div>
              <label htmlFor="name" className="block mb-1 font-medium text-gray-700">
                Nama
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
                required
              />
            </div>

            <div>
              <label htmlFor="phone" className="block mb-1 font-medium text-gray-700">
                No. HP
              </label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full border border-gray-300 rounded p-2"
                required
              />
            </div>
          </div>

          {/* Change Password Section */}
          <div className="pt-4 border-t border-gray-100">
            <h2 className="text-lg font-medium mb-3">Ubah Kata Sandi</h2>
            
            <div className="space-y-3">
              <div>
                <label htmlFor="currentPassword" className="block mb-1 font-medium text-gray-700">
                  Kata Sandi Saat Ini
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div>
                <label htmlFor="newPassword" className="block mb-1 font-medium text-gray-700">
                  Kata Sandi Baru
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block mb-1 font-medium text-gray-700">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded p-2"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="showPassword"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                  className="mr-2"
                />
                <label htmlFor="showPassword" className="text-gray-600">
                  Tampilkan kata sandi
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 text-white rounded px-4 py-2 flex items-center gap-2 disabled:bg-indigo-400"
            >
              {saving ? (
                <>
                  <FaSpinner className="animate-spin" size={14} /> Menyimpan...
                </>
              ) : (
                <>
                  <FaSave size={14} /> Simpan Perubahan
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-200 text-gray-700 rounded px-4 py-2 flex items-center gap-2"
            >
              <FaTimes size={14} /> Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
