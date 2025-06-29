import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EntryType } from '@baby-tracker/shared';
import { QuickActionButton } from './QuickActionButton';
import { EntryModal } from '../forms';
import { useBabyStore, useEntryStore } from '../../stores';
import './QuickActionGrid.css';

export const QuickActionGrid: React.FC = () => {
  const { t } = useTranslation();
  const { getActiveBaby } = useBabyStore();
  const { lastEntry } = useEntryStore();
  
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    entryType: EntryType | null;
  }>({
    isOpen: false,
    entryType: null,
  });

  const activeBaby = getActiveBaby();
  const activeSleepEntry = null; // TODO: Implement active sleep tracking

  const openModal = (entryType: EntryType) => {
    setModalState({ isOpen: true, entryType });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, entryType: null });
  };

  const quickActions = [
    {
      type: 'feed' as EntryType,
      variant: 'bottle',
      icon: '🍼',
      label: t('quickActions.feedBottle'),
    },
    {
      type: 'feed' as EntryType,
      variant: 'breast',
      icon: '🤱',
      label: t('quickActions.feedBreast'),
    },
    {
      type: 'diaper' as EntryType,
      variant: 'wet',
      icon: '🚼',
      label: t('quickActions.diaperWet'),
    },
    {
      type: 'diaper' as EntryType,
      variant: 'dirty',
      icon: '💩',
      label: t('quickActions.diaperDirty'),
    },
    {
      type: 'sleep' as EntryType,
      variant: activeSleepEntry ? 'end' : 'start',
      icon: activeSleepEntry ? '😴' : '🛌',
      label: activeSleepEntry 
        ? t('quickActions.endSleep')
        : t('quickActions.startSleep'),
    },
  ];

  return (
    <div className="quick-action-grid">
      {/* Main Quick Actions */}
      <div className="quick-action-grid__main">
        {quickActions.map(action => (
          <QuickActionButton
            key={`${action.type}-${action.variant}`}
            type={action.type}
            variant={action.variant}
            icon={action.icon}
            label={action.label}
            onClick={() => openModal(action.type)}
            disabled={!activeBaby}
          />
        ))}
      </div>

      {/* Repeat Last Entry - TODO: Add RepeatLastButton */}
      {lastEntry && activeBaby && (
        <div className="quick-action-grid__repeat">
          <button className="repeat-last-btn">
            {t('quickActions.repeatLast')}
          </button>
        </div>
      )}

      {/* Entry Modal */}
      {modalState.entryType && (
        <EntryModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          entryType={modalState.entryType}
        />
 )}
      <button
        className="floating-action-button"
        onClick={() => openModal('feed')}
      >
        +
      </button>
    </div>
  );
}; 
