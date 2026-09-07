import { create } from "zustand";

const useAppStore = create((set)=>
(
    {
        storage: {},

        ws: false, 

        notification: "ALL SYSTEMS NOMINAL",

        setStorage: (key, value)=>set(state=>({
            storage:{
                ...state.storage,
                [key]: value
            }
        })),
        
        setNotification: (notification)=>set(()=>({
            notification
        })),

        setWs: () => set(
                (state) => {
                    if (state.ws) {
                        return { ws: false };
                    } else {
                        return { ws: true };
                    }
                }
            )

    }
)
)

export default useAppStore;