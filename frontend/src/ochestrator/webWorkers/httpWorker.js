//console.log("[http worker] started")
import binanceFetch, { getCandles } from "./binanceFetch"
import BackfillAggregator from "./backFillAgg"
   
const BACKFILL_URL="https://fapi.binance.com/fapi/v1/aggTrades"


const timeframes = {
    "1min": 60,
    "5min": 300,
    "15min": 900,
    "30min": 1800,
    "1h": 3600,
    "4h": 14400,
};

const aggregator = new BackfillAggregator(timeframes);

const allData = []
async function backfill() {
    const start = performance.now();

    const endTime = Date.now(); 
    let startTime = Date.now() - 3_600_000;
    
    while (startTime < endTime){
        let url = BACKFILL_URL + `?symbol=BTCUSDT&startTime=${startTime}&limit=1000`;
        //console.log(url);

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const current_data = await response.json();
            const latestTime = current_data[current_data.length-1].T;
            allData.push(...current_data)
            const result = aggregator.aggregate(allData);
            console.log(result)
            /*for (const tf of Object.keys(result)){
                postMessage({
                                store: "chartStore",
                                k1: `binance|um|BTCUSDT`,
                                tf: tf,
                                trans_arr: result[tf]
                            })
            }*/
            startTime = latestTime+1;
            await new Promise(resolve => setTimeout(resolve, 150));

        } catch (error) {
            console.error("Backfill request failed:", error);
            throw error
        }

        
               
        
    }
    console.log((performance.now()-start)/1000)
}

//await backfill()
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

            case "buffer":{
               
                postMessage(
                    {
                        type: "buffer",
                        worker: "http",
                        payload: "[httpWorker] received buffer"
                    }
            )
            break;
        }
    
        }
    
}