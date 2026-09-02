import useDrawingStore from "../../stores/drawingStore";
import useChartStore from "../../stores/chartStore";
import { renderDrawing,renderDrawings } from "./render";

export function DrawHorizontalLine(ctx, x, y, pointerType, chartRef, k1, chartId, id=null) {
    
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries;
    const price = activeSeries
            .coordinateToPrice(y);
    if (pointerType?.toLowerCase?.().endsWith("down") && !id) {

        renderDrawing(ctx,chartId, {type:"Horizontal Line", points:{ price }})

        useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");
        
        useDrawingStore.getState().setDrawings(k1,"Horizontal Line",
            id ? id :Math.floor(Math.random()*1_000_000_000),
            { price, selected: false})
    } else if (pointerType?.toLowerCase?.().endsWith("move") && id){

        useDrawingStore.getState().setDrawings(k1,"Horizontal Line",
            id ? id :Math.floor(Math.random()*1_000_000_000),
            { price, selected: true})
        
    } 
}

export function DrawVerticalLine(ctx, x, y, pointerType, chartRef, k1, chartId, id=null) {
    
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries
    const ts= chartRef.current.timeScale();

    const time = ts.coordinateToTime(x);
    if (!time) {
        useDrawingStore
        .getState()
        .setDrawingState(k1, "Cursor");

        return;
    };

    if (pointerType?.toLowerCase?.().endsWith("down")) {
        
        
        renderDrawing(ctx,chartId, {type:"Vertical Line", points:{ time}},
             chartRef)
        useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");
        useDrawingStore.getState().setDrawings(k1,"Vertical Line",
            id ? id :Math.floor(Math.random()*1_000_000_000),
             { time, selected:false });
        
    } else if (pointerType?.toLowerCase?.().endsWith("move") && id){
        //console.log("should be settings drawings")
        useDrawingStore.getState().setDrawings(k1,"Vertical Line",
            id ? id :Math.floor(Math.random()*1_000_000_000),
             { time, selected: true });
            //useDrawingStore.subscribe(s=>console.log(s.Drawings))
             
    }
}

let start = {}
let final = {}

export function CircleTrendRect(ctx, x, y, pointerType, chartRef, k1, chartId,type, id=null) {
    /*console.log(`pointer:${pointerType}, id:${id},
        condition:${pointerType?.toLowerCase?.().endsWith("move") && id}`)*/
    
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries;
    const ts= chartRef.current.timeScale();

    const time = ts.coordinateToTime(x);

    const price = activeSeries
        .coordinateToPrice(y);
    
    if (pointerType?.toLowerCase?.().endsWith("down")) {
        
        if (!time) {
            useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");

            return;
        };
        
        start["price"] = price;
        start["time"] = time;
        renderDrawing(ctx,chartId, {type:type, 
            points:{ start, final}},
             chartRef)
            
        //console.log("setting start")
        //console.log(start)
        
    } else  if (id && pointerType?.toLowerCase?.().endsWith("move")){
            //console.log("[circeTrendRect] updating pos")
            start["price"] = useDrawingStore.getState().Drawings?.[k1]?.[type]?.[id]?.start?.price;
            start["time"] = useDrawingStore.getState().Drawings?.[k1]?.[type]?.[id]?.start?.time;
            
            final["price"] = price;
            final["time"] = time;
            useDrawingStore.getState().setDrawings(k1,type,
                id ? id :Math.floor(Math.random()*1_000_000_000),
                { "start":start,"final":final, selected: true });
            
                
    } else if (pointerType?.toLowerCase?.().endsWith("move")) {
        
        final["price"] = price;
        final["time"] = time;
        renderDrawing(ctx,chartId, {type:type, 
            points:{ start, final}},
             chartRef)
        

    } else if (pointerType?.toLowerCase?.().endsWith("up")) {
        if (id){
            //console.log("resetting")
            start={};
            final={};
            return;
        }
        
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
            type, id ? id :Math.floor(Math.random()*1_000_000_000),
            {"start":start, "final":final,  selected:false })
        start={}
        final={}
    } 
}
