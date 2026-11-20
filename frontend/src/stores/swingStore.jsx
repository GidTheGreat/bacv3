
import { create } from "zustand";

const marketState4 = {
  "binance|um|BTCUSDT":{
    "1min": "uptrend"
  }
}


const useSwingStore = create((set) => ({
    swings: {},
    displaySwings: {},
    marketState: {},
    timeVisibleRange:{},
    setTimeVisibleRange: (chartId,from,to)=>set((state)=>({
      timeVisibleRange:{
        ...state.timeVisibleRange,
        [chartId]:{from,to}
      }
    })),
    setDisplaySwings:(chartId, displaySwings)=>set(state=>({
      displaySwings:{
        ...state.displaySwings,
      [chartId]:displaySwings
    }})),

    setMarketState: (key, subKey, newVal)=>set((state)=>({
      marketState:{
        ...state.marketState,
        [key]:{
          ...state.marketState[key],
          [subKey]: newVal
        }
      }
    })),

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
