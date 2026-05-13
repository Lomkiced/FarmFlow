export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background min-h-screen flex justify-center">
      <div className="w-full relative flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  )
}
