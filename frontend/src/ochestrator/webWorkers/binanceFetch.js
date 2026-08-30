import JSZip from "jszip";
import Papa from "papaparse";

const BASE_URL ='https://data.binance.vision/data/'

let buffers = new Map();

const timeframes = {
  "1min": 60,
  "5min": 300,
  "15min": 900,
  "30min": 1800,
  "1h": 3600,
  "4h": 14400,
};

//console.log(new Date(times[999]))

function* candles(tf, priceView, timestampView){
    let cursor = null;
    let current_bucket = null;
    let candles = {[tf]:{}};

    //console.log(candles, priceView, timestampView);
    //debugger;
    let tf_sec = timeframes[tf];
    for (let i=0; i<priceView.length; i++){
        if (!cursor){
            cursor = timestampView[i]
            current_bucket = Math.floor(timestampView[i]/(tf_sec*1000))
            candles[tf]["time"] = timestampView[i]/1000
            candles[tf]["open"] = priceView[i]
            continue
        }
        if (Math.floor(timestampView[i]/(tf_sec*1000)) != current_bucket){
            /*console.log(
            "\ncandles:",candles[tf],
            "curent time in h:",new Date(timestampView[i]))*/
            yield candles[tf]
            candles[tf] = {}
            candles[tf]["open"] = priceView[i]
            current_bucket = Math.floor(timestampView[i]/(tf_sec*1000))
            cursor = timestampView[i]
            candles[tf]["time"] = timestampView[i]/1000
        }
            candles[tf]["close"] = priceView[i]
            candles[tf]["high"] = candles[tf]["high"] ?
            Math.max(candles[tf]["high"] ,priceView[i]) : priceView[i]
            
            candles[tf]["low"] = candles[tf]["low"] ?
            Math.min(candles[tf]["low"] ,priceView[i]) : priceView[i]
        
    }

    if (cursor !== null) {
        yield candles[tf];
    }
    
}

function dateRange(startDate, endDate = null) {
    const start = new Date(startDate);
    const end = endDate
        ? new Date(endDate)
        : new Date(start);

    // If no end date, include 5 days total
    if (!endDate) {
        end.setDate(end.getDate() + 4);
    }

    const dates = [];

    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        dates.push(date.toISOString().slice(0, 10));
    }

    return dates;
}

export default async function binanceFetch(exchange, symbol, tradeType, tf, startDate, endDate=null){
    const dates = dateRange(startDate,endDate);
    let symbolUrl;

    for (const date of dates){
        postMessage({
                store:"appStore",
                notification:`[Fetching Historical Trades] Date:${date}, Symbol:${symbol},${tradeType}`
            })
        const fetchUrl = `${BASE_URL}futures/${tradeType}/${tf}/aggTrades/`+
    `${symbol}/${symbol}-aggTrades-${date}.zip`;
        symbolUrl =`${symbol}-aggTrades-${date}.csv`;

        
        const response = await fetch(fetchUrl);
        postMessage({
                store:"appStore",
                notification:`[Trades Fetched Succesffuly] Date:${date}, Symbol:${symbol},${tradeType}`
            })
        let buffer = await response.arrayBuffer();
        //console.log("beginning extraction")
        let zip = await JSZip.loadAsync(buffer);
        let csv = await zip.file(symbolUrl).async("string");
        //console.log("extraction complete")
        
        postMessage({
                store:"appStore",
                notification:`[CSV Extracted succesffully] Date:${date}, Symbol:${symbol},${tradeType}`
            })
        let m = Papa.parse(csv, {
            header: true,
            dynamicTyping: true,
            skipEmptyLines: true,
        }).data;

        postMessage({
                store:"appStore",
                notification:`[CSV Parsed into JSON] Date:${date}, Symbol:${symbol},${tradeType}`
            })
        const length=m.length;

        const bufferKey = `${exchange}|${tradeType}|${symbol}|${date}`
        const chartKey = `${exchange}|${tradeType}|${symbol}`

        buffers.set(bufferKey, 
            new SharedArrayBuffer(2*Uint8Array.BYTES_PER_ELEMENT +
                            1*Uint32Array.BYTES_PER_ELEMENT+
                            10*Uint8Array.BYTES_PER_ELEMENT +
                            length*Float64Array.BYTES_PER_ELEMENT +
                            length*Float64Array.BYTES_PER_ELEMENT +
                            length*Float64Array.BYTES_PER_ELEMENT +
                            length*Uint8Array.BYTES_PER_ELEMENT 
                        ))

        
        buffer= buffers.get(bufferKey);
        const atomicsView = new Uint8Array(buffer, 1, 1);
        const lengthView = new Int32Array(buffer, 4, 1);

        const timestampView = new Float64Array(buffer, 16, length);
        const priceView = new Float64Array(buffer, (length*8)+16, length);
        const quantityView = new Float64Array(buffer, (length*8*2)+16, length);
        const sideView = new Uint8Array(buffer, (length*8*3)+16, length);

        lengthView[0] = length;
        for (let i=0; i < m.length; i++){
            priceView[i] = m[i].price
            timestampView[i] = m[i].transact_time
        }
        buffer = null;
        zip=null;
        csv=null;
        m=null;
        /./.test("x");

        postMessage({
                store:"appStore",
                notification:`[Generating Candles] Date:${date}, Symbol:${symbol},${tradeType}`
            })

        
        

    }
    
}

export function getCandles(exchange, symbol, market, tfs){
    if (buffers.size<1) return;

    for (const [ bufferKey,buffer ] of buffers.entries()){
        console.log(bufferKey, buffer);
        const chartKey = `${exchange}|${market}|${symbol}`
        if (!bufferKey.startsWith(chartKey)) continue;

        //console.log("working on buffer", bufferKey)
        const atomicsView = new Uint8Array(buffer, 1, 1);
        const lengthView = new Int32Array(buffer, 4, 1);

        const length = lengthView[0];
        //console.log(length)

        const timestampView = new Float64Array(buffer, 16, length);
        const priceView = new Float64Array(buffer, (length*8)+16, length);
        const quantityView = new Float64Array(buffer, (length*8*2)+16, length);
        const sideView = new Uint8Array(buffer, (length*8*3)+16, length);
        for (const tf of tfs){
            for (const candle of candles(tf, priceView, timestampView)){
                postMessage(
                    {
                        store: "chartStore",
                        k1: chartKey,
                        tf: tf,
                        candle
                    }
                )  
                //debugger; 
            }
        }
    }

}