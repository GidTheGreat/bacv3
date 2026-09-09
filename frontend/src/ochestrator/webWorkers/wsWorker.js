import DataFeed from "./parseData";

const BINANCE_FSTREAM_BASE_URL = "wss://fstream.binance.com/market/stream?streams=btcusdt@aggTrade"

let binanceUmURL = "wss://fstream.binance.com/market/stream?streams="


const connections = new Map()
let socket = null;

const df = new DataFeed();


onmessage = event => {
    //console.log("worker triggered")
    const { type, payload } = event.data
    switch (type){
        case "status":{
            postMessage({
                type: "status",
                worker: "ws",
                payload: "[ws worker] loaded succesfully"
            })
            break;
        }

        case "connect":{
            console.log(payload)
           Object.keys(payload.selection).forEach(key=>{
                if (key.startsWith('binance') && key.endsWith('um')){
                    for (const symbol of Array.from(payload.selection[key])){
                        if (binanceUmURL.endsWith("=")){
                            binanceUmURL += `${symbol.toLowerCase()}@aggTrade`
                        } else {
                            binanceUmURL += `/${symbol.toLowerCase()}@aggTrade`
                        }
                    }
                    socket = new WebSocket(binanceUmURL);

                    socket.onopen = ()=>{
                        postMessage(
                            {type:"socket open"}
                        )
                    }

                    socket.onclose = ()=> {
                        postMessage(
                            {type:"socket closed"}
                        )
                    }

                    socket.onmessage = (e)=>{
                        const parseData = JSON.parse(e.data)
                        //console.log(parseData.data)
                        df.parseFeed("binance", "um", parseData.data)
                    }
                }
           })
            
            
            break;
        }

        case "disconnect":{
            
            socket.close()
            binanceUmURL = "wss://fstream.binance.com/market/stream?streams="
            break;
        }
    }
}