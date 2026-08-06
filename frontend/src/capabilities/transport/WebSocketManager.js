class WebSocketManager {
  constructor() {
    this.connections = new Map();
    this.listeners = new Map();
  }

  subscribe(id, listener) {
    //console.log("[manager] subscribe", id);

    if (!this.listeners.has(id)) {
      this.listeners.set(id, new Set());
    }

    const listeners = this.listeners.get(id);
    listeners.add(listener);

    const conn = this.connections.get(id);

    // If already connected, notify immediately.
    if (conn?.connected) {
      listener.onOpen?.();
    }

    return () => {
      //console.log("[manager] unsubscribe", id);
      listeners.delete(listener);
    };
  }

  connect(id, url, handlers = {}) {
    //console.log("[manager] connect", id);

    if (this.connections.has(id)) {
      //console.log("[manager] already connected");
      return;
    }

    //console.log("[manager] creating socket");

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
      //console.log("[manager] socket open");

      conn.connected = true;

      const listeners = this.listeners.get(id) ?? new Set();

      /*console.log(
        `[manager] notifying ${listeners.size} listener(s)`
      );*/
      listeners.forEach(l => l.onOpen?.());
    };

    socket.onmessage = event => {
      handlers.onMessage?.(event);

      const listeners = this.listeners.get(id) ?? new Set();

      listeners.forEach(l => l.onMessage?.(event));
    };

    socket.onclose = () => {
      //console.log("[manager] socket close");

      conn.connected = false;

      const listeners = this.listeners.get(id) ?? new Set();

      listeners.forEach(l => l.onClose?.());

      this.connections.delete(id);
    };

    socket.onerror = err => {
      //console.log("[manager] socket error");

      const listeners = this.listeners.get(id) ?? new Set();

      listeners.forEach(l => l.onError?.(err));
    };
  }

  disconnect(id) {
    //console.log("[manager] disconnect", id);

    this.connections.get(id)?.socket.close();
  }

  send(id, data) {
    const conn = this.connections.get(id);

    if (conn?.socket.readyState === WebSocket.OPEN) {
      conn.socket.send(data);
    }
  }
}

export default new WebSocketManager();