const tfs = {
    "1min": 60,
    "5min": 300,
    "15min": 900,
    "30min": 1800,
    "1h": 3600,
    "4h": 14400,
};

class MessageCoalescer {

    constructor() {

        this.pending = new Map();

        this.timers = new Map();

        this.intervals = {

            "1min": 5_000,
            "5min": 25_000,
            "15min": 75_000,
            "30min": 150_000,
            "1h": 300_000,
            "4h": 1_200_000,
        };
    }


    postMessage(message) {

        const key =
            `${message.k1}|${message.tf}`;


        /*
         * Always keep only the latest
         * message for this chart + timeframe.
         */

        this.pending.set(
            key,
            message
        );


        /*
         * Timer already running.
         * Nothing else to do.
         */

        if (this.timers.has(key)) {
            return;
        }


        const interval =
            this.intervals[message.tf];


        const timer =
            setTimeout(() => {

                const pendingMessage =
                    this.pending.get(key);


                if (pendingMessage) {

                    postMessage(
                        pendingMessage
                    );

                    this.pending.delete(
                        key
                    );
                }


                this.timers.delete(
                    key
                );

            }, interval);


        this.timers.set(
            key,
            timer
        );
    }


    /*
     * Optional:
     * immediately send a completed candle.
     */

    flush(message) {

        const key =
            `${message.k1}|${message.tf}`;


        const timer =
            this.timers.get(key);


        if (timer) {

            clearTimeout(timer);

            this.timers.delete(key);
        }


        this.pending.delete(key);


        postMessage(message);
    }
}

class DataFeed {
    constructor() {
        this.buffers = new Map();
        this.i = {};

        this.startTime = {};
        this.currentTime = {};

        // timeframe-specific state
        this.currentCandle = {};
        this.currentBucket = {};
        this.messageCoalescer =
        new MessageCoalescer();
    }

    parseFeed(platform, trade, data) {

        const today = new Date().toISOString().slice(0, 10);

        const key =
            `${platform}|${trade}|${data.s}|${today}`;

        const chartKey =
            `${platform}|${trade}|${data.s}`;

        if (this.i[key] === undefined) {
            this.i[key] = 0;
        }

        if (!this.buffers.has(key)) {

            this.buffers.set(
                key,
                new SharedArrayBuffer(18_000_000)
            );
        }

        const buffer = this.buffers.get(key);

        const timeView =
            new Float64Array(buffer, 0, 720000);

        const priceView =
            new Float64Array(buffer, 5760000, 720000);

        const quantityView =
            new Float64Array(buffer, 11520000, 720000);

        const sideView =
            new Uint8Array(buffer, 17280000, 720000);

        const i = this.i[key];

        timeView[i] = data.T;
        priceView[i] = data.p;
        quantityView[i] = data.q;
        sideView[i] = data.m ? 1 : 0;

        // Build every timeframe immediately
        for (const tf of Object.keys(tfs)) {

            this.buildCandles(
                timeView,
                priceView,
                quantityView,
                sideView,
                tf,
                key,
                chartKey
            );
        }

        this.i[key] += 1;
    }


    buildCandles(
        timeView,
        priceView,
        quantityView,
        sideView,
        tf,
        key,
        chartKey
    ) {

        const tf_sec = tfs[tf];
        const i = this.i[key];

        const price = priceView[i];
        const quantity = quantityView[i];
        const side = sideView[i];

        const volume = quantity * price;


        /*
         * Important:
         * Each timeframe needs independent state.
         */

        const candleKey =
            `${key}|${tf}`;


        if (!this.currentCandle[candleKey]) {

            this.currentCandle[candleKey] = {

                time: timeView[i] / 1000,

                open: price,
                close: price,
                high: price,
                low: price,

                binnedProfile: {

                    [price]: {

                        buy:
                            side === 1
                                ? 0
                                : volume,

                        sell:
                            side === 1
                                ? volume
                                : 0,
                    }
                },

                totalVolume: volume,

                totalDelta:
                    side === 1
                        ? -volume
                        : volume,
            };


            this.currentBucket[candleKey] =
                Math.floor(
                    timeView[i] /
                    (tf_sec * 1000)
                );

            return;
        }


        const newBucket =
            Math.floor(
                timeView[i] /
                (tf_sec * 1000)
            );


        /*
         * New candle
         */

        if (
            this.currentBucket[candleKey] !==
            newBucket
        ) {
            const bins = this.currentCandle[candleKey]["binnedProfile"]
            const POC = Object.entries(bins).reduce((max, [price, profile]) => {
                return profile.buy + profile.sell > max.volume
                    ? { price: Number(price), volume: profile.buy + profile.sell }
                    : max;
            }, { price: null, volume: 0 });
            
            this.currentCandle[candleKey]["poc"] = POC 
            //console.log(this.currentCandle[candleKey])
            // Send completed candle
            this.messageCoalescer.flush({

                store: "chartStore",

                k1: chartKey,

                tf,

                trans_arr: [
                    this.currentCandle[candleKey]
                ]
            });


            // Start new candle
            this.currentCandle[candleKey] = {

                time:
                    timeView[i] / 1000,

                open: price,
                close: price,
                high: price,
                low: price,

                binnedProfile: {

                    [price]: {

                        buy:
                            side === 1
                                ? 0
                                : volume,

                        sell:
                            side === 1
                                ? volume
                                : 0,
                    }
                },

                totalVolume: volume,

                totalDelta:
                    side === 1
                        ? -volume
                        : volume,
            };


            this.currentBucket[candleKey] =
                newBucket;

            // Immediately show new forming candle
            this.messageCoalescer.flush({

                store: "chartStore",

                k1: chartKey,

                tf,

                trans_arr: [
                    this.currentCandle[candleKey]
                ]
            });


            return;

        } else {


            /*
             * Update existing candle
             */

            const candle =
                this.currentCandle[candleKey];


            candle.close =
                price;


            candle.high =
                Math.max(
                    price,
                    candle.high
                );


            candle.low =
                Math.min(
                    price,
                    candle.low
                );


            /*
             * Volume profile
             */

            const bin =
                candle.binnedProfile[price];


            if (bin) {

                if (side === 1) {

                    bin.sell += volume;

                } else {

                    bin.buy += volume;
                }

            } else {

                candle.binnedProfile[price] = {

                    buy:
                        side === 1
                            ? 0
                            : volume,

                    sell:
                        side === 1
                            ? volume
                            : 0,
                };
            }


            /*
             * Totals
             */

            candle.totalVolume +=
                volume;


            candle.totalDelta +=
                side === 1
                    ? -volume
                    : volume;
        }


        /*
         * Send current candle update
         */

        this.messageCoalescer.postMessage({

            store: "chartStore",

            k1: chartKey,

            tf,

            trans_arr: [
                this.currentCandle[candleKey]
            ]
        });
    }
}

export default DataFeed;