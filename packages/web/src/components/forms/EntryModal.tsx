import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { CreateEntry, EntryType } from '@baby-tracker/shared';
import { FeedForm } from './FeedForm';
import { DiaperForm } from './DiaperForm';
import { SleepForm } from './SleepForm';
import { useBabyStore, useEntryStore, useAnalyticsStore } from '../../stores';
import './EntryModal.css';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryType: EntryType;
  initialData?: Partial<CreateEntry>;
}

export const EntryModal: React.FC<EntryModalProps> = ({
  isOpen,
  onClose,
  entryType,
  initialData,
}) => {
  const { t } = useTranslation();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  const { getActiveBaby } = useBabyStore();
  const { addEntry } = useEntryStore();
  const { track } = useAnalyticsStore();
  
  const activeBaby = getActiveBaby();

  // Focus management
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus the modal after a brief delay to ensure it's rendered
      const timer = setTimeout(() => {
        if (modalRef.current) {
          const firstFocusable = modalRef.current.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement;
          
          if (firstFocusable) {
            firstFocusable.focus();
          }
        }
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      // Return focus to the element that opened the modal
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [isOpen]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (entryData: CreateEntry) => {
    if (!activeBaby) {
      console.error('No active baby selected');
      return;
    }

    try {
      const entry = {
        ...entryData,
        babyId: activeBaby.id,
      };

      await addEntry(entry);
      
      // Track analytics event
      track('entry_created', {
        entry_type: entryType,
        baby_id: activeBaby.id,
        has_notes: !!entry.notes,
      });

      onClose();
    } catch (error) {
      console.error('Failed to create entry:', error);
      // In a real app, you'd show a user-friendly error message
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderForm = () => {
    const baseProps = {
      onSubmit: handleSubmit,
      onCancel: onClose,
    };

    switch (entryType) {
      case 'feed':
        return <FeedForm {...baseProps} initialData={initialData as any} />;
      case 'diaper':
        return <DiaperForm {...baseProps} initialData={initialData as any} />;
      case 'sleep':
        return <SleepForm {...baseProps} initialData={initialData as any} />;
      default:
        return null;
    }
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div 
      className="modal-backdrop"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={onClose}
          aria-label={t('common.close')}
        >
          ×
        </button>
        
        {!activeBaby ? (
          <div className="modal-error">
            <h2>{t('baby.noBabies')}</h2>
            <p>{t('baby.selectBabyFirst')}</p>
            <button onClick={onClose} className="btn btn--primary">
              {t('common.close')}
            </button>
          </div>
        ) : (
          renderForm()
        )}
      </div>
    </div>,
    document.body
  );
}; 