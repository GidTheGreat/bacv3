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
        if (this.workers.has(id)) {
            throw new Error(`Worker "${id}" already exists.`);
        }

        console.log(`[runtime] starting "${id}"`);

        const worker = new Worker(
                new URL(path, import.meta.url),
                {
                    type: "module",
                }
            );

        const subscribers = new Set();

        const state = {
            id,
            worker,
            subscribers,
            started: Date.now(),
        };

        worker.onmessage = (event) => {
            const message = event.data;

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

            for (const callback of subscribers) {
                callback(message);
            }
        };

        worker.onerror = (error) => {
            console.log(error)

            for (const callback of subscribers) {
                callback({
                    type: "error",
                    error,
                });
            }
        };

        worker.onmessageerror = (error) => {
            console.error(`[runtime] "${id}" message error`, error);
        };

        this.workers.set(id, state);

        return id;
    }

    /**
     * Send message to worker.
     */
    send(id, message) {
        const state = this.workers.get(id);

        if (!state) {
            throw new Error(`Unknown worker "${id}"`);
        }

        state.worker.postMessage(message);
    }

    /**
     * Subscribe to worker events.
     */
    subscribe(id, callback) {
        const state = this.workers.get(id);

        if (!state) {
            throw new Error(`Unknown worker "${id}"`);
        }

        state.subscribers.add(callback);

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

        state.worker.terminate();

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