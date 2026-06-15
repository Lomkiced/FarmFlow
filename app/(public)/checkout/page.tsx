import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CheckoutClient from '@/components/marketplace/CheckoutClient';
import { getAddressesAction } from '@/app/actions/addresses';
import { requireAuth } from '@/lib/dal';
import { redirect } from 'next/navigation';

export default async function CheckoutPage() {
  const user = await requireAuth();

  if (user.role !== 'BUYER') {
    redirect('/');
  }

  const addresses = await getAddressesAction();

  return (
    <>
      <Navbar />
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-[24px] py-[32px]">
        <h1 className="font-['Manrope'] text-[32px] font-bold tracking-[-0.01em] text-on-background mb-[32px]">
          Checkout
        </h1>
        <CheckoutClient addresses={addresses} />
      </main>
      <Footer />
    </>
  );
}