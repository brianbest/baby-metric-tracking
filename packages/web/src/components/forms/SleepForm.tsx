import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CreateSleepEntry, SleepQuality } from '@baby-tracker/shared';
import { format } from 'date-fns';
import './EntryForm.css';

interface SleepFormProps {
  onSubmit: (entry: CreateSleepEntry) => void;
  onCancel: () => void;
  initialData?: Partial<CreateSleepEntry>;
  activeSleepEntry?: any; // For ending active sleep
}

export const SleepForm: React.FC<SleepFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialData,
  // activeSleepEntry
}) => {
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    startTime: initialData?.payload?.startTime 
      ? format(initialData.payload.startTime, "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: initialData?.payload?.endTime 
      ? format(initialData.payload.endTime, "yyyy-MM-dd'T'HH:mm")
      : '',
    quality: initialData?.payload?.quality?.toString() || '3',
    location: initialData?.payload?.location || '',
    isNap: initialData?.payload?.isNap || false,
    inProgress: !initialData?.payload?.endTime,
    notes: initialData?.notes || '',
  });

  const [duration, setDuration] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate duration when times change
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      const diffMs = end.getTime() - start.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      
      if (diffMinutes >= 0) {
        setDuration(diffMinutes);
      } else {
        setDuration(null);
      }
    } else {
      setDuration(null);
    }
  }, [formData.startTime, formData.endTime]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.startTime) {
      newErrors.startTime = t('forms.sleep.startTimeRequired');
    }

    if (!formData.inProgress && !formData.endTime) {
      newErrors.endTime = t('forms.sleep.endTimeRequired');
    }

    if (formData.startTime && formData.endTime) {
      const start = new Date(formData.startTime);
      const end = new Date(formData.endTime);
      
      if (end <= start) {
        newErrors.endTime = t('forms.sleep.endTimeAfterStart');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const startTime = new Date(formData.startTime);
    const endTime = formData.endTime ? new Date(formData.endTime) : undefined;
    
    const entry: CreateSleepEntry = {
      babyId: '', // Will be set by parent component
      type: 'sleep',
      timestamp: startTime,
      notes: formData.notes || undefined,
      payload: {
        startTime,
        endTime,
        duration: duration || undefined,
        quality: parseInt(formData.quality) as SleepQuality,
        location: formData.location || undefined,
        isNap: formData.isNap,
      },
    };

    onSubmit(entry);
  };

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (typeof value === 'string' && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleEndNow = () => {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm");
    setFormData(prev => ({ 
      ...prev, 
      endTime: now,
      inProgress: false 
    }));
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <form onSubmit={handleSubmit} className="entry-form" noValidate>
      <div className="entry-form__header">
        <h2>{t('forms.sleep.title')}</h2>
      </div>

      <div className="entry-form__content">
        {/* Start Time */}
        <div className="form-group">
          <label htmlFor="startTime" className="form-label">
            {t('forms.sleep.startTime')} *
          </label>
          <input
            id="startTime"
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => handleFieldChange('startTime', e.target.value)}
            className={`form-input ${errors.startTime ? 'form-input--error' : ''}`}
            required
          />
          {errors.startTime && (
            <span className="form-error" role="alert">
              {errors.startTime}
            </span>
          )}
        </div>

        {/* In Progress Toggle */}
        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={formData.inProgress}
              onChange={(e) => {
                handleFieldChange('inProgress', e.target.checked);
                if (e.target.checked) {
                  handleFieldChange('endTime', '');
                }
              }}
              className="form-checkbox__input"
            />
            <span className="form-checkbox__label">
              {t('forms.sleep.inProgress')}
            </span>
          </label>
        </div>

        {/* End Time */}
        {!formData.inProgress && (
          <div className="form-group">
            <label htmlFor="endTime" className="form-label">
              {t('forms.sleep.endTime')} *
            </label>
            <div className="form-input-group">
              <input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleFieldChange('endTime', e.target.value)}
                className={`form-input ${errors.endTime ? 'form-input--error' : ''}`}
                required
              />
              <button
                type="button"
                onClick={handleEndNow}
                className="btn btn--small btn--secondary"
              >
                {t('time.now')}
              </button>
            </div>
            {errors.endTime && (
              <span className="form-error" role="alert">
                {errors.endTime}
              </span>
            )}
          </div>
        )}

        {/* Duration Display */}
        {duration !== null && (
          <div className="form-group">
            <label className="form-label">
              {t('forms.sleep.duration')}
            </label>
            <div className="form-display">
              {formatDuration(duration)}
            </div>
          </div>
        )}

        {/* Sleep Quality */}
        <div className="form-group">
          <label htmlFor="quality" className="form-label">
            {t('forms.sleep.quality')}
          </label>
          <select
            id="quality"
            value={formData.quality}
            onChange={(e) => handleFieldChange('quality', e.target.value)}
            className="form-select"
          >
            <option value="1">1 - {t('forms.sleep.qualityLabels.poor')}</option>
            <option value="2">2 - {t('forms.sleep.qualityLabels.fair')}</option>
            <option value="3">3 - {t('forms.sleep.qualityLabels.good')}</option>
            <option value="4">4 - {t('forms.sleep.qualityLabels.veryGood')}</option>
            <option value="5">5 - {t('forms.sleep.qualityLabels.excellent')}</option>
          </select>
        </div>

        {/* Location */}
        <div className="form-group">
          <label htmlFor="location" className="form-label">
            {t('forms.sleep.location')}
          </label>
          <input
            id="location"
            type="text"
            value={formData.location}
            onChange={(e) => handleFieldChange('location', e.target.value)}
            className="form-input"
            placeholder={t('forms.sleep.locationPlaceholder')}
          />
        </div>

        {/* Is Nap */}
        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={formData.isNap}
              onChange={(e) => handleFieldChange('isNap', e.target.checked)}
              className="form-checkbox__input"
            />
            <span className="form-checkbox__label">
              {t('forms.sleep.isNap')}
            </span>
          </label>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            {t('forms.sleep.notes')}
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            className="form-textarea"
            rows={3}
            placeholder={t('forms.sleep.notesPlaceholder')}
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