import Link from 'next/link';

export default function PendingApprovalPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <div className="w-24 h-24 bg-surface-container-highest rounded-full flex items-center justify-center mb-6 shadow-sm">
        <span className="material-symbols-outlined text-primary text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          hourglass_top
        </span>
      </div>
      
      <h1 className="text-3xl font-bold text-on-surface mb-4">Registration Under Review</h1>
      
      <p className="text-on-surface-variant max-w-md mb-8 leading-relaxed">
        Thank you for registering as a farmer! Your account is currently pending approval from an administrator. 
        We are reviewing your submitted documents and farm details to ensure the integrity of our marketplace.
      </p>

      <div className="bg-primary-container/30 border border-primary-container p-4 rounded-xl max-w-md w-full mb-8">
        <p className="text-sm text-on-surface-variant">
          You will receive an email notification once your account has been fully verified and activated.
        </p>
      </div>

      <Link 
        href="/"
        className="px-6 py-3 bg-primary text-on-primary font-medium rounded-full hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
      >
        Return to Home
      </Link>
    </div>
  );
}
