import {Queue,scheduleConsumer } from './queue'
import { DataFeedPipeline } from '../data/DataFeedPipeline';

console.log("[worker] loaded");
const connections = new Map();
const queue = new Queue()
const dfp = new DataFeedPipeline

postMessage({
    type: "ready",
});

onmessage = (event) => {
    const { type, id, url, data } = event.data;
    console.log(id)

    switch (type) {
        case "connect": {
            if (connections.has(id)) return;

            const socket = new WebSocket(url);

            connections.set(id, socket);

            socket.onopen = () => {
                postMessage({
                    type: "open",
                    id,
                });
            };

            socket.onmessage = (event) => {
                queue.enqueue(event.data);
                scheduleConsumer(queue, dfp.consume);
                /*
                postMessage({
                    type: "message",
                    id,
                    data: event.data,
                });*/
            };

            socket.onclose = () => {
                connections.delete(id);

                postMessage({
                    type: "close",
                    id,
                });

                close();
            };

            socket.onerror = (error) => {
                postMessage({
                    type: "error",
                    id,
                    error,
                });
            };

            break;
        }

        case "send": {
            const socket = connections.get(id);

            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(data);
            }

            break;
        }

        case "disconnect": {
            const socket = connections.get(id);

            if (!socket) {
                postMessage({
                    type: "close",
                    id,
                });

                close();
                break;
            }

            socket.close();

            break;
        }
    }
};