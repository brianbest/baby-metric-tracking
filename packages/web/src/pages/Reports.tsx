import React from 'react';
import { useTranslation } from 'react-i18next';
import { TimelineChart } from '../components/charts';
import { useBabyStore, useEntryStore } from '../stores';
import { format } from 'date-fns';
import './Reports.css';

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const { getActiveBaby } = useBabyStore();
  const { todayEntries, getStats } = useEntryStore();

  const activeBaby = getActiveBaby();
  const today = new Date();
  const stats = activeBaby ? getStats(activeBaby.id, today) : null;

  const formatSleepDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (!activeBaby) {
    return (
      <div className="reports">
        <div className="reports__empty">
          <h2>{t('baby.selectBaby')}</h2>
          <p>{t('baby.selectBabyToContinue')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports">
      <header className="reports__header">
        <h1 className="reports__title">Reports & Analytics</h1>
        <p className="reports__subtitle">
          Detailed insights for {activeBaby.name} • {format(today, 'MMMM d, yyyy')}
        </p>
      </header>

      <div className="reports__content">
        {/* Daily Summary */}
        <section className="reports__summary">
          <h2 className="reports__section-title">Today's Summary</h2>
          {stats && (
            <div className="reports-stats-grid">
              <div className="reports-stat-card reports-stat-card--feed">
                <div className="reports-stat-card__header">
                  <span className="reports-stat-card__icon">🍼</span>
                  <span className="reports-stat-card__title">Feeds</span>
                </div>
                <div className="reports-stat-card__value">{stats.totalFeeds}</div>
                <div className="reports-stat-card__detail">
                  {stats.lastFeed ? `Last: ${format(stats.lastFeed, 'HH:mm')}` : 'No feeds today'}
                </div>
              </div>

              <div className="reports-stat-card reports-stat-card--sleep">
                <div className="reports-stat-card__header">
                  <span className="reports-stat-card__icon">😴</span>
                  <span className="reports-stat-card__title">Sleep</span>
                </div>
                <div className="reports-stat-card__value">
                  {stats.totalSleep > 0 ? formatSleepDuration(stats.totalSleep) : '0h'}
                </div>
                <div className="reports-stat-card__detail">
                  {stats.lastSleep
                    ? `Last: ${format(stats.lastSleep, 'HH:mm')}`
                    : 'No sleep logged'}
                </div>
              </div>

              <div className="reports-stat-card reports-stat-card--diaper">
                <div className="reports-stat-card__header">
                  <span className="reports-stat-card__icon">🚼</span>
                  <span className="reports-stat-card__title">Diapers</span>
                </div>
                <div className="reports-stat-card__value">
                  {todayEntries.filter((e) => e.type === 'diaper').length}
                </div>
                <div className="reports-stat-card__detail">
                  {stats.lastDiaper
                    ? `Last: ${format(stats.lastDiaper, 'HH:mm')}`
                    : 'No changes today'}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Timeline Chart */}
        <section className="reports__timeline">
          <h2 className="reports__section-title">24-Hour Timeline</h2>
          <div className="reports__chart-container">
            <TimelineChart entries={todayEntries} date={today} height={400} />
          </div>
        </section>

        {/* Placeholder for future analytics */}
        <section className="reports__analytics">
          <h2 className="reports__section-title">Weekly Trends</h2>
          <div className="reports__placeholder">
            <div className="reports__placeholder-content">
              <span className="reports__placeholder-icon">📊</span>
              <h3>Coming Soon</h3>
              <p>Weekly trends, growth charts, and pattern analysis will be available here.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Reports;
