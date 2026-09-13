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
        clearStorage: (key)=>set(state=>{
            const {key:removed, ...rem} = state.storage;
            return {storage: rem}
        }),
        
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