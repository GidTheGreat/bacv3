const tfs = {
    "1min": 60
}

class DataFeed{
    constructor(){
        this.buffers = new Map();
        this.i = {};
        
        this.startTime = null;
        this.currentTime = null;
        this.currentCandle = {};
        this.currentBucket = null;
        
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
    buildCandles(timeView, priceView, quantityView, 
    sideView, tf, key, chartKey){
        //console.log("building candles",this.i, key, this.i[key])
        const tf_sec = tfs[tf];
        if (timeView[this.i[key]]==this.startTime){
            //console.log("setting up candle")
            this.currentCandle["time"] = timeView[this.i[key]]/1000;
            this.currentCandle["open"] = priceView[this.i[key]];
            this.currentCandle["close"] = priceView[this.i[key]];
            this.currentCandle["high"] = priceView[this.i[key]];
            this.currentCandle["low"] = priceView[this.i[key]];
            //console.log("candle init",this.currentCandle);
            
            
            this.currentBucket = Math.floor(timeView[this.i[key]]/(tf_sec*1000));
        } else {
            const newBucket = Math.floor(timeView[this.i[key]]/(tf_sec*1000));
            if (this.currentBucket!=newBucket){
                
                postMessage({
                    store:"chartStore",
                    k1: chartKey,
                    tf: tf,
                    trans_arr: [this.currentCandle]
                })
                console.log("candle open time:",new Date(this.currentCandle["time"]*1000),
                "current time",new Date(timeView[this.i[key]]))
                this.currentCandle = {};
                this.currentCandle["time"] = timeView[this.i[key]]/1000;
                this.currentCandle["open"] = priceView[this.i[key]];
                this.currentCandle["close"] = priceView[this.i[key]];
                this.currentCandle["high"] = priceView[this.i[key]];
                this.currentCandle["low"] = priceView[this.i[key]];
                this.currentBucket = newBucket
            }
            
            this.currentCandle["close"] = priceView[this.i[key]];
            this.currentCandle["high"] = Math.max(priceView[this.i[key]],
            this.currentCandle["high"]);
            this.currentCandle["low"] = Math.min(priceView[this.i[key]],
            this.currentCandle["low"]);
            
            
        
    }
    }
}

export default DataFeed;