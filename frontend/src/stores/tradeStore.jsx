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

    runningTrades: [],

    closedTrades: [],

    drawActiveTrades: false,

    drawClosedTrades: false,

    setDrawActiveTrades: ()=>set((state)=>{
        return {
           drawActiveTrades: !state.drawActiveTrades, 
        }
    }),

    setDrawClosedTrades: ()=>set((state)=>{
        return {
           drawClosedTrades: !state.drawClosedTrades, 
        }
    }),

    setRunningTrade: (tradeInfo)=> set(state=>{
        return {
            runningTrades: [...state.runningTrades, tradeInfo]
        }
    }),

    closeRunningTrade: (id) => set(state=>{
        const closedTrade = state.runningTrades.find(runningTrade=>runningTrade.id==id)
        return {
            runningTrades: state.runningTrades.filter(runningTrade=>(runningTrade.id != closedTrade.id)),
            closedTrades: [...state.closedTrades, closedTrade]
        }
    }),

    modifyPnl: (newTradesList) => set(state => {
        // Create a quick lookup map of the incoming updated trades by ID
        const updatesMap = new Map(newTradesList.map(trade => [trade.id, trade]));

        // Map through existing trades: if an update exists, use it; otherwise, keep the current one
        const nextTrades = state.runningTrades.map(runningTrade => {
            if (updatesMap.has(runningTrade.id)) {
                return updatesMap.get(runningTrade.id);
            }
            return runningTrade;
        });

        return {
            runningTrades: nextTrades
        };
    }),


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