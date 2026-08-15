import { keyframes } from "@emotion/react";
import useDrawingStore from "../../stores/drawingStore";
import useChartStore from "../../stores/chartStore";

const DEFAULT_STYLE = {
    strokeStyle: "blue",
    lineWidth: 1,
    lineDash: []
};

export function renderDrawing(ctx, chartId, drawing) {
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries
    const { type, points, style = {} } = drawing;
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();

    ctx.strokeStyle = "red";
    //console.log(points)

    switch (type) {
        case "Horizontal Line": {
            const y = activeSeries
                .priceToCoordinate(points.price);

            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(ctx.canvas.width, y);
            ctx.stroke();
            break;
        }

        case "line": {
           
        }
    }

    ctx.restore();
}



function DrawHorizontalLine(ctx, x, y, pointerType, chartRef, k1, chartId) {
    
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries
    
    if (pointerType.toLowerCase().endsWith("down")) {
        
        
        const price = activeSeries
            .coordinateToPrice(y);

        console.log({
            canvas: { x, y },
            chart: { price }
        });

        renderDrawing(ctx,chartId, {type:"Horizontal Line", points:{ price }})

        useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");
        
        useDrawingStore.getState().setDrawings(k1,"Horizontal Line", { price })
    }
}

export default function draw(ctx, chartRef, k1, chartId, pointerType, x, y) {
    //console.log("in draw:",ctx, x, y, chartRef, k1, chartId, pointerType)
    if (useDrawingStore.getState().DrawingState.action=="Horizontal Line"){
        console.log(chartId)
        DrawHorizontalLine(ctx, x, y, pointerType, chartRef, k1, chartId);
    }

    if (useDrawingStore.getState().DrawingState.action=="Cursor"){
        const Drawings = useDrawingStore.getState().Drawings[k1];
        //console.log(Drawings)
        for (const drawing of Object.keys(Drawings)){
            for (const drawing_details of Drawings[drawing]){
                renderDrawing(ctx, chartId, {type:drawing, points:drawing_details})

            }
        }

    }

    /*ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = "red";
    ctx.fillRect(x - 5, y - 5, 10, 10);*/
}