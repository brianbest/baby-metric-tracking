import React from 'react';
import { EntryType } from '@baby-tracker/shared';
import { useAnalyticsStore } from '../../stores';
import './QuickActionButton.css';

interface QuickActionButtonProps {
  type: EntryType;
  variant: string;
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
  type,
  variant,
  icon,
  label,
  onClick,
  disabled = false,
  className = '',
}) => {
  // const { t } = useTranslation();
  const { track } = useAnalyticsStore();

  const handleClick = () => {
    track('quick_action_clicked', {
      entry_type: type,
      variant,
    });
    onClick();
  };

  return (
    <button
      className={`quick-action-btn quick-action-btn--${type} quick-action-btn--${variant} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      aria-label={label}
    >
      <span className="quick-action-btn__icon" role="img" aria-hidden="true">
        {icon}
      </span>
      <span className="quick-action-btn__label">
        {label}
      </span>
    </button>
  );
}; 