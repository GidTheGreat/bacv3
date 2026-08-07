// WorkerTransport.js

import WorkerRuntime from "../../webWorker/workerRuntime";

const runtime = new WorkerRuntime();

class WorkerTransport {
    constructor() {
        this.listeners = new Map();
    }

    subscribe(id, listener) {
        if (!this.listeners.has(id)) {
            this.listeners.set(id, new Set());

            runtime.subscribe(id, (message) => {
                const listeners = this.listeners.get(id) ?? new Set();
                //console.log(message)
                switch (message.type) {
                    case "open":
                        listeners.forEach(l => l.onOpen?.());
                        break;

                    case "message":
                        listeners.forEach(l =>
                            l.onMessage?.({
                                data: message.data,
                            })
                        );
                        break;

                    case "close":
                        //console.log("should be changing state")
                        listeners.forEach(l => l.onClose?.());
                        this.listeners.delete(id);
                        runtime.terminate(id);
                        break;

                    case "error":
                        listeners.forEach(l =>
                            l.onError?.(message.error)
                        );
                        break;

                    default:
                        break;
                }
            });
        }

        const listeners = this.listeners.get(id);

        listeners.add(listener);

        return () => {
            listeners.delete(listener);
        };
    }

    

    connect(id, url, handlers = {}) {
        if (!runtime.hasWorker(id)) {
            runtime.run(id, "./worker.js");
        }

        runtime.send(id, {
            type: "connect",
            url,
            id
        });

        if (handlers.onMessage) {
            this.subscribe(id, {
                onMessage: handlers.onMessage,
            });
        }
    }

    disconnect(id) {
        runtime.send(id, {
            type: "disconnect",
            id
        });

        
    }

    send(id, data) {
        runtime.send(id, {
            type: "send",
            data,
            id
        });
    }
}

export default new WorkerTransport();