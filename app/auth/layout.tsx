export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-auth-background text-auth-on-surface font-['Inter'] antialiased">
      {children}
    </div>
  )
}
