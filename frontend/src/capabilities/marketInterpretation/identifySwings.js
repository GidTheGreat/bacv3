
class SwingsIdentifier {
    constructor(swingsStore, chartStore) {
        this.pos = {};
        this.swings = {};
        this.parsedSwings = {};
        this.swingsStore = swingsStore;
        this.lastSwingPos = {};
        this.nextSwingPos = {};
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

    validateSwing(swings, currentPos, data) {
      if (swings.length < 2) return;

      swings[0].isValid===null ? swings[0].isValid = true : null;
      
      //console.log("swing:",swings)
      const unvalidatedSwings = swings.filter((swing) => {
          const result = swing.isValid === null || swing.mod === true;
      
          if (!result) {
              //console.log("Excluded:", swing.id, swing.isValid, swing.mod);
          } else {
              //console.log("Included:", swing.id, swing.isValid, swing.mod);
          }
      
          return result;
      });

      //console.log("unvalidated swings:",unvalidatedSwings,"length:",unvalidatedSwings.length)

      unvalidatedSwings.forEach((swing, index)=>{
        //console.log("swing:",swing,",current pos:",swing.pos,",lsp:",swing.lsp,",nsp:",swing.nsp,",prev candles:", swing.pos- swing.lsp,",after candles:",swing.nsp-swing.pos)
        
        if ((swing.pos - swing.lsp)<3){
          swing.isValid = false;
        } else {
          if (!swing.nsp){
            console.log("next swing not available")
          } else if ((swing.nsp - swing.pos) < 3){
            swing.isValid = false;
          } else {
            swing.isValid = true;
          }
        }
      })
  
      
    }

    processSwing(key, candle, type, last, data) {
        const swings = this.getSwings(key);
    
        const pos2 = this.pos[key] + 1  
        const swing = {  
            type,  
            low: candle.low,  
            high: candle.high,  
            open: candle.open,  
            close: candle.close,  
            time: candle.time,  
            isValid: null,  
            pos: pos2,
            lsp: this.lastSwingPos[key],
            nsp: null,
            mod: false,
        };  

        this.lastSwingPos[key] = swings.at(-1) ? swings.at(-1).pos : 0;

        
      
        this.validateSwing(swings, pos2, data);
        
        if (!last || last.type !== type) {
            swings.at(-1) ?  swings.at(-1).nsp=pos2 : null;
            this.addSwings(key, swing);  
        } else if (  
            type === "high" && last.high < candle.high ||  
            type === "low" && last.low > candle.low  
        ) {  
            this.removeLatestSwing(key);  
            if (swings.at(-1)){
              swings.at(-1).nsp=pos2;
              swings.at(-1).mod=true;
            } 
            this.addSwings(key, swing);  
        }  
         
    }

    findSwings(key, data) {
        //console.log("in findwings, pos:",JSON.stringify(this.pos))
        if (data.length < 3) return;

        if (this.pos[key] === undefined) {
            this.pos[key] = 0;
        }

        if (!this.lastSwingPos[key]){
          this.lastSwingPos[key] = 0;
        }

        if (!this.nextSwingPos[key]){
          this.nextSwingPos[key] = null;
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

                this.processSwing(key, candle_two, type, last, data);

            } else if (isHigh) {

                this.processSwing(key, candle_two, "high", last, data);

            } else if (isLow) {

                this.processSwing(key, candle_two, "low", last, data);
            }
          //console.log("new pos:", this.pos[key])
        }
      //
    }
}

export default SwingsIdentifier;
