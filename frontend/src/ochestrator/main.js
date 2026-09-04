import workersManager from "./workersManager";
import appstore from "../stores/appStore";
import useChartStore from "../stores/chartStore";



class OchestratorMain{
    constructor(){
        this.workerController = workersManager;
        this.stateUpdate = this.stateUpdate.bind(this);
        this.activeTfs = new Map();
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

    }
    startUp(){
        this.workerController.startUp(this.parseWorkerMsg);

    }

    cleanUp(){
        this.workerController.shutDown();
        appstore.getState().setWs();
        this.unsubApp();
        this.unsubChart();
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
            useChartStore.getState().addSymbol(
                msg.k1.split("|")[2]
            )
            
            useChartStore.getState().setData(
                msg.k1, msg.tf, msg.trans_arr
            )
        } else if (msg.store =="appStore"){
            //console.log("setting state")
            appstore.getState().setNotification(msg.notification)
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