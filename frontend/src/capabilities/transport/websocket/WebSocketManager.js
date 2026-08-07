import LocalTransport from "./LocalTransport";
import WorkerTransport from "./WorkerTransport";

class WebSocketManager {
    constructor() {
        this.useWorker = true;
    }

    setUseWorker(value) {
        this.useWorker = value;
    }

    get transport() {
        return this.useWorker
    ? WorkerTransport
    : LocalTransport;
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