'use client';

interface PasswordStrengthBarProps {
  password: string
}

export default function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const getStrength = (pwd: string): number => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }

  const score = getStrength(password)

  return (
    <div>
      <div className="flex gap-1 h-1 w-full mt-2">
        <div className={`flex-1 rounded-full transition-colors duration-300 ${score >= 1 ? (score === 1 ? 'bg-error' : score === 2 ? 'bg-amber-400' : score === 3 ? 'bg-primary/60' : 'bg-primary') : 'bg-auth-secondary-fixed'}`} />
        <div className={`flex-1 rounded-full transition-colors duration-300 ${score >= 2 ? (score === 2 ? 'bg-amber-400' : score === 3 ? 'bg-primary/60' : 'bg-primary') : 'bg-auth-secondary-fixed'}`} />
        <div className={`flex-1 rounded-full transition-colors duration-300 ${score >= 3 ? (score === 3 ? 'bg-primary/60' : 'bg-primary') : 'bg-auth-secondary-fixed'}`} />
        <div className={`flex-1 rounded-full transition-colors duration-300 ${score === 4 ? 'bg-primary' : 'bg-auth-secondary-fixed'}`} />
      </div>
      <p className="text-[11px] text-auth-secondary mt-1">Must be at least 8 characters.</p>
    </div>
  )
}
