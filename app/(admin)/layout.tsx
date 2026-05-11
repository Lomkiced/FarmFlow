import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminTopbar from '@/components/admin/AdminTopbar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex bg-admin-background font-sans min-h-screen">
      <AdminSidebar />
      <div className="flex flex-col ml-[280px] w-full min-h-screen flex-1">
        <AdminTopbar />
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  )
}
