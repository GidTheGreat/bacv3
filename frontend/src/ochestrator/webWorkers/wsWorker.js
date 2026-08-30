
const BINANCE_FSTREAM_BASE_URL = "wss://fstream.binance.com/market/stream?streams=btcusdt@aggTrade"
let atomicsView;
let countView;

let aggTradeIdView;
let timestampView;
let priceView;
let quantityView;
let sideView;

const platform='binance';
const tradeType = 'um';
const symbol = 'BTCUSDT';

const connections = new Map()

let localCounter = 0;

function test(){
    while (true){
        //console.log(countView[0], countView[0] === localCounter);

        const result = Atomics.wait(countView, 0, localCounter);

        //console.log("wait returned:", result);
        //console.log("processing");
        
        localCounter=countView[0];
        //console.log(priceView[localCounter],localCounter, countView[0]);
        //debugger;

    }
}

onmessage = event => {
    
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

        case "buffer":{
            /*
            const key = `${platform}|${tradeType}|${symbol}`;
            const buffer= payload.get(key);
            atomicsView = new Uint8Array(buffer, 1, 1);
            countView = new Int32Array(buffer, 4, 1);

            aggTradeIdView = new BigUint64Array(buffer, 16, 1_000_000);
            timestampView = new Float64Array(buffer, 8_000_016, 1_000_000);
            priceView = new Float64Array(buffer, 16_000_016, 1_000_000);
            quantityView = new Float64Array(buffer, 24_000_016, 1_000_000);
            sideView = new Uint8Array(buffer, 32_000_016, 1_000_000);
            test();*/
            postMessage(
                {
                    type: "buffer",
                    worker: "ws",
                    payload: "[ws worker] received buffer"
                }
            )
            break;
        }
    }
}