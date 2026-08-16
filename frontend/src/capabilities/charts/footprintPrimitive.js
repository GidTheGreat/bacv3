// FootprintPrimitive.js
import useFootprintStore from "../../stores/footPrintStore";

export class FootprintPrimitive {
    constructor(data = []) {
        this.data = data;

        this.chart = null;
        this.series = null;
        this.requestUpdate = null;

        this._paneViews = [];
    }

    attached(param) {
        // lightweight-charts gives us both of these.
        this.chart = param.chart;
        this.series = param.series;
        this.requestUpdate = param.requestUpdate;

        this.unsubscribe = useFootprintStore.subscribe(
            (state) => state.variant,
            () => {
                this.requestUpdate?.();
            }
        );

        this._paneViews = [
            new FootprintPaneView(this),
        ];

        this.requestUpdate();
    }

    detached() {
        this.unsubscribe?.();
        this.unsubscribe = null;
        this.chart = null;
        this.series = null;
        this.requestUpdate = null;
        this._paneViews = [];
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

class FootprintRenderer {

    constructor(source) {
        this.source = source;
    }

    

    draw(target) {
    const { chart, series, data } = this.source;

    const variant = useFootprintStore.getState().variant;

    if (variant === "off") return;
    if (!chart || !series || !data.length) return;

    const timeScale = chart.timeScale();
    const barSpacing = timeScale.options().barSpacing;

    // Future:
    // "notional" -> buy / sell
    // "volume"   -> buy_volume / sell_volume
    const metric = "notional";

    const valueKeys = {
        notional: {
            buy: "buy",
            sell: "sell",
        },
        volume: {
            buy: "buy_volume",
            sell: "sell_volume",
        },
    };

    const { buy: buyKey, sell: sellKey } = valueKeys[metric];

    target.useMediaCoordinateSpace(({ context: ctx }) => {
        for (const item of data) {
            const x = timeScale.timeToCoordinate(item.time);

            if (x === null) continue;

            const bins = item.binned_profile;

            if (!bins) continue;

            const prices = Object.keys(bins)
                .map(Number)
                .sort((a, b) => a - b);

            if (!prices.length) continue;

            /*
             * Determine vertical size of each price bin.
             */
            let binHeight = 10;

            if (prices.length > 1) {
                const y1 = series.priceToCoordinate(prices[0]);
                const y2 = series.priceToCoordinate(prices[1]);

                if (y1 !== null && y2 !== null) {
                    binHeight = Math.max(1, Math.abs(y2 - y1));
                }
            }

            /*
             * Equal-width cells on both sides of the candle.
             */
            const sideWidth = Math.max(
                2,
                Math.min(barSpacing * 0.4, 100)
            );

            const leftX = x - barSpacing / 2;
            const rightX = x + barSpacing / 2 - sideWidth;

            for (const price of prices) {
                const bin = bins[price];

                const y = series.priceToCoordinate(price);

                if (y === null) continue;

                const sell = bin[sellKey] ?? 0;
                const buy = bin[buyKey] ?? 0;

                /*
                 * ------------------------------------------------
                 * SELL CELL
                 * ------------------------------------------------
                 */

                ctx.fillStyle = "red";

                ctx.fillRect(
                    leftX,
                    y - binHeight / 2,
                    sideWidth,
                    binHeight
                );

                ctx.fillStyle = "white";

                ctx.textAlign = "center";
                ctx.textBaseline = "middle";

                ctx.fillText(
                    formatNotional(sell),
                    leftX + sideWidth / 2,
                    y
                );

                /*
                 * ------------------------------------------------
                 * BUY CELL
                 * ------------------------------------------------
                 */

                ctx.fillStyle = "green";

                ctx.fillRect(
                    rightX,
                    y - binHeight / 2,
                    sideWidth,
                    binHeight
                );

                ctx.fillStyle = "white";

                ctx.fillText(
                    formatNotional(buy),
                    rightX + sideWidth / 2,
                    y
                );
            }
        }
    });
}
}