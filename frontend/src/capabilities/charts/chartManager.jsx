import { useEffect, useState, useRef } from "react";
import useChartStore from "../../stores/chartStore";
import useReplayStore from "../../stores/replayStore";
import Buttons from "./buttons";
import {
  Box,
  Paper,
  Button,
  IconButton,
  TextField,
  Typography,
  ToggleButton,
  Popover,
  FormControlLabel,
  RadioGroup,
  Radio,
  Stack
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import Tooltip from '@mui/material/Tooltip';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';

import { getCapabilities } from "../../registry";
import {createChart, CandlestickSeries} from 'lightweight-charts';
import CloseIcon from "@mui/icons-material/Close";
import DrawingLayer from "../../UI/drawings/drawingLayer";
import { FootprintPrimitive } from "./footprintPrimitive";

import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import BarChartIcon from "@mui/icons-material/BarChart";
import VPControls from "./vpControls";


function ChartSeries({chartId,chartRef, fpRef}){
    //console.count("in usechart",chartRef)
    const candle = useChartStore(s=>s.selection[chartId].candle)
    const activeSeries = useChartStore(s=>s.selection[chartId].activeSeries)
    
    const setActiveSeries =useChartStore(s=>s.setActiveSeries)
    const chartReady  =useChartStore(s=>s.selection[chartId].ready)
    /*console.log("SERIES RENDER:", {
        chartId,
        candle,
        chartReady,
        activeSeries,
        chartRef: chartRef.current
    });*/
    
    
    useEffect(() => {
        if (!chartReady || !chartRef.current) return;

        let series;

        if (candle === "japanese") {
            series = chartRef.current.addSeries(
                CandlestickSeries,
                {
                    upColor: "#26a69a",
                    downColor: "#ef5350",
                    borderVisible: false,
                    wickUpColor: "#26a69a",
                    wickDownColor: "#ef5350",
                }
            );
          series.attachPrimitive(fpRef.current)
        } else {
            series = chartRef.current.addCustomSeries(
                new FootprintSeries(chartId)
            );
        }

        setActiveSeries(chartId, series);

        return () => {
            if (chartRef.current && series) {
                chartRef.current.removeSeries(series);
            }

            setActiveSeries(chartId, null);
        };

    }, [candle, chartReady]);
        
    

}

function noData({ symbol, tf }) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: 24,
        top: 24,
        zIndex: 10,
        width: 320,
        p: 2,
        borderRadius: 2,
        backgroundColor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        boxShadow: 3,
        opacity: 0.9,
        backdropFilter: 'blur(6px)',
        transition: 'opacity 0.2s ease, box-shadow 0.2s ease',

        '&:hover': {
          opacity: 1,
          boxShadow: 6,
        },
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{ mb: 0.5 }}
      >
        No data available
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2 }}
      >
        {symbol} · {tf}
      </Typography>

      <Stack spacing={1.25}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="body2">
            Historical data
          </Typography>

          <Button
            variant="outlined"
            size="small"
          >
            Fetch
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Typography variant="body2">
            Live data
          </Typography>

          <Button
            variant="contained"
            size="small"
          >
            Stream
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}

function ChartData({ chartId, fpRef, chartRef, containerRef }) {
    const replayState = useReplayStore(s => s.replayState);
    const replayActive = useReplayStore(s=>s.replayActive);
    const setReplayState = useReplayStore(s => s.setReplayState);

    const activeSeries = useChartStore(
        s => s.selection[chartId]?.activeSeries
    )

    const selection = useChartStore(
        s => s.selection[chartId]
    )

    const chartReady = useChartStore(
        s => s.selection[chartId]?.ready
    )

    const k1 = selection
        ? `${selection.platform}|${selection.trade}|${selection.symbol}`
        : null

    const tf = selection?.timeframe

    const data = useChartStore(
        s => s.data?.[k1]?.[tf]
    )
    const renderdata = data?.data
    const replayStateDeets = replayState[k1];

    function getOffset(tf, minuteCursor){
      if (tf.startsWith("1m")){
        return minuteCursor
      } else if (tf.startsWith("5m")){
        return Math.floor(minuteCursor/5)
      } else if (tf.startsWith("15m")){
        return Math.floor(minuteCursor/15)
      } else if (tf.startsWith("30m")){
        return Math.floor(minuteCursor/30)
      } else if (tf.startsWith("1h")){
        return Math.floor(minuteCursor/60)
      } else if (tf.startsWith("4h")){
        return Math.floor(minuteCursor/240)
      }

    }

    useEffect(() => {
        if (!replayActive) return;
        if (!replayStateDeets?.playing) return;

        const interval = setInterval(() => {
           const cursor =
    replayStateDeets.cursor =
        Math.min(
            renderdata.length,
            replayStateDeets.cursor + 1
        );

            setReplayState(k1, "cursor", cursor)

        }, 250 / replayStateDeets.speed);

        return () => clearInterval(interval);

    }, [
        replayActive,
        replayStateDeets?.playing,
        replayStateDeets?.speed
    ]);
    
    useEffect(() => {
        if (!chartReady || !activeSeries || !renderdata) return;

        if (replayActive) {
            if (!replayStateDeets) return;

            const offset = getOffset(
                tf,
                replayStateDeets.cursor
            );

            const replayData = renderdata.slice(0, offset);

            activeSeries.setData(replayData);

            activeSeries.priceScale().applyOptions({
                autoScale: true,
            });

            fpRef.current?.setData(replayData);

        } else {
            activeSeries.setData(renderdata);

            activeSeries.priceScale().applyOptions({
                autoScale: true,
            });

            fpRef.current?.setData(renderdata);
        }

    }, [
        chartReady,
        activeSeries,
        renderdata,
        replayActive,
        replayStateDeets?.cursor,
        tf
    ]);

    return null
}



function ChartControls({chartId,handleDestroyChart}){
  
  return (
    <>
      
        <Box  sx={{
            position: 'absolute',
            left: 5,
            top: 10,
            zIndex: 10,
            borderRadius: 50,
            backgroundColor: 'background.paper',
                opacity: 0.75,

            '&:hover': {
              opacity: 1,
              backgroundColor: 'background.paper',
            },
            
          }}>
            <Buttons chartId={chartId} />
          </Box>

        <Tooltip title="Toggle Footprint">
          <Box size="small" sx={{
            position: 'absolute',
            right: 60,
            top: 10,
            zIndex: 10,
            borderRadius: 50,
            backgroundColor: 'background.paper',
                opacity: 0.75,

            '&:hover': {
              opacity: 1,
              backgroundColor: 'background.paper',
            },
            
          }}>
            <VPControls chartId={chartId} />
          </Box>

        </Tooltip>
        
        <Tooltip title="Destroy Chart">
          <IconButton size="small" sx={{
            position: 'absolute',
            right: 10,
            top: 10,
            zIndex: 10,
            backgroundColor: 'background.paper',
                opacity: 0.75,

            '&:hover': {
              opacity: 1,
              backgroundColor: 'background.paper',
            },
            
          }}
          onClick={handleDestroyChart}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
        
      
    </>
  )
}

function ChartScroll({chartRef}){
  return (
    <>
      <Tooltip title="Fit Content">
        <IconButton
          size="small"
          aria-label="Fit content"
          sx={{
              position: 'absolute',
              right: 60,
              bottom: 30,
              zIndex: 10,
              backgroundColor: 'background.paper',
              opacity: 0.75,

              '&:hover': {
                opacity: 1,
                backgroundColor: 'background.paper',
              },
            }}
          onClick={
              ()=>{
                chartRef.current.timeScale().fitContent();
              }
            }
        >
          <ZoomOutMapIcon />
        </IconButton>
        </Tooltip>

        <Tooltip title="Go to Latest">
        <IconButton
            size="small"
            aria-label="Go to latest"
            sx={{
              position: 'absolute',
              right: 10,
              bottom: 30,
              zIndex: 10,
              backgroundColor: 'background.paper',
              opacity: 0.75,

              '&:hover': {
                opacity: 1,
                backgroundColor: 'background.paper',
              },
            }}
            onClick={
              ()=>{
                chartRef.current.timeScale().scrollToRealTime();
              }
            }
          >
            <KeyboardDoubleArrowRightIcon />
          </IconButton>
          </Tooltip>
    </>
  )
}


function Chart({chartId, destroyChart, pane}){
  /*console.log("CHART RENDER:", {
        chartId,
        pane
    });*/
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  const fpRef = useRef(new FootprintPrimitive(chartId))
  //console.count("chart")
  function handleDestroyChart(){
    destroyChart(chartId, pane);
  }
  const setChartReady = useChartStore(s=>s.setChartReady);
  
  useEffect(
    ()=>{
      /*console.log("CHART EFFECT/MOUNT:", {
        chartId,
        pane
    });*/
      const rect = containerRef.current.getBoundingClientRect();
      const chart = createChart(containerRef.current,
            {
                width: rect.width,
                height: rect.height,
                layout: {
                    textColor: "white",
                    background: {
                        color: "#0b0b0b",
                    },
                },

                timeScale: {
                    borderColor: "#2a2e39",
                    timeVisible: true,
                    secondsVisible: false,
                },
            })
      chartRef.current = chart;
       /*console.log("CHART CREATED:", {
        chartId,
        chartRef: chartRef.current
    });*/

      setChartReady(chartId,true)
      const resize = new ResizeObserver((entries) => {
        const entry = entries[0];

        const { width, height } = entry.contentRect;

          if (width > 0 && height > 0) {
              chart.resize(width, height);
          }
      });

    
      
      resize.observe(containerRef.current);
       
      return ()=>{
        /*console.log("CHART CLEANUP START:", {
            chartId,
            pane,
            chartRef: chartRef.current
        });*/
        chart.remove();
        resize.disconnect();
        setChartReady(chartId,false);
        chartRef.current=null;
        /*console.log("CHART CLEANUP END:", {
            chartId,
            chartRef: chartRef.current
        });*/
      }
    },[]
  )
  
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      

      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          width: "100%",
          position:"relative",
        }}
      >
        <ChartControls chartId={chartId} handleDestroyChart={handleDestroyChart}/>
        {//!dataState.data && <NoData symbol={dataState.symbol} tf={dataState.tf}/>
        }
        <ChartScroll chartRef={chartRef}/>
        <DrawingLayer chartId={chartId} paneId={pane} chartRef={chartRef}
        containerRef={containerRef}/>
      </Box>
      <ChartSeries chartId={chartId} chartRef={chartRef} fpRef={fpRef}/>
      <ChartData chartId={chartId} fpRef={fpRef}  chartRef={chartRef}
       containerRef={containerRef}/>
      
    </Box>
  )

}






export default function ChartManager({chartId, destroyChart, pane}) {
  
 
    return (
        <Box
        
            sx={{
                width: "100%",
                height: "100%",
                minHeight: 0,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
            }}
        >
            
            

            
                {
                <Chart key={chartId} chartId={chartId} destroyChart={destroyChart} pane={pane}/>
                }
                
            
        </Box>
    )
}