import { create } from "zustand";

const DEFAULT = {
    "12345":{
        notional: true,
        footprint: false,
        footer: true,
        poc: false,
        lod: false,
        ua: false,
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