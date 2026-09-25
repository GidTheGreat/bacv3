import { use } from "react";
import { create } from "zustand";

const useTradeStore = create((set) => ({
    tradeMode: false,
    setTradeMode: (tradeMode) => set({ tradeMode })
}))

export default useTradeStore;