import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-6xl mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-brand-500 w-8 h-8 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">MF</span>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Malay Futsal</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/signin"
              className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:text-brand-500 dark:hover:text-brand-400"
            >
              Masuk
            </Link>
            <Link
              href="/signup"
              className="px-3 py-1.5 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Selamat Datang di Malay Futsal
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm md:text-base">
            Temukan dan booking lapangan futsal favorit Anda dengan mudah. Nikmati pengalaman bermain futsal tanpa ribet.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/signin"
              className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg"
            >
              Masuk & Booking
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg"
            >
              Daftar Sekarang
            </Link>
          </div>
        </div>

        {/* Feature Section */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl w-full">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Booking Mudah</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Pesan lapangan favorit Anda kapan saja dan di mana saja.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Pembayaran Aman</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Berbagai metode pembayaran yang mudah dan terjamin keamanannya.</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-brand-100 dark:bg-brand-900/20 rounded-lg flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Kelola Reservasi</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">Lihat dan kelola jadwal booking Anda dengan mudah.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 shadow-inner">
        <div className="max-w-6xl mx-auto p-4 text-center text-xs text-gray-600 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} Malay Futsal. Semua hak cipta dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
