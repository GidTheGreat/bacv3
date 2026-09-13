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
const stores2 = ["panelStore"]

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
            }
        }
    }
}

function createUpdateDB(version){
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
    console.log("store exists populating zustand")
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
            console.log(state)
            updateObjectStore("panelStore", "activeLayout", state.activeLayout )
            
        })

    }
    startUp(){
        this.workerController.startUp(this.parseWorkerMsg);
        createUpdateDB(1)

    }

    cleanUp(){
        this.workerController.shutDown();
        appstore.getState().setWs();
        this.unsubApp();
        this.unsubChart();
        this.unsubPanelStore();
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
            //console.log("setting state")
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