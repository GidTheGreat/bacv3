export default class WorkerRuntime {
    constructor() {
        this.workers = new Map();
    }

    /**
     * Spawn a new worker.
     *
     * @param {string} id
     * @param {string|URL} script
     */
    run(id, path) {
        let state = this.workers.get(id);

        if (state?.worker) {
            throw new Error(`Worker "${id}" already exists.`);
        }

        if (!state) {
            state = {
                id,
                worker: null,
                subscribers: new Set(),
                started: null,
            };

            this.workers.set(id, state);
        }

        console.log(`[runtime] starting "${id}"`);
        const evalPath = new URL(path, import.meta.url);
        //console.log(evalPath)
        const worker = new Worker(
            evalPath,
            {
                type: "module",
            }
        );

        state.worker = worker;
        console.log(state.worker);
        state.started = Date.now();

        worker.onmessage = (event) => {
            const message = event.data;
            //console.log(message)

            switch (message.type) {
                case "ready":
                    console.log(`[runtime] "${id}" ready`);
                    break;

                case "close":
                    console.log(`[runtime] "${id}" closed`);
                    break;

                case "log":
                    console.log(`[${id}]`, message.data);
                    break;

                default:
                    break;
            }

            for (const callback of state.subscribers) {
                callback(message);
            }
        };

        worker.onerror = (error) => {
            console.error(`[runtime] "${id}" crashed`, error);

            for (const callback of state.subscribers) {
                callback({
                    type: "error",
                    error,
                });
            }
        };

        worker.onmessageerror = (error) => {
            console.error(`[runtime] "${id}" message error`, error);
        };

        return id;
    }

    /**
     * Send message to worker.
     */
    send(id, message) {
        const state = this.workers.get(id);
        console.log(state)

        if (!state) {
            throw new Error(`Unknown worker "${id}"`);
        }

        state.worker.postMessage(message);
    }

    /**
     * Subscribe to worker events.
     */
    subscribe(id, callback) {
        let state = this.workers.get(id);

        if (!state) {
            state = {
                id,
                worker: null,
                subscribers: new Set(),
                started: null,
            };

            this.workers.set(id, state);
        }

        state.subscribers.add(callback);
        //console.log(state)
        return () => {
            state.subscribers.delete(callback);
        };
    }

    /**
     * Stop worker.
     */
    terminate(id) {
        const state = this.workers.get(id);

        if (!state) return;

        console.log(`[runtime] terminating "${id}"`);

        //state.worker.terminate();

        this.workers.delete(id);

        console.log(`[runtime] "${id}" terminated`);
    }

    /**
     * Stop everything.
     */
    terminateAll() {
        for (const id of this.workers.keys()) {
            this.terminate(id);
        }
    }

    hasWorker(id) {
        return !!this.workers.get(id)?.worker;
    }

    has(id) {
        return this.workers.has(id);
    }

    get(id) {
        return this.workers.get(id);
    }

    size() {
        return this.workers.size;
    }
}