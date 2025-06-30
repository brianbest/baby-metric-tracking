import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateDiaperEntry, DiaperType, DiaperColor } from '@baby-tracker/shared';
import './EntryForm.css';

interface DiaperFormProps {
  onSubmit: (entry: CreateDiaperEntry) => void;
  onCancel: () => void;
  initialData?: Partial<CreateDiaperEntry>;
}

export const DiaperForm: React.FC<DiaperFormProps> = ({ onSubmit, onCancel, initialData }) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    diaperType: initialData?.payload?.diaperType || ('wet' as DiaperType),
    color: initialData?.payload?.color || ('yellow' as DiaperColor),
    consistency: initialData?.payload?.consistency || 'soft',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.diaperType) {
      newErrors.diaperType = t('forms.diaper.typeRequired');
    }

    if ((formData.diaperType === 'dirty' || formData.diaperType === 'mixed') && !formData.color) {
      newErrors.color = t('forms.diaper.colorRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const entry: CreateDiaperEntry = {
      babyId: '', // Will be set by parent component
      type: 'diaper',
      timestamp: new Date(),
      notes: formData.notes || undefined,
      payload: {
        diaperType: formData.diaperType,
        color:
          formData.diaperType === 'dirty' || formData.diaperType === 'mixed'
            ? formData.color
            : undefined,
        consistency:
          formData.diaperType === 'dirty' || formData.diaperType === 'mixed'
            ? (formData.consistency as 'liquid' | 'soft' | 'formed' | 'hard')
            : undefined,
      },
    };

    onSubmit(entry);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const showColorAndConsistency =
    formData.diaperType === 'dirty' || formData.diaperType === 'mixed';

  return (
    <form onSubmit={handleSubmit} className="entry-form" noValidate>
      <div className="entry-form__header">
        <h2>{t('forms.diaper.title')}</h2>
      </div>

      <div className="entry-form__content">
        {/* Diaper Type - Radio Buttons */}
        <div className="form-group">
          <fieldset className="form-radio-group">
            <legend className="form-label">{t('forms.diaper.type')}</legend>
            <div className="form-radio-options">
              <label className="form-radio">
                <input
                  type="radio"
                  name="diaperType"
                  value="wet"
                  checked={formData.diaperType === 'wet'}
                  onChange={(e) => handleFieldChange('diaperType', e.target.value)}
                  className="form-radio__input"
                />
                <span className="form-radio__label">💧 {t('forms.diaper.types.wet')}</span>
              </label>
              <label className="form-radio">
                <input
                  type="radio"
                  name="diaperType"
                  value="dirty"
                  checked={formData.diaperType === 'dirty'}
                  onChange={(e) => handleFieldChange('diaperType', e.target.value)}
                  className="form-radio__input"
                />
                <span className="form-radio__label">💩 {t('forms.diaper.types.dirty')}</span>
              </label>
              <label className="form-radio">
                <input
                  type="radio"
                  name="diaperType"
                  value="mixed"
                  checked={formData.diaperType === 'mixed'}
                  onChange={(e) => handleFieldChange('diaperType', e.target.value)}
                  className="form-radio__input"
                />
                <span className="form-radio__label">💧💩 {t('forms.diaper.types.mixed')}</span>
              </label>
            </div>
          </fieldset>
          {errors.diaperType && (
            <span className="form-error" role="alert">
              {errors.diaperType}
            </span>
          )}
        </div>

        {/* Color - only for dirty/mixed diapers */}
        {showColorAndConsistency && (
          <div className="form-context-section">
            <div className="form-group">
              <fieldset className="form-radio-group">
                <legend className="form-label">{t('forms.diaper.color')}</legend>
                <div className="form-color-picker">
                  <label className="form-color-option">
                    <input
                      type="radio"
                      name="color"
                      value="yellow"
                      checked={formData.color === 'yellow'}
                      onChange={(e) => handleFieldChange('color', e.target.value)}
                      className="form-color-option__input"
                    />
                    <span className="form-color-option__emoji">🟡</span>
                  </label>
                  <label className="form-color-option">
                    <input
                      type="radio"
                      name="color"
                      value="brown"
                      checked={formData.color === 'brown'}
                      onChange={(e) => handleFieldChange('color', e.target.value)}
                      className="form-color-option__input"
                    />
                    <span className="form-color-option__emoji">🟤</span>
                  </label>
                  <label className="form-color-option">
                    <input
                      type="radio"
                      name="color"
                      value="green"
                      checked={formData.color === 'green'}
                      onChange={(e) => handleFieldChange('color', e.target.value)}
                      className="form-color-option__input"
                    />
                    <span className="form-color-option__emoji">🟢</span>
                  </label>
                  <label className="form-color-option">
                    <input
                      type="radio"
                      name="color"
                      value="red"
                      checked={formData.color === 'red'}
                      onChange={(e) => handleFieldChange('color', e.target.value)}
                      className="form-color-option__input"
                    />
                    <span className="form-color-option__emoji">🔴</span>
                  </label>
                  <label className="form-color-option">
                    <input
                      type="radio"
                      name="color"
                      value="black"
                      checked={formData.color === 'black'}
                      onChange={(e) => handleFieldChange('color', e.target.value)}
                      className="form-color-option__input"
                    />
                    <span className="form-color-option__emoji">⚫</span>
                  </label>
                </div>
              </fieldset>
              {errors.color && (
                <span className="form-error" role="alert">
                  {errors.color}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            {t('forms.diaper.notes')} ({t('common.optional')})
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            className="form-textarea"
            rows={2}
            placeholder={t('forms.diaper.notesPlaceholder')}
          />
        </div>
      </div>

      <div className="entry-form__actions">
        <button type="button" onClick={onCancel} className="btn btn--secondary">
          {t('common.cancel')}
        </button>
        <button type="submit" className="btn btn--primary">
          {t('common.save')}
        </button>
      </div>
    </form>
  );
};
