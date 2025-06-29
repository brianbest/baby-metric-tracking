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
    isNap: initialData?.payload?.isNap || false,
    inProgress: !initialData?.payload?.endTime,
    manualEntry: false,
    notes: initialData?.notes || '',
  });

  const [duration, setDuration] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate duration when times change or for active sleep
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
    } else if (formData.inProgress && formData.startTime) {
      // Calculate ongoing duration for active sleep
      const start = new Date(formData.startTime);
      const now = new Date();
      const diffMs = now.getTime() - start.getTime();
      const diffMinutes = Math.round(diffMs / (1000 * 60));
      setDuration(diffMinutes >= 0 ? diffMinutes : 0);
    } else {
      setDuration(null);
    }
  }, [formData.startTime, formData.endTime, formData.inProgress]);

  // Update duration every minute when sleep is in progress
  useEffect(() => {
    if (formData.inProgress && formData.startTime) {
      const interval = setInterval(() => {
        const start = new Date(formData.startTime);
        const now = new Date();
        const diffMs = now.getTime() - start.getTime();
        const diffMinutes = Math.round(diffMs / (1000 * 60));
        setDuration(diffMinutes >= 0 ? diffMinutes : 0);
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [formData.inProgress, formData.startTime]);

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
        isNap: formData.isNap,
      },
    };

    onSubmit(entry);
  };

  const handleFieldChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (typeof value === 'string' && errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleStartSleep = () => {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm");
    setFormData((prev) => ({
      ...prev,
      startTime: now,
      endTime: '',
      inProgress: true,
    }));
  };

  const handleEndNow = () => {
    const now = format(new Date(), "yyyy-MM-dd'T'HH:mm");
    setFormData((prev) => ({
      ...prev,
      endTime: now,
      inProgress: false,
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
        {/* Timer Actions */}
        {!formData.manualEntry && (
          <div className="form-group">
            <div className="sleep-timer-actions">
              {formData.inProgress ? (
                <>
                  <div className="sleep-timer-status">
                    <span className="sleep-timer-icon">😴</span>
                    <span className="sleep-timer-text">
                      {duration !== null
                        ? `${t('forms.sleep.sleepingFor')} ${formatDuration(duration)}`
                        : t('forms.sleep.sleepStarted')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleEndNow}
                    className="btn btn--primary btn--large"
                  >
                    {t('forms.sleep.endSleep')}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleStartSleep}
                  className="btn btn--primary btn--large"
                >
                  🛌 {t('forms.sleep.startSleep')}
                </button>
              )}
            </div>
          </div>
        )}

        {/* This was a nap checkbox */}
        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={formData.isNap}
              onChange={(e) => handleFieldChange('isNap', e.target.checked)}
              className="form-checkbox__input"
            />
            <span className="form-checkbox__label">{t('forms.sleep.isNap')}</span>
          </label>
        </div>

        {/* Manual Entry Toggle */}
        <div className="form-group">
          <button
            type="button"
            onClick={() => handleFieldChange('manualEntry', !formData.manualEntry)}
            className="btn btn--ghost btn--small"
          >
            {formData.manualEntry ? t('forms.sleep.useTimer') : t('forms.sleep.manualTimes')}
          </button>
        </div>

        {/* Manual Time Entry */}
        {formData.manualEntry && (
          <div className="form-context-section">
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
          </div>
        )}

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
