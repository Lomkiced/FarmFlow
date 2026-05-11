export default function FarmerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-background min-h-screen flex justify-center">
      <div className="w-full max-w-[390px] relative flex flex-col min-h-screen md:max-w-none md:w-full">
        {children}
      </div>
    </div>
  )
}
