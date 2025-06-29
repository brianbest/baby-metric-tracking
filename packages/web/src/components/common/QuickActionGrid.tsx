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
      icon: '🍼',
      label: t('quickActions.feed'),
    },
    {
      type: 'diaper' as EntryType,
      icon: '👶',
      label: t('quickActions.diaper'),
    },
    {
      type: 'sleep' as EntryType,
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
            key={action.type}
            type={action.type}
            icon={action.icon}
            label={action.label}
            onClick={() => openModal(action.type)}
            disabled={!activeBaby}
          />
        ))}
      </div>

      {/* Repeat Last Entry */}
      {lastEntry && activeBaby && (
        <div className="quick-action-grid__repeat">
          <button className="repeat-last-btn">
            ⟲ {t('quickActions.repeatLast')}
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
    </div>
  );
}; 
