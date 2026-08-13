import { useEffect, useState, useRef } from "react";
import useChartStore from "../../stores/chartStore";
import Buttons from "./buttons";
import {
  Box,
  Paper,
  Button,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useDockStore } from "../../stores/dockstore";

import { getCapabilities } from "../../registry";
import {createChart, CandlestickSeries} from 'lightweight-charts'
import { FootprintSeries } from "./volume/volume";
import CloseIcon from "@mui/icons-material/Close";

function ChartSeries({chartId,chartRef}){
    //console.count("in usechart",chartRef)
    const candle = useChartStore(s=>s.selection[chartId].candle)
    const activeSeries = useChartStore(s=>s.selection[chartId].activeSeries)
    const setActiveSeries =useChartStore(s=>s.setActiveSeries)
    const chartReady  =useChartStore(s=>s.selection[chartId].ready)
    console.log("SERIES RENDER:", {
        chartId,
        candle,
        chartReady,
        activeSeries,
        chartRef: chartRef.current
    });
    
    
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
        } else {
            series = chartRef.current.addCustomSeries(
                new FootprintSeries()
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

function ChartData({ chartId }) {
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

    useEffect(() => {
        if (!chartReady || !activeSeries || !renderdata) return

        activeSeries.setData(renderdata)
    }, [chartReady, activeSeries, renderdata])

    return null
}

function Chart({chartId, destroyChart, pane}){
  console.log("CHART RENDER:", {
        chartId,
        pane
    });
  const containerRef = useRef(null);
  const chartRef = useRef(null) 
  //console.count("chart")
  function handleDestroyChart(){
    destroyChart(chartId, pane);
  }
  const setChartReady = useChartStore(s=>s.setChartReady)
  
  useEffect(
    ()=>{
      console.log("CHART EFFECT/MOUNT:", {
        chartId,
        pane
    });
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
       console.log("CHART CREATED:", {
        chartId,
        chartRef: chartRef.current
    });

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
        console.log("CHART CLEANUP START:", {
            chartId,
            pane,
            chartRef: chartRef.current
        });
        chart.remove();
        resize.disconnect();
        setChartReady(chartId,false);
        chartRef.current=null;
        console.log("CHART CLEANUP END:", {
            chartId,
            chartRef: chartRef.current
        });
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
        sx={{
          display: "flex",
          justifyContent: "space-between",
          height: "20px",
          flexShrink: 0,
        }}
      >
        <Buttons chartId={chartId} />
        <IconButton size="small" onClick={handleDestroyChart}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          width: "100%",
        }}
      />
      <ChartSeries chartId={chartId} chartRef={chartRef}/>
      <ChartData chartId={chartId}/>
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