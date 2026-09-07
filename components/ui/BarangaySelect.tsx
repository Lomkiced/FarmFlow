'use client';

import React, { forwardRef } from 'react';
import { AGOO_BARANGAYS, normalizeBarangayName } from '@/lib/constants/locations';


export interface BarangaySelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string | boolean;
  label?: string;
  helperText?: string;
  placeholder?: string;
  allowOutsideAgoo?: boolean;
}

export const BarangaySelect = forwardRef<HTMLSelectElement, BarangaySelectProps>(
  (
    {
      error,
      label,
      helperText,
      placeholder = 'Select Barangay',
      defaultValue,
      value,
      className = '',
      allowOutsideAgoo = false,
      ...props
    },
    ref
  ) => {
    // Normalize defaultValue if it's a legacy value (e.g. "Consolacion" -> "Consolacion (Poblacion)")
    const normalizedDefault =
      typeof defaultValue === 'string' ? normalizeBarangayName(defaultValue) : defaultValue;

    const normalizedValue =
      typeof value === 'string' ? normalizeBarangayName(value) : value;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={props.id || props.name}
            className="block text-sm font-semibold text-on-surface"
          >
            {label} {props.required && <span className="text-error">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            defaultValue={normalizedDefault}
            value={normalizedValue}
            className={`w-full appearance-none rounded-lg border bg-white py-2.5 px-3 pr-10 text-[14px] text-on-surface outline-none transition-colors shadow-sm cursor-pointer ${
              error
                ? 'border-error bg-error-container/5 focus:border-error focus:ring-2 focus:ring-error/20'
                : 'border-outline-variant focus:border-primary focus:ring-2 focus:ring-primary/20'
            } ${className}`}
            {...props}
          >
            <option value="" disabled={props.required}>
              {placeholder}
            </option>
            {AGOO_BARANGAYS.map((brgy) => (
              <option key={brgy} value={brgy}>
                {brgy}
              </option>
            ))}
            {allowOutsideAgoo && (
              <option value="Outside Agoo">Other / Outside Agoo</option>
            )}
          </select>

          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-outline">
            <span className="material-symbols-outlined text-[20px]">expand_more</span>
          </div>
        </div>

        {helperText && !error && (
          <p className="text-[11px] text-on-surface-variant mt-1">{helperText}</p>
        )}

        {typeof error === 'string' && error && (
          <p className="text-[11px] text-error font-medium mt-1">{error}</p>
        )}
      </div>
    );
  }
);

BarangaySelect.displayName = 'BarangaySelect';
