
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useTelegramStore = create(
  persist(
    (set) => ({
      botToken: null,
      chartId: null,
      hasHydrated: false,

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setBotToken: (botToken) => set({ botToken }),
      setChartId: (chartId) => set({ chartId }),

      reset: () => set({
        botToken: null,
        chartId: null,
      }),
    }),
    {
      name: 'tgDeets',
      storage: createJSONStorage(() => localStorage),
      version: 1,

      // Persist only the actual Telegram configuration.
      partialize: (state) => ({
        botToken: state.botToken,
        chartId: state.chartId,
      }),

      // Handle hydration lifecycle.
      onRehydrateStorage: () => {
        console.log('Starting Telegram store hydration');

        return (state, error) => {
          if (error) {
            console.error('Telegram store hydration failed:', error);
          }

          state?.setHasHydrated(true);
        };
      },

      // Preserve defaults when merging persisted state.
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...persistedState,
      }),
    }
  )
);

export default useTelegramStore;
