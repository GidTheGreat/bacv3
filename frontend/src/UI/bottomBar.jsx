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

import {useEffect, useRef, useState} from 'react'

import ochestrator from '../ochestrator/main'
import useAppStore from "../stores/appStore";


export default function BottomBar() {
  console.count("bottom bar")
  const ws = useAppStore(state => state.ws);
  const url = "wss://fstream.binance.com/market/stream?streams=btcusdt@aggTrade"
  
  useEffect(
    ()=>{
      ochestrator.startUp()
    return ()=> {ochestrator.cleanUp()}
    },[]
  )
  
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
        onClick={()=>{
          if (ws){
            ochestrator.netWorkMgmt("live feed", url, "close", "metadata", "ws")

          } else {
            ochestrator.netWorkMgmt("live feed", url, "connect", "metadata", "ws")
            
          }
          
        }}
        startIcon={
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: ws ? "success.main" : "error.main",
              boxShadow: (theme) =>
                `0 0 6px ${
                  ws
                    ? theme.palette.success.main
                    : theme.palette.error.main
                }`,
            }}
          />
        }
      >
        {ws ? "Connected" : "Disconnected"
        }
      </Button>

      {/*<Button
        variant="outlined"
        size="small"
        onClick={()=>{
          ochestrator.netWorkMgmt("backfill feed", url, "connect", "metadata", "http")
          
        }}
        startIcon={
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              
            }}
          />
        }
      >
        {"http"
        }
      </Button>*/}

       
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