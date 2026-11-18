
import { create } from "zustand";

const useSwingStore = create((set) => ({
    swings: {},
    displaySwings: {},
    setDisplaySwings:(chartId, displaySwings)=>set(state=>({
      displaySwings:{
      [chartId]:displaySwings
    }})),

    addSwings: (key, swing) => set((state) => {
        //console.log("adding swing:", swing)
        const currentSwings = state.swings[key] || [];

        return {
            swings: {
                ...state.swings,
                [key]: [...currentSwings, swing]
            }
        };
    }),

    removeLatestSwing: (key) => set((state) => {
        const currentSwings = state.swings[key] || [];

        return {
            swings: {
                ...state.swings,
                [key]: currentSwings.slice(0, -1)
            }
        };
    })
}));

export default useSwingStore;
