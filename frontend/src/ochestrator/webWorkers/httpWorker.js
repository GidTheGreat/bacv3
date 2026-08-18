import { DataFeedPipeline } from '../../capabilities/data/histFeedPipeline';
import JSZip from "jszip";
import Papa from "papaparse";
//import * as dfd from "danfojs";

console.log("[http worker] loaded")


const dfp = new DataFeedPipeline()
postMessage(
    {
        type: "status",
        message: "[http worker] ready"
    }
)
const BASE_URL =
  'https://data.binance.vision/data/futures/um/daily/aggTrades/' +
  'BTCUSDT/' +
  'BTCUSDT-aggTrades-2026-07-01.zip';
   


onmessage = async(event) => {
    console.log(event)
    const { type, url, id, msg } = event.data;
    switch (type){
            case "connect":{
                
                const response = await fetch(BASE_URL);

                let buffer = await response.arrayBuffer();

                let zip = await JSZip.loadAsync(buffer);
                let csv = await zip.file("BTCUSDT-aggTrades-2026-07-01.csv").async("string");
                console.log("STARTING PARSE", performance.now());
                
                const rows = Papa.parse(csv, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                }).data;
                console.log("consuming")
                dfp.consumeB(rows);

                
                break;
                
            }
    
            case "close":{
                //console.log(connections)
                const socket = connections.get(id);
                if (socket){
                    socket.close();
                }
                //console.log(connections)
                break;
            }
    
            case "send":{
                const socket = connections.get(id);
                if (socket){
                    socket.send(msg);
    
                }
                
                break;
            }
        }
    
    
}