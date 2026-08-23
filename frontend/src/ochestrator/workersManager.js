import HttpWorker from "./webWorkers/httpWorker.js?worker";
import WsWorker from "./webWorkers/wsWorker.js?worker";

class WorkersManager {
    constructor() {
        this.maxWorkers = navigator.hardwareConcurrency;
        this.activeWorkers = new Map();
        this.WorkersRunning = false;
    }

    startWorkers(msgRelayWs, msgRelayHTTP) {
        if (this.activeWorkers.size > 0) return;

        const wsWorker = new WsWorker();

        this.activeWorkers.set("ws", {
            worker: wsWorker,
            msgRelay: new Set()
        });
        const workerHandle = this.activeWorkers.get("ws");
        workerHandle.msgRelay.add(msgRelayWs);
        this.#workerMsgSub(
                    workerHandle.worker,
                    workerHandle.msgRelay
                );

        const httpWorker = new HttpWorker();

        this.activeWorkers.set("http", {
            worker: httpWorker,
            msgRelay: new Set()
        });

        const workerHandle2 = this.activeWorkers.get("http");
        workerHandle2.msgRelay.add(msgRelayHTTP);
        this.#workerMsgSub(
                    workerHandle2.worker,
                    workerHandle2.msgRelay
                );

        this.WorkersRunning = true;
    }

    stopWorkers() {
        for (const [workerKey, workerHandles] of this.activeWorkers) {
            workerHandles.worker.terminate();
            this.activeWorkers.delete(workerKey);
        }

        this.WorkersRunning = false;
    }

    connect(worker, url, id, msg, msgRelay, newWorker = false) {
        console.log("connect invoked");

        switch (worker) {
            case "http": {
                const workerHandle = this.activeWorkers.get(worker);

                workerHandle.msgRelay.add(msgRelay);

                workerHandle.worker.postMessage({
                    type: "connect",
                    url,
                    id,
                    msg
                });

                this.#workerMsgSub(
                    workerHandle.worker,
                    workerHandle.msgRelay
                );

                break;
            }

            case "ws": {
                const workerHandle = this.activeWorkers.get(worker);

                workerHandle.msgRelay.add(msgRelay);

                workerHandle.worker.postMessage({
                    type: "connect",
                    url,
                    id,
                    msg
                });

                this.#workerMsgSub(
                    workerHandle.worker,
                    workerHandle.msgRelay
                );

                break;
            }
        }
    }

    #workerMsgSub(actualWorker, msgRelays) {
        actualWorker.onmessage = event => {
            const event_data = event.data;

            for (const msgRelay of msgRelays) {
                msgRelay(event_data);
            }
        };

        actualWorker.onerror = event => {
            console.log(event);
        };
    }

    send(
        id,
        worker,
        msg,
        type,
        url = null,
        msgRelay = null
    ) {
        
        const workerHandle = this.activeWorkers.get(worker);

        workerHandle.worker.postMessage({
            type,
            msg,
            id,
            url
        });

        if (msgRelay) {
            //console.log("adding relay")
            workerHandle.msgRelay.add(msgRelay);

            this.#workerMsgSub(
                workerHandle.worker,
                workerHandle.msgRelay
            );
        }
    }
}

export default new WorkersManager();