import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy — FarmFlow',
  description: 'FarmFlow Privacy Policy',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-[800px] mx-auto px-[24px] py-[64px] flex flex-col gap-10 w-full bg-background">
      <div className="border-b border-stone-200 pb-8 flex flex-col items-start gap-4">
        <Link href="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-primary transition-colors font-label-md">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Home
        </Link>
        <div>
          <h1 className="font-display font-bold text-display text-primary mb-4 tracking-tight">Privacy Policy</h1>
          <p className="font-sans text-lg text-on-surface-variant font-medium">
            Effective Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-12">

        {/* 1. General Provisions */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">1. General Provisions</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>1.1.</strong> FarmFlow operates under the regulatory jurisdiction of the Local Government Unit (LGU) of Agoo, La Union, serving as an official digital infrastructure to foster sustainable local agriculture and commerce.
            </p>
            <p>
              <strong>1.2.</strong> By accessing, registering, or transacting within the FarmFlow platform, you hereby provide your express consent to the collection, use, and processing of your personal data as outlined within this document.
            </p>
          </div>
        </section>

        {/* 2. Scope of Data Collection */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">2. Scope of Data Collection</h2>
          <p className="font-body-lg text-on-surface-variant leading-relaxed">
            In the course of providing municipal e-commerce services, we systematically collect the following classes of personal data:
          </p>
          <ul className="list-none font-body-lg text-on-surface-variant leading-relaxed space-y-3 pl-2">
            <li><strong className="text-stone-800">2.1. Account Data:</strong> Full legal name, official email address, secure password credentials, and verified contact numbers.</li>
            <li><strong className="text-stone-800">2.2. Agricultural Entity Data:</strong> Registered farm name, exact geographical location (barangay and municipality), land area, and operational descriptions.</li>
            <li><strong className="text-stone-800">2.3. Transactional Data:</strong> Comprehensive records of produce listed, orders fulfilled, product quantities, and designated delivery addresses.</li>
            <li><strong className="text-stone-800">2.4. Financial Information:</strong> External payment reference IDs and transaction statuses requisite for order fulfillment and farmer compensation.</li>
            <li><strong className="text-stone-800">2.5. Telemetry & Analytics:</strong> System logs, IP addresses, browser configurations, and user-activity metrics essential for platform auditing and security.</li>
          </ul>
        </section>

        {/* 3. Purpose of Processing */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">3. Purpose of Processing</h2>
          <p className="font-body-lg text-on-surface-variant leading-relaxed">
            Your personal data is strictly processed for the following legitimate purposes:
          </p>
          <ul className="list-disc list-outside font-body-lg text-on-surface-variant leading-relaxed space-y-2 pl-6">
            <li>To securely process, validate, and fulfill agricultural transactions between registered buyers and verified local farmers.</li>
            <li>To maintain accurate registries of municipal agricultural stakeholders in compliance with LGU directives.</li>
            <li>To dispatch critical platform notifications, operational alerts, and transactional updates.</li>
            <li>To aggregate anonymized agricultural data for local government economic analysis and policy formulation.</li>
            <li>To enforce our Terms of Service and mitigate fraudulent activities.</li>
          </ul>
        </section>

        {/* 4. Data Disclosure and Third-Party Sharing */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">4. Data Disclosure and Third-Party Sharing</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>4.1.</strong> We adhere to a strict non-disclosure protocol. Your personal data is never sold, leased, or unlawfully disseminated to unauthorized third-party marketing entities.
            </p>
            <p>
              <strong>4.2.</strong> Authorized disclosures are exclusively limited to:
            </p>
            <ul className="list-disc list-outside space-y-2 pl-6">
              <li>Verified buyers and farmers engaging in a mutual transaction (limited to relevant fulfillment data).</li>
              <li>Accredited payment gateways and cloud hosting providers bound by strict Data Processing Agreements (DPAs).</li>
              <li>Law enforcement agencies and government regulatory bodies upon the issuance of a valid legal warrant or directive.</li>
            </ul>
          </div>
        </section>

        {/* 5. Data Security and Retention */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">5. Data Security and Retention</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              <strong>5.1. Security Measures:</strong> FarmFlow employs enterprise-grade cryptographic protocols to ensure your data is encrypted both in transit (TLS) and at rest. Administrative access is strictly governed by the principle of least privilege.
            </p>
            <p>
              <strong>5.2. Data Retention:</strong> Personal and transactional data shall be retained only for as long as necessary to fulfill the operational purposes stated herein, or as mandated by national archiving and taxation statutes, after which it shall be securely expunged.
            </p>
          </div>
        </section>

        {/* 6. Rights of the Data Subject */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">6. Rights of the Data Subject</h2>
          <p className="font-body-lg text-on-surface-variant leading-relaxed">
            In accordance with Section 16 of the Data Privacy Act of 2012, you are guaranteed the following absolute rights:
          </p>
          <ul className="list-none font-body-lg text-on-surface-variant leading-relaxed space-y-3 pl-2">
            <li><strong className="text-stone-800">Right to be Informed:</strong> To know whether your personal data is being processed.</li>
            <li><strong className="text-stone-800">Right to Access:</strong> To request reasonable access to your stored personal records.</li>
            <li><strong className="text-stone-800">Right to Rectification:</strong> To formally dispute and correct inaccuracies or errors in your data.</li>
            <li><strong className="text-stone-800">Right to Erasure or Blocking:</strong> To suspend, withdraw, or order the removal of your data upon discovery of unlawful processing.</li>
            <li><strong className="text-stone-800">Right to Data Portability:</strong> To securely obtain a copy of your data in a commonly used electronic format.</li>
            <li><strong className="text-stone-800">Right to File a Complaint:</strong> To seek legal redress with the National Privacy Commission (NPC) for any privacy violations.</li>
          </ul>
        </section>

        {/* 7. Use of Cookies and Tracking Technologies */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">7. Use of Cookies</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              FarmFlow utilizes secure session cookies to authenticate users, prevent cross-site request forgery (CSRF), and maintain session integrity. You may reconfigure your browser parameters to decline optional cookies; however, doing so may critically impair core platform functionalities.
            </p>
          </div>
        </section>

        {/* 8. Policy Amendments */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">8. Policy Amendments</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              The Local Government Unit and the FarmFlow administrative board reserve the sovereign right to amend, alter, or update this Privacy Policy at any time to reflect changes in regulatory statutes or operational procedures. Users will be formally notified of significant changes via electronic dispatch.
            </p>
          </div>
        </section>

        {/* 9. Contact and Data Protection Officer */}
        <section className="flex flex-col gap-4">
          <h2 className="font-display font-semibold text-h2 text-primary border-l-4 border-primary pl-4">9. Contact the Data Protection Officer</h2>
          <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
            <p>
              For formal inquiries, data retrieval requests, or privacy concerns, you may contact our appointed Data Protection Officer (DPO) through official channels:
            </p>
            <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 inline-block">
              <p className="font-bold text-stone-800">Email: <span className="font-medium text-stone-500 italic text-sm font-normal">* Official email pending provision by Agoo LGU stakeholders.</span></p>
              <p className="font-bold text-stone-800 mt-2">Physical Address:</p>
              <p className="text-stone-600">Office of the Municipal Agriculturist</p>
              <p className="text-stone-600">Agoo Municipal Hall, Agoo, La Union</p>
              <p className="text-stone-600">Republic of the Philippines</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
