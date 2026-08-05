import { create } from "zustand";

export const useDockStore = create((set) => ({
  dock: {
    open: false,
    panels: [],
  },

  openDock: () =>
    set((state) => ({
      dock: {
        ...state.dock,
        open: true,
      },
    })),

  closeDock: () =>
    set((state) => ({
      dock: {
        ...state.dock,
        open: false,
      },
    })),

  addDockPanel: (panel) =>
    set((state) => {
      const exists = state.dock.panels.some(
        (p) => p.id === panel.id
      );

      return {
        dock: {
          ...state.dock,
          open: true,
          panels: exists
            ? state.dock.panels
            : [...state.dock.panels, panel],
        },
      };
    }),

  removeDockPanel: (id) =>
    set((state) => ({
      dock: {
        ...state.dock,
        panels: state.dock.panels.filter(
          (p) => p.id !== id
        ),
      },
    })),
}));