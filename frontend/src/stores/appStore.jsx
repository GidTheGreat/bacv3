import { create } from "zustand";

const useAppStore = create((set)=>
(
    {
        threadsRunning: false,

        ws: false, 

        notification: "ALL SYSTEMS NOMINAL",

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