import { getRenderableCandles } from "./footprintLOD";

export class FootprintRenderer {
    constructor() {
        this._data = null;
        this._options = null;
    }

    update(data, options) {
        this._data = data;
        this._options = options;
    }

    draw(target, priceToCoordinate) {
        if (!this._data) return;

        target.useMediaCoordinateSpace(scope => {
            const ctx = scope.context;

            const bars = this._data.bars;
            const visibleRange = this._data.visibleRange;

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "8px sans-serif";

            for (
                let i = visibleRange.from;
                i < visibleRange.to;
                i++
            ) {
                const bar = bars[i];

                if (!bar?.originalData) continue;

                const candle = bar.originalData;
                const x = bar.x;

                const highY = priceToCoordinate(
                    candle.high
                );

                const lowY = priceToCoordinate(
                    candle.low
                );

                if (
                    highY == null ||
                    lowY == null
                ) {
                    continue;
                }

                const footprint = candle.footprint;
                //FIRST THING TO CHECK IF BREAK
                //if (!rows?.length) continue;

                if (!footprint) continue;

                const {
                    rows,
                    poc,
                    vah,
                    val,
                    totalVolume,
                    maxVolume
                } = footprint;

                const candleTop = Math.min(
                    highY,
                    lowY
                );

                const candleBottom = Math.max(
                    highY,
                    lowY
                );

                const candleHeight =
                    candleBottom - candleTop;

                const rowHeight =
    candleHeight / rows.length;

                const candleWidth =
                    Math.max(
                        4,
                        this._data.barSpacing *
                            0.2
                    );

                const ladderWidth =
                    Math.max(
                        4,
                        this._data.barSpacing *
                            0.35
                    );

                

                // ---------------------------------
                // FOOTPRINT
                // ---------------------------------

                rows.forEach(
                    (row, idx) => {
                        const y =
                            candleTop +
                            idx *
                                rowHeight;

                        const buyColor =
                            heatColor(
                                row.buy,
                                maxVolume,
                                "buy"
                            );

                        const sellColor =
                            heatColor(
                                row.sell,
                                maxVolume,
                                "sell"
                            );

                        const inValueArea =
                            row.price >=
                                val &&
                            row.price <=
                                vah;

                        const isPOC =
                            row.price === poc;

                        const sellX =
                            x -
                            candleWidth /
                                2 -
                            ladderWidth;

                        const buyX =
                            x +
                            candleWidth /
                                2;

                        // SELL

                        ctx.fillStyle =
                            sellColor;

                        ctx.fillRect(
                            sellX,
                            y,
                            ladderWidth,
                            rowHeight
                        );

                        // BUY

                        ctx.fillStyle =
                            buyColor;

                        ctx.fillRect(
                            buyX,
                            y,
                            ladderWidth,
                            rowHeight
                        );

                        // VALUE AREA

                        if (inValueArea) {
                            ctx.strokeStyle =
                                "#ffff00";

                            ctx.lineWidth = 1;

                            ctx.strokeRect(
                                sellX,
                                y,
                                ladderWidth,
                                rowHeight
                            );

                            ctx.strokeRect(
                                buyX,
                                y,
                                ladderWidth,
                                rowHeight
                            );
                        }

                        // POC

                        if (isPOC) {
                            ctx.strokeStyle =
                                "#ffffff";

                            ctx.lineWidth = 2;

                            ctx.strokeRect(
                                sellX,
                                y,
                                ladderWidth *
                                    2 +
                                    candleWidth,
                                rowHeight
                            );
                        }

                        // TEXT

                        ctx.fillStyle =
                            sellColor ===
                            "#ffffff"
                                ? "#000"
                                : "#fff";

                        ctx.fillText(
                            fmtVol(
                                row.sell
                            ),
                            sellX +
                                ladderWidth /
                                    2,
                            y +
                                rowHeight /
                                    2
                        );

                        ctx.fillStyle =
                            buyColor ===
                            "#ffffff"
                                ? "#000"
                                : "#fff";

                        ctx.fillText(
                            fmtVol(
                                row.buy
                            ),
                            buyX +
                                ladderWidth /
                                    2,
                            y +
                                rowHeight /
                                    2
                        );
                    }
                );

                // ---------------------------------
                // WICK
                // ---------------------------------

                ctx.strokeStyle =
                    candle.close >=
                    candle.open
                        ? "#00d084"
                        : "#ff4d4d";

                ctx.lineWidth = 1;

                ctx.beginPath();
                ctx.moveTo(x, highY);
                ctx.lineTo(x, lowY);
                ctx.stroke();

                // ---------------------------------
                // BODY
                // ---------------------------------

                const openY =
                    priceToCoordinate(
                        candle.open
                    );

                const closeY =
                    priceToCoordinate(
                        candle.close
                    );

                if (
                    openY != null &&
                    closeY != null
                ) {
                    const bodyTop =
                        Math.min(
                            openY,
                            closeY
                        );

                    const bodyHeight =
                        Math.max(
                            2,
                            Math.abs(
                                closeY -
                                    openY
                            )
                        );

                    ctx.fillStyle =
                        candle.close >=
                        candle.open
                            ? "#00b386"
                            : "#d94b4b";

                    ctx.fillRect(
                        x -
                            candleWidth /
                                2,
                        bodyTop,
                        candleWidth,
                        bodyHeight
                    );
                }

                // ---------------------------------
                // FOOTER
                // ---------------------------------

                const footerY =
                    candleBottom + 12;

                const delta =
                    candle.volume_delta ??
                    0;

                ctx.font =
                    "bold 10px sans-serif";

                ctx.fillStyle =
                    delta >= 0
                        ? "#00cc88"
                        : "#ff5555";

                ctx.fillText(
                    `${delta >= 0 ? "▲" : "▼"} ${fmtVol(
                        Math.abs(delta)
                    )}`,
                    x,
                    footerY
                );

                ctx.fillStyle =
                    "#ffffff";

                ctx.fillText(
                    `Σ ${fmtVol(
                        totalVolume
                    )}`,
                    x,
                    footerY + 12
                );

                ctx.fillStyle =
                    "#ffd700";

                /*ctx.fillText(
                    `x${multiplier.toFixed(
                        1
                    )}`,
                    x,
                    footerY + 24
                );*/

                ctx.font =
                    "8px sans-serif";
            }
             
        });
    }
}

// -----------------------------------------
// HELPERS
// -----------------------------------------

function fmtVol(v) {
    if (v >= 1_000_000) {
        return (
            v / 1_000_000
        ).toFixed(2) + "M";
    }

    if (v >= 1_000) {
        return (
            v / 1_000
        ).toFixed(2) + "K";
    }

    return Number(v).toFixed(0);
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


function drawLegend(ctx, chartWidth) {

    const width = 165;
    const height = 78;

    const x = (chartWidth - width) / 2;
    const y = 10;

    // background
    ctx.save();

    ctx.fillStyle = "rgba(20,20,20,0.75)";
    ctx.strokeStyle = "#3a3a3a";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 6);
    ctx.fill();
    ctx.stroke();

    // title
    ctx.font = "bold 11px sans-serif";
    ctx.fillStyle = "#ffffff";
    //ctx.fillText("Color Scheme", x + 8, y + 15);

    // ---------- Volume Gradient ----------

    const gx = x + 10;
    const gy = y + 28;

    const grad = ctx.createLinearGradient(
        gx,
        0,
        gx + 48,
        0
    );

    grad.addColorStop(0.0, "#2d2d2d");
    grad.addColorStop(1.0, "#ffffff");

    ctx.fillStyle = grad;
    ctx.fillRect(gx, gy, 48, 8);

    ctx.font = "10px sans-serif";
    ctx.fillStyle = "#cfcfcf";
    ctx.fillText("Low", gx - 2, gy + 20);
    ctx.fillText("High", gx + 32, gy + 20);

    // ---------- POC ----------

    const px = x + 72;
    const py = y + 26;

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(px, py, 10, 10);

    ctx.fillStyle = "#ffffff";
    ctx.fillText("POC", px + 16, py + 9);

    // ---------- Value Area ----------

    const vx = px;
    const vy = py + 20;

    ctx.strokeStyle = "#ffd700";
    ctx.strokeRect(vx, vy, 10, 10);

    ctx.fillStyle = "#ffd700";
    ctx.fillText("VA", vx + 16, vy + 9);

    ctx.restore();
}

export class FootprintSeries {
    constructor() {
        this._renderer =
            new FootprintRenderer();
    }

    update(data, options) {
        this._renderer.update(
            data,
            options
        );
    }

    renderer() {
        return this._renderer;
    }

    priceValueBuilder(bar) {
        return [
            bar.high,
            bar.low,
            bar.close,
        ];
    }

    isWhitespace(data) {
        return (
            data === undefined ||
            data.high === undefined ||
            data.low === undefined
        );
    }

    defaultOptions() {
        return {};
    }

    destroy() {}
}