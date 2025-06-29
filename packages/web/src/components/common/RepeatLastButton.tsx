import React from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { useEntryStore, useAnalyticsStore } from '../../stores';
import './RepeatLastButton.css';

export const RepeatLastButton: React.FC = () => {
  const { t } = useTranslation();
  const { lastEntry, repeatLastEntry } = useEntryStore();
  const { track } = useAnalyticsStore();

  if (!lastEntry) {
    return null;
  }

  const handleRepeat = async () => {
    try {
      track('repeat_last_entry', {
        original_entry_type: lastEntry.type,
        time_since_last: Date.now() - lastEntry.timestamp.getTime(),
      });
      
      await repeatLastEntry();
    } catch (error) {
      console.error('Failed to repeat last entry:', error);
    }
  };

  const getEntryIcon = () => {
    switch (lastEntry.type) {
      case 'feed':
        if (lastEntry.payload.source === 'breast') return '🤱';
        if (lastEntry.payload.source === 'bottle') return '🍼';
        return '🥄';
      case 'diaper':
        return '🚼';
      case 'sleep':
        return '😴';
      default:
        return '📝';
    }
  };

  const getEntryLabel = () => {
    switch (lastEntry.type) {
      case 'feed':
        if (lastEntry.payload.source === 'breast') {
          return t('forms.feed.sources.breast');
        }
        if (lastEntry.payload.source === 'bottle') {
          return `${t('forms.feed.sources.bottle')} ${lastEntry.payload.volume || ''}${lastEntry.payload.unit || ''}`;
        }
        return t('forms.feed.sources.solid');
      case 'diaper':
        return t(`forms.diaper.types.${lastEntry.payload.diaperType}`);
      case 'sleep':
        if (lastEntry.payload.endTime) {
          const duration = lastEntry.payload.duration || 0;
          const hours = Math.floor(duration / 60);
          const minutes = duration % 60;
          return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
        }
        return t('forms.sleep.inProgress');
      default:
        return t('common.entry');
    }
  };

  const timeAgo = formatDistanceToNow(lastEntry.timestamp, { addSuffix: true });

  return (
    <button
      className="repeat-last-btn"
      onClick={handleRepeat}
      aria-label={`${t('quickActions.repeatLast')}: ${getEntryLabel()}`}
    >
      <div className="repeat-last-btn__content">
        <div className="repeat-last-btn__header">
          <span className="repeat-last-btn__icon" role="img" aria-hidden="true">
            {getEntryIcon()}
          </span>
          <span className="repeat-last-btn__label">
            {t('quickActions.repeatLast')}
          </span>
        </div>
        <div className="repeat-last-btn__details">
          <span className="repeat-last-btn__entry-label">
            {getEntryLabel()}
          </span>
          <span className="repeat-last-btn__time">
            {timeAgo}
          </span>
        </div>
      </div>
    </button>
  );
}; 