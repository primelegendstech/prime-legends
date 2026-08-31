import { Suspense } from "react";
import type { Metadata } from "next";
import { exigirAdmin } from "@/lib/admin";
import GoldNetworkBackground from "@/components/GoldNetworkBackground";
import AdminSidebar from "@/components/AdminSidebar";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await exigirAdmin();

  return (
    <main className="relative min-h-screen bg-black px-4 pt-24 pb-10 overflow-hidden">
      <GoldNetworkBackground />

      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Painel Admin</h1>
            <p className="text-gray-400 text-sm">{admin.email}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          <AdminSidebar />
          <div className="flex-1 w-full min-w-0">
            <Suspense fallback={null}>{children}</Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}
