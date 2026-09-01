import useDrawingStore from "../../stores/drawingStore";
import useChartStore from "../../stores/chartStore";
import { renderDrawing} from "./render";

function distanceToSegment(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;

    if (dx === 0 && dy === 0) {
        return Math.hypot(px - x1, py - y1);
    }

    const t = Math.max(
        0,
        Math.min(
            1,
            ((px - x1) * dx + (py - y1) * dy) /
            (dx * dx + dy * dy)
        )
    );

    const closestX = x1 + t * dx;
    const closestY = y1 + t * dy;

    return Math.hypot(px - closestX, py - closestY);
}

function hitTestDrawing(chartRef, activeSeries, drawingType, drawing, x, y){
    switch (drawingType) {
        case "Horizontal Line":
            const drawingY = activeSeries.priceToCoordinate(drawing.price)
            return Math.abs(y - drawingY) <= 6;

        case "Vertical Line":
            return Math.abs(x - drawing.x) <= 6;

        case "Trend Line":
            return distanceToSegment(
                x, y,
                drawing.x1, drawing.y1,
                drawing.x2, drawing.y2
            ) <= 6;
    }
}

export default function hitTest(ctx, chartRef, k1, chartId, pointerType, x, y){
    if (!useDrawingStore.getState().Drawings) return;
    if (pointerType?.toLowerCase?.().endsWith("down")) {
        const activeSeries = useChartStore.getState().selection[chartId].activeSeries;
        const Drawings = useDrawingStore.getState().Drawings[k1];
        const priceY = activeSeries.coordinateToPrice(y);
        const priceX = chartRef.current.timeScale().coordinateToTime(x);
        for (const drawingType of  Object.keys(Drawings)){
            for (const drawing of Drawings[drawingType]){
                const hit = hitTestDrawing(chartRef, activeSeries, 
                    drawingType, drawing, x, y) 
                if (hit) console.log(drawing,drawingType);
            }
        }
        
    }
}