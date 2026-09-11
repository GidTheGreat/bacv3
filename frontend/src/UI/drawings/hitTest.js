import useDrawingStore from "../../stores/drawingStore";
import useChartStore from "../../stores/chartStore";
import { renderDrawing} from "./render";
import { DrawHorizontalLine, DrawVerticalLine, CircleTrendRect, longShort, WriteText } from "./graphic";

 

function hitTestDrawing(chartRef, activeSeries, drawingType, drawing, x, y){
    switch (drawingType) {
        case "Horizontal Line":
            const drawingY = activeSeries.priceToCoordinate(drawing.price);
            return Math.abs(y - drawingY) <= 6;

        case "Vertical Line":
            const drawingX = chartRef.current.timeScale().timeToCoordinate(drawing.time);
            //console.log("[HIT TEST DRAWINGs]",drawingX)
            return Math.abs(x - drawingX) <= 6;

        case "Circle":{
            const x1 = chartRef.current.timeScale()
                .timeToCoordinate(drawing.start.time);
            const y1 = activeSeries.priceToCoordinate(drawing.start.price);

            const x2 = chartRef.current.timeScale()
                .timeToCoordinate(drawing.final.time);
            const y2 = activeSeries.priceToCoordinate(drawing.final.price);

            if (x1 == null || y1 == null || x2 == null || y2 == null)
                return false;

            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2;

            const radius = Math.min(
                Math.abs(x2 - x1),
                Math.abs(y2 - y1)
            ) / 2;

            const distance = Math.hypot(x - cx, y - cy);

            return distance <= radius + 6;
        }

        case "Rectangle":{
            const x1 = chartRef.current.timeScale()
                .timeToCoordinate(drawing.start.time);
            const y1 = activeSeries.priceToCoordinate(drawing.start.price);

            const x2 = chartRef.current.timeScale()
                .timeToCoordinate(drawing.final.time);
            const y2 = activeSeries.priceToCoordinate(drawing.final.price);

            if (x1 == null || y1 == null || x2 == null || y2 == null)
                return false;

            const left   = Math.min(x1, x2);
            const right  = Math.max(x1, x2);
            const top    = Math.min(y1, y2);
            const bottom = Math.max(y1, y2);

            const padding = 6;

            return (
                x >= left - padding &&
                x <= right + padding &&
                y >= top - padding &&
                y <= bottom + padding
            );
        }
        case "Trend Line": {
            const x1 = chartRef.current.timeScale()
                .timeToCoordinate(drawing.start.time);
            const y1 = activeSeries.priceToCoordinate(drawing.start.price);

            const x2 = chartRef.current.timeScale()
                .timeToCoordinate(drawing.final.time);
            const y2 = activeSeries.priceToCoordinate(drawing.final.price);

            if (x1 == null || y1 == null || x2 == null || y2 == null)
                return false;

            const dx = x2 - x1;
            const dy = y2 - y1;

            const lengthSquared = dx * dx + dy * dy;

            if (lengthSquared === 0)
                return Math.hypot(x - x1, y - y1) <= 6;

            // Project mouse point onto the line
            const t = (
                (x - x1) * dx +
                (y - y1) * dy
            ) / lengthSquared;

            // Clamp projection to the actual segment
            const clampedT = Math.max(0, Math.min(1, t));

            const closestX = x1 + clampedT * dx;
            const closestY = y1 + clampedT * dy;

            // Distance from mouse to closest point on segment
            const distance = Math.hypot(
                x - closestX,
                y - closestY
            );

            return distance <= 6;
        }
        case "Short Position":
        case "Long Position":
            const drawingTy = activeSeries.priceToCoordinate(drawing.target.price);
            const drawingRx = activeSeries.priceToCoordinate(drawing.risk.price);
            if (Math.abs(y - drawingTy) <= 10){
                return "target"
            } else if (Math.abs(y - drawingRx) <= 10){
                return "risk" }
        
    }
}

let activeSelection = {type:null, id:null, k1:null, hit:null, hold:false};
export default function hitTest(ctx, chartRef, k1, chartId, pointerType, x, y){
    //console.log("[hit test] execeuting,received args: ",ctx, chartRef, k1, chartId, pointerType, x, y)
    
    if (Object.keys(useDrawingStore.getState().Drawings).length < 1) return;
    if (useDrawingStore.getState().DrawingState.action=="Clear Selected Drawing"){
        if (!activeSelection.hold) return;
        console.log("[clearing drawing it test]",activeSelection);
        useDrawingStore.getState().clearDrawing(k1,activeSelection.type,activeSelection.id);
        activeSelection = {type:null, id:null,
            k1:null, hit:null, hold: false};
        return;
    }
    //useDrawingStore.subscribe(s=>console.log(s.Drawings))
    const setSelected = useDrawingStore.getState().setSelected;
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries;
    const Drawings = useDrawingStore.getState().Drawings[k1];
    const priceY = activeSeries.coordinateToPrice(y);
    const priceX = chartRef.current.timeScale().coordinateToTime(x);
    if (pointerType?.toLowerCase?.().endsWith("dblclick")){
        console.log(pointerType,activeSelection)
        for (const drawingType of  Object.keys(Drawings)){
            for (const [id, drawing] of Object.entries(Drawings[drawingType])){
                const hit = hitTestDrawing(chartRef, activeSeries, 
                    drawingType, drawing, x, y) 
                if (hit) {
                    if (activeSelection.hold){
                        setSelected(k1, drawingType, id, hit);
                        activeSelection = {type:null, id:null,
                         k1:null, hit:null, hold: false}
                         console.log("should be deselecting",
                            useDrawingStore.getState().Drawings
                         )
                    } else {
                        setSelected(k1, drawingType, id, hit);
                        activeSelection = {type:drawingType, id:id,
                         k1:k1, hit:hit, hold: true};
                         console.log("should be selecting",
                            activeSelection
                         )
                    }
                    
                    };
            }
        }
    }

    if (pointerType?.toLowerCase?.().endsWith("down")) {
        //console.log("[hit test] pointer down lokking for drawingsks")
        if (activeSelection.hold){
            console.log("[Pointer down]",activeSelection)
            return;
        }
        
        for (const drawingType of  Object.keys(Drawings)){
            for (const [id, drawing] of Object.entries(Drawings[drawingType])){
                const hit = hitTestDrawing(chartRef, activeSeries, 
                    drawingType, drawing, x, y) 
                if (hit) {
                    setSelected(k1, drawingType, id, hit);
                    activeSelection = {type:drawingType, id:id, k1:k1, hit:hit, hold:false};
                    //console.log(activeSelection)
                    };
            }
        }
        
    } else if (pointerType?.toLowerCase?.().endsWith("up")){
        console.log("[pointer up] executing",activeSelection)
        if (activeSelection.hold){
            console.log("Not deselecting");
            return;
        }
        for (const drawingType of  Object.keys(Drawings)){
            for (const [id, drawing] of Object.entries(Drawings[drawingType])){
                
                if (drawing.selected) {
                    setSelected(k1, drawingType, id);
                    CircleTrendRect(ctx, x, y, pointerType, chartRef, k1, chartId,
                     activeSelection.type, activeSelection.id);
                    longShort(ctx, x, y, pointerType, chartRef, k1, chartId,
                     activeSelection.type, activeSelection.id)
                    activeSelection = {type:null, id:null, k1:null, hit:null, hold:false};
                   
                    //console.log(drawing,drawingType)
                };
            }
        }
    } else if ( pointerType?.toLowerCase?.().endsWith("move") && activeSelection.type){
        if (activeSelection.hold){
            //console.log("Hold mode not updating");
            return;
        }
        switch (activeSelection.type){
            case "Horizontal Line":
                DrawHorizontalLine(ctx, x, y, pointerType, chartRef, k1, chartId, activeSelection.id);
                break;
            
            case "Vertical Line":
                DrawVerticalLine(ctx, x, y, pointerType, chartRef, k1, chartId, activeSelection.id);
                break;
            
            case "Circle":
            case "Rectangle":
            case "Trend Line":
                //console.log("should be calling [CircleTrendrect]")
                CircleTrendRect(ctx, x, y, pointerType, chartRef, k1, chartId,
                     activeSelection.type, activeSelection.id);
                break;
            
            case "Short Position":
            case "Long Position":
                longShort(ctx, x, y, pointerType, chartRef, k1, chartId,
                     activeSelection.type, activeSelection.id,
                     activeSelection.hit)
                break;
            
            
            
        }
        
    }
}