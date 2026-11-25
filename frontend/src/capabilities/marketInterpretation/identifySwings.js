
class SwingsIdentifier {
    constructor(swingsStore) {
        this.pos = {};
        this.swings = {};
        this.parsedSwings = {};
        this.swingsStore = swingsStore;
        this.ammendPos = {};

        this.contained = {};
        this.failBreakContained = {};
        this.priceActionSwings={key:{high:null,low:null,refHigh:null, refLow:null}};
      
    }

    removeLatestSwing(key, typeOfSwings="normal") {
        if (this.swingsStore) {
            this.swingsStore.getState().removeLatestSwing(key);
        } else {
            this.swings[key]?.pop();
        }
    }
  
    getSwingsLength(key, typeOfSwings="normal"){
      if (typeOfSwings == "normal"){
        const swings = this.swingsStore
            ? this.swingsStore.getState().swings
            : this.swings;

        return swings[key].length
      } else {
        const swings = this.swingsStore
            ? this.swingsStore.getState().parseSwings
            : this.parsedSwings;

        return swings[key].length
      }
      
    }

    getSwings(key, typeOfSwings="normal") {
      if (typeOfSwings=="normal"){
        const swings = this.swingsStore
            ? this.swingsStore.getState().swings
            : this.swings;

        return key === undefined ? swings : swings[key] ?? [];
      } else {
        const swings = this.swingsStore
            ? this.swingsStore.getState().parsedSwings
            : this.parsedSwings;

        return key === undefined ? swings : swings[key] ?? [];
      }
        
    }

    addSwings(key, swing, typeOfSwings="normal") {
      if (typeOfSwings=="normal"){
        if  (this.swingsStore) {
            this.swingsStore.getState().addSwings(key, swing);
        } else {
            if (!this.swings[key]) this.swings[key] = [];
            this.swings[key].push(swing);
        }
      } else {
        if  (this.swingsStore) {
            this.swingsStore.getState().addParsedSwings(key, swing);
        } else {
            if (!this.parsedSwings[key]) this.parsedSwings[key] = [];
            swing.forEach(swing=>this.parsedSwings[key].push(swing));
        }
      }
        
    }
 
    
   
    
    processSwing(key, candle, type, last) {
        const swing = {
            type,
            low: candle.low,
            high: candle.high,
            open: candle.open,
            close: candle.close,
            time: candle.time
        };
        /*const isValid = this.validateSwing(key, candle, type, last);
        if (!isValid) return;*/
      
        if (!last || last.type !== type) {
            this.addSwings(key, swing);
        } else if (
            type === "high" && last.high < candle.high ||
            type === "low" && last.low > candle.low
        ) {
            this.removeLatestSwing(key);
            this.addSwings(key, swing);
        }
       
    }

    findSwings(key, data) {
        //console.log("in findwings, pos:",JSON.stringify(this.pos))
        if (data.length < 3) return;

        if (this.pos[key] === undefined) {
            this.pos[key] = 0;
        }

        for (; this.pos[key] < data.length - 2; this.pos[key]++) {

            const candle_one = data[this.pos[key]];
            const candle_two = data[this.pos[key] + 1];
            const candle_three = data[this.pos[key] + 2];

            const last = this.getSwings(key).at(-1);

            const isHigh =
                candle_two.high >= candle_one.high &&
                candle_two.high >= candle_three.high;

            const isLow =
                candle_two.low <= candle_one.low &&
                candle_two.low <= candle_three.low;

            // Both conditions qualify on the same candle.
            if (isHigh && isLow) {

                // Discard dual swing if no previous swing exists.
                if (!last) continue;

                // Alternate against the previous swing.
                const type = last.type === "high" ? "low" : "high";

                this.processSwing(key, candle_two, type, last);

            } else if (isHigh) {

                this.processSwing(key, candle_two, "high", last);

            } else if (isLow) {

                this.processSwing(key, candle_two, "low", last);
            }
          //console.log("new pos:", this.pos[key])
        }
      //
    }
}

export default SwingsIdentifier;
