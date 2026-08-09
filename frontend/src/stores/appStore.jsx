import { create } from "zustand";

const useAppStore = create((set)=>
(
    {
        threadsRunning: false,

        ws: false, 

        setThreadsStatus: (running)=>set(
            (state)=>({
                threadsRunning:running
            })
        ),

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