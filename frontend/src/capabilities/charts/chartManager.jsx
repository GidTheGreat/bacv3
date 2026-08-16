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
  ToggleButton,
  Popover
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useDockStore } from "../../stores/dockstore";

import { getCapabilities } from "../../registry";
import {createChart, CandlestickSeries} from 'lightweight-charts'
import { FootprintSeries } from "./volume/volume";
import CloseIcon from "@mui/icons-material/Close";
import DrawingLayer from "../../UI/drawings/drawingLayer";
import { FootprintPrimitive } from "./footprintPrimitive";
import CandlestickChartIcon from "@mui/icons-material/CandlestickChart";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import BarChartIcon from "@mui/icons-material/BarChart";

import useFootprintStore from "../../stores/footPrintStore";

function VPControls() {
  const variant = useFootprintStore((s) => s.variant);
  const setVariant = useFootprintStore((s) => s.setVariant);

  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const id = open ? "footprint-popover" : undefined;

  const handleVariantChange = (variant) => {
    setVariant(variant);
    handleClose();
  };

  const CurrentIcon =
    variant === "off"
      ? VisibilityOffIcon
      : variant === "delta"
        ? CompareArrowsIcon
        : BarChartIcon;

  return (
    <Box sx={{ display: "inline-flex" }}>
      <IconButton
        size="small"
        aria-describedby={id}
        onClick={handleClick}
      >
        <CandlestickChartIcon />
      </IconButton>

      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Box
          sx={{
            display: "flex",
            p: 1,
            gap: 1,
          }}
        >
          <ToggleButton
            value="off"
            selected={variant === "off"}
            onClick={() => handleVariantChange("off")}
          >
            <VisibilityOffIcon />
          </ToggleButton>

          <ToggleButton
            value="delta"
            selected={variant === "delta"}
            onClick={() => handleVariantChange("delta")}
          >
            <CompareArrowsIcon />
          </ToggleButton>

          <ToggleButton
            value="profile"
            selected={variant === "profile"}
            onClick={() => handleVariantChange("profile")}
          >
            <BarChartIcon />
          </ToggleButton>
        </Box>
      </Popover>
    </Box>
  );
}

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
          //series.attachPrimitive(fpRef.current)
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

function ChartData({ chartId, fpRef }) {
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
        //fpRef.current.setData(renderdata)
    }, [chartReady, activeSeries, renderdata])

    return null
}

function Chart({chartId, destroyChart, pane}){
  /*console.log("CHART RENDER:", {
        chartId,
        pane
    });*/
  const containerRef = useRef(null);
  const chartRef = useRef(null);

  //const fpRef = useRef(new FootprintPrimitive())
  //console.count("chart")
  function handleDestroyChart(){
    destroyChart(chartId, pane);
  }
  const setChartReady = useChartStore(s=>s.setChartReady)
  
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
        sx={{
          display: "flex",
          justifyContent: "space-between",
          height: "20px",
          flexShrink: 0,
        }}
      >
        <Buttons chartId={chartId} />
          
          {//<VPControls/>
          }
        
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
          position:"relative",
        }}
      >
        <DrawingLayer chartId={chartId} paneId={pane} chartRef={chartRef}
        containerRef={containerRef}/>
      </Box>
      <ChartSeries chartId={chartId} chartRef={chartRef} fpRef={null}/>
      <ChartData chartId={chartId} fpRef={null}/>
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