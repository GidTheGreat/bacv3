import { create } from "zustand";

const DEFAULT = {
    "binance|um|BTCUSDT":{
        replayBar: false,
        playing: false,
        locked:false,
        cursor: 1,
        speed: 1,
        
    }
}

const useReplayStore = create((set) => ({
    replayState: {
        ...DEFAULT
    },

    replayKey: {
        platform: "binance", symbol: "BTCUSDT", trade: "um"
    },
    replayActive: false,

    setReplayActive: ()=>set((state)=>({replayActive:!state.replayActive})),

    setReplayKey: (update)=>set(
        (state)=>{
            const order = {
                platform:0,
                trade:1,
                symbol:2
            }
            const currentKeys=Object.keys(state.replayKey).filter(cKey=>!(Object.keys(update).includes(cKey)));
            

            const replayKeyJoinList = [...currentKeys,...Object.keys(update)].sort((a,b)=>order[a]-order[b]).map(
                c2Key=>{
                    if (Object.keys(update).includes(c2Key)) return update[c2Key];
                    else return state.replayKey[c2Key]

                }
            )

            
            if (replayKeyJoinList[2].toLowerCase().endsWith("perp") 
                && replayKeyJoinList[1].toLowerCase().endsWith("um")){
                    replayKeyJoinList[1]="cm"
            } else if (!replayKeyJoinList[2].toLowerCase().endsWith("perp") 
                && replayKeyJoinList[1].toLowerCase().endsWith("cm")){
                    replayKeyJoinList[1]="um"
                }

            const replayKeyJoin = replayKeyJoinList.join("|") 
            const replayState ={
                ...state.replayState,
                [replayKeyJoin]: {
                    replayBar: false,
                    playing: false,
                    locked:false,
                    cursor: 1,
                    speed: 1,
                    
                }
            }


            const replayKey = {
                ...state.replayKey,
                ...update,
            }

            

            return {replayKey, replayState}
        }
    ),

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