import { createContext, useEffect, useRef } from "react"
import useDrawingStore from "../../stores/drawingStore";
import handlePointers from "./pointersUtil";
import useChartStore from "../../stores/chartStore";
import draw from "./draw";
import { SyncDrawings } from "./syncDrawings";
import hitTest from "./hitTest";


export default function DrawingLayer({chartId, paneId, chartRef, containerRef}){
    const DrawingState = useDrawingStore(s=>s.DrawingState);
    const setDrawingState = useDrawingStore(s=>s.setDrawingState);
    //console.log(chartId)
    const selection = useChartStore(s=>s.selection[chartId]);
    const chartReady = useChartStore(s=>s.selection[chartId].ready)
    
    const canvasRef = useRef(null)
    const k1 = selection
        ? `${selection.platform}|${selection.trade}|${selection.symbol}`
        : null

    //console.log(chartRef)

    function translatePointer(canvas, pointerData) {
        const rect = canvas.getBoundingClientRect();

        return {
            x: pointerData.x - rect.left - canvas.clientLeft,
            y: pointerData.y - rect.top - canvas.clientTop
        };
    }

    function relay(pointerData) {
        //console.log(pointerData)
        
        const canvas = canvasRef.current;
        //console.log(getComputedStyle(canvas).touchAction);
        const ctx = canvas.getContext("2d");

        const { x, y } = translatePointer(canvas, pointerData);
        //console.log("in relay",chartId)
        draw(ctx, chartRef, k1, chartId, pointerData.type, x, y);
    }


    useEffect(() => {
    const chart = chartRef.current;
    if (!chart) {return};


    

    const handler = () => {
        //console.log("timescale change")
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        
        draw(ctx,chartRef, k1, chartId, null, null, null);
    };

    const timeScale = chart.timeScale();
    
    chart.panes?.()[0].attachPrimitive(new SyncDrawings(handler))

    

        return () => {
            
        };
    }, [chartReady,selection.activeSeries]);

    useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

        const resizeObserver = new ResizeObserver(() => {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
        });

        resizeObserver.observe(canvas);

        return () => resizeObserver.disconnect();
    }, []);

    useEffect(
        ()=>{
            if (!containerRef.current) return;
            containerRef.current.style.pointerEvents=
            DrawingState.action!="Cursor"?"none":"auto"
            if (!canvasRef.current) return;
            return handlePointers(canvasRef.current, relay)
        },[DrawingState.action]
    )
    return <canvas id="canvas" ref={canvasRef} style={{
                width:"100%",
                height: "100%",
                zIndex: 9998,
                position: "absolute",
                inset: 0,
                border: "2px dashed green",
                pointerEvents:DrawingState.action =="Cursor"?"none":"auto",
                
            }}></canvas>
}

/*touchAction:DrawingState.action =="Cursor"?"auto":"none",
                userSelect:DrawingState.action =="Cursor"?"auto":"none",*/