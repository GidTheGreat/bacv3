//console.log("[http worker] started")
import binanceFetch, { getCandles, upload, manageBuffers } from "./binanceFetch"

   
const BACKFILL_URL="https://fapi.binance.com/fapi/v1/klines"


const timeframes = {
    "1min": 60,
    "5min": 300,
    "15min": 900,
    "30min": 1800,
    "1h": 3600,
    "4h": 14400,
};


let allData = []
async function backfill(symbol) {
    const start = performance.now();
    
    for (const tf of ["1m", "5m", "15m", "30m", "1h", "4h"]) {
        const endTime = Date.now(); 
        let startTime = Date.now() - 172_800_000;
        //console.log("start of loop", tf)
        while (startTime < endTime) {
            let url = BACKFILL_URL + `?symbol=${symbol}&interval=${tf}&startTime=${startTime}&limit=1000`;
        
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const current_data = await response.json();
            if (current_data.length === 0) {
                //console.log("No more data to fetch for", symbol, "at timeframe", tf);
                break;
            }
            //console.log(current_data.length)
            const latestTime = current_data[current_data.length-1][0];
            for (const candle of current_data) {
                const totalVolume = parseFloat(candle[7]);
                const buyVolume   = parseFloat(candle[10]);
                const sellVolume  = totalVolume - buyVolume;
                const delta       = buyVolume - sellVolume;

                let item = {
                    time: candle[0] / 1000,
                    open: parseFloat(candle[1]),
                    high: parseFloat(candle[2]),
                    low: parseFloat(candle[3]),
                    close: parseFloat(candle[4]),
                    totalVolume,
                    totalDelta: delta
                };
                allData.push(item);
            }
            //console.log("allData:", allData)
            
            
            startTime = latestTime+1;
            
            await new Promise(resolve => setTimeout(resolve, 150));

        }
        postMessage({
                            store: "chartStore",
                            k1: `binance|um|${symbol}`,
                            tf: tf.endsWith("m") ? tf + "in" : tf,
                            trans_arr: allData
                        })
        
        //console.log("End of loop", tf)
        allData = []
        
    }
    
    console.log((performance.now()-start)/1000)
}

onmessage = async(event) => {
    //console.log(event)
    const { type, payload } = event.data;
    switch (type){
            case "status":{
                postMessage({
                    type: "status",
                    worker: "http",
                    payload: "httpWorker loaded succesfully"
                })
                break;
                
            }

            case "fetch":{
                if (payload.exchange=="binance"){
                    
                    await binanceFetch(payload.exchange, payload.symbol, payload.market, 
                    payload.timeframe, payload.start, payload.end)}
                    getCandles(payload.exchange, payload.symbol, payload.market, payload.tfs);
                

                break;
                
            }

            case "candles":{
                getCandles(payload.exchange, payload.symbol, payload.market, payload.tfs);
            }

            case "connect":{
                const selections = payload.selection;
                if (!selections){
                    //console.log("No selections provided for backfilling.");
                    return;
                }
                //console.log("http worker connect case, selections:", selections)
                for (const [selkey, selSet] of Object.entries(selections)) {
                    const [platform, trade] = selkey.split("|");
                    if (platform === "binance" && trade === "um") {
                        for (const symbol of Array.from(selSet)) {
                            //console.log("backfilling symbol:", symbol);
                            await backfill(symbol);
                        } 
                    }
                }
                break;
            }

            case "upload":{
                
               //console.log("[http worker] upload case,payload:",payload)
                await upload(payload);
                getCandles(payload.exchange,
                     payload.csvName ? payload.csvName.split("-")[0] : payload.file.name.split("-")[0],
                      payload.market, ["1min"],);
                break;

            }
            case "buffers":{
                
                manageBuffers(payload.action, payload.key)
                break;
            }
    
        }
    
}