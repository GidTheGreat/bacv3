const tfs = {
    "1min": 60
}

class DataFeed{
    constructor(){
        this.buffers = new Map();
        this.i = {};
        
        this.startTime = null;
        this.startTime = {};
        this.currentTime = {};
        this.currentCandle = {};
        this.currentBucket = {};
        
    }
    
    parseFeed(platform, trade, tf, data){
        const today = new Date().toISOString().slice(0,10);
        const key = `${platform}|${trade}|${data.s}|${today}`;
        const chartKey = `${platform}|${trade}|${data.s}`
        if (!this.i[key]){
            this.i[key]= 0
        }
        //console.log(this.i)
        if (!this.buffers.has(key)){
            this.buffers.set(key,
            new SharedArrayBuffer(18_000_000));
        }
        const buffer = this.buffers.get(key);
        
        const timeView = new Float64Array(buffer, 0, 720000);
        const priceView = new Float64Array(buffer, 5760000, 720000);
        const quantityView = new Float64Array(buffer, 11520000, 720000);
        const sideView = new Uint8Array(buffer, 17280000, 720000);
        if (!this.startTime){
            this.startTime = data.T;
        } else {
            this.currentTime = data.T;
        }
        //console.log(this.i[key])
        timeView[this.i[key]] = data.T;
        priceView[this.i[key]] = data.p;
        quantityView[this.i[key]] = data.q;
        sideView[this.i[key]] = data.m ? 1 : 0 ;
        
        this.buildCandles(timeView, priceView, quantityView, 
        sideView, tf, key, chartKey)
        this.i[key] +=1;
    }

    buildCandles(timeView, priceView, quantityView, sideView, tf, key, chartKey) {

        const tf_sec = tfs[tf];
        const i = this.i[key];

        const price = priceView[i];
        const quantity = quantityView[i];
        const side = sideView[i];

        const volume = quantity * price;

        if (!this.currentCandle[key]) {

            this.currentCandle[key] = {
                time: timeView[i] / 1000,
                open: price,
                close: price,
                high: price,
                low: price,

                binnedProfile: {
                    [price]: {
                        buy: side === 1 ? 0 : volume,
                        sell: side === 1 ? volume : 0,
                    }
                },

                totalVolume: volume,
                totalDelta: side === 1 ? -volume : volume,
            };

            this.startTime[key] = timeView[i];

            this.currentBucket[key] =
                Math.floor(timeView[i] / (tf_sec * 1000));

        } else {

            const newBucket =
                Math.floor(timeView[i] / (tf_sec * 1000));

            if (this.currentBucket[key] !== newBucket) {

                postMessage({
                    store: "chartStore",
                    k1: chartKey,
                    tf: tf,
                    trans_arr: [this.currentCandle[key]]
                });

                this.currentCandle[key] = {
                    time: timeView[i] / 1000,
                    open: price,
                    close: price,
                    high: price,
                    low: price,

                    binnedProfile: {
                        [price]: {
                            buy: side === 1 ? 0 : volume,
                            sell: side === 1 ? volume : 0,
                        }
                    },

                    totalVolume: volume,
                    totalDelta: side === 1 ? -volume : volume,
                };

                this.currentBucket[key] = newBucket;

            } else {

                this.currentCandle[key].close = price;

                this.currentCandle[key].high =
                    Math.max(
                        price,
                        this.currentCandle[key].high
                    );

                this.currentCandle[key].low =
                    Math.min(
                        price,
                        this.currentCandle[key].low
                    );

                // Volume profile
                const bin =
                    this.currentCandle[key].binnedProfile[price];

                if (bin) {

                    if (side === 1) {
                        bin.sell += volume;
                    } else {
                        bin.buy += volume;
                    }

                } else {

                    this.currentCandle[key].binnedProfile[price] = {
                        buy: side === 1 ? 0 : volume,
                        sell: side === 1 ? volume : 0,
                    };
                }

                // Candle totals
                this.currentCandle[key].totalVolume += volume;

                this.currentCandle[key].totalDelta +=
                    side === 1 ? -volume : volume;
            }

            postMessage({
                store: "chartStore",
                k1: chartKey,
                tf: tf,
                trans_arr: [this.currentCandle[key]]
            });
        }
    }
}

export default DataFeed;