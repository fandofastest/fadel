import { Metadata } from "next";
import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import RecentOrders from "@/components/ecommerce/RecentOrders";
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
    <div className="p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Selamat Datang, {session.user.name || 'Admin'}
      </h1>
      
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <EcommerceMetrics />
          <MonthlySalesChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <MonthlyTarget />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard />
        </div>

        <div className="col-span-12">
          <RecentOrders />
        </div>
      </div>
    </div>
  );
}
