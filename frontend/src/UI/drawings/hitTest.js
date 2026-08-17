import useDrawingStore from "../../stores/drawingStore";
import useChartStore from "../../stores/chartStore";
import { renderDrawing} from "./render";

export default function hitTest(ctx, chartRef, k1, chartId, pointerType, x, y){
    if (!useDrawingStore.getState().Drawings) return;
    if (pointerType?.toLowerCase?.().endsWith("down")) {
        const activeSeries = useChartStore.getState().selection[chartId].activeSeries
        const Drawings = useDrawingStore.getState().Drawings[k1];
        const priceY = activeSeries.coordinateToPrice(y);
        const priceX = chartRef.current.timeScale().coordinateToTime(x);

        for (const drawing of Object.keys(Drawings)){
            
                const slected_drawing= Drawings[drawing].find(detail=>{
                    if ( detail.price && detail.price<= priceY*1.001 
                        &&  detail.price>= priceY*0.999){
                            console.log(detail)
                        }
                })
            }
    }
}