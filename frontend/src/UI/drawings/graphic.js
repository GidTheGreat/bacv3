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

let start = {};
let final = {};
let target = {};
let risk = {};

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
            if (!price || !time) {
            //console.log("returning");
            return;}
            final["price"] = price;
            final["time"] = time;
            useDrawingStore.getState().setDrawings(k1,type,
                id ? id :Math.floor(Math.random()*1_000_000_000),
                { "start":start,"final":final, selected: true });
            
                
    } else if (pointerType?.toLowerCase?.().endsWith("move")) {
        if (!price || !time) {
            //console.log("returning");
            return;}
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
        if (!price || !time) {
            //console.log("returning");
            return;}
        
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


export function WriteText(ctx, x, y, pointerType, chartRef, k1, chartId){
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries;
    
    
    if (pointerType?.toLowerCase?.().endsWith("down")) {
        
        console.log("should be entering text mode")
        const price = activeSeries
            .coordinateToPrice(y);

        const container = ctx.canvas.parentElement;
        console.log(container)

        const input = document.createElement("input");

        input.style.position = "absolute";
        input.style.left = `${x}px`;
        input.style.top = `${y}px`;

        input.style.zIndex = "9999";
        input.style.color = "white";
        input.style.background = "white";
        input.style.border = "1px solid black";
        input.style.outline = "none";
        ctx.canvas.pointerEvents= "none"
        input.style.pointerEvents = "auto"

        container.appendChild(input);

        console.log("INPUT:", input);
        console.log("CONTAINER:", container);

        input.focus();

        //renderDrawing(ctx,chartId, {type:"Text", points:{ price, text:input.value }})
        
        input.addEventListener("blur", () => {
            const text = input.value;
            /*
            useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");*/
        
        //useDrawingStore.getState().setDrawings(k1,"Text", { price, text })

            //input.remove();
            console.log("INPUT BLURRED");

            // store drawing/text object
        });

        
    }
}

export function longShort(ctx, x, y, pointerType, chartRef, k1, chartId,type, id=null, hitType=null) {
    
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries
    const ts= chartRef.current.timeScale();
    const time = ts.coordinateToTime(x);
    const price = activeSeries
            .coordinateToPrice(y);
    if (!price || !time){
        
        return;
    }
    const priceScale = activeSeries.priceScale();
    const range = priceScale.getVisibleRange();

    //console.log(range);
    const rangeSize = range.to - range.from;

    const riskDistance = rangeSize * 0.10;
    const rewardDistance = rangeSize * 0.20;
    if (pointerType?.toLowerCase?.().endsWith("down")) {
        
        if (!time) {
            useDrawingStore
            .getState()
            .setDrawingState(k1, "Cursor");

            return;
        };
        
        start["price"] = price;
        start["time"] = time;

        if (type=="Long Position"){
            target["price"] = price + rewardDistance;
            target["time"] = time;
            risk["price"] = price - riskDistance;
            risk["time"] = time;
        } else if (type == "Short Position") {
            target["price"] = price - rewardDistance;
            target["time"] = time;

            risk["price"] = price + riskDistance;
            risk["time"] = time;
        }
                
            
        useDrawingStore.getState().setDrawings(k1,
            type, id ? id :Math.floor(Math.random()*1_000_000_000),
            {"start":start, "target":target, "risk":risk, selected: false})
        
        start={}
        target={}
        risk = {}
        useDrawingStore
            .getState()
            .setDrawingState(k1, "Select Drawing");
        
    } else  if (id && pointerType?.toLowerCase?.().endsWith("move")){
            //console.log("[long short] updating pos")
            start["price"] = useDrawingStore.getState().Drawings?.[k1]?.[type]?.[id]?.start?.price;
            start["time"] = useDrawingStore.getState().Drawings?.[k1]?.[type]?.[id]?.start?.time;
            if (hitType=="target"){
                target["price"] = price;
                target["time"] = time;
                risk["price"] = useDrawingStore.getState().Drawings?.[k1]?.[type]?.[id]?.risk.price;
                risk["time"] = useDrawingStore.getState().Drawings?.[k1]?.[type]?.[id]?.risk.time;
                
            } else if (hitType=="risk"){
                target["price"] = useDrawingStore.getState().Drawings?.[k1]?.[type]?.[id]?.target.price;
                target["time"] = useDrawingStore.getState().Drawings?.[k1]?.[type]?.[id]?.target.time;
                risk["price"] = price 
                risk["time"] = time;
            }
            
            useDrawingStore.getState().setDrawings(k1,
            type, id ? id :Math.floor(Math.random()*1_000_000_000),
            {"start":start, "target":target, "risk":risk, selected: true, "hit":hitType})
    } else if (pointerType?.toLowerCase?.().endsWith("up")) {
        if (id){
            //console.log("resetting")
            start={}
        target={}
        risk = {}
            return;
        }
    }
}