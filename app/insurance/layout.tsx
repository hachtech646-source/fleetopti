import Sidebar from '@/components/Sidebar'

export default function InsuranceLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="md:flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}

