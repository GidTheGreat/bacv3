console.log("[worker] loaded");

self.postMessage({
    type: "ready",
});

self.onmessage = (event) => {
    console.log("[worker] received:", event.data);

    self.postMessage({
        type: "message",
        data: event.data,
    });
};
1/0
self.onerror = (event) => {
    self.postMessage({
        type: "error",
        error: event.message,
    });
};