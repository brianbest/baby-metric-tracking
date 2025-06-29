import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateFeedEntry, FeedSource, BreastSide, FormulaType } from '@baby-tracker/shared';
import { useSettingsStore } from '../../stores';
import './EntryForm.css';

interface FeedFormProps {
  onSubmit: (entry: CreateFeedEntry) => void;
  onCancel: () => void;
  initialData?: Partial<CreateFeedEntry>;
}

export const FeedForm: React.FC<FeedFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData 
}) => {
  const { t } = useTranslation();
  const { units } = useSettingsStore();
  
  const [formData, setFormData] = useState({
    source: initialData?.payload?.source || 'breast' as FeedSource,
    volume: (initialData?.payload?.volume || '').toString(),
    duration: (initialData?.payload?.duration || '').toString(),
    side: initialData?.payload?.side || 'left' as BreastSide,
    formulaType: initialData?.payload?.formulaType || 'formula' as FormulaType,
    bottleType: initialData?.payload?.bottleType || '',
    location: initialData?.payload?.location || '',
    notes: initialData?.notes || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.source === 'bottle' && !formData.volume) {
      newErrors.volume = t('forms.feed.volumeRequired');
    }

    if (formData.source === 'breast' && !formData.duration) {
      newErrors.duration = t('forms.feed.durationRequired');
    }

    if (formData.volume && parseFloat(formData.volume) <= 0) {
      newErrors.volume = t('forms.feed.volumePositive');
    }

    if (formData.duration && parseFloat(formData.duration) <= 0) {
      newErrors.duration = t('forms.feed.durationPositive');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const entry: CreateFeedEntry = {
      babyId: '', // Will be set by parent component
      type: 'feed',
      timestamp: new Date(),
      notes: formData.notes || undefined,
      payload: {
        source: formData.source,
        unit: units === 'metric' ? 'ml' : 'oz',
        volume: formData.volume ? parseFloat(formData.volume) : undefined,
        duration: formData.duration ? parseFloat(formData.duration) : undefined,
        side: formData.source === 'breast' ? formData.side : undefined,
        formulaType: formData.source === 'bottle' ? formData.formulaType : undefined,
        bottleType: formData.bottleType || undefined,
        location: formData.location || undefined,
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

  return (
    <form onSubmit={handleSubmit} className="entry-form" noValidate>
      <div className="entry-form__header">
        <h2>{t('forms.feed.title')}</h2>
      </div>

      <div className="entry-form__content">
        {/* Feed Source */}
        <div className="form-group">
          <label htmlFor="source" className="form-label">
            {t('forms.feed.source')}
          </label>
          <select
            id="source"
            value={formData.source}
            onChange={(e) => handleFieldChange('source', e.target.value)}
            className="form-select"
            required
          >
            <option value="breast">{t('forms.feed.sources.breast')}</option>
            <option value="bottle">{t('forms.feed.sources.bottle')}</option>
            <option value="solid">{t('forms.feed.sources.solid')}</option>
          </select>
        </div>

        {/* Breast-specific fields */}
        {formData.source === 'breast' && (
          <>
            <div className="form-group">
              <label htmlFor="side" className="form-label">
                {t('forms.feed.side')}
              </label>
              <select
                id="side"
                value={formData.side}
                onChange={(e) => handleFieldChange('side', e.target.value)}
                className="form-select"
              >
                <option value="left">{t('forms.feed.sides.left')}</option>
                <option value="right">{t('forms.feed.sides.right')}</option>
                <option value="both">{t('forms.feed.sides.both')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="duration" className="form-label">
                {t('forms.feed.duration')} ({t('units.minutes')})
              </label>
              <input
                id="duration"
                type="number"
                min="0"
                step="0.5"
                value={formData.duration}
                onChange={(e) => handleFieldChange('duration', e.target.value)}
                className={`form-input ${errors.duration ? 'form-input--error' : ''}`}
                placeholder="15"
              />
              {errors.duration && (
                <span className="form-error" role="alert">
                  {errors.duration}
                </span>
              )}
            </div>
          </>
        )}

        {/* Bottle-specific fields */}
        {formData.source === 'bottle' && (
          <>
            <div className="form-group">
              <label htmlFor="volume" className="form-label">
                {t('forms.feed.volume')} ({units === 'metric' ? t('units.ml') : t('units.oz')})
              </label>
              <input
                id="volume"
                type="number"
                min="0"
                step="0.5"
                value={formData.volume}
                onChange={(e) => handleFieldChange('volume', e.target.value)}
                className={`form-input ${errors.volume ? 'form-input--error' : ''}`}
                placeholder={units === 'metric' ? '120' : '4'}
              />
              {errors.volume && (
                <span className="form-error" role="alert">
                  {errors.volume}
                </span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="formulaType" className="form-label">
                {t('forms.feed.formulaType')}
              </label>
              <select
                id="formulaType"
                value={formData.formulaType}
                onChange={(e) => handleFieldChange('formulaType', e.target.value)}
                className="form-select"
              >
                <option value="formula">{t('forms.feed.formulaTypes.formula')}</option>
                <option value="breast_milk">{t('forms.feed.formulaTypes.breast_milk')}</option>
                <option value="mixed">{t('forms.feed.formulaTypes.mixed')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="bottleType" className="form-label">
                {t('forms.feed.bottleType')}
              </label>
              <input
                id="bottleType"
                type="text"
                value={formData.bottleType}
                onChange={(e) => handleFieldChange('bottleType', e.target.value)}
                className="form-input"
                placeholder="Dr. Brown's"
              />
            </div>
          </>
        )}

        {/* Common fields */}
        <div className="form-group">
          <label htmlFor="location" className="form-label">
            {t('forms.feed.location')}
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            className="form-input"
            placeholder={t('forms.feed.locationPlaceholder')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            {t('forms.feed.notes')}
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            className="form-textarea"
            rows={3}
            placeholder={t('forms.feed.notesPlaceholder')}
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