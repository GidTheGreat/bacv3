import { useEffect, useRef , useMemo, useState } from "react";
import { createChart } from "lightweight-charts";
import useChartStore from "../../stores/chartStore";

import useChartSeries from "./chartHooks/useChartSeries";
import useChartData from "./chartHooks/useChartData";
//import ReplayToggle from "./replay";
//import Alerts from "./Alerts";
//import FetchDataButton from "./fetch";
import DrawingTools from "./drawings/drawingTools";
import {
  Box,
  Paper,
  Button,
  IconButton,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";

export default function NewChart({
    Controls = null,
    chartId,
    destroy,
    replayState,
    setReplayState
}) {
   //console.log("replaystate", setReplayState);
    const theme = useTheme();
    const containerRef = useRef(null);
    const chartRef = useRef(null);
    const [chartReady, setChartReady] = useState(false);

    // Every lightweight object lives here
    const renderState = useRef({

        syncMode: 'append',

        series: {},
        seenLength: {},
    });

    const selection = useChartStore(
        s => s.selection[chartId]
    );


    //console.log(data)
    const k1 =
        `${selection.platform}|${selection.trade}|${selection.symbol}`;

    const tf = selection.timeframe;
    const dataset = useChartStore(state => state.data[k1]?.[tf]);
    const masterDataset = useChartStore(state => state.data);
    
    const key = `${k1}|${tf}`
    useEffect(() => {
        //console.log("MOUNT", chartId);
        if (!containerRef.current) return;

        const chart = createChart(
            containerRef.current,
            {
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
            }
        );

        chartRef.current = chart;
        setChartReady(true);

        const resize = new ResizeObserver(() => {
            if (!chartRef.current || !containerRef.current) return;

            chartRef.current.applyOptions({
                width: containerRef.current.clientWidth,
                height: containerRef.current.clientHeight,
            });
        });

        resize.observe(containerRef.current);

        return () => {
            //console.log("UNMOUNT", chartId);
            resize.disconnect();
            setChartReady(false);
            chartRef.current = null;
            chart.remove();
            /*
            renderState.current = {
                initialized: false,
                series: {},
                indicators: {},
            };*/
            renderState.current ={

              syncMode: 'append',

              series: {},

              seenLength: {}

          };

        };

    }, []);
    
    const ctx = useMemo(() => ({

        chartId,

        chartRef,
        containerRef,

        renderState,

        selection,

        dataset,
        
        masterDataset,

        k1,

        tf,

        key,

        replayState,
        
        setReplayState

    }), [

        chartId,

        selection,

        dataset,

        k1,
        
        tf,

        key,

        replayState,

    ]);
    
    useChartSeries(ctx);

    useChartData(ctx);


    return (

    <Box
        sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            flex: 1,
            minHeight: 0,
        }}
>
    <Box
        sx={{
            width: "98%",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            bgcolor: "background.default",
            boxShadow: 3,
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minHeight: 0,
        }}
    >
        {Controls && (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: "background.paper",
                    borderBottom: 1,
                    borderColor: "divider",
                    px: 1.5,
                    py: 1,
                    minHeight: 44,
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                    }}
                >
                    <Controls chartId={chartId} />

                    <Box
                        sx={{
                            width: 1,
                            height: 24,
                            bgcolor: "divider",
                        }}
                    />
                    
                    
                    
                </Box>

                {destroy && (
                    <IconButton
                        onClick={destroy}
                        sx={{
                            width: 28,
                            height: 28,
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
                            bgcolor: "background.paper",
                            color: "text.primary",

                            "&:hover": {
                                bgcolor: "action.hover",
                            },
                        }}
                    >
                        ✕
                    </IconButton>
                )}
            </Box>
        )}

    <Box
        sx={{
            position: "relative",
            width: "100%",
            flex: 1,
            minHeight: 0,
        }}
>
    {chartReady && (
        <DrawingTools
            ctx={ctx}
        />
    )}

    <Box
        ref={containerRef}
        sx={{
            width: "100%",
            height: "100%",
        }}
    />
</Box>
    </Box>
</Box>

    );

}