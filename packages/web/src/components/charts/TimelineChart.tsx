import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { Entry } from '@baby-tracker/shared';
import { format, startOfDay, endOfDay } from 'date-fns';
import './TimelineChart.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, TimeScale);

interface TimelineChartProps {
  entries: Entry[];
  date: Date;
  height?: number;
}

interface TimelineDataPoint {
  x: Date;
  y: number;
  entryType: 'feed' | 'diaper' | 'sleep';
  entry: Entry;
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ entries, date, height = 300 }) => {
  const { t } = useTranslation();

  const { chartData, options } = useMemo(() => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    // Create 24-hour timeline data
    const timelineData: TimelineDataPoint[] = [];

    entries.forEach((entry) => {
      // Map entry types to y-axis positions
      let yPosition = 0;
      switch (entry.type) {
        case 'sleep':
          yPosition = 3;
          break;
        case 'feed':
          yPosition = 2;
          break;
        case 'diaper':
          yPosition = 1;
          break;
      }

      timelineData.push({
        x: entry.timestamp,
        y: yPosition,
        entryType: entry.type,
        entry,
      });
    });

    // Separate data by entry type for different colors
    const feedData = timelineData.filter((d) => d.entryType === 'feed');
    const diaperData = timelineData.filter((d) => d.entryType === 'diaper');
    const sleepData = timelineData.filter((d) => d.entryType === 'sleep');

    const data = {
      datasets: [
        {
          label: t('forms.feed.title'),
          data: feedData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)', // Blue
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 4,
          barThickness: 20,
        },
        {
          label: t('forms.diaper.title'),
          data: diaperData,
          backgroundColor: 'rgba(34, 197, 94, 0.8)', // Green
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 2,
          borderRadius: 4,
          barThickness: 20,
        },
        {
          label: t('forms.sleep.title'),
          data: sleepData,
          backgroundColor: 'rgba(168, 85, 247, 0.8)', // Purple
          borderColor: 'rgba(168, 85, 247, 1)',
          borderWidth: 2,
          borderRadius: 4,
          barThickness: 20,
        },
      ],
    };

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'nearest' as const,
        axis: 'x' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
          labels: {
            usePointStyle: true,
            padding: 20,
            color: 'var(--color-text-primary)',
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: 'var(--color-bg-primary)',
          titleColor: 'var(--color-text-primary)',
          bodyColor: 'var(--color-text-secondary)',
          borderColor: 'var(--color-border)',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            title: (context: any) => {
              const dataPoint = context[0]?.raw as TimelineDataPoint;
              if (dataPoint) {
                return format(dataPoint.x, 'HH:mm');
              }
              return '';
            },
            label: (context: any) => {
              const dataPoint = context.raw as TimelineDataPoint;
              if (!dataPoint) return '';

              const entry = dataPoint.entry;
              let label = t(`forms.${entry.type}.title`);

              // Add specific details based on entry type
              switch (entry.type) {
                case 'feed':
                  if (entry.payload.source === 'breast') {
                    label += ` - ${t('forms.feed.sources.breast')}`;
                    if (entry.payload.duration) {
                      label += ` (${entry.payload.duration}min)`;
                    }
                    if (entry.payload.side) {
                      label += ` - ${t(`forms.feed.sides.${entry.payload.side}`)}`;
                    }
                  } else if (entry.payload.source === 'bottle') {
                    label += ` - ${entry.payload.volume}${entry.payload.unit}`;
                  }
                  break;
                case 'diaper':
                  label += ` - ${t(`forms.diaper.types.${entry.payload.diaperType}`)}`;
                  break;
                case 'sleep':
                  if (entry.payload.duration) {
                    const hours = Math.floor(entry.payload.duration / 60);
                    const minutes = entry.payload.duration % 60;
                    label += ` - ${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
                  } else {
                    label += ` - ${t('forms.sleep.inProgress')}`;
                  }
                  break;
              }

              if (entry.notes) {
                label += `\n${entry.notes}`;
              }

              return label;
            },
          },
        },
      },
      scales: {
        x: {
          type: 'time' as const,
          time: {
            unit: 'hour' as const,
            displayFormats: {
              hour: 'HH:mm',
            },
            min: dayStart.getTime(),
            max: dayEnd.getTime(),
          },
          grid: {
            display: true,
            color: 'var(--color-border)',
          },
          ticks: {
            color: 'var(--color-text-secondary)',
            font: {
              size: 11,
            },
            maxRotation: 0,
            callback: function (value: any) {
              return format(new Date(value), 'HH:mm');
            },
          },
          title: {
            display: true,
            text: t('dashboard.timeline'),
            color: 'var(--color-text-primary)',
            font: {
              size: 12,
              weight: 'bold' as const,
            },
          },
        },
        y: {
          type: 'linear' as const,
          min: 0,
          max: 4,
          ticks: {
            stepSize: 1,
            color: 'var(--color-text-secondary)',
            font: {
              size: 11,
            },
            callback: function (value: any) {
              switch (value) {
                case 1:
                  return t('forms.diaper.title');
                case 2:
                  return t('forms.feed.title');
                case 3:
                  return t('forms.sleep.title');
                default:
                  return '';
              }
            },
          },
          grid: {
            display: true,
            color: 'var(--color-border)',
          },
          title: {
            display: true,
            text: t('dashboard.activities'),
            color: 'var(--color-text-primary)',
            font: {
              size: 12,
              weight: 'bold' as const,
            },
          },
        },
      },
    };

    return { chartData: data, options: chartOptions };
  }, [entries, date, t]);

  return (
    <div className="timeline-chart">
      <div className="timeline-chart__header">
        <h3 className="timeline-chart__title">
          {t('dashboard.timeline')} - {format(date, 'MMMM d, yyyy')}
        </h3>
        <div className="timeline-chart__summary">
          {entries.length === 0 ? (
            <span className="timeline-chart__empty">{t('dashboard.noData')}</span>
          ) : (
            <span className="timeline-chart__count">
              {t('dashboard.entriesCount', { count: entries.length })}
            </span>
          )}
        </div>
      </div>

      <div className="timeline-chart__container" style={{ height: `${height}px` }}>
        {entries.length > 0 ? (
          <Bar data={chartData} options={options as any} />
        ) : (
          <div className="timeline-chart__placeholder">
            <div className="timeline-chart__placeholder-icon">📊</div>
            <p>{t('dashboard.noDataToday')}</p>
            <p className="timeline-chart__placeholder-hint">{t('dashboard.addFirstEntry')}</p>
          </div>
        )}
      </div>
    </div>
  );
};
