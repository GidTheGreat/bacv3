// FootprintPrimitive.js



import {
    // These are mainly useful as documentation/type references.
    // You do not have to import them at runtime in plain JS.
    // SeriesPrimitivePaneView,
    // SeriesPrimitivePaneRenderer,
} from "lightweight-charts";


/*
 * ============================================================
 *  PRIMITIVE
 * ============================================================
 *
 * Attach with:
 *
 *     candleSeries.attachPrimitive(
 *         new FootprintPrimitive(...)
 *     );
 *
 * The primitive is responsible for:
 *
 * - keeping drawing/data state
 * - knowing when the chart needs to redraw
 * - creating pane views
 * - optionally implementing hit testing
 * - optionally implementing autoscaling
 * - reacting to attachment/detachment
 */
export class FootprintPrimitive {

    constructor(data = []) {
        this.data = data;

        // Set by lightweight-charts when attached.
        this.series = null;

        // Function supplied by lightweight-charts.
        // Calling this causes updateAllViews() / redraw.
        this.requestUpdate = null;

        this._paneViews = [];
    }


    /*
     * --------------------------------------------------------
     * ATTACHMENT
     * --------------------------------------------------------
     *
     * Called by lightweight-charts when:
     *
     *     series.attachPrimitive(primitive)
     *
     * happens.
     *
     * `target` contains the series and requestUpdate callback.
     */
    attached(param) {
        this.series = param.series;
        this.requestUpdate = param.requestUpdate;

        // Create the pane view once.
        this._paneViews = [
            new FootprintPaneView(this),
        ];

        // Tell the chart that the primitive has something to draw.
        this.requestUpdate();
    }


    /*
     * --------------------------------------------------------
     * DETACHMENT
     * --------------------------------------------------------
     *
     * Called when:
     *
     *     series.detachPrimitive(primitive)
     *
     * happens.
     */
    detached() {
        this.series = null;
        this.requestUpdate = null;
        this._paneViews = [];
    }


    /*
     * --------------------------------------------------------
     * PANE VIEWS
     * --------------------------------------------------------
     *
     * lightweight-charts asks the primitive for its pane views
     * during rendering.
     */
    paneViews() {
        return this._paneViews;
    }


    /*
     * --------------------------------------------------------
     * UPDATE DATA
     * --------------------------------------------------------
     *
     * This is your own API.
     *
     * Example:
     *
     *     primitive.setData(footprintData);
     *
     * The important part is requestUpdate().
     */
    setData(data) {
        this.data = data;

        if (this.requestUpdate) {
            this.requestUpdate();
        }
    }


    /*
     * Add/update one footprint.
     */
    update(data) {
        // Your actual merging logic goes here.
        this.data.push(data);

        if (this.requestUpdate) {
            this.requestUpdate();
        }
    }


    /*
     * --------------------------------------------------------
     * UPDATE ALL VIEWS
     * --------------------------------------------------------
     *
     * This method is optional.
     *
     * It becomes useful when your primitive has multiple views
     * and they need to be explicitly refreshed from primitive
     * state.
     *
     * For a simple primitive, requestUpdate() is normally enough.
     */
    updateAllViews() {
        //console.log("update")
        for (const view of this._paneViews) {
            view.update();
        }
    }


    /*
     * --------------------------------------------------------
     * HIT TESTING
     * --------------------------------------------------------
     *
     * Optional.
     *
     * Return a HitTestResult when the pointer is over something
     * belonging to this primitive.
     *
     * Return null when nothing was hit.
     *
     * `x` and `y` are media-coordinate pixels.
     *
     * This becomes useful later for:
     *
     * - selecting a footprint
     * - dragging
     * - resizing
     * - showing a tooltip
     * - context menus
     */
    hitTest(x, y) {
        // Example placeholder.
        //
        // return {
        //     cursorStyle: "pointer",
        //     externalId: "some-id",
        // };

        return null;
    }


    /*
     * --------------------------------------------------------
     * AUTOSCALE
     * --------------------------------------------------------
     *
     * Optional.
     *
     * Return information that should contribute to the series'
     * price scale.
     *
     * Returning null means:
     *     "I don't affect autoscaling."
     *
     * For footprint data painted inside the candle range,
     * you probably don't need this.
     */
    autoscaleInfo(startTimePoint, endTimePoint) {
        return null;

        /*
        Example if your primitive adds prices outside the candle:

        return {
            priceRange: {
                minValue: 95000,
                maxValue: 105000,
            },
        };
        */
    }


    /*
     * --------------------------------------------------------
     * Z-ORDER
     * --------------------------------------------------------
     *
     * Optional.
     *
     * Depending on what you are drawing, you can control whether
     * the primitive appears behind/in front of normal series
     * rendering through the pane-view configuration supported by
     * your lightweight-charts version.
     *
     * Keep this method here as a placeholder for that plumbing.
     */
    zOrder() {
        return "normal";
    }
}


/*
 * ============================================================
 *  PANE VIEW
 * ============================================================
 *
 * The pane view sits between the primitive and renderer.
 *
 * Its job is essentially:
 *
 *     primitive state -> renderer state
 */
class FootprintPaneView {

    constructor(source) {
        this._source = source;

        this._renderer = new FootprintRenderer(source);
    }


    /*
     * Called by lightweight-charts before rendering.
     *
     * This is where you would normally translate logical/chart
     * information into screen coordinates.
     */
    update() {
        /*
         * If your renderer needs prepared coordinates, calculate
         * them here.
         *
         * Example:
         *
         * this._renderer.setData(
         *     this._source.data
         * );
         *
         * For now the renderer can directly access the primitive.
         */
    }


    /*
     * lightweight-charts asks the pane view for its renderer.
     */
    renderer() {
        return this._renderer;
    }
}


/*
 * ============================================================
 *  RENDERER
 * ============================================================
 *
 * This is where the actual canvas drawing happens.
 *
 * IMPORTANT:
 *
 * The renderer should NOT manipulate DOM elements.
 * It receives the canvas rendering target from
 * lightweight-charts.
 */
class FootprintRenderer {

    constructor(source) {
        this._source = source;
    }


    /*
     * --------------------------------------------------------
     * DRAW
     * --------------------------------------------------------
     *
     * This is called by lightweight-charts during rendering.
     *
     * `target` gives access to the drawing context.
     */
    draw(target) {

        target.useMediaCoordinateSpace((scope) => {

            const ctx = scope.context;

            /*
             * ------------------------------------------------
             * TEMPORARY DEMONSTRATION
             * ------------------------------------------------
             *
             * For now:
             *
             *     LEFT  of candle  -> red
             *     RIGHT of candle  -> green
             *
             * Replace these coordinates with the actual candle
             * coordinates once the coordinate plumbing is wired.
             */

            const data = this._source.data;
            console.log(data)

            for (const candle of data) {

                /*
                 * Eventually these should come from:
                 *
                 *     time -> x
                 *     price -> y
                 *
                 * and the candle width/bar spacing.
                 *
                 * For now the data is expected to contain:
                 *
                 * {
                 *     x: 100,
                 *     y: 200,
                 *     width: 40,
                 *     height: 20
                 * }
                 */

                const x = candle.x ?? 0;
                const y = candle.y ?? 0;
                const width = candle.width ?? 40;
                const height = candle.height ?? 20;

                const half = width / 2;

                // LEFT side of candle
                ctx.fillStyle = "red";
                ctx.fillRect(
                    x - half,
                    y,
                    half,
                    height
                );

                // RIGHT side of candle
                ctx.fillStyle = "green";
                ctx.fillRect(
                    x,
                    y,
                    half,
                    height
                );
            }
        });
    }
}