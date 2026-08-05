// drawingStore.js
import { create } from "zustand";

const useDrawingStore = create((set) => ({

    // {
    //   [k1]: [ drawing, drawing, ... ]
    // }
    drawings: {},

    getDrawings: (k1) =>
        useDrawingStore.getState().drawings[k1] ?? [],

    addDrawing: (k1, drawing) =>
        set((state) => ({

            drawings: {

                ...state.drawings,

                [k1]: [
                    ...(state.drawings[k1] ?? []),
                    drawing,
                ],

            },

        })),

    updateDrawing: (k1, id, updates) =>
        set((state) => ({

            drawings: {

                ...state.drawings,

                [k1]: (state.drawings[k1] ?? []).map(d =>
                    d.id === id
                        ? {
                              ...d,
                              ...updates,
                          }
                        : d
                ),

            },

        })),

    deleteDrawing: (k1, id) =>
        set((state) => ({

            drawings: {

                ...state.drawings,

                [k1]: (state.drawings[k1] ?? []).filter(
                    d => d.id !== id
                ),

            },

        })),

    clearDrawings: (k1) =>
        set((state) => ({

            drawings: {

                ...state.drawings,

                [k1]: [],

            },

        })),

}));
export default useDrawingStore;