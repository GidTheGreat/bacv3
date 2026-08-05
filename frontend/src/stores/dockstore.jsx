import { create } from "zustand";

export const useDockStore = create((set) => ({
  dock: {
    open: false,
    active: null,
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

  setActivePanel: (id) =>
    set((state) => ({
      dock: {
        ...state.dock,
        active: id,
      },
    })),

  addDockPanel: (panel) =>
    set((state) => {
      const exists = state.dock.panels.some(
        (p) => p.id === panel.id
      );

      if (exists) {
        return {
          dock: {
            ...state.dock,
            open: true,
            active: panel.id,
          },
        };
      }

      return {
        dock: {
          open: true,
          active: panel.id,
          panels: [...state.dock.panels, panel],
        },
      };
    }),

  removeDockPanel: (id) =>
    set((state) => {
      const panels = state.dock.panels.filter(
        (p) => p.id !== id
      );

      let active = state.dock.active;

      if (active === id) {
        active = panels.length ? panels[panels.length - 1].id : null;
      }

      return {
        dock: {
          open: panels.length > 0,
          active,
          panels,
        },
      };
    }),
}));