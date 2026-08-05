import { useEffect, useRef , useMemo, useState } from "react";
import { createChart } from "lightweight-charts";
import useChartStore from "../../stores/chartStore";

import useChartSeries from "./chartHooks/useChartSeries";
import useChartData from "./chartHooks/useChartData";
//import ReplayToggle from "./replay";
//import Alerts from "./Alerts";
//import FetchDataButton from "./fetch";
import DrawingTools from "./drawings/drawingTools";

export default function NewChart({
    Controls = null,
    chartId,
    destroy,
    replayState,
    setReplayState
}) {
   //console.log("replaystate", setReplayState);
    
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

        <div
    style={{
        display: "flex",
        justifyContent: "center",
        width: "100%",
        marginTop: 3,
    }}
>
    <div
        style={{
            width: "98%",
            border: "1px solid #2a2e39",
            borderRadius: 12,
            overflow: "hidden",
            background: "#0b0b0b",
            boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
        }}
    >
        {Controls && (
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#161b22",
                    borderBottom: "1px solid #2a2e39",
                    padding: "10px 14px",
                    minHeight: 52,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                    }}
                >
                    <Controls chartId={chartId} />

                    <div
                        style={{
                            width: 1,
                            height: 24,
                            background: "#2a2e39",
                        }}
                    />
                    
                    
                    
                </div>

                {destroy && (
                    <button
                        onClick={destroy}
                        style={{
                            width: 34,
                            height: 34,
                            border: "1px solid #3a3f4b",
                            borderRadius: 8,
                            background: "#20252d",
                            color: "#d0d7de",
                            cursor: "pointer",
                            fontSize: 16,
                            fontWeight: "bold",
                        }}
                    >
                        ✕
                    </button>
                )}
            </div>
        )}

        <div
    style={{
        position: "relative",
        width: "100%",
        height: 570,
    }}
>
    {chartReady && (
        <DrawingTools
            ctx={ctx}
        />
    )}

    <div
        ref={containerRef}
        style={{
            width: "100%",
            height: "100%",
        }}
    />
</div>
    </div>
</div>

    );

}