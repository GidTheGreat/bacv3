import {
  Paper,
  Stack,
  Typography,
  Button,
  Box
} from "@mui/material";

import Clock from "./time";
import { getCapabilities } from '../registry'

import {useRef} from 'react'



export default function BottomBar() {
  

  const useWs = getCapabilities('ws')[0].component
    const url = "wss://fstream.binance.com/market/stream?streams=btcusdt@aggTrade"
 
  
    const { connected, connect, disconnect } = useWs({
      url
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