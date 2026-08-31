import { keyframes } from "@emotion/react";
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

function binsHelper(bins, price, quantity, side, sideKey){
    if (bins[price]){
        if (side== 0 && sideKey=="buy"){
            return bins[price]["buy"]+=(price*quantity)
        } else if (side== 1 && sideKey=="sell"){
            return bins[price]["sell"]+=(price*quantity)
        } else if (side== 0 && sideKey=="sell"){
            return bins[price]["sell"]
        } else if (side== 1 && sideKey=="buy"){
            return bins[price]["buy"]
        }
    } else {
        if (side== 0 && sideKey=="buy"){
            return (price*quantity)
        } else if (side== 1 && sideKey=="sell"){
            return (price*quantity)
        } else if (side== 0 && sideKey=="sell"){
            return 0
        } else if (side== 1 && sideKey=="buy"){
            return 0
        }
    }
}

function totalsHelper(bins){
    const flattedBins= []
    Object.entries(bins).forEach(([key, values])=>{
        flattedBins.push(values);});
    
    const totalBuyVolume = flattedBins.reduce((acc,val)=>acc+val.buy,0);
    const totalSellVolume = flattedBins.reduce((acc,val)=>acc+val.sell,0);
    const totalDelta = totalBuyVolume - totalSellVolume;
    const totalVolume = totalBuyVolume+totalSellVolume;
    
    return [totalDelta, totalVolume]


}

function* candles(tf, priceView, timestampView, quantityView, sideView){
    let cursor = null;
    let current_bucket = null;
    let candles = {[tf]:{binnedProfile:{},totalVolume:null,totalDelta:null}};

    //console.log(candles, priceView, timestampView);
    //debugger;
    let tf_sec = timeframes[tf];
    for (let i=0; i<priceView.length; i++){
        if (!cursor){
            cursor = timestampView[i]
            current_bucket = Math.floor(timestampView[i]/(tf_sec*1000));
            candles[tf]["time"] = timestampView[i]/1000;
            candles[tf]["open"] = priceView[i];
            candles[tf]["binnedProfile"][priceView[i]]={
                "buy":sideView[i]==1 ? 0: quantityView[i]*priceView[i],
                "sell":sideView[i]==1 ? quantityView[i]*priceView[i] : 0,
                
            }
            continue
        }
        if (Math.floor(timestampView[i]/(tf_sec*1000)) != current_bucket){
            const [totalDelta, totalVolume] = totalsHelper(candles[tf]["binnedProfile"]);
            candles[tf]["totalDelta"] = totalDelta;
            candles[tf]["totalVolume"] = totalVolume;
            yield candles[tf]
            candles[tf] = {binnedProfile:{},totalVolume:null,totalDelta:null};
            candles[tf]["open"] = priceView[i]
            current_bucket = Math.floor(timestampView[i]/(tf_sec*1000))
            cursor = timestampView[i]
            candles[tf]["time"] = timestampView[i]/1000
            candles[tf]["binnedProfile"][priceView[i]]={
                "buy":sideView[i]==1 ? 0: quantityView[i]*priceView[i],
                "sell":sideView[i]==1 ? quantityView[i]*priceView[i] : 0,
                
            }
        }
            candles[tf]["close"] = priceView[i]
            candles[tf]["high"] = candles[tf]["high"] ?
            Math.max(candles[tf]["high"] ,priceView[i]) : priceView[i];
            
            candles[tf]["low"] = candles[tf]["low"] ?
            Math.min(candles[tf]["low"] ,priceView[i]) : priceView[i];

            
            candles[tf]["binnedProfile"][priceView[i]]={
                "buy": binsHelper(candles[tf]["binnedProfile"], priceView[i], quantityView[i], sideView[i], "buy"),
                "sell":binsHelper(candles[tf]["binnedProfile"], priceView[i], quantityView[i], sideView[i], "sell"),
                
            }
        
    }

    if (cursor !== null) {
        const [totalDelta, totalVolume] = totalsHelper(candles[tf]["binnedProfile"]);
        candles[tf]["totalDelta"] = totalDelta;
        candles[tf]["totalVolume"] = totalVolume;
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
            priceView[i] = m[i].price;
            timestampView[i] = m[i].transact_time;
            quantityView[i] = m[i].quantity;
            sideView[i] = m[i].is_buyer_maker ? 1 : 0;
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



export async function getCandles(exchange, symbol, market, tfs){
    if (buffers.size<1) return;

    for (const [ bufferKey,buffer ] of buffers.entries()){
        //console.log(bufferKey, buffer);
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
            let trans_arr = []
            for (const candle of candles(tf, priceView, timestampView, quantityView, sideView)){

                trans_arr.push(candle)
                if ((trans_arr.length%100)==0){
                    await new Promise(resolve=>{
                        setTimeout(()=>{
                            postMessage({
                                store: "chartStore",
                                k1: chartKey,
                                tf: tf,
                                trans_arr
                            })
                            trans_arr=[]
                            resolve("");
                        },6_000)
                    })
                    debugger;
                }
                
                 
            }
            if (trans_arr){
                postMessage({
                        store: "chartStore",
                        k1: chartKey,
                        tf: tf,
                        trans_arr
                    })
                    trans_arr=[];
            }

        }
        
    }

}