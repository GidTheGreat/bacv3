import {
  Paper,
  Stack,
  Typography,
  Button,
  Box
} from "@mui/material";

import Clock from "./time";
import { getCapabilities } from '../registry'
import useChartStore from '../stores/chartStore'

import {useRef} from 'react'

// OutputAdapter.js

class OutputAdapter {
    constructor() {
        this.listeners = new Set();

        if (typeof window === "undefined") {
            self.onmessage = (event) => {
                for (const listener of this.listeners) {
                    listener(event.data);
                }
            };
        }
    }

    emit(message) {
        if (typeof window === "undefined") {
            self.postMessage(message);
        } else {
            for (const listener of this.listeners) {
                listener(message);
            }
        }
    }

    subscribe(callback) {
        this.listeners.add(callback);

        return () => {
            this.listeners.delete(callback);
        };
    }
}

function applyToStore(message) {
    const state = useChartStore.getState();

    switch (message.type) {
        case "addSymbol":
            state.addSymbol(message.symbol);
            break;

        case "addPlatform":
            state.addPlatform(message.platform);
            break;

        case "addTradeType":
            state.addTradeType(message.tradeType);
            break;

        case "addTimeframe":
            state.addTimeframe(message.timeframe);
            break;

        case "setData":
            state.setData(
                message.streamKey,
                message.timeframe,
                message.data
            );
            break;
    }
}

export default function BottomBar() {
  const DFP = getCapabilities('data feed')[0].component
  const output = new OutputAdapter()
  output.subscribe(applyToStore)
  const pipeRef = useRef(new DFP(output));
  const pipeline = pipeRef.current;

  const useWs = getCapabilities('ws')[0].component
    const url = "wss://fstream.binance.com/market/stream?streams=btcusdt@aggTrade"
    const id = "live-feed"
  
    const { connected, connect, disconnect } = useWs({
      id, url, consumer: pipeline.consume
    });
  return (
    <Paper
      sx={{
        height: "100%",
        px: 2,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Left */}

      <Stack
        direction="row"
        spacing={2}
      >
        {/* Connection */}
      <Button
        variant="outlined"
        size="small"
        onClick={connected ? ()=>{console.log("disconnecting");disconnect()} 
        : ()=>{console.log("connecting");connect()}}
        startIcon={
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: connected ? "success.main" : "error.main",
              boxShadow: (theme) =>
                `0 0 6px ${
                  connected
                    ? theme.palette.success.main
                    : theme.palette.error.main
                }`,
            }}
          />
        }
      >
        {connected ? "Connected" : "Disconnected"}
      </Button>

       
      </Stack>

      {/* Center */}

      

      {/* Right */}

      <Stack
        direction="row"
        spacing={2}
      >
        <Clock/>

        
      </Stack>
    </Paper>
  );
}