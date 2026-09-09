class BackfillAggregator {

    constructor(timeframes) {
        this.timeframes = timeframes;

        // Oldest completed bucket already emitted for each TF.
        // null means first call.
        this.emittedBefore = {};

        for (const tf of Object.keys(timeframes)) {
            this.emittedBefore[tf] = null;
        }
    }


    aggregate(data) {

        // One aggregation state per timeframe
        const states = {};

        for (const tf of Object.keys(this.timeframes)) {
            states[tf] = {
                bucket: null,
                candle: null,
            };
        }


        /*
         * Build every timeframe in one pass.
         */
        for (const trade of data) {

            const {
                q: quantity,
                T: timestamp,
                p: price,
                m: buyerMaker,
            } = trade;


            for (const tf of Object.keys(this.timeframes)) {

                const tfMs = this.timeframes[tf] * 1000;

                const bucket =
                    Math.floor(timestamp / tfMs);


                const state = states[tf];


                /*
                 * First trade for this timeframe
                 */
                if (state.bucket === null) {

                    state.bucket = bucket;

                    state.candle =
                        this.createCandle(
                            timestamp,
                            price,
                            quantity,
                            buyerMaker
                        );

                    continue;
                }


                /*
                 * New candle bucket
                 */
                if (bucket !== state.bucket) {

                    this.addTrade(
                        state.candle,
                        timestamp,
                        price,
                        quantity,
                        buyerMaker
                    );

                    /*
                     * The previous candle is now known to be
                     * complete because we've entered a new bucket.
                     */
                    state.completed =
                        state.candle;

                    state.bucket = bucket;

                    state.candle =
                        this.createCandle(
                            timestamp,
                            price,
                            quantity,
                            buyerMaker
                        );

                    continue;
                }


                /*
                 * Same candle
                 */
                this.addTrade(
                    state.candle,
                    timestamp,
                    price,
                    quantity,
                    buyerMaker
                );
            }
        }


        /*
         * The final candle for every TF is intentionally NOT
         * emitted because it is the currently incomplete bucket.
         *
         * state.completed contains the last completed candle.
         */


        const output = {};


        for (const tf of Object.keys(this.timeframes)) {

            output[tf] = [];

            const completed =
                states[tf].completed;

            if (!completed) {
                continue;
            }


            const previousBoundary =
                this.emittedBefore[tf];


            /*
             * First call:
             *
             * Emit every completed candle.
             */
            if (previousBoundary === null) {

                output[tf] =
                    this.collectCompleted(
                        data,
                        tf
                    );

                if (output[tf].length > 0) {
                    this.emittedBefore[tf] =
                        Math.floor(
                            output[tf][0].time * 1000 /
                            (this.timeframes[tf] * 1000)
                        );
                }

                continue;
            }


            /*
             * Subsequent calls:
             *
             * We only want candles OLDER than the
             * oldest candle previously emitted.
             */
            output[tf] =
                this.collectCompleted(
                    data,
                    tf,
                    previousBoundary
                );


            if (output[tf].length > 0) {

                this.emittedBefore[tf] =
                    Math.floor(
                        output[tf][0].time * 1000 /
                        (this.timeframes[tf] * 1000)
                    );
            }
        }


        return output;
    }


    createCandle(timestamp, price, quantity, buyerMaker) {

        const buy =
            buyerMaker
                ? 0
                : quantity * price;

        const sell =
            buyerMaker
                ? quantity * price
                : 0;


        return {
            time: timestamp / 1000,

            open: price,
            high: price,
            low: price,
            close: price,

            binnedProfile: {
                [price]: {
                    buy,
                    sell,
                }
            },

            totalVolume: buy + sell,
            totalDelta: buy - sell,
        };
    }


    addTrade(
        candle,
        timestamp,
        price,
        quantity,
        buyerMaker
    ) {

        candle.close = price;

        candle.high =
            Math.max(
                candle.high,
                price
            );

        candle.low =
            Math.min(
                candle.low,
                price
            );


        const volume =
            quantity * price;


        if (!candle.binnedProfile[price]) {

            candle.binnedProfile[price] = {
                buy: 0,
                sell: 0,
            };
        }


        if (buyerMaker) {
            candle.binnedProfile[price].sell += volume;
        }
        else {
            candle.binnedProfile[price].buy += volume;
        }


        candle.totalVolume += volume;

        candle.totalDelta +=
            buyerMaker
                ? -volume
                : volume;
    }


    collectCompleted(
        data,
        tf,
        beforeBucket = null
    ) {

        const tfMs =
            this.timeframes[tf] * 1000;


        const candles = [];

        let bucket = null;
        let candle = null;


        for (const trade of data) {

            const {
                q: quantity,
                T: timestamp,
                p: price,
                m: buyerMaker,
            } = trade;


            const currentBucket =
                Math.floor(
                    timestamp / tfMs
                );


            /*
             * We only care about candles older than
             * the previous emission boundary.
             */
            if (
                beforeBucket !== null &&
                currentBucket >= beforeBucket
            ) {
                continue;
            }


            if (bucket === null) {

                bucket = currentBucket;

                candle =
                    this.createCandle(
                        timestamp,
                        price,
                        quantity,
                        buyerMaker
                    );

                continue;
            }


            if (currentBucket !== bucket) {

                candles.push(candle);

                bucket = currentBucket;

                candle =
                    this.createCandle(
                        timestamp,
                        price,
                        quantity,
                        buyerMaker
                    );

                continue;
            }


            this.addTrade(
                candle,
                timestamp,
                price,
                quantity,
                buyerMaker
            );
        }


        /*
         * Final candle in the selected range is incomplete,
         * so don't emit it.
         */
        return candles;
    }
}

export default BackfillAggregator;