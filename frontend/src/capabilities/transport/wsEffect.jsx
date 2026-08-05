import { useCallback, useRef, useState, useEffect } from "react";
//import {parseMarketData} from "./parser";
import useChartStore from '../../stores/chartStore'
import {Queue,scheduleConsumer } from './queue'

export default function useWebSocket({url}) {
  const addSymbol = useChartStore((s)=>s.addSymbol)
  const addPlatform = useChartStore((s)=>s.addPlatform)
  const addTf = useChartStore((s)=>s.addTimeframe)
  const addTradeType = useChartStore((s)=>s.addTradeType)
  const setData = useChartStore((s)=>s.setData)
  const dataset = useChartStore(state => state.data)

  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  const queueRef = useRef(new Queue());
  const queue = queueRef.current;

  const handleMessage = useCallback((event) => {
    queue.enqueue(event.data)
    scheduleConsumer(queue,
      addSymbol,addPlatform,addTf,addTradeType,setData,useChartStore)
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(url);

    socket.onopen = () => {
        setConnected(true);
        
        console.log("connected")
    }
    socket.onmessage = handleMessage;

    socket.onclose = () => {
      setConnected(false);
      socketRef.current = null;
      console.log("disconnected");
      //console.log("before close", useStore.getState().data);
      
    };

    socket.onerror = () => console.error("WebSocket error");

    socketRef.current = socket;
  }, [handleMessage]);

  const disconnect = useCallback(() => {
    socketRef.current?.close();
    socketRef.current = null;
    setConnected(false);
  }, []);

  useEffect(() => {
    return () => socketRef.current?.close();
  }, []);

  return { connected, connect, disconnect };
}