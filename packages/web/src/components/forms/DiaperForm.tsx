import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateDiaperEntry, DiaperType, DiaperColor } from '@baby-tracker/shared';
import './EntryForm.css';

interface DiaperFormProps {
  onSubmit: (entry: CreateDiaperEntry) => void;
  onCancel: () => void;
  initialData?: Partial<CreateDiaperEntry>;
}

export const DiaperForm: React.FC<DiaperFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData 
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    diaperType: initialData?.payload?.diaperType || 'wet' as DiaperType,
    color: initialData?.payload?.color || 'yellow' as DiaperColor,
    consistency: initialData?.payload?.consistency || 'soft',
    size: initialData?.payload?.size || '',
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
        color: (formData.diaperType === 'dirty' || formData.diaperType === 'mixed') 
          ? formData.color 
          : undefined,
        consistency: (formData.diaperType === 'dirty' || formData.diaperType === 'mixed') 
          ? formData.consistency as 'liquid' | 'soft' | 'formed' | 'hard'
          : undefined,
        size: formData.size || undefined,
      },
    };

    onSubmit(entry);
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const showColorAndConsistency = formData.diaperType === 'dirty' || formData.diaperType === 'mixed';

  return (
    <form onSubmit={handleSubmit} className="entry-form" noValidate>
      <div className="entry-form__header">
        <h2>{t('forms.diaper.title')}</h2>
      </div>

      <div className="entry-form__content">
        {/* Diaper Type */}
        <div className="form-group">
          <label htmlFor="diaperType" className="form-label">
            {t('forms.diaper.type')} *
          </label>
          <select
            id="diaperType"
            value={formData.diaperType}
            onChange={(e) => handleFieldChange('diaperType', e.target.value)}
            className={`form-select ${errors.diaperType ? 'form-select--error' : ''}`}
            required
          >
            <option value="wet">{t('forms.diaper.types.wet')}</option>
            <option value="dirty">{t('forms.diaper.types.dirty')}</option>
            <option value="mixed">{t('forms.diaper.types.mixed')}</option>
            <option value="dry">{t('forms.diaper.types.dry')}</option>
          </select>
          {errors.diaperType && (
            <span className="form-error" role="alert">
              {errors.diaperType}
            </span>
          )}
        </div>

        {/* Color - only for dirty/mixed diapers */}
        {showColorAndConsistency && (
          <>
            <div className="form-group">
              <label htmlFor="color" className="form-label">
                {t('forms.diaper.color')} *
              </label>
              <select
                id="color"
                value={formData.color}
                onChange={(e) => handleFieldChange('color', e.target.value)}
                className={`form-select ${errors.color ? 'form-select--error' : ''}`}
                required
              >
                <option value="yellow">{t('forms.diaper.colors.yellow')}</option>
                <option value="brown">{t('forms.diaper.colors.brown')}</option>
                <option value="green">{t('forms.diaper.colors.green')}</option>
                <option value="red">{t('forms.diaper.colors.red')}</option>
                <option value="black">{t('forms.diaper.colors.black')}</option>
                <option value="other">{t('forms.diaper.colors.other')}</option>
              </select>
              {errors.color && (
                <span className="form-error" role="alert">
                  {errors.color}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="consistency" className="form-label">
                {t('forms.diaper.consistency')}
              </label>
              <select
                id="consistency"
                value={formData.consistency}
                onChange={(e) => handleFieldChange('consistency', e.target.value)}
                className="form-select"
              >
                <option value="liquid">{t('forms.diaper.consistencies.liquid')}</option>
                <option value="soft">{t('forms.diaper.consistencies.soft')}</option>
                <option value="formed">{t('forms.diaper.consistencies.formed')}</option>
                <option value="hard">{t('forms.diaper.consistencies.hard')}</option>
              </select>
            </div>
          </>
        )}

        {/* Diaper Size */}
        <div className="form-group">
          <label htmlFor="size" className="form-label">
            {t('forms.diaper.size')}
          </label>
          <select
            id="size"
            value={formData.size}
            onChange={(e) => handleFieldChange('size', e.target.value)}
            className="form-select"
          >
            <option value="">Select size</option>
            <option value="Newborn">Newborn</option>
            <option value="Size 1">Size 1</option>
            <option value="Size 2">Size 2</option>
            <option value="Size 3">Size 3</option>
            <option value="Size 4">Size 4</option>
            <option value="Size 5">Size 5</option>
            <option value="Size 6">Size 6</option>
          </select>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            {t('forms.diaper.notes')}
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            className="form-textarea"
            rows={3}
            placeholder={t('forms.diaper.notesPlaceholder')}
          />
        </div>
      </div>

      <div className="entry-form__actions">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn--secondary"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          className="btn btn--primary"
        >
          {t('common.save')}
        </button>
      </div>
    </form>
  );
}; 