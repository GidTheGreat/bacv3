import { use } from "react";
import { create } from "zustand";


const useTradeStore = create((set) => ({
    accBalance: {"Practice": 50, "Demo": 100, "Live": 0},

    tradeMode: false,

    accType: "Practice",

    accTypes: ["Practice", "Demo", "Live"],

    activeTrade: "um",

    activeSymbol: "BTCUSDT",

    activePlatform: "binance",

    stake: 2,

    leverage: 4,

    setLeverage: (leverage) => set({ leverage }),

    setStake: (stake) => set({ stake }),

    setActivePlatform: (activePlatform) => set({ activePlatform }),

    setActiveTrade: (activeTrade) => set({activeTrade}),

    setActiveSymbol: (activeSymbol) => set({activeSymbol}),

    setTradeMode: (tradeMode) => set({ tradeMode }),

    setAccType: (accType) => set({ accType }),

    setAccBalance: (accType, accBalance) => set(state=>{
        return {
            accBalance: {
                ...state.accBalance,
                [accType]: accBalance
            }
        }
    }),

}))

export default useTradeStore;