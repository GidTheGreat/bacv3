import workersManager from "./workersManager";
import appstore from "../stores/appStore";
import useChartStore from "../stores/chartStore";
import useConnStore from "../stores/connStore";
import useFootprintStore from "../stores/footPrintStore";
import usePanelStore from "../stores/panelStore";
import useDrawingStore from "../stores/drawingStore";
import useReplayStore from "../stores/replayStore";

const stores = ["appStore", "chartStore", "connStore", "footPrintStore",
    "panelStore", "drawingStore", "replayStore"
] 
const stores2 = ["panelStore", "drawingStore", "tradeData", "symbols", "symbolsInfo"]

function updateObjectStore(storeType, infoType, info ){
    const req = indexedDB.open("bacv3");
    req.onsuccess= e=>{
        const db = e.target.result;
        const tx = db.transaction(storeType, "readwrite");
        const store = tx.objectStore(storeType);
        store.put({
            type: infoType,
            [infoType]: info
        })
    }

}

async function fetchSymbols(){
    const platforms = useChartStore.getState().platforms;
    const tradeTypes = useChartStore.getState().trade_types;
    const addSymbols = useChartStore.getState().addSymbols;
    const addSymbolsInfo = useChartStore.getState().addSymbolsInfo;
    const info = {};
    const symbolsIDB = {};

    for (const platform of platforms){
        for (const trade of tradeTypes){
            if (platform=="binance"){
                let resp;
                if (trade=="um"){
                    try {
                        resp = await fetch("https://fapi.binance.com/fapi/v1/exchangeInfo");
                    } catch (error){
                        return;
                    }
                    
                    const exchangeInfo = await resp.json();
                    //console.log(exchangeInfo)
                    const symbols = exchangeInfo.symbols.map(symbolInfo=>symbolInfo.symbol);
                    addSymbols(symbols, platform, trade);
                    symbolsIDB[`${platform}|${trade}`] = symbols;

                    exchangeInfo.symbols.forEach(symbolInfo=>{
                        info[`${platform}|${trade}|${symbolInfo.symbol}`] = symbolInfo.filters;

                        addSymbolsInfo(symbolInfo.symbol, symbolInfo.filters, platform, trade)
                    });
                    
                } else if (trade=="cm"){
                    try {
                        resp = await fetch("https://dapi.binance.com/dapi/v1/exchangeInfo");
                    } catch (error){
                        return;
                    }
                    
                    const exchangeInfo = await resp.json();

                    console.log(exchangeInfo);
                    const symbols = exchangeInfo.symbols.map(symbolInfo=>symbolInfo.symbol);
                    addSymbols(symbols, platform, trade);
                    symbolsIDB[`${platform}|${trade}`] = symbols;
                    exchangeInfo.symbols.forEach(symbolInfo=>{

                        addSymbolsInfo(symbolInfo.symbol, symbolInfo.filters, platform, trade)
                    });
                }
            }

        }
    }
    return [ info, symbolsIDB ]
    
  }


function populateZustand(db, storeType){
    //console.log(db,storeType)
    const tx = db.transaction(storeType, "readonly");
    const store = tx.objectStore(storeType);
    const storeReq = store.getAll();

    storeReq.onsuccess = e=>{
        const storeData = e.target.result;
        switch (storeType){
            case "panelStore":{
                storeData.forEach(storeDatum=>{
                    usePanelStore.getState().setActiveLayout(storeDatum.activeLayout)
                })
                break;
            }
            case "drawingStore":{
                storeData.forEach(storeDatum=>{
                    for (const [drawingKey, drawings] of Object.entries(storeDatum.Drawings)){
                        for (const [drawingType, drawingDetailsDict] of Object.entries(drawings)){
                            for ( const [drawingId, drawingDetails] of Object.entries(drawingDetailsDict)){
                                //console.log(drawingKey,drawingType,drawingId,drawingDetails)
                                useDrawingStore.getState().setDrawings(drawingKey,drawingType,drawingId,drawingDetails)
                                console.log(useDrawingStore.getState().Drawings)
                            }
                        }
                    }
                    
                })
                break;
            }

            case "symbols":{
                
                storeData.forEach(storeDatum=>{
                    const symbolsDict = storeDatum.symbols;
                    for (const [platformTrade, symbols] of Object.entries(symbolsDict)){
                        const [platform, tradeType] = platformTrade.split("|");

                        //console.log(platform, tradeType,"end")
                        useChartStore.getState().addSymbols(symbols, platform, tradeType);
                    }
                    
                })
                break;
            }

            case "symbolsInfo":{
                storeData.forEach(storeDatum=>{
                    const symbolsInfo = storeDatum.symbolsInfo;
                    for (const [platformTradeSymbol, symbolInfo] of Object.entries(symbolsInfo)){
                        const [platform, tradeType, symbol] = platformTradeSymbol.split("|");
                        useChartStore.getState().addSymbolsInfo(symbol, symbolInfo, platform, tradeType)
                    }
                    
                })
                break;
            }
        }
    }
}

async function createUpdateDB(version){
  const req = indexedDB.open("bacv3",version);
  req.onupgradeneeded = e=>{
    console.log("[upgrading DB]")
    const db = e.target.result;
    for (const store of stores2){
        if (!db.objectStoreNames.contains(store)){
            db.createObjectStore(store,
                {
                    keyPath: "type"
                }
            )
        } 
    }
    
  }

  req.onsuccess = e =>{
    const db = e.target.result;
    appstore.getState().setNotification("[DB initialization] success")
    console.log("store exists populating zustand",db)
    
    
    try{
        stores2.forEach(storeType=>populateZustand(db, storeType))
        
    } catch (error){
        console.log(error)
    }
    
    
  }

  req.onerror = e =>{
    console.log(e)
  }
}


  


class OchestratorMain{
    constructor(){
        this.workerController = workersManager;
        this.stateUpdate = this.stateUpdate.bind(this);
        this.activeTfs = new Map();
        this.db = null

        this.unsubApp = appstore.subscribe((state)=>{
            //console.log(state)
        })

        this.unsubChart = useChartStore.subscribe((state)=>{
           
            const selections = state.selection;
            Object.keys(selections).map((chartId)=>{
                this.updateActiveTfs(selections[chartId].platform, selections[chartId].trade
                    , selections[chartId].symbol, selections[chartId].timeframe)
                
            })
        })

        

        this.unsubPanelStore = usePanelStore.subscribe(state=>{
            //console.log(state)
            updateObjectStore("panelStore", "activeLayout", state.activeLayout);
            
        })

        this.unsubDrawingStore = useDrawingStore.subscribe(state=>{
            //console.log(state.Drawings);
            updateObjectStore("drawingStore", "Drawings", state.Drawings);
        })

    }
    async startUp(){
        this.workerController.startUp(this.parseWorkerMsg);
        await createUpdateDB(1);
        const [ info, symbolsIDB ] = await fetchSymbols();

        if (Object.keys(info).length > 0){
            updateObjectStore("symbolsInfo", "symbolsInfo", info);
            updateObjectStore("symbols", "symbols", symbolsIDB);
        }
    }

    cleanUp(){
        this.workerController.shutDown();
        appstore.getState().setWs();
        this.unsubApp();
        this.unsubChart();
        this.unsubPanelStore();
        this.unsubDrawingStore();
        this.db=null
    }

    updateActiveTfs(exchange, market, symbol, tf){
        //console.log(platform,trade, symbol, tf);
        const key = `${exchange}|${market}|${symbol}`;
        if (!this.activeTfs.get(key)){
            this.activeTfs.set(key, new Set());
            this.activeTfs.get(key).add(tf);
            //console.log("initiating calc for tf:",tf)
        } else {
            if (Array.from(this.activeTfs.get(key)).includes(tf)){
                //console.log("tf already present");
            } else {
                this.activeTfs.get(key).add(tf);
                this.send("candles",{exchange, market, symbol},"http", [tf])
                //console.log("initiating calc for tf:",tf)
            }
            
        }
        
        //console.log(this.activeTfs)
    }

    stateUpdate(msg){
        //console.log(msg)
        if (msg.store =="chartStore"){
            /*useChartStore.getState().addSymbol(
                msg.k1.split("|")[2]
            )*/
            
            useChartStore.getState().setData(
                msg.k1, msg.tf, msg.trans_arr
            )
        } else if (msg.store =="appStore"){
            //console.log("setting state")
            appstore.getState().setNotification(msg.notification)
        } else if (msg.storage =="RAM"){
            if (msg.type=="clear"){
                appstore.getState().clearStorage(msg.key);
                return;
            }
            appstore.getState().setStorage(msg.key, msg.size)
        } else if (msg.type == "socket open"){
            appstore.getState().setWs()
        } else if (msg.type == "socket closed"){
            appstore.getState().setWs()
        }
    }

    send(type, payload, workerKey, chartTfs=null){
        if (!chartTfs){
            let tfs = this.activeTfs.get(`${payload.exchange}|${payload.market}|${payload.symbol}`); 
            if (!tfs){
                this.updateActiveTfs(payload.exchange, payload.market, payload.symbol, "1min")
            }
            tfs = this.activeTfs.get(`${payload.exchange}|${payload.market}|${payload.symbol}`);
            this.workerController.send(type, {...payload,tfs:[...tfs]}, this.stateUpdate, workerKey);
        } else {
            this.workerController.send(type, {...payload,tfs:[...chartTfs]}, this.stateUpdate, workerKey);
        }
    }

    
}

export default new OchestratorMain()