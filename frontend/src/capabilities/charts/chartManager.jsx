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


function ChartSeries({chartRef}){
    //console.count("in usechart",chartRef)
    const candle = useChartStore(s=>s.selection.default.candle)
    const activeSeries = useChartStore(s=>s.activeSeries)
    const setActiveSeries =useChartStore(s=>s.setActiveSeries)
    const chartReady  =useChartStore(s=>s.chartReady)

    function japaneseCandles(){
      const jpCandles=chartRef.current.addSeries(
            CandlestickSeries,
            {
                upColor: "#26a69a",
                downColor: "#ef5350",
                borderVisible: false,
                wickUpColor: "#26a69a",
                wickDownColor: "#ef5350",
            })
      //console.log(jpCandles)
      
      setActiveSeries(jpCandles)

    }

    function volumecandles(){
        const vpCandles=chartRef.current.addCustomSeries(
              new FootprintSeries()
          )
        setActiveSeries(vpCandles)
    }

    function rmSeries(){
        if (activeSeries){
          console.log("removing series",activeSeries)
              chartRef.current.removeSeries(activeSeries);
              setActiveSeries(null)
            }
    }
    
    useEffect(
      ()=>{
        //console.log("running effect in chart series")
        //console.log(chartRef.current)
        if (!chartRef.current || !chartReady) return;
        //console.log(candle)
        //console.log("selection changed")
        if (candle==="japanese"){
          //console.log("adding japanese")
          rmSeries()
          japaneseCandles()
        
        }  else {
          rmSeries()
          volumecandles()

        }
        //console.log("in chart series",activeSeries)
        
        return ()=>{}
      },[candle, chartReady]
      
    )
    
    

}

function ChartData(){
  console.count("chartData")
    const activeSeries = useChartStore(s=>s.activeSeries)
    const selection = useChartStore(s=>s.selection.default);
    const chartReady  =useChartStore(s=>s.chartReady)
    
    
    const k1 = selection
        ? `${selection.platform}|${selection.trade}|${selection.symbol}`
        : null;

    
    const tf = selection.timeframe
    
    const data = useChartStore(s=>s.data?.[k1]?.[tf]);
    
    
     const renderdata = data?.data
     //console.log(renderdata)
     //console.log("in chartdata",activeSeries)
     if (!activeSeries|| !renderdata) {//console.log("returning");
      return}
     activeSeries.setData(renderdata)
    
}

function Chart({chartId, destroyChart, pane}){
  const containerRef = useRef(null);
  const chartRef = useRef(null) 
  //console.count("chart")
  const [chartShouldExist, setChartShouldExist] = useState(true);
  function handleDestroyChart(){
    setChartShouldExist(false);
    destroyChart(chartId, pane);
  }
  const setChartReady = useChartStore(s=>s.setChartReady)
  
  useEffect(
    ()=>{
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
      
      setChartReady(true)
      const resize = new ResizeObserver((entries) => {
        const entry = entries[0];

        const { width, height } = entry.contentRect;

          if (width > 0 && height > 0) {
              chart.resize(width, height);
          }
      });

    
      
      resize.observe(containerRef.current);
       
      return ()=>{
        chart.remove();
        resize.disconnect();
        setChartReady(false);
        chartRef.current=null;
      }
    },[]
  )
  if (!chartShouldExist){
    chart.remove();
        resize.disconnect();
        setChartReady(false);
        chartRef.current=null;
  }

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
        <Buttons />
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
                <Chart chartId={chartId} destroyChart={destroyChart} pane={pane}/>
                }
                
            
        </Box>
    )
}