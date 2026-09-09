// FootprintPrimitive.js
import useFootprintStore from "../../stores/footPrintStore";

export class FootprintPrimitive {
    constructor(chartId, data = []) {
        this.data = data;

        this.chart = null;
        this.series = null;
        this.requestUpdate = null;
        this.chartId = chartId;
        this._paneViews = [];
    }

    attached(param) {
        // lightweight-charts gives us both of these.
        this.chart = param.chart;
        this.series = param.series;
        this.requestUpdate = param.requestUpdate;

        this._paneViews = [
            new FootprintPaneView(this),
        ];

        this.requestUpdate();
        
        this.unsubFp = useFootprintStore.subscribe(
            (state) =>  {
                if (!state.footPrintState?.[this.chartId]) return;
            
                this.requestUpdate?.();
            }
        );
        this.unsubChart = this.chart.timeScale().subscribeVisibleLogicalRangeChange((range) => {
            if (!range) return;

            this.from = Math.max(0, Math.floor(range.from));;
            this.to   = Math.min(this.data.length, Math.ceil(range.to));;

           //console.log(this.from, this.to)
        });
    }

    detached() {
        this.chart = null;
        this.series = null;
        this.requestUpdate = null;
        this._paneViews = [];
        this.unsubFp();
        this.unsubChart();
    }

    paneViews() {
        return this._paneViews;
    }

    updateAllViews() {
        for (const view of this._paneViews) {
            view.update();
        }
    }

    setData(data) {
        this.data = data;

        if (this.requestUpdate) {
            this.requestUpdate();
        }
    }

    update(data) {
        this.data.push(data);

        if (this.requestUpdate) {
            this.requestUpdate();
        }
    }

    hitTest(x, y) {
        return null;
    }

    autoscaleInfo(startTimePoint, endTimePoint) {
        return null;
    }
}


/*
 * ============================================================
 * PANE VIEW
 * ============================================================
 */

class FootprintPaneView {

    constructor(source) {
        this.source = source;
        this.rendererInstance = new FootprintRenderer(source);
    }

    update() {
        // We don't need to calculate anything here yet.
        //
        // The renderer will obtain the current screen
        // coordinates directly from the chart/series APIs.
    }

    renderer() {
        return this.rendererInstance;
    }

    zOrder() {
        return "normal";
    }
}


/*
 * ============================================================
 * RENDERER
 * ============================================================
 */

function regroup(arr, groupNum){
    let newArr = []
    let transArr = []
    let group = groupNum
    for (const item of arr){
        //console.log(item)
        if (group > 0){
            transArr.push(item)
            group-=1
        } else {
            newArr.push(transArr)
            transArr=[]
            group= groupNum
            transArr.push(item)
            group -=1
            
        }
    }
    newArr.push(transArr)
    transArr=[]
    //console.log(newArr)
    return newArr
}


function formatNotional(value) {
        const abs = Math.abs(value);

        if (abs >= 1_000_000) {
            return `${(value / 1_000_000).toFixed(1)}M`;
        }

        if (abs >= 1_000) {
            return `${(value / 1_000).toFixed(1)}k`;
        }

        return `${Math.round(value)}`;
    }

function heatColor(
    value,
    max,
    side
) {
    const ratio =
        max === 0
            ? 0
            : value / max;

    if (ratio > 0.95) {
        return "#ffffff";
    }

    const intensity =
        Math.floor(
            25 + ratio * 180
        );

    return side === "buy"
        ? `rgb(0,${intensity},0)`
        : `rgb(${intensity},0,0)`;
}

class FootprintRenderer {

    constructor(source) {
        this.source = source;
    }

    
    drawFooter(y1, x, item, ctx){
        const footerY =
                y1 + 12;

        const delta =
            item.totalDelta ??
            0;
        
        ctx.font =
            "bold 10px sans-serif";

        ctx.fillStyle =
                delta >= 0
                    ? "#00cc88"
                    : "#ff5555";

        ctx.fillText(
            `${delta >= 0 ? "▲" : "▼"} ${formatNotional(
                Math.abs(delta)
            )}`,
            x,
            footerY
        );

        ctx.fillStyle =
                "#ffffff";

        ctx.fillText(
            `Σ ${formatNotional(
                item.totalVolume

            )}`,
            x,
            footerY + 12
        );
    }

    draw(target) {
    const { chart, series, data, chartId, from, to } = this.source;
    let newData;
    if (from && to){
        newData= data.slice(from,to);
    } else {
        newData = data;
    }
    if (!newData) return;
    //console.log(newData.length);
    const footPrintState = useFootprintStore.getState().footPrintState?.[chartId];
    //console.log(footPrintState)
    if (footPrintState?.fpStatus === "off") return;
    const visible = series.priceScale().getVisibleRange();
    if (!visible) return;
    const priceSpan = Math.abs(visible.to - visible.from);
    const paneHeight = chart.panes()[0].getHeight();

    const pixelsPerPrice = paneHeight / priceSpan;
    const targetPx = 100;
    const timeScale = chart.timeScale();
    const spacing = timeScale.options().barSpacing;

    
    if (!chart || !series || !data.length) return;

    

    target.useMediaCoordinateSpace(({ context: ctx }) => {
        for (const item of newData) {
            const x = timeScale.timeToCoordinate(item.time);

            if (x === null) continue;

            const bins = item.binnedProfile;
            //console.log(item,bins)
            const poc= item?.poc;
            let pocY;
            if (poc){
                pocY = series.priceToCoordinate(poc.price);
            }
            
            const width = spacing * 0.8;
            if (!bins) continue;
            const y1 = series.priceToCoordinate(item.low);
            const y2 = series.priceToCoordinate(item.high);
            const levels = Object.entries(bins);

            const profileRows = levels.map(([price,profile])=>({
                price: Number(price), buy: profile.buy,
              sell:profile.sell}))
            profileRows.sort((a,b)=>b.price-a.price);
            let aggPerRow = targetPx/pixelsPerPrice;
            //let aggLength = profileRows.length/aggPerRow;
            let newRows = regroup(profileRows, aggPerRow);
            let rowHeight = Math.abs(y2-y1)/newRows.length;
            //console.log(aggPerRow,newRows.length)
            
            
            this.drawFooter(y1, x, item, ctx)
            
            let pos = y2;
            for ( const group of newRows){
                const maxVolBuySide = newRows.reduce(
                    (max, group) => Math.max(
                        max,
                        group.reduce((sum, val) => sum + val.buy, 0)
                    ),
                    0
                );

                const maxVolSellSide = newRows.reduce(
                    (max, group) => Math.max(
                        max,
                        group.reduce((sum, val) => sum + val.sell, 0)
                    ),
                    0
                );

                
                
                const sellT = group.reduce((acc,val)=>Math.floor(acc+val.sell),0);
                const sellColor =
                            heatColor(
                                sellT,
                                maxVolSellSide,
                                "sell"
                            );
                ctx.fillStyle=sellColor;
                ctx.fillRect(x-width/2,pos,width/4,rowHeight);
                
                const buyT = group.reduce((acc,val)=>Math.floor(acc+val.buy),0);
                const buyColor =
                            heatColor(
                                buyT,
                                maxVolBuySide,
                                "buy"
                            );
                ctx.fillStyle=buyColor;
                ctx.fillRect(x+width/4,pos,width/4,rowHeight);
                
                
                const availableWidth = width/4;
                const textWidth = ctx.measureText(String(sellT)).width;
                if (textWidth < availableWidth){
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillStyle = sellColor === "#ffffff" ? "black" : "white";
                    ctx.fillText(formatNotional(sellT),x - 3 * width / 8,(pos+rowHeight/2));
                    
                    ctx.fillStyle =buyColor === "#ffffff" ? "black" : "white";
                    ctx.fillText(formatNotional(buyT),x + 3 * width / 8,(pos+rowHeight/2));
                }
                pos = pos+rowHeight;
            }
            if (pocY){
                ctx.save();
                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.strokeRect(
                    x - width / 2,
                    pocY,
                    width,
                    rowHeight
                );
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "black";
                ctx.fillText("POC",x,pocY+rowHeight/2)
                ctx.restore();

            }

        }
    });
}
}