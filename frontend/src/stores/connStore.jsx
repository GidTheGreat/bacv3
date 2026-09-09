import { create } from 'zustand';

const useConnStore = create(
    set=>({
        platforms:["binance"],
        trades:["um", "cm"],
        symbols:[],

        activePlatform: "binance",
        activeTrade: "um",

        selection: {
            "binance|um":new Set()
        },

        setSymbols: (symbols)=>set(()=>({
            symbols:symbols
        }))
        ,
        setActive: (type, value)=>set(
            (state)=>{
                if (type.startsWith("platform")){
                    return {
                        activePlatform: value
                    }
                } else {
                    return {
                        activeTrade: value
                    }
                }
            })
        ,

        setSelection: (platform, trade, selection) =>
            set((state) => {
                const selKey = `${platform}|${trade}`;

                const newSet = new Set(state.selection[selKey]);

                newSet.has(selection)
                ? newSet.delete(selection)
                : newSet.add(selection);

                return {
                selection: {
                    ...state.selection,
                    [selKey]: newSet,
                },
                };
            })
    })
)

export default useConnStore;