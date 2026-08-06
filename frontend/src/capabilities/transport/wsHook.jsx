import { useCallback, useRef, useState, useEffect } from "react";
//import {parseMarketData} from "./parser";

import {Queue,scheduleConsumer } from './queue'
import WebSocketManager from "./WebSocketManager";


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