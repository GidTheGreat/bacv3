class SwingGen{
    constructor(){
        this.pos = {};
        this.swings = {};
        this.pendingSwings = {};
        
    }
    
    determineTrend(key, tf){
        const swingsList = swings?.[key]?.[tf];
        if (!swingsList.length || swingsList.length < 4) return;
        
        const latestSwings = swingsList.slice(-4);
        
        
    }
    
    findSwings(key, tf, candleData){
        if (!this.pendingSwings[key]) {
            this.pendingSwings[key] = {};
        }
        
        if (!this.pendingSwings[key][tf]) {
            this.pendingSwings[key][tf] = {
                max: { value: null, confirmed: 0 },
                min: { value: null, confirmed: 0 }
            };
        }
        
        if (!this.swings[key]){
            this.swings[key] = {};
        }
        
        if (!this.swings[key][tf]){
            this.swings[key][tf] = []
        }
        
        if (!this.pos[key]){
            this.pos[key] = {};
            
        }
        
        if (this.pos[key][tf] === undefined){
            this.pos[key][tf] = 0;
        }
        
        //console.log(this.swings)
        if (candleData?.length < 3) return;
        
        for (;this.pos[key][tf]+2 < candleData.length; this.pos[key][tf]++){
            const curr_three = [ candleData[this.pos[key][tf]],
            candleData[this.pos[key][tf]+1], candleData[this.pos[key][tf]+2] ]
            
            const maxCandle = curr_three.reduce((max,candle)=>{
                if (max==0){
                    return candle
                } else if (candle.high > max.high){
                    return candle
                } else {
                    return max
                }
            },0)
            
            const minCandle = curr_three.reduce((min,candle)=>{
                if (min==0){
                    return candle
                } else if (candle.low < min.low){
                    return candle
                } else {
                    return min
                }
            },0)
            
            
            if (!this.pendingSwings[key][tf]["max"]["value"]){
                this.pendingSwings[key][tf]["max"]["value"] = maxCandle;
                
            } else if (this.pendingSwings[key][tf]["max"]["value"] &&
            this.pendingSwings[key][tf]["max"]["value"].high > maxCandle.high){
                this.pendingSwings[key][tf]["max"]["confirmed"] += 1;
                
            } else if (this.pendingSwings[key][tf]["max"]["value"] &&
            this.pendingSwings[key][tf]["max"]["value"].high < maxCandle.high){
                this.pendingSwings[key][tf]["max"]["confirmed"] = 0;
                this.pendingSwings[key][tf]["max"]["value"] = maxCandle
                
            }
            
            if (!this.pendingSwings[key][tf]["min"]["value"]){
                this.pendingSwings[key][tf]["min"]["value"] = minCandle;
                
            } else if (this.pendingSwings[key][tf]["min"]["value"] &&
            this.pendingSwings[key][tf]["min"]["value"].low < minCandle.low){
                this.pendingSwings[key][tf]["min"]["confirmed"] += 1;
                
            } else if (this.pendingSwings[key][tf]["min"]["value"] &&
            this.pendingSwings[key][tf]["min"]["value"].low > minCandle.low){
                this.pendingSwings[key][tf]["min"]["confirmed"] = 0;
                this.pendingSwings[key][tf]["min"]["value"] = minCandle
                
            }
            
            if (this.pendingSwings[key][tf]["max"]["confirmed"] >=3 ||
            this.pendingSwings[key][tf]["min"]["confirmed"] >=3){
                if (this.pendingSwings[key][tf]["min"]["confirmed"] >=3){
                        this.swings[key][tf].push({
                        swingType:"low",
                        value: this.pendingSwings[key][tf]["min"]["value"]
                    })
                    this.pendingSwings[key][tf]["min"] = {value:null,confirmed:0};
                }
                if (this.pendingSwings[key][tf]["max"]["confirmed"] >=3){
                    this.swings[key][tf].push({
                        swingType:"high",
                        value: this.pendingSwings[key][tf]["max"]["value"]
                    })
                    this.pendingSwings[key][tf]["max"] = {value:null,confirmed:0};
                } 
                
            } 
        }
    }
}

//sg = new SwingGen;
//sg.findSwings("um")

export default new SwingGen();