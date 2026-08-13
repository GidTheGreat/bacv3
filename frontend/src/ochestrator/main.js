import workersManager from "./workersManager"
import appstore from "../stores/appStore"
import useChartStore from "../stores/chartStore"


class OchestratorMain{
    constructor(){
        this.workerController = workersManager
        this.parseWorkerMsg = this.parseWorkerMsg.bind(this)
        this.unsub = appstore.subscribe((state)=>{
            console.log(state)
        })

    }
    startUp(){
        this.workerController.startWorkers()
        appstore.getState().setThreadsStatus(true)

    }

    cleanUp(){
        this.workerController.stopWorkers()
        appstore.getState().setThreadsStatus(false)
        appstore.getState().setWs();
        this.unsub()


    }

    send(id, worker, payload ){
        if (this.workerController.WorkersRunning){
            this.workerController.send(id, worker, payload, console.log)
        }
        
    }

    applyToStore(messageEn) {
        //console.log(messageEn)
        const message = messageEn
        if (!message) return;
            const state = useChartStore.getState();
        message.map(message=>{
            switch (message.type) {
                case "addSymbol":
                    state.addSymbol(message.symbol);
                    break;

                case "addPlatform":
                    state.addPlatform(message.platform);
                    break;

                case "addTradeType":
                    state.addTradeType(message.tradeType);
                    break;

                case "addTimeframe":
                    state.addTimeframe(message.timeframe);
                    break;

                case "setData":
                    state.setData(
                        message.streamKey,
                        message.timeframe,
                        message.data
                    );
                    break;
            }})
        }

    parseWorkerMsg(msg){
        /*
        console.log(
        "WORKER EVENT:",
        msg.type,
        "ID:",
        msg.id,
        "TIME:",
        Date.now()
    )*/
        switch (msg.type){
            case "socket open":{
                appstore.getState().setWs();
                break;
            }

            case "socket closed":{
                appstore.getState().setWs();
                break;
            }

            default:{
                this.applyToStore(msg)
            }
        }

    }

    netWorkMgmt(id, url, cmd, msg, worker){
        switch (cmd){
            case "connect":{
                this.workerController.connect(worker, url, id, msg, this.parseWorkerMsg);
                break;
            }

            case "close":{
                this.workerController.send(id, worker, msg, cmd)
            }

        }
        
    }

    doWork(){

    }
}

export default new OchestratorMain()