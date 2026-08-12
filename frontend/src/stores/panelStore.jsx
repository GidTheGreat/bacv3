import { create } from "zustand";

const usePanelStore = create((set) => ({
 

  activeLayout: "fourGrid",

  setActiveLayout: (layout)=>set((state)=>({
    activeLayout: layout
  }))
  
}));

export default usePanelStore;