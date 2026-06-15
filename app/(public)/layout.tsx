import { getSessionUser } from '@/lib/dal';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      <Footer user={user} />
    </div>
  );
}
