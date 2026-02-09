import React from 'react';
import type { FormFieldRenderProps } from '../types.js';

export function DefaultFormField({
  field,
  value,
  onChange,
  error,
  inputClassName,
  labelClassName,
  fieldClassName,
  errorClassName,
}: FormFieldRenderProps) {
  const fieldId = `form-field-${field.name}`;
  const errorId = `${fieldId}-error`;
  const isRequired = field.validation?.required ?? false;
  const hasError = !!error;

  const commonInputProps = {
    id: fieldId,
    name: field.name,
    className: inputClassName,
    required: isRequired,
    'aria-invalid': hasError ? (true as const) : undefined,
    'aria-describedby': hasError ? errorId : undefined,
  };

  let input: React.ReactNode;

  switch (field.type) {
    case 'textarea':
      input = (
        <textarea
          {...commonInputProps}
          rows={4}
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;

    case 'checkbox':
      input = (
        <label className={labelClassName} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            {...commonInputProps}
            type="checkbox"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span>{field.label}</span>
          {isRequired && <span aria-hidden="true"> *</span>}
        </label>
      );
      break;

    case 'select':
      input = (
        <select
          {...commonInputProps}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">{field.placeholder || 'Select...'}</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
      break;

    case 'radio':
      input = (
        <div role="radiogroup" aria-labelledby={`${fieldId}-label`}>
          {field.options?.map((opt) => (
            <label key={opt.value} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="radio"
                name={field.name}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                required={isRequired}
                aria-invalid={hasError ? true : undefined}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      );
      break;

    case 'number':
      input = (
        <input
          {...commonInputProps}
          type="number"
          placeholder={field.placeholder}
          min={field.validation?.min}
          max={field.validation?.max}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;

    case 'phone':
      input = (
        <input
          {...commonInputProps}
          type="tel"
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;

    case 'email':
      input = (
        <input
          {...commonInputProps}
          type="email"
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;

    case 'date':
      input = (
        <input
          {...commonInputProps}
          type="date"
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;

    default:
      input = (
        <input
          {...commonInputProps}
          type="text"
          placeholder={field.placeholder}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
  }

  return (
    <div className={fieldClassName}>
      {field.type !== 'checkbox' && (
        <label id={`${fieldId}-label`} htmlFor={fieldId} className={labelClassName}>
          {field.label}
          {isRequired && <span aria-hidden="true"> *</span>}
        </label>
      )}
      {input}
      {hasError && (
        <div id={errorId} role="alert" className={errorClassName}>
          {error}
        </div>
      )}
    </div>
  );
}
