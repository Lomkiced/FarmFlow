interface GoogleSSOButtonProps {
  label?: string
}

export default function GoogleSSOButton({ 
  label = 'Continue with Google' 
}: GoogleSSOButtonProps) {
  return (
    <button
      type="button"
      className="w-full bg-white text-auth-on-surface border border-auth-secondary-fixed font-auth-body-base text-auth-body-base font-medium py-3 rounded-xl hover:bg-auth-surface-container-low transition-colors flex items-center justify-center gap-2"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
        <path d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.71 17.57C14.72 18.23 13.47 18.63 12 18.63C9.15 18.63 6.74 16.71 5.88 14.15H2.21V16.99C4.02 20.58 7.73 23 12 23Z" fill="#34A853"/>
        <path d="M5.88 14.15C5.66 13.49 5.54 12.77 5.54 12C5.54 11.23 5.66 10.51 5.88 9.85V7.01H2.21C1.46 8.5 1 10.2 1 12C1 13.8 1.46 15.5 2.21 16.99L5.88 14.15Z" fill="#FBBC05"/>
        <path d="M12 5.38C13.62 5.38 15.06 5.93 16.21 7.02L19.35 3.88C17.45 2.11 14.97 1 12 1C7.73 1 4.02 3.42 2.21 7.01L5.88 9.85C6.74 7.29 9.15 5.38 12 5.38Z" fill="#EA4335"/>
      </svg>
      {label}
    </button>
  )
}
