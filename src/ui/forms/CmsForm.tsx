import React, { useState, useEffect, useCallback } from 'react';
import type { CmsFormProps } from '../types.js';
import type { FormDefinition } from '../../client/types.js';
import { DefaultFormField } from './DefaultFormField.js';
import { validateFormData } from './validation.js';

function buildInitialData(form: FormDefinition): Record<string, string | boolean> {
  const data: Record<string, string | boolean> = {};
  for (const field of form.fields) {
    data[field.name] = field.type === 'checkbox' ? false : '';
  }
  return data;
}

export function CmsForm({
  slug,
  client,
  form: formProp,
  className,
  fieldClassName,
  labelClassName,
  inputClassName,
  errorClassName,
  buttonClassName,
  successClassName,
  errorContainerClassName,
  loadingClassName,
  submitLabel = 'Submit',
  submittingLabel = 'Submitting...',
  loadingContent,
  successContent,
  errorContent,
  renderField,
  onSuccess,
  onError,
  onLoadError,
  resetOnSuccess = true,
  children,
}: CmsFormProps) {
  const [formDef, setFormDef] = useState<FormDefinition | null>(formProp ?? null);
  const [formData, setFormData] = useState<Record<string, string | boolean>>(() =>
    formProp ? buildInitialData(formProp) : {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'submitting' | 'success' | 'error'>(
    formProp ? 'idle' : 'loading'
  );
  const [resultMessage, setResultMessage] = useState('');

  // Fetch form definition if slug is provided
  useEffect(() => {
    if (formProp || !slug || !client) return;

    let cancelled = false;
    setStatus('loading');

    client
      .getForm(slug)
      .then((form) => {
        if (cancelled) return;
        setFormDef(form);
        setFormData(buildInitialData(form));
        setStatus('idle');
      })
      .catch((err) => {
        if (cancelled) return;
        setStatus('error');
        setResultMessage(err instanceof Error ? err.message : 'Failed to load form');
        onLoadError?.(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
    };
  }, [slug, client, formProp, onLoadError]);

  const handleFieldChange = useCallback((fieldName: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
    // Clear error for this field when user edits it
    setErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!formDef || !client) return;

      // Validate
      const validationErrors = validateFormData(formDef.fields, formData);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

      setErrors({});
      setStatus('submitting');

      try {
        const response = await client.submitForm(formDef.slug, formData);
        setStatus('success');
        setResultMessage(response.message || formDef.success_message || 'Form submitted successfully');
        onSuccess?.(response);

        if (resetOnSuccess) {
          setFormData(buildInitialData(formDef));
        }
      } catch (err) {
        setStatus('error');
        const errorMsg = err instanceof Error ? err.message : 'Failed to submit form';
        setResultMessage(errorMsg);
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    },
    [formDef, client, formData, onSuccess, onError, resetOnSuccess]
  );

  // Loading state
  if (status === 'loading') {
    if (loadingContent) {
      return <div className={loadingClassName}>{loadingContent}</div>;
    }
    return <div className={loadingClassName}>Loading form...</div>;
  }

  // Error loading form
  if (status === 'error' && !formDef) {
    if (errorContent) {
      return <div className={errorContainerClassName}>{errorContent}</div>;
    }
    return (
      <div className={errorContainerClassName} role="alert">
        {resultMessage || 'Failed to load form'}
      </div>
    );
  }

  // No form loaded
  if (!formDef) return null;

  // Success state
  if (status === 'success') {
    if (successContent) {
      return <div className={successClassName}>{successContent}</div>;
    }
    return (
      <div className={successClassName} role="status">
        {resultMessage}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={className} noValidate>
      {formDef.fields.map((field) => {
        const fieldValue = formData[field.name] ?? (field.type === 'checkbox' ? false : '');
        const fieldError = errors[field.name];

        if (renderField) {
          return (
            <React.Fragment key={field.name}>
              {renderField({
                field,
                value: fieldValue,
                onChange: (val) => handleFieldChange(field.name, val),
                error: fieldError,
                inputClassName,
                labelClassName,
                fieldClassName,
                errorClassName,
              })}
            </React.Fragment>
          );
        }

        return (
          <DefaultFormField
            key={field.name}
            field={field}
            value={fieldValue}
            onChange={(val) => handleFieldChange(field.name, val)}
            error={fieldError}
            inputClassName={inputClassName}
            labelClassName={labelClassName}
            fieldClassName={fieldClassName}
            errorClassName={errorClassName}
          />
        );
      })}

      {children}

      {status === 'error' && resultMessage && (
        <div className={errorContainerClassName} role="alert">
          {resultMessage}
        </div>
      )}

      <button
        type="submit"
        className={buttonClassName}
        disabled={status === 'submitting'}
      >
        {status === 'submitting' ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
