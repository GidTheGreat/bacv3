class WorkersManager{
    constructor(){
        this.maxWorkers = navigator.hardwareConcurrency;
        this.activeWorkers = new Map();
        this.workerPaths = [
            "./webWorkers/httpWorker.js",
            "./webWorkers/wsWorker.js"
        ];
        this.WorkersRunning = false
    }

    startWorkers(){
        if (this.activeWorkers.size > 0) return;
        for (const path of this.workerPaths){
            if (path.toLowerCase().endsWith("wsworker.js")){
                const wsWorker = new Worker(
                    new URL(path, import.meta.url),
                    { type: "module" }
                );
                this.activeWorkers.set("ws", 
                    {"worker":wsWorker, "msgRelay":new Set()});
            } else {
                const httpWorker = new Worker(
                    new URL(path, import.meta.url),
                    { type: "module" }
                );
                httpWorker.postMessage(
                    {
                        type: "test"
                    })
                this.activeWorkers.set("http", 
                    {"worker":httpWorker, "msgRelay":new Set()});
            }
        }
        this.WorkersRunning = true

    }

    stopWorkers(){
        for (const [workerKey, workerHandles] of this.activeWorkers){
            workerHandles["worker"].terminate();
            this.activeWorkers.delete(workerKey);
        }
        this.WorkersRunning = false

    }

    connect(worker, url, id, msg, msgRelay, newWorker=false){
        console.log("connect invoked")
        switch (worker){
            case "http":{
                const workerHandle = this.activeWorkers.get(worker);
                
                workerHandle["msgRelay"].add(msgRelay);
                workerHandle["worker"].postMessage(
                    {
                        type: "connect",
                        url,
                        id,
                        msg
                    }
                )
                this.#workerMsgSub(workerHandle["worker"], workerHandle["msgRelay"])


            }

            case "ws":{
                const workerHandle = this.activeWorkers.get(worker);
                workerHandle["msgRelay"].add(msgRelay);
                workerHandle["worker"].postMessage(
                    {
                        type: "connect",
                        url,
                        id,
                        msg
                    }
                )
                this.#workerMsgSub(workerHandle["worker"], workerHandle["msgRelay"])


            }
        }

    }

    #workerMsgSub(actualWorker, msgRelays){
        actualWorker.onmessage = event =>{
            const event_data = event.data;
            //console.log(`[worker Manager] [msg Receipt],msg:${JSON.stringify(event.data)}`)
            for (const msgRelay of msgRelays){
                //console.log(msgRelay)
                msgRelay(event.data)
            }
        }

        actualWorker.onerror = event => {
            console.log(event)
        }

    }

    send(id, worker, msg, type, url=null, msgRelay=null){
        const workerHandle = this.activeWorkers.get(worker);
        workerHandle["worker"].postMessage(
                    {
                        type,
                        msg,
                        id,
                        url
                    }
                )
        if (msgRelay){
        workerHandle["msgRelay"].add(msgRelay);
        this.#workerMsgSub(workerHandle["worker"], workerHandle["msgRelay"])}

    }
}

export default new WorkersManager