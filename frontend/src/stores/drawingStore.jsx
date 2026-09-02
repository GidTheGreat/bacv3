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

    setDrawings: (key, type, id, entry) =>
        set(state => {
            return {
            Drawings: {
                    ...state.Drawings,
                    [key]: {
                        ...(state.Drawings[key] ?? {}),
                        [type]: {
                            ...(state.Drawings[key]?.[type] ?? {}),
                            [id]:entry
                        }
                            
                        
                    }
                }
            }

        }
            
        ),

    setSelected:(key, type,id)=>set((state=>{
        return {
            Drawings: {
                    ...state.Drawings,
                    [key]: {
                        ...(state.Drawings[key] ?? {}),
                        [type]: {
                            ...(state.Drawings[key]?.[type] ?? {}),
                            [id]: {
                                ...state.Drawings[key]?.[type]?.[id],
                                selected: !state.Drawings[key]?.[type]?.[id].selected,
                            }
                        }
                            
                        
                    }
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

