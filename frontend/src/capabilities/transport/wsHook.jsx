import { useCallback, useRef, useState, useEffect } from "react";
//import {parseMarketData} from "./parser";

import {Queue,scheduleConsumer } from './queue'
import WebSocketManager from "./websocket/WebSocketManager";
import useChartStore from '../../stores/chartStore'
/*import { fetchWithProgress } from "./http.js";

const result = await fetchWithProgress("https://fapi.binance.com/fapi/v1/exchangeInfo", {
    onProgress: ({ percent, loaded, total }) => {
        if (percent !== null) {
            console.log(`${percent.toFixed(1)}%`);
        } else {
            console.log(`${loaded} bytes`);
        }
    },
});

const data = await result.json();
console.log(data);*/


export function calculateStoreSize() {
    const data = useChartStore.getState().data;

    const bytes = new Blob([JSON.stringify(data)]).size;

    return {
        bytes,
        kb: bytes / 1024,
        mb: bytes / 1024 / 1024,
    };
}





export default function useWebSocket({ id, url, consumer }) {
  const [connected, setConnected] = useState(false);
  const queueRef = useRef(new Queue());
  const queue = queueRef.current;
  useEffect(() => {
    const id = setInterval(() => {
        const size = calculateStoreSize();
        console.log(size.mb.toFixed(2), "MB");
    }, 60_000);

    return () => clearInterval(id);
}, []);

  const handleMessage = useCallback(event => {
    queue.enqueue(event.data);
    scheduleConsumer(queue, consumer);
  }, [consumer]);

  useEffect(() => {
    //console.log("[hook] subscribe");

    return WebSocketManager.subscribe(id, {
      onOpen() {
        //console.log("[hook] onOpen");
        setConnected(true);
      },

      onClose() {
        //console.log("[hook] onClose");
        setConnected(false);
      }
    });
  }, [id]);

  const connect = useCallback(() => {
    //console.log("[hook] connect");

    WebSocketManager.connect(id, url, {
      onMessage: handleMessage
    });
  }, [id, url, handleMessage]);

  const disconnect = useCallback(() => {
    //console.log("[hook] disconnect");

    WebSocketManager.disconnect(id);
  }, [id]);

  const send = useCallback(data => {
    WebSocketManager.send(id, data);
  }, [id]);

  return {
    connected,
    connect,
    disconnect,
    send
  };
}