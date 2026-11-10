import Link from 'next/link';
import SupportFormClient from '@/components/support/SupportFormClient';

export const metadata = {
  title: 'Support — FarmFlow',
  description: 'FarmFlow Support Center',
};

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 flex flex-col gap-10 w-full bg-[#F9FAFB]">
      {/* 1. Page Header */}
      <div className="border-b border-gray-200 pb-6 flex flex-col items-start gap-3">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-green-800 transition-colors">
          <span className="material-symbols-outlined text-[16px]">arrow_back</span>
          Back to Home
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Support & Agricultural Assistance</h1>
          <p className="text-sm text-gray-600 mt-1">
            Need help with your order, verification, or logistics? Reach out through any of our official channels.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Support Channels */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 — Email Support */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-gray-900 mb-1">Email Support</h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Send us your concerns and our team will respond within 1-2 business days.
              </p>
            </div>
            <span className="text-[11px] text-gray-400">
              support@farmflow.gov.ph
            </span>
          </div>

          {/* Card 2 — Phone Support */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-gray-900 mb-1">Phone Support</h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Contact Municipal Agriculture Office support during office hours.
              </p>
            </div>
            <span className="text-[11px] text-gray-400">
              (072) 682-1234
            </span>
          </div>

          {/* Card 3 — Visit Us */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-base text-gray-900 mb-1">Municipal Agriculture</h3>
              <p className="text-xs text-gray-600 mb-3 leading-relaxed">
                Visit the Municipal Agriculture Office in Agoo for walk-in verification.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-green-800">
              Agoo, La Union, Philippines
            </span>
          </div>
        </section>

        {/* Office Info & Response Notice */}
        <section className="bg-white p-5 rounded-lg border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs text-gray-600">
            <div>
              <p className="font-bold text-gray-900 text-sm mb-0.5">Office Hours</p>
              <p>Monday to Friday, 8:00 AM to 5:00 PM</p>
              <p className="text-gray-400 text-[11px] mt-0.5">Closed on Philippine public holidays</p>
            </div>
            <div className="max-w-md border-l-2 border-green-800 pl-3">
              <p>
                <strong>Response Notice:</strong> Inquiries are addressed within 1–2 business days. For urgent order discrepancies, use the Return/Dispute button in your order tracking screen.
              </p>
            </div>
          </div>
        </section>

        {/* Direct Contact Form */}
        <section id="contact-form">
          <SupportFormClient />
        </section>

        {/* Step-by-Step Guides */}
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-bold text-gray-900 border-l-2 border-green-800 pl-3">Operating Guides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Guide for Farmers */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col gap-3">
              <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">For Farmers: Selling on FarmFlow</h3>
              <ol className="list-decimal list-outside text-xs text-gray-600 leading-relaxed space-y-2 pl-4">
                <li><strong>Register & Verify RSBSA:</strong> Submit your RSBSA number and matching government ID for LGU verification.</li>
                <li><strong>Track Crop Stages:</strong> Register planted crops to track development and forecast yields.</li>
                <li><strong>List Produce:</strong> Post retail or wholesale batches with fractional kg settings and minimum order quantities.</li>
                <li><strong>Fulfill Orders:</strong> Log courier dispatch details, license numbers, and photo proof-of-delivery (POD).</li>
                <li><strong>Receive Payout:</strong> Escrow funds are released upon buyer receipt confirmation.</li>
              </ol>
            </div>

            {/* Guide for Buyers */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col gap-3">
              <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">For Buyers: Direct Purchasing</h3>
              <ol className="list-decimal list-outside text-xs text-gray-600 leading-relaxed space-y-2 pl-4">
                <li><strong>Create Profile:</strong> Register with verified phone and delivery address within La Union.</li>
                <li><strong>Browse Fresh Harvest:</strong> Select fractional weights (1/4 kg, 1/2 kg, 1 kg) or setup wholesale contracts.</li>
                <li><strong>Escrow Checkout:</strong> Pay securely via GCash or Cash on Delivery (COD).</li>
                <li><strong>Track Logistics:</strong> Monitor live parcel checkpoints and rider contact from farm gate to your door.</li>
                <li><strong>Inspect & Confirm:</strong> Confirm receipt to release farmer payment, or report issues within 24 hours.</li>
              </ol>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
