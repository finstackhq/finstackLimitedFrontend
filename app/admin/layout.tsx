import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white font-(family-name:--font-manrope)">
      <div className="flex">
        <AdminSidebar />
        <div className="flex-1 lg:ml-64 min-w-0">
          <AdminHeader />
          <main className="p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}