import HttpWorker from "./webWorkers/httpWorker.js?worker";
import WsWorker from "./webWorkers/wsWorker.js?worker";

/*
 * TRADE DATA STORAGE FORMAT
 *
 * METADATA
 * ----------
 * byte 0: format version (Uint8)
 *
 * byte 1: Atomics Sync i.e Lock (Uint8)
 * 
 * byte 4 to 7: Count i.e. loaded pos (Uint32)
 * 
 * byte 8: platform key (Uint8)
 *   binance = 1
 *
 * byte 9: trade type key (Uint8)
 *   futures USDM (UM) = 1
 *
 * byte 10: symbol key (Uint8)
 *   BTCUSDT = 1
 * 
 * byte 11-15: BUFFER ZONe so data starts at byte 16 
 *
 * DATA FIELDS
 * ----------
 * aggTradeId  → BigUint64
 * timestamp   → Float64
 * price       → Float64
 * quantity    → Float64
 * side        → Uint8
 *   aggressive side
 *
 * CHUNKING
 * ----------
 * Each typed array is chunked into blocks of 1,000,000 elements.
 *
 * All field arrays share the same logical index:
 *
 *   index i
 *     → one complete trade
 *
 *   chunkIndex = floor(i / 1,000,000)
 *   localIndex = i % 1,000,000
 *
 * TRADE IDENTITY
 * ----------
 * aggTradeId is the trade's exchange-defined identity.
 *
 * Array index is only the storage position and is NOT the trade identity.
 *
 * Therefore:
 *
 *   aggTradeId[i]     → identifies the trade
 *   timestamp[i]
 *   price[i]
 *   quantity[i]
 *   side[i]
 *   
 *                    → describe that trade
 *
 * STORAGE MODEL
 * ----------
 * one contiguous buffer of all info relevant to describe a trade chunked  by 
 * [count] as offset
 * 
 *
 * FORMAT VERSION
 * ----------
 * Version must be incremented whenever the binary layout,
 * field types, metadata interpretation, or field ordering changes.
 */

class WorkersManager {
    constructor() {
        this.maxWorkers = navigator.hardwareConcurrency;
        
        this.workers = new Map();
        this.msgRelays = new Set();
        
    }

    startUp(msgRelay){
        console.log("starting up")
        if (!this.workers.has("http")){
            console.log("creating http worker");
            const httpWorker = new HttpWorker();

            httpWorker.postMessage({type: "status", payload:"meta"});

            httpWorker.onmessage = event => {this.workerMsgCapture(event)};

            httpWorker.onerror = (event) => {
            console.error("WORKER ERROR");
            console.error("message:", event.message);
            console.error("filename:", event.filename);
            console.error("lineno:", event.lineno);
            console.error(event);
            };

            httpWorker.onmessageerror = (event) => {
            console.error("MESSAGE ERROR", event);
            };
            console.log("created http worker");

            this.workers.set("http", httpWorker);
        }

        if (!this.workers.has("ws")){
            const wsWorker = new WsWorker();

            wsWorker.postMessage({type: "status", payload:"meta"});

            wsWorker.onmessage = event => {this.workerMsgCapture(event)};

            this.workers.set("ws", wsWorker);
        }

        this.msgRelays.add(msgRelay);
    }

    shutDown(){
        console.log("shutting down")
        if (this.workers.size< 1) return;
        for  (const [workerKey, worker] of this.workers.entries()){
            worker.terminate();
            this.workers.delete(workerKey);
        }
    }

    workerMsgCapture(event){
        const msg = event.data;
        //console.log(msg)
        if (msg.type=="status"){
            //console.log(this.workers.get(msg.worker))
           
        } else {
            [...this.msgRelays].forEach(relay=>{relay?.(msg);})
        }
        
    }

    send(type, payload, msgRelay, workerKey){
        //console.log("[workers manager SEND] ",workerKey)
        const worker = this.workers.get(workerKey);

        this.msgRelays.add(msgRelay)

        worker.postMessage({
            type,
            payload
        })

    }

   
}

export default new WorkersManager();