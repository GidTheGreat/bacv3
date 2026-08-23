import { create } from "zustand";

const DEFAULT = {
    "12345":{
        notional: true,
        fpStatus: "full",
        footer: true,
        poc: false,
        VA: 70
    }
}

const useFootprintStore = create((set) => ({

    footPrintState: {},
    

    setFootPrintState: (chartId, property, value) =>
        set((state)=>({
            footPrintState:{
                ...state.footPrintState,
                [chartId]: {
                    ...state.footPrintState[chartId],
                    [property]:value
                }
            }
        })),
}));

export default useFootprintStore;