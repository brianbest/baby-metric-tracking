import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '../lib/dataService';
import { useAuthStore } from '../stores/useAuthStore';
import type { Baby, Entry, CreateEntry } from '@baby-tracker/shared';

// Query keys
export const queryKeys = {
  babies: ['babies'] as const,
  entries: (babyId: string) => ['entries', babyId] as const,
};

// Baby hooks
export function useBabies() {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.babies,
    queryFn: () => dataService.getBabies(),
    enabled: !!user, // Only run when user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateBaby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (baby: Omit<Baby, 'id' | 'createdAt' | 'updatedAt'>) =>
      dataService.createBaby(baby),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.babies });
    },
    onError: (error) => {
      console.error('Failed to create baby:', error);
    },
  });
}

export function useUpdateBaby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Baby> }) =>
      dataService.updateBaby(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.babies });
    },
    onError: (error) => {
      console.error('Failed to update baby:', error);
    },
  });
}

export function useDeleteBaby() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataService.deleteBaby(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.babies });
    },
    onError: (error) => {
      console.error('Failed to delete baby:', error);
    },
  });
}

// Entry hooks
export function useEntries(babyId: string, limit?: number) {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: queryKeys.entries(babyId),
    queryFn: () => dataService.getEntries(babyId, limit),
    enabled: !!user && !!babyId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entry: CreateEntry) => dataService.createEntry(entry),
    onMutate: async (newEntry) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.entries(newEntry.babyId) });

      // Snapshot the previous value
      const previousEntries = queryClient.getQueryData(queryKeys.entries(newEntry.babyId));

      // Optimistically update to the new value
      queryClient.setQueryData(queryKeys.entries(newEntry.babyId), (old: Entry[] = []) => {
        const optimisticEntry: Entry = {
          ...newEntry,
          id: 'temp-' + Date.now(),
          createdAt: new Date(),
        };
        return [optimisticEntry, ...old];
      });

      // Return a context object with the snapshotted value
      return { previousEntries, babyId: newEntry.babyId };
    },
    onError: (err, newEntry, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousEntries) {
        queryClient.setQueryData(queryKeys.entries(context.babyId), context.previousEntries);
      }
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.entries(variables.babyId) });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Entry> }) =>
      dataService.updateEntry(id, updates),
    onSuccess: (updatedEntry) => {
      // Update the specific entry in all relevant queries
      queryClient.setQueryData(queryKeys.entries(updatedEntry.babyId), (old: Entry[] = []) =>
        old.map((entry) => (entry.id === updatedEntry.id ? updatedEntry : entry))
      );
    },
    onError: (error) => {
      console.error('Failed to update entry:', error);
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => dataService.deleteEntry(id),
    onMutate: async (entryId) => {
      // Find which baby this entry belongs to
      const queriesData = queryClient.getQueriesData({ queryKey: ['entries'] });
      let babyId: string | null = null;

      for (const [queryKey, data] of queriesData) {
        const entries = data as Entry[] | undefined;
        if (entries?.some((entry) => entry.id === entryId)) {
          babyId = (queryKey as string[])[1];
          break;
        }
      }

      if (!babyId) return;

      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.entries(babyId) });

      // Snapshot the previous value
      const previousEntries = queryClient.getQueryData(queryKeys.entries(babyId));

      // Optimistically remove the entry
      queryClient.setQueryData(queryKeys.entries(babyId), (old: Entry[] = []) =>
        old.filter((entry) => entry.id !== entryId)
      );

      return { previousEntries, babyId };
    },
    onError: (err, entryId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousEntries && context.babyId) {
        queryClient.setQueryData(queryKeys.entries(context.babyId), context.previousEntries);
      }
    },
    onSettled: (data, error, variables, context) => {
      // Always refetch after error or success
      if (context?.babyId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.entries(context.babyId) });
      }
    },
  });
}

// Sync hook
export function useDataSync() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => dataService.syncData(),
    onSuccess: () => {
      // Invalidate all queries to refetch fresh data
      queryClient.invalidateQueries({ queryKey: queryKeys.babies });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
    },
    onError: (error) => {
      console.error('Data sync failed:', error);
    },
  });
}

// Connection status
export function useConnectionStatus() {
  return useQuery({
    queryKey: ['connectionStatus'],
    queryFn: () => dataService.getConnectionStatus(),
    refetchInterval: 30000, // Check every 30 seconds
  });
}
