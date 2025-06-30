import React from 'react';
import { useTranslation } from 'react-i18next';
import { useRealtime } from '../../lib/realtimeService';
import './PresenceIndicator.css';

interface PresenceIndicatorProps {
  babyId?: string;
}

export function PresenceIndicator({ babyId }: PresenceIndicatorProps) {
  const { t } = useTranslation();
  const { onlineUsers, isConnected, connectionStatus } = useRealtime(babyId);

  if (!babyId || !isConnected) {
    return null;
  }

  const otherUsers = onlineUsers.filter((user) => user.user_id !== user.user_id); // Filter out current user

  return (
    <div className="presence-indicator">
      <div className="connection-status">
        <div
          className={`connection-dot ${connectionStatus}`}
          title={t(`realtime.status.${connectionStatus}`)}
        />
      </div>

      {otherUsers.length > 0 && (
        <div className="online-users">
          <span className="online-users-count">{otherUsers.length}</span>
          <div className="online-users-list">
            {otherUsers.slice(0, 3).map((user, index) => (
              <div
                key={user.user_id || index}
                className="user-avatar"
                title={`${user.user_email || 'Caregiver'} is online`}
              >
                {(user.user_email || 'C')[0].toUpperCase()}
              </div>
            ))}
            {otherUsers.length > 3 && (
              <div className="user-avatar more">+{otherUsers.length - 3}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
