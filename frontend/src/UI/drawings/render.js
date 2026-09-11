import useDrawingStore from "../../stores/drawingStore";
import useChartStore from "../../stores/chartStore";

const WIDTH = 120;
const RISK_HEIGHT = 30;
const PROFIT_HEIGHT = 60;

export function renderDrawing(ctx, chartId, drawing, chartRef) {
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

        case "Vertical Line": {
            if (!points.time) return;
            const x = chartRef.current.timeScale().timeToCoordinate(points.time);

            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, ctx.canvas.height);
            ctx.stroke();

            break;
        }

        case "Trend Line": {
            //console.log(points)
            if (!points.start || !points.final) return;

            const timeScale = chartRef.current.timeScale();
            const activeSeries =
                useChartStore.getState().selection[chartId].activeSeries;
            if (!points?.start.time || !points?.start.price) return;
            if (!points?.final.time || !points?.final.price) return;
            const x1 = timeScale.timeToCoordinate(points?.start.time);
            const y1 = activeSeries.priceToCoordinate(points?.start.price);
            
            const x2 = timeScale.timeToCoordinate(points.final.time);
            const y2 = activeSeries.priceToCoordinate(points.final.price);

            if (x1 == null || y1 == null || x2 == null || y2 == null) return;
            //console.log("painting", points)
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();

            break;
        }

        case "Rectangle": {
            if (!points.start || !points.final) return;

            const timeScale = chartRef.current.timeScale();
            if (!points?.start.time || !points?.start.price) return;
            if (!points?.final.time || !points?.final.price) return;

            const x1 = timeScale.timeToCoordinate(points.start.time);
            const y1 = activeSeries.priceToCoordinate(points.start.price);

            const x2 = timeScale.timeToCoordinate(points.final.time);
            const y2 = activeSeries.priceToCoordinate(points.final.price);

            if (x1 == null || y1 == null || x2 == null || y2 == null) return;

            const x = Math.min(x1, x2);
            const y = Math.min(y1, y2);
            const width = Math.abs(x2 - x1);
            const height = Math.abs(y2 - y1);

            ctx.beginPath();
            ctx.rect(x, y, width, height);
            ctx.stroke();

            break;
        }

        case "Circle": {
            if (!points.start || !points.final) return;

            const timeScale = chartRef.current.timeScale();
            if (!points?.start.time || !points?.start.price) return;
            if (!points?.final.time || !points?.final.price) return;
            const x1 = timeScale.timeToCoordinate(points.start.time);
            const y1 = activeSeries.priceToCoordinate(points.start.price);

            const x2 = timeScale.timeToCoordinate(points.final.time);
            const y2 = activeSeries.priceToCoordinate(points.final.price);

            if (x1 == null || y1 == null || x2 == null || y2 == null) return;

            const cx = (x1 + x2) / 2;
            const cy = (y1 + y2) / 2;

            const radius = Math.min(
                Math.abs(x2 - x1),
                Math.abs(y2 - y1)
            ) / 2;

            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();

            break;
        }

        case "Long Position": {
            if (!points.start.time) return;

            const ts = chartRef.current.timeScale();

            const x = ts.timeToCoordinate(points.start.time);
            const entry = activeSeries.priceToCoordinate(points.start.price);

            if (x == null || entry == null) return;

            const width = 120;
            const riskHeight = 30;
            const profitHeight = riskHeight * 2;

            ctx.fillStyle = "rgba(0, 180, 0, 0.2)";
            ctx.fillRect(
                x,
                entry - profitHeight,
                width,
                profitHeight
            );

            ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
            ctx.fillRect(
                x,
                entry,
                width,
                riskHeight
            );

            break;
        }
        case "Short Position": {
            if (!points.start.time) return;

            const ts = chartRef.current.timeScale();

            const x = ts.timeToCoordinate(points.start.time);
            const entry = activeSeries.priceToCoordinate(points.start.price);

            if (x == null || entry == null) return;

            const width = 120;
            const riskHeight = 30;
            const profitHeight = riskHeight * 2;

            ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
            ctx.fillRect(
                x,
                entry - riskHeight,
                width,
                riskHeight
            );

            ctx.fillStyle = "rgba(0, 180, 0, 0.2)";
            ctx.fillRect(
                x,
                entry,
                width,
                profitHeight
            );

            break;
        }
    }

    ctx.restore();
}


function drawSelection(ctx, type, drawing) {
    let bounds;

    switch (type) {
        case "line":
            bounds = lineBounds(drawing);
            break;

        case "rectangle":
            bounds = rectangleBounds(drawing);
            break;

        case "circle":
            bounds = circleBounds(drawing);
            break;
    }

    if (!bounds) return;

    const pad = 5;

    ctx.save();
    ctx.strokeStyle = "#2196f3";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 3]);

    ctx.strokeRect(
        bounds.minX - pad,
        bounds.minY - pad,
        bounds.maxX - bounds.minX + pad * 2,
        bounds.maxY - bounds.minY + pad * 2
    );

    ctx.restore();
}

export function renderDrawings(ctx, chartId, k1, chartRef) {
    const activeSeries = useChartStore.getState().selection[chartId].activeSeries
    
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();

    ctx.strokeStyle = "red";
    //console.log(points)
    const Drawings = useDrawingStore.getState().Drawings[k1];
    //console.log(Drawings)
        if (!Drawings) return;
        for (const drawing of Object.keys(Drawings)){
            //console.log(drawing)
            for (const drawing_details of Object.values(Drawings[drawing])){
                
                if (drawing== "Horizontal Line") {
                        const y = activeSeries
                            .priceToCoordinate(drawing_details.price);
                        ctx.save();
                        if (drawing_details.selected){ 
                            //console.log("selected",drawing_details.selected)
                            ctx.strokeStyle= "#2196f3"};
                        ctx.beginPath();
                        ctx.moveTo(0, y);
                        ctx.lineTo(ctx.canvas.width, y);
                        ctx.stroke();
                            
                        ctx.restore();
                        
                } else if  (drawing== "Vertical Line"){
                        const x = chartRef.current.timeScale().timeToCoordinate(drawing_details.time);
                        //console.log("[render drawings vertical]",x)
                        ctx.save();
                        if (drawing_details.selected){ 
                            //console.log("selected",drawing_details.selected)
                            ctx.strokeStyle= "#2196f3"};
                        ctx.beginPath();
                        ctx.moveTo(x, 0);
                        ctx.lineTo(x, ctx.canvas.height);
                        ctx.stroke();
                        ctx.restore();
                        
                } else if  (drawing== "Trend Line") {
                    //console.log(drawing_details)
                    if (!drawing_details.start || !drawing_details.final) return;

                    const timeScale = chartRef.current.timeScale();
                    const activeSeries =
                        useChartStore.getState().selection[chartId].activeSeries;

                    const x1 = timeScale.timeToCoordinate(drawing_details.start.time);
                    const y1 = activeSeries.priceToCoordinate(drawing_details.start.price);

                    const x2 = timeScale.timeToCoordinate(drawing_details.final.time);
                    const y2 = activeSeries.priceToCoordinate(drawing_details.final.price);

                    if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
                    ctx.save();
                    if (drawing_details.selected){ 
                        //console.log(`${drawing} selected`,drawing_details.selected)
                        ctx.strokeStyle= "#2196f3"};
                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);
                    ctx.stroke();
                    ctx.restore();

                } else if (drawing== "Rectangle") {
                    if (!drawing_details.start || !drawing_details.final) return;

                    const timeScale = chartRef.current.timeScale();

                    const x1 = timeScale.timeToCoordinate(drawing_details.start.time);
                    const y1 = activeSeries.priceToCoordinate(drawing_details.start.price);

                    const x2 = timeScale.timeToCoordinate(drawing_details.final.time);
                    const y2 = activeSeries.priceToCoordinate(drawing_details.final.price);

                    if (x1 == null || y1 == null || x2 == null || y2 == null) continue;

                    const x = Math.min(x1, x2);
                    const y = Math.min(y1, y2);
                    const width = Math.abs(x2 - x1);
                    const height = Math.abs(y2 - y1);
                    ctx.save();
                    if (drawing_details.selected){ 
                        //console.log(`${drawing} selected`,drawing_details.selected)
                        ctx.strokeStyle= "#2196f3"};
                    ctx.beginPath();
                    ctx.rect(x, y, width, height);
                    ctx.stroke();
                    ctx.restore();

                    
                } else if (drawing== "Circle") {
                    if (!drawing_details.start || !drawing_details.final) return;

                    const timeScale = chartRef.current.timeScale();
                    const x1 = timeScale.timeToCoordinate(drawing_details.start.time);
                    const y1 = activeSeries.priceToCoordinate(drawing_details.start.price);

                    const x2 = timeScale.timeToCoordinate(drawing_details.final.time);
                    const y2 = activeSeries.priceToCoordinate(drawing_details.final.price);

                    if (x1 == null || y1 == null || x2 == null || y2 == null) continue;

                    const cx = (x1 + x2) / 2;
                    const cy = (y1 + y2) / 2;

                    const radius = Math.min(
                        Math.abs(x2 - x1),
                        Math.abs(y2 - y1)
                    ) / 2;
                    ctx.save();
                    if (drawing_details.selected){ 
                        //console.log(`${drawing} selected`,drawing_details.selected)
                        ctx.strokeStyle= "#2196f3"};
                    ctx.beginPath();
                    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.restore();

                } else if (drawing== "Long Position"){
                    if (!drawing_details.start) return;

                    const ts = chartRef.current.timeScale();

                    const x = ts.timeToCoordinate(drawing_details.start.time);
                    const entry = activeSeries.priceToCoordinate(drawing_details.start.price);

                    const target = activeSeries.priceToCoordinate(drawing_details.target.price);
                    const risk =activeSeries.priceToCoordinate(drawing_details.risk.price);

                    if (x == null || entry == null) return;

                    const width = 120;
                    const rewardToRisk= ((drawing_details.target.price-drawing_details.start.price)/
                        (drawing_details.start.price-drawing_details.risk.price)
                    );
                    
                    ctx.fillStyle = "rgba(0, 180, 0, 0.2)";
                    
                    ctx.fillRect(
                        x,
                        target,
                        width,
                        entry - target
                    );
                    
                    ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
                    ctx.fillRect(
                        x,
                        entry,
                        width,
                        risk - entry
                    );
                    ctx.save();

                    ctx.font = "12px Arial";
                    ctx.textBaseline = "middle";

                    // Entry label
                    ctx.fillStyle = "#00e5ff";
                    ctx.fillText(
                        `${drawing_details.start.price.toFixed(2)}  |  Reward:Risk  ${rewardToRisk.toFixed(2)}`,
                        x + 6,
                        entry
                    );

                    // Target price — near the top of green zone
                    ctx.fillStyle = "#008000";
                    ctx.textAlign = "right";
                    ctx.fillText(
                        `${drawing_details.target.price.toFixed(2)}`,
                        x + width - 6,
                        target + 12
                    );

                    // Risk price — near the bottom of red zone
                    ctx.fillStyle = "#cc0000";
                    ctx.fillText(
                        drawing_details.risk.price.toFixed(2),
                        x + width - 6,
                        risk - 12
                    );
                    if (drawing_details.selected){ 
                            //console.log(`${drawing}`,drawing_details.hit)
                            ctx.save();
                            ctx.strokeStyle= "#2196f3";
                            ctx.lineWidth = 3;

                            if (drawing_details.hit=="target"){
                                ctx.beginPath();
                                ctx.moveTo(x, target);
                                ctx.lineTo(x+width, target);
                                ctx.stroke();

                                ctx.beginPath();
                                ctx.arc(x, target, 3, 0, Math.PI * 2);
                                ctx.arc(x + width, target, 3, 0, Math.PI * 2);
                                ctx.fill();

                                ctx.restore();
                            } else if (drawing_details.hit=="risk"){
                                ctx.beginPath();
                                ctx.moveTo(x, risk);
                                ctx.lineTo(x+width, risk);
                                ctx.stroke();

                                ctx.beginPath();
                                ctx.arc(x, risk, 3, 0, Math.PI * 2);
                                ctx.arc(x + width, risk, 3, 0, Math.PI * 2);
                                ctx.fill();

                                ctx.restore();
                            }
                            
                           };

                    ctx.restore();
                                        
                    
                    
                } else if (drawing== "Short Position"){
                    if (!drawing_details.start) return;

                    const ts = chartRef.current.timeScale();

                    const x = ts.timeToCoordinate(drawing_details.start.time);
                    const entry = activeSeries.priceToCoordinate(drawing_details.start.price);
                    const target = activeSeries.priceToCoordinate(drawing_details.target.price);
                    const risk =activeSeries.priceToCoordinate(drawing_details.risk.price);
                    const rewardToRisk= ((drawing_details.target.price-drawing_details.start.price)/
                        (drawing_details.start.price-drawing_details.risk.price)
                    );
                    if (x == null || entry == null) return;

                    const width = 120;
                    
                    ctx.fillStyle = "rgba(255, 0, 0, 0.2)";
                    ctx.fillRect(
                        x,
                        entry,
                        width,
                        risk-entry
                    );

                    ctx.fillStyle = "rgba(0, 180, 0, 0.2)";
                    ctx.fillRect(
                    x,
                    target,
                    width,
                    entry - target
                    );

                    ctx.save();

                    ctx.font = "12px Arial";
                    ctx.textBaseline = "middle";

                    // Entry + R:R
                    ctx.fillStyle = "#00e5ff";
                    ctx.textAlign = "left";
                    ctx.fillText(
                        `${drawing_details.start.price.toFixed(2)}  |  Reward:Risk  ${rewardToRisk.toFixed(2)}`,
                        x + 6,
                        entry
                    );

                    // Target price — upper green zone
                    ctx.fillStyle = "#008000";
                    ctx.textAlign = "right";
                    ctx.fillText(
                        drawing_details.target.price.toFixed(2),
                        x + width - 6,
                        target + 12
                    );

                    // Risk price — lower red zone
                    ctx.fillStyle = "#cc0000";
                    ctx.fillText(
                        drawing_details.risk.price.toFixed(2),
                        x + width - 6,
                        risk - 12
                    );

                    if (drawing_details.selected){ 
                            //console.log(`${drawing}`,drawing_details.hit)
                            ctx.save();
                            ctx.strokeStyle= "#2196f3";
                            ctx.lineWidth = 3;

                            if (drawing_details.hit=="target"){
                                ctx.beginPath();
                                ctx.moveTo(x, target);
                                ctx.lineTo(x+width, target);
                                ctx.stroke();

                                ctx.beginPath();
                                ctx.arc(x, target, 3, 0, Math.PI * 2);
                                ctx.arc(x + width, target, 3, 0, Math.PI * 2);
                                ctx.fill();

                                ctx.restore();
                            } else if (drawing_details.hit=="risk"){
                                ctx.beginPath();
                                ctx.moveTo(x, risk);
                                ctx.lineTo(x+width, risk);
                                ctx.stroke();

                                ctx.beginPath();
                                ctx.arc(x, risk, 3, 0, Math.PI * 2);
                                ctx.arc(x + width, risk, 3, 0, Math.PI * 2);
                                ctx.fill();

                                ctx.restore();
                            }
                            
                           };

                    ctx.restore();

                }
            }
     
    }

ctx.restore();
}