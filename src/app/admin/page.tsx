import { Metadata } from "next";
import { ReservationMetrics } from "@/components/dashboard/ReservationMetrics";
import MonthlyReservationChart from "@/components/dashboard/MonthlyReservationChart";
import FieldUsageStatistics from "@/components/dashboard/FieldUsageStatistics";
import RecentReservations from "@/components/dashboard/RecentReservations";
import MonthlyTarget from "@/components/dashboard/MonthlyTarget";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Dashboard Admin | Malay Futsal",
  description: "Panel kontrol admin untuk manajemen sistem Malay Futsal",
};

export default async function AdminDashboard() {
  const session = await auth();

  // Debugging log untuk session
  console.log('Session in admin page:', JSON.stringify(session, null, 2));

  // Redirect ke halaman login jika belum terautentikasi
  if (!session?.user) {
    console.log('No session user found, redirecting to signin');
    redirect('/signin?callbackUrl=/admin');
  }

  // Periksa apakah pengguna memiliki role admin
  const user = session.user as { role?: string, email?: string };
  console.log('User object in admin page:', user);
  
  if (user.role !== 'admin') {
    console.log(`User role is ${user.role}, not admin. Redirecting to signin`);
    // Redirect ke halaman login jika bukan admin
    redirect('/signin');
  }
  
  console.log('Admin access granted to:', user.email);

  return (
    <div className="p-4 sm:p-5">
      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
        Selamat Datang, {session.user.name || 'Admin'}
      </h1>
      
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 space-y-4 xl:col-span-8">
          <ReservationMetrics />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MonthlyReservationChart />
            <FieldUsageStatistics />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-4 space-y-4">
          <MonthlyTarget />
          <RecentReservations />
        </div>
      </div>
    </div>
  );
}
