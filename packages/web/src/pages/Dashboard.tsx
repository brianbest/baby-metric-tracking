import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QuickActionGrid } from '../components/common';
import { TimelineChart } from '../components/charts';
import { EntryModal } from '../components/forms';
import { useBabyStore, useEntryStore, useSettingsStore } from '../stores';
import { format } from 'date-fns';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { babies, getActiveBaby, loadBabies } = useBabyStore();
  const { 
    todayEntries, 
    loadTodayEntries, 
    getStats, 
    isLoading: entriesLoading 
  } = useEntryStore();
  const { initialize } = useSettingsStore();

  const activeBaby = getActiveBaby();

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

  const formatSleepDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

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
        <p className="dashboard__subtitle">
          {format(selectedDate, 'MMMM d')}
        </p>
      </header>
      
      <div className="dashboard__content">
        {/* Quick Actions Section */}
        <section className="dashboard__quick-actions">
          <h2 className="dashboard__section-title">{t('quickActions.title')}</h2>
          <QuickActionGrid />
        </section>

        {/* Stats Overview */}
        {stats && (
          <section className="dashboard__stats">
            <h2 className="dashboard__section-title">{t('dashboard.todayStats')}</h2>
            <div className="stats-grid">
              <div className="stat-card stat-card--feed">
                <div className="stat-card__icon">🍼</div>
                <div className="stat-card__content">
                  <span className="stat-card__label">{t('dashboard.stats.totalFeeds')}</span>
                  <span className="stat-card__value">{stats.totalFeeds}</span>
                  {stats.lastFeed && (
                    <span className="stat-card__time">
                      {t('dashboard.lastFeed')}: {formatTimeAgo(stats.lastFeed)}
                    </span>
                  )}
                </div>
              </div>

              <div className="stat-card stat-card--sleep">
                <div className="stat-card__icon">😴</div>
                <div className="stat-card__content">
                  <span className="stat-card__label">{t('dashboard.stats.totalSleep')}</span>
                  <span className="stat-card__value">
                    {stats.totalSleep > 0 ? formatSleepDuration(stats.totalSleep) : '0h'}
                  </span>
                  {stats.lastSleep && (
                    <span className="stat-card__time">
                      {t('dashboard.lastSleep')}: {formatTimeAgo(stats.lastSleep)}
                    </span>
                  )}
                </div>
              </div>

              <div className="stat-card stat-card--diaper">
                <div className="stat-card__icon">🚼</div>
                <div className="stat-card__content">
                  <span className="stat-card__label">{t('dashboard.stats.totalDiapers')}</span>
                  <span className="stat-card__value">
                    {todayEntries.filter(e => e.type === 'diaper').length}
                  </span>
                  {stats.lastDiaper && (
                    <span className="stat-card__time">
                      {t('dashboard.lastDiaper')}: {formatTimeAgo(stats.lastDiaper)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Timeline Chart */}
        <section className="dashboard__timeline">
          <h2 className="dashboard__section-title">{t('dashboard.timeline')}</h2>
          {entriesLoading ? (
            <div className="dashboard__loading">
              <div className="loading-spinner"></div>
              <p>{t('common.loading')}</p>
            </div>
          ) : (
            <TimelineChart 
              entries={todayEntries} 
              date={selectedDate}
              height={300}
            />
          )}
        </section>

        {/* Recent Entries */}
        {todayEntries.length > 0 && (
          <section className="dashboard__recent">
            <h2 className="dashboard__section-title">{t('dashboard.recentEntries')}</h2>
            <div className="recent-entries">
              {todayEntries.slice(-5).reverse().map((entry) => (
                <div key={entry.id} className={`recent-entry recent-entry--${entry.type}`}>
                  <div className="recent-entry__icon">
                    {entry.type === 'feed' && '🍼'}
                    {entry.type === 'diaper' && '🚼'}
                    {entry.type === 'sleep' && '😴'}
                  </div>
                  <div className="recent-entry__content">
                    <div className="recent-entry__type">
                      {t(`forms.${entry.type}.title`)}
                    </div>
                    <div className="recent-entry__details">
                      {entry.type === 'feed' && entry.payload.source === 'breast' && (
                        <span>
                          {t('forms.feed.sources.breast')}
                          {entry.payload.duration && ` • ${entry.payload.duration}min`}
                        </span>
                      )}
                      {entry.type === 'feed' && entry.payload.source === 'bottle' && (
                        <span>
                          {entry.payload.volume}{entry.payload.unit}
                        </span>
                      )}
                      {entry.type === 'diaper' && (
                        <span>
                          {t(`forms.diaper.types.${entry.payload.diaperType}`)}
                        </span>
                      )}
                      {entry.type === 'sleep' && entry.payload.duration && (
                        <span>
                          {formatSleepDuration(entry.payload.duration)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="recent-entry__time">
                    {format(entry.timestamp, 'HH:mm')}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 