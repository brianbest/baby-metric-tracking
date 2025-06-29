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
        {/* Feed Source - Radio Buttons */}
        <div className="form-group">
          <fieldset className="form-radio-group">
            <legend className="form-label">{t('forms.feed.source')}</legend>
            <div className="form-radio-options">
              <label className="form-radio">
                <input
                  type="radio"
                  name="source"
                  value="breast"
                  checked={formData.source === 'breast'}
                  onChange={(e) => handleFieldChange('source', e.target.value)}
                  className="form-radio__input"
                />
                <span className="form-radio__label">🤱 {t('forms.feed.sources.breast')}</span>
              </label>
              <label className="form-radio">
                <input
                  type="radio"
                  name="source"
                  value="bottle"
                  checked={formData.source === 'bottle'}
                  onChange={(e) => handleFieldChange('source', e.target.value)}
                  className="form-radio__input"
                />
                <span className="form-radio__label">🍼 {t('forms.feed.sources.bottle')}</span>
              </label>
              <label className="form-radio">
                <input
                  type="radio"
                  name="source"
                  value="solid"
                  checked={formData.source === 'solid'}
                  onChange={(e) => handleFieldChange('source', e.target.value)}
                  className="form-radio__input"
                />
                <span className="form-radio__label">🥄 {t('forms.feed.sources.solid')}</span>
              </label>
            </div>
          </fieldset>
        </div>

        {/* Breast-specific fields */}
        {formData.source === 'breast' && (
          <div className="form-context-section">
            <div className="form-group">
              <fieldset className="form-radio-group">
                <legend className="form-label">{t('forms.feed.side')}</legend>
                <div className="form-radio-options form-radio-options--inline">
                  <label className="form-radio">
                    <input
                      type="radio"
                      name="side"
                      value="left"
                      checked={formData.side === 'left'}
                      onChange={(e) => handleFieldChange('side', e.target.value)}
                      className="form-radio__input"
                    />
                    <span className="form-radio__label">{t('forms.feed.sides.left')}</span>
                  </label>
                  <label className="form-radio">
                    <input
                      type="radio"
                      name="side"
                      value="right"
                      checked={formData.side === 'right'}
                      onChange={(e) => handleFieldChange('side', e.target.value)}
                      className="form-radio__input"
                    />
                    <span className="form-radio__label">{t('forms.feed.sides.right')}</span>
                  </label>
                  <label className="form-radio">
                    <input
                      type="radio"
                      name="side"
                      value="both"
                      checked={formData.side === 'both'}
                      onChange={(e) => handleFieldChange('side', e.target.value)}
                      className="form-radio__input"
                    />
                    <span className="form-radio__label">{t('forms.feed.sides.both')}</span>
                  </label>
                </div>
              </fieldset>
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
          </div>
        )}

        {/* Bottle-specific fields */}
        {formData.source === 'bottle' && (
          <div className="form-context-section">
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
              <fieldset className="form-radio-group">
                <legend className="form-label">{t('forms.feed.formulaType')}</legend>
                <div className="form-radio-options">
                  <label className="form-radio">
                    <input
                      type="radio"
                      name="formulaType"
                      value="formula"
                      checked={formData.formulaType === 'formula'}
                      onChange={(e) => handleFieldChange('formulaType', e.target.value)}
                      className="form-radio__input"
                    />
                    <span className="form-radio__label">{t('forms.feed.formulaTypes.formula')}</span>
                  </label>
                  <label className="form-radio">
                    <input
                      type="radio"
                      name="formulaType"
                      value="breast_milk"
                      checked={formData.formulaType === 'breast_milk'}
                      onChange={(e) => handleFieldChange('formulaType', e.target.value)}
                      className="form-radio__input"
                    />
                    <span className="form-radio__label">{t('forms.feed.formulaTypes.breast_milk')}</span>
                  </label>
                  <label className="form-radio">
                    <input
                      type="radio"
                      name="formulaType"
                      value="mixed"
                      checked={formData.formulaType === 'mixed'}
                      onChange={(e) => handleFieldChange('formulaType', e.target.value)}
                      className="form-radio__input"
                    />
                    <span className="form-radio__label">{t('forms.feed.formulaTypes.mixed')}</span>
                  </label>
                </div>
              </fieldset>
            </div>
          </div>
        )}

        {/* Solid-specific fields */}
        {formData.source === 'solid' && (
          <div className="form-context-section">
            <div className="form-group">
              <label htmlFor="solidDescription" className="form-label">
                {t('forms.feed.solidDescription')}
              </label>
              <input
                id="solidDescription"
                type="text"
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                className="form-input"
                placeholder={t('forms.feed.solidPlaceholder')}
              />
            </div>
          </div>
        )}

        {/* Notes field - always visible */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            {t('forms.feed.notes')} ({t('common.optional')})
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            className="form-textarea"
            rows={2}
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