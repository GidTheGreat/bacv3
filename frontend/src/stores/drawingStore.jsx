import { Visibility } from "@mui/icons-material";
import { create } from "zustand";
const DEFAULT = {
    key:"binance|futures trade|BTCUSDT",
    action: "Cursor",

}
const useDrawingStore = create((set) => ({
    DrawingState: { ...DEFAULT },

    NotDrawings: {
        visibility: true
    },

    Drawings: {},

    clearDrawings: () => set({
        Drawings: {}
    }),

    setNotDrawings: (type)=>set(state=>{
        //console.log("[setNotDrawings], condition:",state.NotDrawings?.[type],"notDrawings:", state.NotDrawings?.[type],)
        return {
            NotDrawings: {
                ...state.NotDrawings,
                [type]: !state.NotDrawings?.[type]
                
            }
        }
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

    clearDrawing: (key, type, id,)=>set((state) => {
        const {
            [id]: removed,
            ...remainingDrawings
        } = state.Drawings[key]?.[type] ?? {};
        //console.log("[drawing store]",remainingDrawings);

        return {
            Drawings: {
                ...state.Drawings,
                [key]: {
                    ...state.Drawings[key],
                    [type]: remainingDrawings
                }
            }
        };
    }),

    setSelected:(key, type, id, hit=null)=>set((state=>{
        //console.log("Set slected being called")
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
                                hit: hit
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

