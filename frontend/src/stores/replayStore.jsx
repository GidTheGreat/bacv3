import { create } from "zustand";

const DEFAULT = {
    "binance|futures trade|BTCUSDT":{
        playing: false,
        cursor: 1,
        speed: 1,
        
    }
}

const useReplayStore = create((set) => ({
    replayState: {
        ...DEFAULT
    },

    setReplayState: (streamKey, property, value) =>
        set((state) => {
            //console.log(state.replayState)
            return {
            replayState: {
                ...state.replayState,
                [streamKey]: {
                    ...state.replayState[streamKey],
                    [property]: value
                }
            }}
        })
}))

export default useReplayStore;