
import binanceFetch, { getCandles } from "./binanceFetch"

   
const BACKFILL_URL="https://fapi.binance.com/fapi/v1/aggTrades"


                
const allData = []
async function backfill() {
    const endTime = Date.now(); 
    let startTime = Date.now() - 86400000;
    
    while (startTime < endTime){
        let url = BACKFILL_URL + `?symbol=BTCUSDT&startTime=${startTime}&limit=1000`;
        //console.log(url);
        const response = await fetch(url);
        const current_data = await response.json();

        
               
        const latestTime = current_data[current_data.length-1].T;
        allData.push(...current_data)
        startTime = latestTime+1;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    dfp.consumeB(allData, "key");
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