import { create } from "zustand";
const DEFAULT = {
    key:"binance|futures trade|BTCUSDT",
    action: "Cursor",

}
const useDrawingStore = create((set) => ({
    DrawingState: { ...DEFAULT },

    Drawings: {},

    clearDrawings: () => set({
        Drawings: {}
    }),

    setDrawings: (key, type, entry) =>
        set(state => ({
            Drawings: {
                ...state.Drawings,
                [key]: {
                    ...(state.Drawings[key] ?? {}),
                    [type]: [
                        ...(state.Drawings[key]?.[type] ?? []),
                        entry
                    ]
                }
            }
        })),
        
    setDrawingState: (key, newAction, details = null) =>
        set((state) => ({
            DrawingState: {
                ...state.DrawingState,
                    key,
                    action: newAction,
                    details
                
            }
        }))
}));

export default useDrawingStore;

