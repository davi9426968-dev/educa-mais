import { SelectHTMLAttributes, useId } from "react";
import { ChevronDown } from "lucide-react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

export function SelectField({ label, error, id, children, ...rest }: SelectFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <div className="relative">
        <select
          id={inputId}
          className="field-input appearance-none pr-9"
          aria-invalid={Boolean(error)}
          {...rest}
        >
          {children}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-faint"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
