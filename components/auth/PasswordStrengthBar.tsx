'use client';

interface PasswordStrengthBarProps {
  password: string;
}

export default function PasswordStrengthBar({ password }: PasswordStrengthBarProps) {
  const getStrength = (pwd: string): number => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const score = getStrength(password);

  const getBarColor = (barIndex: number) => {
    if (score < barIndex) return 'bg-gray-200';
    if (score === 1) return 'bg-red-700';
    if (score === 2) return 'bg-gray-500';
    if (score === 3) return 'bg-green-700';
    return 'bg-green-800';
  };

  return (
    <div>
      <div className="flex gap-1.5 h-1 w-full mt-2">
        <div className={`flex-1 rounded-full transition-colors duration-300 ${getBarColor(1)}`} />
        <div className={`flex-1 rounded-full transition-colors duration-300 ${getBarColor(2)}`} />
        <div className={`flex-1 rounded-full transition-colors duration-300 ${getBarColor(3)}`} />
        <div className={`flex-1 rounded-full transition-colors duration-300 ${getBarColor(4)}`} />
      </div>
      <p className="text-[11px] text-gray-500 mt-1">Must be at least 8 characters.</p>
    </div>
  );
}
