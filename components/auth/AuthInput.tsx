'use client';

interface AuthInputProps {
  id: string
  name?: string
  label?: string
  type?: string
  placeholder?: string
  icon?: string
  trailingIcon?: string
  onTrailingClick?: () => void
  helperText?: string
  error?: string
  required?: boolean
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  autoComplete?: string
}

export default function AuthInput({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  icon,
  trailingIcon,
  onTrailingClick,
  helperText,
  error,
  required,
  value,
  onChange,
  autoComplete,
}: AuthInputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="block text-auth-body-sm font-medium text-auth-on-surface mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-outline pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          name={name ?? id}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`w-full py-2 bg-white border rounded-lg text-auth-body-base text-auth-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors placeholder-auth-secondary/50 ${
            error
              ? 'border-error focus:border-error bg-error-container/5'
              : 'border-auth-secondary-fixed focus:border-primary bg-white'
          } ${
            icon ? 'pl-10' : 'pl-3'
          } ${trailingIcon ? 'pr-10' : 'pr-3'}`}
        />
        {trailingIcon && (
          <button
            type="button"
            onClick={onTrailingClick}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-auth-on-surface flex items-center justify-center"
          >
            <span className={`material-symbols-outlined text-[20px] ${error && passwordsMatchHelper(trailingIcon) ? 'text-primary' : ''}`}>
              {trailingIcon}
            </span>
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-error mt-1">{error}</p>}
      {helperText && !error && <p className="text-[11px] text-auth-secondary mt-1">{helperText}</p>}
    </div>
  )
}

function passwordsMatchHelper(iconName: string) {
  // Minor hack to make check_circle green if it's the specific check icon used for matches
  return iconName === 'check_circle';
}
