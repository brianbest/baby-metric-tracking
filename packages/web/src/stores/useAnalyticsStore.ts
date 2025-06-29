import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AnalyticsEvent {
  id: string;
  event: string;
  properties: Record<string, any>;
  timestamp: Date;
  userId?: string;
}

interface AnalyticsState {
  events: AnalyticsEvent[];
  isOnline: boolean;
  isInitialized: boolean;
}

interface AnalyticsActions {
  track: (event: string, properties?: Record<string, any>, userId?: string) => void;
  flush: () => Promise<void>;
  setOnlineStatus: (isOnline: boolean) => void;
  initialize: () => void;
}

type AnalyticsStore = AnalyticsState & AnalyticsActions;

export const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set, get) => ({
      // State
      events: [],
      isOnline: navigator.onLine,
      isInitialized: false,

      // Actions
      track: (event: string, properties = {}, userId) => {
        const analyticsEvent: AnalyticsEvent = {
          id: crypto.randomUUID(),
          event,
          properties: {
            ...properties,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent,
          },
          timestamp: new Date(),
          userId,
        };

        set(state => ({
          events: [...state.events, analyticsEvent]
        }));

        // Try to flush immediately if online
        if (get().isOnline) {
          get().flush().catch(console.error);
        }
      },

      flush: async () => {
        const { events, isOnline } = get();
        
        if (!isOnline || events.length === 0) {
          return;
        }

        try {
          // In a real implementation, you would send to Segment here
          // For now, we'll just simulate the API call
          const segmentEvents = events.map(event => ({
            event: event.event,
            properties: event.properties,
            userId: event.userId,
            timestamp: event.timestamp.toISOString(),
          }));

          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 100));
          
          console.log('Analytics events flushed:', segmentEvents);
          
          // Clear successfully sent events
          set({ events: [] });
          
        } catch (error) {
          console.error('Failed to flush analytics events:', error);
          // Events remain in queue for next attempt
        }
      },

      setOnlineStatus: (isOnline: boolean) => {
        set({ isOnline });
        
        // Try to flush queued events when coming back online
        if (isOnline) {
          get().flush().catch(console.error);
        }
      },

      initialize: () => {
        if (get().isInitialized) return;

        // Listen for online/offline events
        const handleOnline = () => get().setOnlineStatus(true);
        const handleOffline = () => get().setOnlineStatus(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Set initial online status
        set({ 
          isOnline: navigator.onLine,
          isInitialized: true 
        });

        // Try to flush any queued events
        get().flush().catch(console.error);
      },
    }),
    {
      name: 'analytics-store',
      partialize: (state) => ({ 
        events: state.events 
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initialize();
        }
      },
    }
  )
); 