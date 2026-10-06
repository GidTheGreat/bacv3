import { create } from "zustand";

const useSwingStore = create((set) => ({
    swings: {},

    addSwing: (key, tf, swing) => set((state) => {
        // Get the existing array for this specific key and timeframe, or default to an empty array
        const currentTimeframeSwings = state.swings?.[key]?.[tf] || [];

        return {
            swings: {
                ...state.swings,
                [key]: {
                    ...state.swings?.[key], // Preserve other timeframes for this key
                    [tf]: [...currentTimeframeSwings, swing] // Safely add the new swing
                }
            }
        };
    }),

    replaceLatest: (key, tf, swing) => set((state) => {
        // Get the existing array for this specific key and timeframe, or default to an empty array
        state.swings?.[key]?.[tf].pop();
        const currentTimeframeSwings = state.swings?.[key]?.[tf];

        return {
            swings: {
                ...state.swings,
                [key]: {
                    ...state.swings?.[key], // Preserve other timeframes for this key
                    [tf]: [...currentTimeframeSwings, swing] // Safely add the new swing
                }
            }
        };
    }),

}));


export default useSwingStore;