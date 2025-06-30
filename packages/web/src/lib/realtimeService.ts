import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { dataService } from './dataService';

export interface RealtimeService {
  subscribeToBaby(babyId: string): void;
  unsubscribeFromBaby(babyId: string): Promise<void>;
  sendPresence(babyId: string, status: 'online' | 'offline'): Promise<void>;
  onEntryChange(callback: (entry: any, event: 'INSERT' | 'UPDATE' | 'DELETE') => void): void;
  onPresenceChange(callback: (presence: any[]) => void): void;
  cleanup(): void;
}

class SupabaseRealtimeService implements RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private entryCallbacks: ((entry: any, event: 'INSERT' | 'UPDATE' | 'DELETE') => void)[] = [];
  private presenceCallbacks: ((presence: any[]) => void)[] = [];

  subscribeToBaby(babyId: string): void {
    if (this.channels.has(babyId)) {
      return; // Already subscribed
    }

    const channel = supabase
      .channel(`baby:${babyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'entry',
          filter: `baby_id=eq.${babyId}`,
        },
        (payload) => {
          console.log('Real-time entry change:', payload);

          // Notify all entry callbacks
          this.entryCallbacks.forEach((callback) => {
            callback(payload.new || payload.old, payload.eventType as any);
          });
        }
      )
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState();
        const presenceList = Object.values(newState).flat();

        console.log('Presence sync:', presenceList);

        // Notify all presence callbacks
        this.presenceCallbacks.forEach((callback) => {
          callback(presenceList);
        });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to baby:${babyId} channel`);

          // Send initial presence
          await this.sendPresence(babyId, 'online');
        }
      });

    this.channels.set(babyId, channel);
  }

  async unsubscribeFromBaby(babyId: string): Promise<void> {
    const channel = this.channels.get(babyId);
    if (channel) {
      // Send offline presence before unsubscribing
      await this.sendPresence(babyId, 'offline');

      supabase.removeChannel(channel);
      this.channels.delete(babyId);
      console.log(`Unsubscribed from baby:${babyId} channel`);
    }
  }

  async sendPresence(babyId: string, status: 'online' | 'offline'): Promise<void> {
    const channel = this.channels.get(babyId);
    if (!channel) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (status === 'online') {
      channel.track({
        user_id: user,
        status: 'online',
        last_seen: new Date().toISOString(),
      });
    } else {
      channel.untrack();
    }
  }

  onEntryChange(callback: (entry: any, event: 'INSERT' | 'UPDATE' | 'DELETE') => void): void {
    this.entryCallbacks.push(callback);
  }

  onPresenceChange(callback: (presence: any[]) => void): void {
    this.presenceCallbacks.push(callback);
  }

  cleanup(): void {
    // Unsubscribe from all channels
    this.channels.forEach((channel, babyId) => {
      this.unsubscribeFromBaby(babyId);
    });

    // Clear callbacks
    this.entryCallbacks = [];
    this.presenceCallbacks = [];
  }
}

export const realtimeService = new SupabaseRealtimeService();

// React hook for using real-time features
import { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/useAuthStore';
import { useBabyStore } from '../stores/useBabyStore';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/useData';

export function useRealtime(babyId?: string) {
  const { user } = useAuthStore();
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('disconnected');
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user || !babyId) return;

    setConnectionStatus('connecting');

    // Subscribe to baby channel
    realtimeService.subscribeToBaby(babyId);
    setConnectionStatus('connected');

    // Listen for entry changes
    const handleEntryChange = (entry: any, event: 'INSERT' | 'UPDATE' | 'DELETE') => {
      // Invalidate queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.entries(babyId) });

      // Show notification for changes from other users
      if (entry.created_by !== user.id) {
        showNotification(event, entry);
      }
    };

    // Listen for presence changes
    const handlePresenceChange = (presence: any[]) => {
      setOnlineUsers(presence);
    };

    realtimeService.onEntryChange(handleEntryChange);
    realtimeService.onPresenceChange(handlePresenceChange);

    return () => {
      realtimeService.unsubscribeFromBaby(babyId);
      setConnectionStatus('disconnected');
      setOnlineUsers([]);
    };
  }, [user, babyId, queryClient]);

  // Send heartbeat to maintain presence
  useEffect(() => {
    if (!user || !babyId || connectionStatus !== 'connected') return;

    const interval = setInterval(() => {
      realtimeService.sendPresence(babyId, 'online');
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [user, babyId, connectionStatus]);

  return {
    onlineUsers,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
  };
}

// Helper function to show notifications
function showNotification(event: 'INSERT' | 'UPDATE' | 'DELETE', entry: any) {
  if (!('Notification' in window)) return;

  let message = '';
  switch (event) {
    case 'INSERT':
      message = `New ${entry.type} entry added`;
      break;
    case 'UPDATE':
      message = `${entry.type} entry updated`;
      break;
    case 'DELETE':
      message = `${entry.type} entry deleted`;
      break;
  }

  if (Notification.permission === 'granted') {
    new Notification('Baby Metrics Update', {
      body: message,
      icon: '/icon.svg',
      badge: '/icon.svg',
    });
  }
}
