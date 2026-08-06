import { getRenderableCandles } from "./footprintLOD";

import {
    drawRows,
    drawValueArea,
    drawPOC,
    drawWick,
    drawBody,
    drawDelta,
    drawTotalVolume,
} from "./FootprintPrimitives";

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

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = "8px sans-serif";

            const renderables = getRenderableCandles(
                this._data.bars,
                this._data.visibleRange,
                this._data.barSpacing,
                priceToCoordinate
            );

            for (const r of renderables) {
                drawRows(ctx, r);
                drawValueArea(ctx, r);
                drawPOC(ctx, r);
                drawWick(ctx, r);
                drawBody(ctx, r);
                drawDelta(ctx, r);
                drawTotalVolume(ctx, r);
            }
        });
    }
}

// -----------------------------------------
// HELPERS
// -----------------------------------------



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