import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QuickActionGrid } from '../components/common';
import { useBabyStore, useEntryStore, useSettingsStore } from '../stores';
import { format } from 'date-fns';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDate] = useState(new Date());
  
  const { babies, getSelectedBaby, loadBabies } = useBabyStore();
  const { 
    loadTodayEntries, 
    getStats
  } = useEntryStore();
  const { initialize } = useSettingsStore();

  const activeBaby = getSelectedBaby(babies);

  // Initialize stores and load data
  useEffect(() => {
    initialize();
    loadBabies();
  }, [initialize, loadBabies]);

  useEffect(() => {
    if (activeBaby) {
      loadTodayEntries(activeBaby.id);
    }
  }, [activeBaby, loadTodayEntries]);

  const stats = activeBaby ? getStats(activeBaby.id, selectedDate) : null;

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMinutes < 60) {
      return t('time.minutesAgo', { count: diffMinutes });
    }

    const diffHours = Math.floor(diffMinutes / 60);
    return t('time.hoursAgo', { count: diffHours });
  };

  if (!activeBaby && babies.length === 0) {
    return (
      <div className="dashboard">
        <div className="dashboard__empty">
          <h2>{t('baby.noBabies')}</h2>
          <p>{t('baby.addFirstBaby')}</p>
        </div>
      </div>
    );
  }

  if (!activeBaby) {
    return (
      <div className="dashboard">
        <div className="dashboard__empty">
          <h2>{t('baby.selectBaby')}</h2>
          <p>{t('baby.selectBabyToContinue')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <h1 className="dashboard__title">{t('dashboard.title')}</h1>
        <p className="dashboard__subtitle">{format(selectedDate, 'MMMM d')}</p>
      </header>

      <div className="dashboard__content">
        {/* Quick Actions Section */}
        <section className="dashboard__quick-actions">
          <QuickActionGrid />
        </section>

        {/* At-a-Glance Summary */}
        {stats && (
          <section className="dashboard__summary">
            <h2 className="dashboard__section-title">{t('dashboard.atAGlance')}</h2>
            <div className="summary-grid">
              <div className="summary-card summary-card--feed">
                <div className="summary-card__icon">🍼</div>
                <div className="summary-card__content">
                  <span className="summary-card__label">{t('dashboard.lastFeed')}</span>
                  <span className="summary-card__value">
                    {stats.lastFeed ? formatTimeAgo(stats.lastFeed) : t('dashboard.noData')}
                  </span>
                </div>
              </div>

              <div className="summary-card summary-card--diaper">
                <div className="summary-card__icon">🚼</div>
                <div className="summary-card__content">
                  <span className="summary-card__label">{t('dashboard.lastDiaper')}</span>
                  <span className="summary-card__value">
                    {stats.lastDiaper ? formatTimeAgo(stats.lastDiaper) : t('dashboard.noData')}
                  </span>
                </div>
              </div>

              <div className="summary-card summary-card--sleep">
                <div className="summary-card__icon">😴</div>
                <div className="summary-card__content">
                  <span className="summary-card__label">{t('dashboard.sleepStatus')}</span>
                  <span className="summary-card__value">
                    {stats.lastSleep ? formatTimeAgo(stats.lastSleep) : t('dashboard.noData')}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
