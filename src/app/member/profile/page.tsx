import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { nextAuthOptions } from "../../api/auth/[...nextauth]/options";
import ProfileForm from "@/components/profile/ProfileForm";
import DangerZone from "@/components/profile/DangerZone";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import MemberLayout from '@/components/member/MemberLayout';

// Define the User document interface
interface UserDocument {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt?: Date;
  passwordHash?: string;
  role?: string;
}

export default async function MemberProfilePage() {
  // Verifikasi sesi dan role
  const session = await getServerSession(nextAuthOptions);
  
  if (!session || !session.user) {
    redirect("/signin");
  }
  
  if (session.user.role !== "customer") {
    redirect("/");
  }

  // Connect to the database
  await dbConnect();
  
  // Fetch user data directly from the database
  let userData: UserDocument | null = null;
  try {
    // Find the user and convert to plain object
    const userDoc = await User.findById(session.user.id);
    if (userDoc) {
      // Convert Mongoose document to plain object and cast to our interface
      userData = userDoc.toObject() as UserDocument;
    }
  } catch (error) {
    console.error("Failed to fetch user data from database:", error);
    // Continue with session data as fallback
  }
  
  // Use the fetched data for user profile
  const user = {
    id: session.user.id,
    name: userData?.name || session.user.name || "Member",
    email: userData?.email || session.user.email || "",
    phone: userData?.phone || "",
    address: userData?.address || "",
    createdAt: userData?.createdAt ? 
      new Date(userData.createdAt).toLocaleDateString('id-ID', {
        day: '2-digit', 
        month: 'long', 
        year: 'numeric'
      }) : 
      "Tidak tersedia"
  };

  return (
    <MemberLayout title="Profil Saya" showBackButton={true}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Informasi profil dasar */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{user.name}</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-2">{user.email}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Member sejak: {user.createdAt}</p>
            </div>
            <div className="mt-4 md:mt-0">
              <button 
                type="button"
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-all"
              >
                Ubah Foto Profil
              </button>
            </div>
          </div>
        </div>
        
        {/* Form edit profil - using client component */}
        <ProfileForm user={user} />
        
        {/* Danger Zone - using client component */}
        <DangerZone userId={user.id} />
      </div>
    </MemberLayout>
  );
}
