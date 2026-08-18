import HttpWorker from "./webWorkers/httpWorker.js?worker";
import WsWorker from "./webWorkers/wsWorker.js?worker";

class WorkersManager {
    constructor() {
        this.maxWorkers = navigator.hardwareConcurrency;
        this.activeWorkers = new Map();
        this.WorkersRunning = false;
    }

    startWorkers() {
        if (this.activeWorkers.size > 0) return;

        const wsWorker = new WsWorker();

        this.activeWorkers.set("ws", {
            worker: wsWorker,
            msgRelay: new Set()
        });

        const httpWorker = new HttpWorker();

        httpWorker.postMessage({
            type: "test"
        });

        this.activeWorkers.set("http", {
            worker: httpWorker,
            msgRelay: new Set()
        });

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
            workerHandle.msgRelay.add(msgRelay);

            this.#workerMsgSub(
                workerHandle.worker,
                workerHandle.msgRelay
            );
        }
    }
}

export default new WorkersManager();