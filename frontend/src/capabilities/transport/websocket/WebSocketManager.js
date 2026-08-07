import LocalTransport from "./LocalTransport";

class WebSocketManager {
    constructor() {
        this.useWorker = false;
    }

    setUseWorker(value) {
        this.useWorker = value;
    }

    get transport() {
        if (this.useWorker) {
            // return WorkerTransport;
        }

        return LocalTransport;
    }

    subscribe(...args) {
        return this.transport.subscribe(...args);
    }

    connect(...args) {
        return this.transport.connect(...args);
    }

    disconnect(...args) {
        return this.transport.disconnect(...args);
    }

    send(...args) {
        return this.transport.send(...args);
    }
}

export default new WebSocketManager();