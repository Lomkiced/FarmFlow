import Link from 'next/link';

export default function SuspendedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 text-center">
      <div className="w-24 h-24 bg-error-container/20 border border-error/30 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <span className="material-symbols-outlined text-error text-[48px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          gavel
        </span>
      </div>
      
      <h1 className="text-3xl font-bold text-on-surface mb-4">Account Suspended</h1>
      
      <p className="text-on-surface-variant max-w-md mb-8 leading-relaxed">
        Your farmer account has been suspended by the administration. You currently do not have access to the farmer dashboard or marketplace tools.
      </p>

      <div className="bg-error-container/20 border border-error/30 p-4 rounded-xl max-w-md w-full mb-8">
        <p className="text-sm text-error font-medium">
          If you believe this is a mistake, please contact support for further assistance.
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
