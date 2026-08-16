import { create } from "zustand";

const useFootprintStore = create((set) => ({

    variant: "off", // "delta" | "profile"
    

    setVariant: (variant) =>
        set({ variant }),
}));

export default useFootprintStore;