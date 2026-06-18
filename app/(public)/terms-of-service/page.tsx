import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service — FarmFlow',
  description: 'FarmFlow Terms of Service',
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-[800px] mx-auto px-[24px] py-[64px] flex flex-col gap-10 w-full bg-background">
      <div className="border-b border-stone-200 pb-8 flex flex-col items-start gap-4">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-primary transition-colors font-label-md">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Home
        </Link>
        <div>
          <h1 className="font-display font-bold text-display text-primary mb-4 tracking-tight">Terms of Service</h1>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        {/* 1. Acceptance of Terms */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">1. Acceptance of Terms</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>1.1.</strong> By accessing or using FarmFlow, you agree to be bound by these Terms of Service and all applicable Philippine laws and regulations.
            </p>
            <p>
              <strong>1.2.</strong> If you do not agree to these terms, you must discontinue use of the platform immediately.
            </p>
            <p>
              <strong>1.3.</strong> These terms apply to all users including farmers, buyers, and administrators.
            </p>
          </div>
        </section>

        {/* 2. About the Platform */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">2. About the Platform</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>2.1.</strong> FarmFlow is an official digital agricultural marketplace developed and operated under the local government unit of Agoo, La Union, Philippines.
            </p>
            <p>
              <strong>2.2.</strong> The platform facilitates direct trade between registered local farmers and buyers of agricultural produce.
            </p>
            <p>
              <strong>2.3.</strong> FarmFlow operates in compliance with the Department of Agriculture (DA) regulations and relevant Philippine national laws.
            </p>
          </div>
        </section>

        {/* 3. User Eligibility */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">3. User Eligibility</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>3.1.</strong> Users must be at least 18 years of age to register.
            </p>
            <p>
              <strong>3.2.</strong> Farmer accounts must be verified and approved by the Municipal Agriculture Office before gaining full access to the platform.
            </p>
            <p>
              <strong>3.3.</strong> Users must provide accurate, complete, and truthful information during registration.
            </p>
            <p>
              <strong>3.4.</strong> The LGU reserves the right to suspend or terminate any account found to contain false or misleading information.
            </p>
          </div>
        </section>

        {/* 4. Farmer Obligations */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">4. Farmer Obligations</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>4.1.</strong> Farmers must ensure that all listed products are accurately described, including variety, quantity, and price per kilogram.
            </p>
            <p>
              <strong>4.2.</strong> Farmers are solely responsible for the quality, safety, and freshness of the produce they list and deliver.
            </p>
            <p>
              <strong>4.3.</strong> Farmers must comply with all food safety standards set by the Bureau of Agriculture and Fisheries Standards (BAFS).
            </p>
            <p>
              <strong>4.4.</strong> Farmers must fulfill confirmed orders within the agreed timeframe. Failure to do so may result in account suspension.
            </p>
            <p>
              <strong>4.5.</strong> Farmers must not list products that are prohibited, restricted, or regulated without proper permits.
            </p>
          </div>
        </section>

        {/* 5. Buyer Obligations */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">5. Buyer Obligations</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>5.1.</strong> Buyers must provide accurate delivery addresses and contact information for all orders.
            </p>
            <p>
              <strong>5.2.</strong> Buyers must complete payment for confirmed orders in a timely manner.
            </p>
            <p>
              <strong>5.3.</strong> Buyers must inspect produce upon delivery and report any concerns within 24 hours of receipt.
            </p>
            <p>
              <strong>5.4.</strong> Buyers must not use the platform for fraudulent purchases or chargebacks without legitimate cause.
            </p>
          </div>
        </section>

        {/* 6. Prohibited Activities */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">6. Prohibited Activities</h2>
          <p className="font-body-lg text-on-surface-variant leading-relaxed">
            Users are strictly prohibited from engaging in the following activities:
          </p>
          <ul className="list-disc list-outside font-body-lg text-on-surface-variant leading-relaxed space-y-2 pl-6">
            <li>Impersonating another user, farmer, or government official.</li>
            <li>Listing or purchasing prohibited or regulated agricultural products without authorization.</li>
            <li>Manipulating product listings, prices, or reviews in a deceptive manner.</li>
            <li>Using the platform for any unlawful purpose under Philippine law.</li>
            <li>Attempting to gain unauthorized access to any part of the system.</li>
            <li>Engaging in any activity that disrupts the normal operation of the platform.</li>
          </ul>
        </section>

        {/* 7. Order and Transaction Policy */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">7. Order and Transaction Policy</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>7.1.</strong> All transactions made through FarmFlow are binding agreements between the buyer and farmer.
            </p>
            <p>
              <strong>7.2.</strong> FarmFlow facilitates the transaction but is not a party to the sale contract.
            </p>
            <p>
              <strong>7.3.</strong> Disputes between buyers and farmers must first be reported to the platform administrator for mediation.
            </p>
            <p>
              <strong>7.4.</strong> The LGU reserves the right to intervene in disputes involving platform misuse or violations of these terms.
            </p>
          </div>
        </section>

        {/* 8. Intellectual Property */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">8. Intellectual Property</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>8.1.</strong> All content, branding, logos, and materials on FarmFlow are the property of the LGU of Agoo, La Union.
            </p>
            <p>
              <strong>8.2.</strong> Users may not reproduce, distribute, or use platform content for commercial purposes without written authorization from the LGU.
            </p>
          </div>
        </section>

        {/* 9. Limitation of Liability */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">9. Limitation of Liability</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>9.1.</strong> FarmFlow and the LGU of Agoo shall not be held liable for losses arising from transactions between buyers and farmers.
            </p>
            <p>
              <strong>9.2.</strong> The LGU does not guarantee the continuous availability of the platform and shall not be liable for service interruptions beyond its control.
            </p>
            <p>
              <strong>9.3.</strong> Users access and use the platform at their own risk.
            </p>
          </div>
        </section>

        {/* 10. Data Privacy */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">10. Data Privacy</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>10.1.</strong> The collection and use of personal data on FarmFlow is governed by our Privacy Policy and complies with Republic Act No. 10173, also known as the Data Privacy Act of 2012.
            </p>
            <p>
              <strong>10.2.</strong> Users consent to the collection and processing of their data as described in our Privacy Policy upon registration.
            </p>
          </div>
        </section>

        {/* 11. Amendments to Terms */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">11. Amendments to Terms</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>11.1.</strong> The LGU of Agoo reserves the right to update or amend these Terms of Service at any time.
            </p>
            <p>
              <strong>11.2.</strong> Users will be notified of significant changes through the platform.
            </p>
            <p>
              <strong>11.3.</strong> Continued use of FarmFlow after amendments constitutes acceptance of the revised terms.
            </p>
          </div>
        </section>

        {/* 12. Governing Law and Jurisdiction */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">12. Governing Law and Jurisdiction</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>12.1.</strong> These Terms of Service shall be governed by the laws of the Republic of the Philippines.
            </p>
            <p>
              <strong>12.2.</strong> Any disputes arising from the use of FarmFlow shall be subject to the jurisdiction of the appropriate courts of La Union, Philippines.
            </p>
          </div>
        </section>

        {/* 13. Contact Information */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">13. Contact Information</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              For questions or concerns regarding these terms, please contact:
            </p>
            <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 inline-block">
              <p className="font-bold text-stone-800">Municipal Agriculture Office</p>
              <p className="text-stone-600">Municipality of Agoo, La Union, Philippines</p>
              <p className="font-bold text-stone-800 mt-2">Email: <span className="font-medium text-stone-500 italic text-sm font-normal">* Official email pending provision by Agoo LGU stakeholders.</span></p>
              <p className="text-stone-600 mt-2">Office Hours: Monday to Friday, 8:00 AM to 5:00 PM</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
