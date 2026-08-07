class LocalTransport {
    constructor() {
        this.connections = new Map();
        this.listeners = new Map();
    }

    subscribe(id, listener) {
        if (!this.listeners.has(id)) {
            this.listeners.set(id, new Set());
        }

        const listeners = this.listeners.get(id);

        listeners.add(listener);

        const conn = this.connections.get(id);

        if (conn?.connected) {
            listener.onOpen?.();
        }

        return () => {
            listeners.delete(listener);
        };
    }

    connect(id, url, handlers = {}) {
        if (this.connections.has(id)) {
            return;
        }

        const socket = new WebSocket(url);

        const conn = {
            id,
            url,
            socket,
            connected: false,
            handlers,
        };

        this.connections.set(id, conn);

        socket.onopen = () => {
            conn.connected = true;

            const listeners = this.listeners.get(id) ?? new Set();

            listeners.forEach(l => l.onOpen?.());
        };

        socket.onmessage = event => {
            handlers.onMessage?.(event);

            const listeners = this.listeners.get(id) ?? new Set();

            listeners.forEach(l => l.onMessage?.(event));
        };

        socket.onclose = () => {
            conn.connected = false;

            const listeners = this.listeners.get(id) ?? new Set();

            listeners.forEach(l => l.onClose?.());

            this.connections.delete(id);
        };

        socket.onerror = err => {
            const listeners = this.listeners.get(id) ?? new Set();

            listeners.forEach(l => l.onError?.(err));
        };
    }

    disconnect(id) {
        this.connections.get(id)?.socket.close();
    }

    send(id, data) {
        const conn = this.connections.get(id);

        if (conn?.socket.readyState === WebSocket.OPEN) {
            conn.socket.send(data);
        }
    }
}

export default new LocalTransport();