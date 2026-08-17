import { keyframes } from "@emotion/react";
import useDrawingStore from "../../stores/drawingStore";
import useChartStore from "../../stores/chartStore";
import { renderDrawing,renderDrawings } from "./render";
import hitTest from "./hitTest";

const DEFAULT_STYLE = {
    strokeStyle: "blue",
    lineWidth: 1,
    lineDash: []
};
let start = {}
let final = {}



function longShort(ctx, x, y, pointerType, chartRef, k1, chartId,type) {
    
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries
    
    if (pointerType?.toLowerCase?.().endsWith("down")) {
        
        const ts= chartRef.current.timeScale();

        const time = ts.coordinateToTime(x);
        /*
        if (!time) {
            useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");

            return;
        };*/

        const price = activeSeries
            .coordinateToPrice(y);
        
        start["price"] = price;
        start["time"] = time;
        renderDrawing(ctx,chartId, {type:type, 
            points:{ start, final}},
             chartRef)
            
        //console.log("setting start")
        //console.log(start)
        
    } else if (pointerType?.toLowerCase?.().endsWith("move")) {
        const ts= chartRef.current.timeScale();

        const time = ts.coordinateToTime(x);

        const price = activeSeries
            .coordinateToPrice(y);
        
        final["price"] = price;
        final["time"] = time;
        renderDrawing(ctx,chartId, {type:type, 
            points:{ start, final}},
             chartRef)
        

    } else if (pointerType?.toLowerCase?.().endsWith("up")) {
        const ts= chartRef.current.timeScale();

        const time = ts.coordinateToTime(x);

        const price = activeSeries
            .coordinateToPrice(y);
        
        final["price"] = price;
        final["time"] = time;
        renderDrawing(ctx,chartId, {type:type, 
            points:{ start, final}},
             chartRef)
        
        //console.log("end of trend line")
        //console.log(final)

        useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");
        
        useDrawingStore.getState().setDrawings(k1,
            type, {"start":start, "final":final})
        start={}
        final={}
}
}

function WriteText(ctx, x, y, pointerType, chartRef, k1, chartId){
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries
    useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");
    
    if (pointerType?.toLowerCase?.().endsWith("down")) {
        
        
        const price = activeSeries
            .coordinateToPrice(y);

        const container = ctx.canvas.parentElement;

        const input = document.createElement("input");

        input.type = "text";
        input.style.position = "absolute";
        input.style.left = `${x}px`;
        input.style.top = `${y}px`;
        input.style.background = "transparent";
        input.style.border = "none";
        input.style.outline = "none";

        container.appendChild(input);
        input.focus();

        //renderDrawing(ctx,chartId, {type:"Text", points:{ price, text:input.value }})
        input.addEventListener("blur", () => {
            const text = input.value;
            /*
            useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");*/
        
        //useDrawingStore.getState().setDrawings(k1,"Text", { price, text })

            input.remove();

            // store drawing/text object
        });

        
    }
}

function DrawHorizontalLine(ctx, x, y, pointerType, chartRef, k1, chartId) {
    
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries
    
    if (pointerType?.toLowerCase?.().endsWith("down")) {
        
        
        const price = activeSeries
            .coordinateToPrice(y);

            /*
        console.log({
            canvas: { x, y },
            chart: { price }
        });*/

        renderDrawing(ctx,chartId, {type:"Horizontal Line", points:{ price }})

        useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");
        
        useDrawingStore.getState().setDrawings(k1,"Horizontal Line", 
            { price,id: Math.floor(Math.random()*1_000_000_000)})
    }
}

function DrawVerticalLine(ctx, x, y, pointerType, chartRef, k1, chartId) {
    
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries
    
    if (pointerType?.toLowerCase?.().endsWith("down")) {
        
        const ts= chartRef.current.timeScale();

        const time = ts.coordinateToTime(x);
        if (!time) {
            useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");

            return;
        };
        renderDrawing(ctx,chartId, {type:"Vertical Line", points:{ time}}, chartRef)
        useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");
        useDrawingStore.getState().setDrawings(k1,"Vertical Line",
             { time,id: Math.floor(Math.random()*1_000_000_000),
                hit_test_x:[(x*0.9), (x*1.1)],
            hit_test_y:[(y*0.9), (y*1.1)]
             });
    }
}


function CircleTrendRect(ctx, x, y, pointerType, chartRef, k1, chartId,type) {
    
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries
    
    if (pointerType?.toLowerCase?.().endsWith("down")) {
        
        const ts= chartRef.current.timeScale();

        const time = ts.coordinateToTime(x);
        if (!time) {
            useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");

            return;
        };

        const price = activeSeries
            .coordinateToPrice(y);
        
        start["price"] = price;
        start["time"] = time;
        renderDrawing(ctx,chartId, {type:type, 
            points:{ start, final}},
             chartRef)
            
        //console.log("setting start")
        //console.log(start)
        
    } else if (pointerType?.toLowerCase?.().endsWith("move")) {
        const ts= chartRef.current.timeScale();

        const time = ts.coordinateToTime(x);

        const price = activeSeries
            .coordinateToPrice(y);
        
        final["price"] = price;
        final["time"] = time;
        renderDrawing(ctx,chartId, {type:type, 
            points:{ start, final}},
             chartRef)
        

    } else if (pointerType?.toLowerCase?.().endsWith("up")) {
        const ts= chartRef.current.timeScale();

        const time = ts.coordinateToTime(x);

        const price = activeSeries
            .coordinateToPrice(y);
        
        final["price"] = price;
        final["time"] = time;
        renderDrawing(ctx,chartId, {type:type, 
            points:{ start, final}},
             chartRef)
        
        //console.log("end of trend line")
        //console.log(final)

        useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");
        
        useDrawingStore.getState().setDrawings(k1,
            type, {"start":start, "final":final,
                id: Math.floor(Math.random()*1_000_000_000)})
        start={}
        final={}
}
}


export default function draw(ctx, chartRef, k1, chartId, pointerType, x, y) {
    //console.log("in draw:",ctx, x, y, chartRef, k1, chartId, pointerType)
    if (useDrawingStore.getState().DrawingState.action=="Horizontal Line"){
        //console.log(chartId)
        DrawHorizontalLine(ctx, x, y, pointerType, chartRef, k1, chartId);
    } else if (useDrawingStore.getState().DrawingState.action=="Cursor"){
        
        renderDrawings(ctx, chartId, k1, chartRef)
    } else if (useDrawingStore.getState().DrawingState.action=="Clear Drawings"){
        
        useDrawingStore.getState().clearDrawings()
        useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");
        
        renderDrawings(ctx, chartId, k1, chartRef);

    } else if (useDrawingStore.getState().DrawingState.action=="Vertical Line"){
        //console.log(chartId)
        DrawVerticalLine(ctx, x, y, pointerType, chartRef, k1, chartId);

    } else if (["Trend Line", "Rectangle", "Circle"].includes(useDrawingStore.getState().DrawingState.action)){
        //console.log(chartId)
        CircleTrendRect(ctx, x, y, pointerType, chartRef, 
            k1, chartId,useDrawingStore.getState().DrawingState.action);

    } else if (useDrawingStore.getState().DrawingState.action=="Text"){
        WriteText(ctx, x, y, pointerType, chartRef, k1, chartId);

    } else if (["Long Position", "Short Position"].includes(useDrawingStore.getState().DrawingState.action)){
        longShort(ctx, x, y, pointerType, chartRef, k1, chartId,
            useDrawingStore.getState().DrawingState.action);

    } else if (useDrawingStore.getState().DrawingState.action=="Select Drawing"){
        hitTest(ctx, chartRef, k1, chartId, pointerType, x, y)
    }

}