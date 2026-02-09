import type { FormFieldDefinition } from '../../client/types.js';

/**
 * Validate form data against field definitions.
 * Mirrors the CMS backend's FormDefinition::buildValidationRules().
 *
 * @returns Record of field name to error message. Empty object means valid.
 */
export function validateFormData(
  fields: FormFieldDefinition[],
  data: Record<string, string | boolean>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const value = data[field.name];
    const validation = field.validation;
    const isRequired = validation?.required ?? false;

    // Required check
    if (isRequired) {
      if (field.type === 'checkbox') {
        if (value !== true) {
          errors[field.name] = `${field.label} is required`;
          continue;
        }
      } else {
        if (value === undefined || value === null || String(value).trim() === '') {
          errors[field.name] = `${field.label} is required`;
          continue;
        }
      }
    }

    // Skip further validation if value is empty and not required
    if (field.type === 'checkbox') {
      continue;
    }
    const strValue = String(value ?? '');
    if (strValue.trim() === '') {
      continue;
    }

    // Type-specific validation
    switch (field.type) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(strValue)) {
          errors[field.name] = 'Please enter a valid email address';
        }
        break;
      }
      case 'number': {
        if (isNaN(Number(strValue))) {
          errors[field.name] = 'Please enter a valid number';
          break;
        }
        const num = Number(strValue);
        if (validation?.min !== undefined && num < validation.min) {
          errors[field.name] = `Must be at least ${validation.min}`;
          break;
        }
        if (validation?.max !== undefined && num > validation.max) {
          errors[field.name] = `Must be at most ${validation.max}`;
          break;
        }
        break;
      }
      case 'date': {
        if (isNaN(Date.parse(strValue))) {
          errors[field.name] = 'Please enter a valid date';
        }
        break;
      }
      case 'select':
      case 'radio': {
        if (field.options && field.options.length > 0) {
          const validValues = field.options.map((o) => o.value);
          if (!validValues.includes(strValue)) {
            errors[field.name] = 'Please select a valid option';
          }
        }
        break;
      }
    }

    // Skip min/max/regex if we already have an error for this field
    if (errors[field.name]) {
      continue;
    }

    // String length min/max (for non-number types)
    if (field.type !== 'number') {
      if (validation?.min !== undefined && strValue.length < validation.min) {
        errors[field.name] = `Must be at least ${validation.min} characters`;
      } else if (validation?.max !== undefined && strValue.length > validation.max) {
        errors[field.name] = `Must be at most ${validation.max} characters`;
      }
    }

    // Custom regex
    if (!errors[field.name] && validation?.regex) {
      try {
        const regex = new RegExp(validation.regex);
        if (!regex.test(strValue)) {
          errors[field.name] = `${field.label} format is invalid`;
        }
      } catch {
        // Invalid regex pattern — skip validation
      }
    }
  }

  return errors;
}
