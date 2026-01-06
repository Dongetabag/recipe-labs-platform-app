// Database Form Component
// Create and edit database records

import React, { useState, useEffect } from 'react';

export interface FormField {
  key: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'textarea' | 'select' | 'date' | 'boolean';
  required?: boolean;
  placeholder?: string;
  options?: { value: string | number; label: string }[];
  defaultValue?: any;
  validation?: (value: any) => string | null;
}

export interface DatabaseFormProps {
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  title?: string;
  loading?: boolean;
}

export function DatabaseForm({
  fields,
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Save',
  title,
  loading = false,
}: DatabaseFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const initial: Record<string, any> = {};
    fields.forEach((field) => {
      initial[field.key] = initialData?.[field.key] ?? field.defaultValue ?? '';
    });
    setFormData(initial);
  }, [fields, initialData]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formData[field.key];

      // Required validation
      if (field.required && (value === '' || value === null || value === undefined)) {
        newErrors[field.key] = `${field.label} is required`;
        return;
      }

      // Custom validation
      if (field.validation && value) {
        const error = field.validation(value);
        if (error) {
          newErrors[field.key] = error;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save record' });
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formData[field.key] ?? '';
    const error = errors[field.key];

    const baseInputClass = `w-full px-4 py-2 bg-brand-bg-tertiary border rounded-lg text-white placeholder-brand-text-dim focus:outline-none focus:ring-1 transition-colors ${
      error
        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
        : 'border-brand-border focus:border-brand-lemon focus:ring-brand-lemon'
    }`;

    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            id={field.key}
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            rows={4}
            className={baseInputClass}
          />
        );

      case 'select':
        return (
          <select
            id={field.key}
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            required={field.required}
            className={baseInputClass}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'boolean':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              id={field.key}
              checked={!!value}
              onChange={(e) => handleChange(field.key, e.target.checked)}
              className="w-5 h-5 rounded border-brand-border bg-brand-bg-tertiary text-brand-lemon focus:ring-brand-lemon focus:ring-2"
            />
            <span className="text-white">{field.placeholder || 'Enabled'}</span>
          </label>
        );

      case 'number':
        return (
          <input
            type="number"
            id={field.key}
            value={value}
            onChange={(e) => handleChange(field.key, parseFloat(e.target.value) || 0)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseInputClass}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            id={field.key}
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            required={field.required}
            className={baseInputClass}
          />
        );

      default:
        return (
          <input
            type={field.type}
            id={field.key}
            value={value}
            onChange={(e) => handleChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className={baseInputClass}
          />
        );
    }
  };

  return (
    <div className="bg-brand-bg-secondary rounded-lg border border-brand-border p-6">
      {title && (
        <h2 className="text-2xl font-display font-bold text-white mb-6 gradient-text">{title}</h2>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {fields.map((field) => (
          <div key={field.key}>
            <label htmlFor={field.key} className="block text-sm font-medium text-white mb-2">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {renderField(field)}
            {errors[field.key] && (
              <p className="mt-1 text-sm text-red-400">{errors[field.key]}</p>
            )}
          </div>
        ))}

        {errors.submit && (
          <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-red-400">
            {errors.submit}
          </div>
        )}

        <div className="flex justify-end space-x-4 pt-4 border-t border-brand-border">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting || loading}
              className="px-6 py-2 border border-brand-border rounded-lg text-white hover:bg-brand-bg-tertiary transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting || loading}
            className="px-6 py-2 bg-brand-lemon text-black rounded-lg font-medium hover:bg-brand-lemon-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {submitting || loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>{submitLabel}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}


