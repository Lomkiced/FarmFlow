import Link from 'next/link';

export const metadata = {
  title: 'Support — FarmFlow',
  description: 'FarmFlow Support Center',
};

export default function SupportPage() {
  return (
    <div className="max-w-[1000px] mx-auto px-[24px] py-[64px] flex flex-col gap-12 w-full bg-background">
      {/* 1. Page Header */}
      <div className="border-b border-stone-200 pb-8 flex flex-col items-start gap-4">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-primary transition-colors font-label-md">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Home
        </Link>
        <div>
          <h1 className="font-display font-bold text-display text-primary mb-4 tracking-tight">FarmFlow Support Center</h1>
          <p className="font-sans text-lg text-on-surface-variant font-medium">
            We are here to help. Reach out to us through any of the channels below.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {/* 2 & 3. Support Channels (Cards) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 — Email Support */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">mail</span>
            </div>
            <div>
              <h3 className="font-display font-semibold text-xl text-stone-800 mb-2">Email Support</h3>
              <p className="font-body text-stone-600 mb-4 h-16">
                Send us your concerns and we will respond within 1-2 business days.
              </p>
              <span className="font-medium text-stone-500 italic text-sm">
                * Official email pending provision by Agoo LGU stakeholders.
              </span>
            </div>
          </div>

          {/* Card 2 — Phone Support */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
              <span className="material-symbols-outlined">call</span>
            </div>
            <div>
              <h3 className="font-display font-semibold text-xl text-stone-800 mb-2">Phone Support</h3>
              <p className="font-body text-stone-600 mb-4 h-16">
                Call us during office hours for immediate assistance.
              </p>
              <span className="font-medium text-stone-500 italic text-sm">
                * Official hotline pending provision by Agoo LGU stakeholders.
              </span>
            </div>
          </div>

          {/* Card 3 — Visit Us */}
          <div className="bg-surface-container-lowest p-6 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-4 items-start">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
              <span className="material-symbols-outlined">location_on</span>
            </div>
            <div>
              <h3 className="font-display font-semibold text-xl text-stone-800 mb-2">Visit Our Office</h3>
              <p className="font-body text-stone-600 mb-4 h-16">
                Come visit the Municipal Agriculture Office for in-person assistance.
              </p>
              <span className="font-bold text-blue-600">
                Agoo, La Union, Philippines
              </span>
            </div>
          </div>
        </section>

        {/* Office Info & Response Time Notice */}
        <section className="bg-stone-50 p-6 rounded-xl border border-stone-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="font-body text-stone-700">
              <p className="font-bold text-stone-900 mb-1">Official Office Hours</p>
              <p>Monday to Friday, 8:00 AM to 5:00 PM</p>
              <p className="text-stone-500 text-sm">(Closed on Philippine public holidays)</p>
            </div>
            <div className="font-body text-stone-700 max-w-md border-l-4 border-amber-400 pl-4">
              <p>
                <strong>Response Time Notice:</strong> Our support team typically responds within 1-2 business days. For urgent concerns, please contact us by phone during office hours.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Step-by-Step Guides */}
        <section className="flex flex-col gap-6">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">Step-by-Step Guides</h2>
          <div className="flex flex-col gap-6">
            
            {/* Guide for Farmers */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-stone-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">agriculture</span>
                </div>
                <h3 className="font-bold text-xl text-stone-800">For Farmers: Selling on FarmFlow</h3>
              </div>
              <ul className="list-decimal list-outside font-body text-stone-600 leading-relaxed space-y-3 pl-6">
                <li><strong>Register your Profile:</strong> Go to the Registration page and select <strong>Farmer</strong>. Fill out your personal details and provide accurate farm information including your barangay, land area, and a cover photo.</li>
                <li><strong>Get Verified:</strong> Your account will initially be set to pending. Await official review and approval from the Municipal Agriculture Office to gain full platform access.</li>
                <li><strong>Manage Crop Cycles:</strong> Before listing items, use your dashboard to register your planted crops, including the date planted and expected harvest dates.</li>
                <li><strong>List Produce:</strong> Add your fresh products to the public marketplace. Set your price per kilogram, specify your available stock, and upload high-quality photos.</li>
                <li><strong>Fulfill Orders:</strong> When a buyer places an order, you must accept it by changing its status to <em>Confirmed</em>, prepare the produce, and then mark it as <em>Ready</em> for delivery.</li>
                <li><strong>Receive Payouts:</strong> Once the produce safely reaches the buyer, update the order status to <em>Delivered</em>. The platform will then process and release your secure payout.</li>
              </ul>
            </div>

            {/* Guide for Buyers */}
            <div className="bg-surface-container-lowest p-6 rounded-xl border border-stone-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                  <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
                </div>
                <h3 className="font-bold text-xl text-stone-800">For Buyers: Purchasing Local Produce</h3>
              </div>
              <ul className="list-decimal list-outside font-body text-stone-600 leading-relaxed space-y-3 pl-6">
                <li><strong>Create an Account:</strong> Go to the Registration page and select <strong>Buyer</strong>. Set up your free profile with your contact details and default delivery address.</li>
                <li><strong>Browse the Market:</strong> Explore fresh, locally-sourced products. You can browse the global marketplace or visit specific Farmer profiles to learn about their farming practices.</li>
                <li><strong>Place an Order:</strong> Add your desired items to your cart, ensuring your requested quantity does not exceed the farmer's available stock in kilograms.</li>
                <li><strong>Secure Checkout:</strong> Review your delivery address, check any applicable delivery fees, and complete your payment securely via our integrated PayMongo system.</li>
                <li><strong>Track Progress:</strong> Monitor your order via your dashboard. You will receive updates as the farmer confirms your order, prepares it, and marks it for delivery.</li>
                <li><strong>Receive Delivery:</strong> Enjoy premium, fresh produce delivered exactly to your provided address, directly supporting the local agricultural community.</li>
              </ul>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
