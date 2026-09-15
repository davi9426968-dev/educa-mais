import { TextareaHTMLAttributes, useId } from "react";

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export function TextareaField({ label, error, id, ...rest }: TextareaFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div>
      <label htmlFor={inputId} className="field-label">
        {label}
      </label>
      <textarea id={inputId} className="field-input" rows={3} aria-invalid={Boolean(error)} {...rest} />
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
