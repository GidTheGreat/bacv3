import { keyframes } from "@emotion/react";
import useDrawingStore from "../../stores/drawingStore";
import useChartStore from "../../stores/chartStore";
import { renderDrawing,renderDrawings } from "./render";
import hitTest from "./hitTest";
import { DrawHorizontalLine, DrawVerticalLine, CircleTrendRect, longShort, WriteText } from "./graphic"


const DEFAULT_STYLE = {
    strokeStyle: "blue",
    lineWidth: 1,
    lineDash: []
};









export default function draw(ctx, chartRef, k1, chartId, pointerType, x, y) {
    //console.log("in draw:", k1,useDrawingStore.getState())
    if (useDrawingStore.getState().DrawingState.action=="Horizontal Line"){
        //console.log(chartId)
        DrawHorizontalLine(ctx, x, y, pointerType, chartRef, k1, chartId);
    } else if (useDrawingStore.getState().DrawingState.action=="Cursor"){
        //console.log("[Cursor mode] should be calling hit test")
        //hitTest(ctx, chartRef, k1, chartId, pointerType, x, y);
        renderDrawings(ctx, chartId, k1, chartRef)
    } else if (useDrawingStore.getState().DrawingState.action=="Clear Drawings"){
        
        useDrawingStore.getState().clearDrawings()
        renderDrawings(ctx, chartId, k1, chartRef);
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
        hitTest(ctx, chartRef, k1, chartId, pointerType, x, y);
        renderDrawings(ctx, chartId, k1, chartRef);
    } else if (useDrawingStore.getState().DrawingState.action=="Clear Selected Drawing"){
        
        hitTest(ctx, chartRef, k1, chartId, pointerType, x, y);
        renderDrawings(ctx, chartId, k1, chartRef);
        useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");
        
        renderDrawings(ctx, chartId, k1, chartRef);

    }

}